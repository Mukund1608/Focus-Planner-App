import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
from models import ExamDifficulty, ExamSchedule, ExamScheduleDay, ExamTask
import json
import hashlib

class ExamScheduler:
    """Deterministic exam scheduling algorithm"""
    
    # Default configuration
    DEFAULT_CONFIG = {
        'blockMinutes': 50,
        'shortBreakMinutes': 10,
        'longBreakMinutes': 20,
        'longBreakEveryNBlocks': 3,
        'reserveRevision': True
    }
    
    # Difficulty weights
    DIFFICULTY_WEIGHTS = {
        ExamDifficulty.EASY: 1.0,
        ExamDifficulty.MEDIUM: 1.2,
        ExamDifficulty.HARD: 1.5
    }
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = {**self.DEFAULT_CONFIG, **(config or {})}
    
    def generate_schedule(self, subjects: List, daily_hours: float, start_date: str = None) -> Dict[str, Any]:
        """
        Generate a deterministic exam schedule
        
        Args:
            subjects: List of subject dictionaries with id, name, examDate, difficulty, weightOverride
            daily_hours: Available study hours per day
            start_date: Start date for scheduling (ISO string), defaults to today
            
        Returns:
            Dictionary containing schedule data
        """
        # Normalize inputs
        daily_hours = max(0.5, min(16.0, daily_hours))
        daily_minutes = int(daily_hours * 60)
        block_minutes = self.config['blockMinutes']
        
        # Parse dates
        if start_date:
            start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        else:
            start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Sort subjects by exam date
        subjects = sorted(subjects, key=lambda s: s.examDate if hasattr(s, 'examDate') else s['examDate'])
        
        # Build timeline
        max_exam_date = max(datetime.fromisoformat(s.examDate.replace('Z', '+00:00') if hasattr(s, 'examDate') else s['examDate'].replace('Z', '+00:00')) for s in subjects)
        timeline = self._build_timeline(start, max_exam_date)
        
        # Generate schedule days
        schedule_days = []
        for day in timeline:
            day_schedule = self._generate_day_schedule(
                subjects, day, daily_minutes, block_minutes
            )
            if day_schedule['tasks']:  # Only add days with tasks
                schedule_days.append(day_schedule)
        
        # Create schedule metadata
        schedule_id = str(uuid.uuid4())
        version = 1
        
        return {
            'scheduleId': schedule_id,
            'version': version,
            'fromDate': start.isoformat(),
            'toDate': max_exam_date.isoformat(),
            'days': schedule_days,
            'params': {
                'subjects': subjects,
                'dailyHours': daily_hours,
                'startDate': start.isoformat(),
                'config': self.config
            }
        }
    
    def _build_timeline(self, start_date: datetime, end_date: datetime) -> List[datetime]:
        """Build list of dates from start to end"""
        timeline = []
        current = start_date
        while current <= end_date:
            timeline.append(current)
            current += timedelta(days=1)
        return timeline
    
    def _generate_day_schedule(self, subjects: List, day: datetime, 
                             daily_minutes: int, block_minutes: int) -> Dict[str, Any]:
        """Generate schedule for a single day"""
        
        # Get active subjects (exam date >= current day)
        active_subjects = []
        for s in subjects:
            # Handle both dict and object access
            if isinstance(s, dict):
                exam_date_str = s['examDate']
            else:
                exam_date_str = s.examDate
            
            if datetime.fromisoformat(exam_date_str.replace('Z', '+00:00')) >= day:
                active_subjects.append(s)
        
        if not active_subjects:
            return {
                'day': day.isoformat(),
                'totalPlannedMinutes': 0,
                'tasks': []
            }
        
        # Calculate urgency scores
        scores = []
        for subject in active_subjects:
            # Handle both dict and object access
            if isinstance(subject, dict):
                exam_date_str = subject['examDate']
                difficulty = subject['difficulty']
                weight_override = subject.get('weightOverride', 1.0)
            else:
                exam_date_str = subject.examDate
                difficulty = subject.difficulty
                weight_override = getattr(subject, 'weightOverride', 1.0)
            
            exam_date = datetime.fromisoformat(exam_date_str.replace('Z', '+00:00'))
            days_until_exam = (exam_date - day).days
            
            # Base weight from difficulty
            if isinstance(difficulty, str):
                difficulty_enum = ExamDifficulty(difficulty)
            else:
                difficulty_enum = difficulty
            base_weight = self.DIFFICULTY_WEIGHTS[difficulty_enum]
            
            # Apply weight override if present (ensure it's not None)
            if weight_override is None:
                weight_override = 1.0
            effective_weight = base_weight * weight_override
            
            # Urgency based on days until exam (inverse time decay)
            urgency = 1.0 / max(1, days_until_exam)
            
            # Final score
            score = effective_weight * urgency
            
            scores.append({
                'subject': subject,
                'weight': effective_weight,
                'urgency': urgency,
                'score': score,
                'daysUntilExam': days_until_exam
            })
        
        # Allocate minutes proportionally
        total_score = sum(s['score'] for s in scores)
        if total_score == 0:
            total_score = 1  # Prevent division by zero
        
        allocations = []
        for score_data in scores:
            proportional_minutes = (score_data['score'] / total_score) * daily_minutes
            # Floor to nearest block
            allocated_minutes = int(proportional_minutes // block_minutes) * block_minutes
            allocations.append({
                'subject': score_data['subject'],
                'minutes': allocated_minutes,
                'score': score_data['score']
            })
        
        # Ensure at least one block for the most urgent subject if capacity allows
        if daily_minutes >= block_minutes and all(a['minutes'] == 0 for a in allocations):
            # Find most urgent subject
            most_urgent = max(scores, key=lambda s: s['score'])
            allocations = [{
                'subject': most_urgent['subject'],
                'minutes': block_minutes,
                'score': most_urgent['score']
            }]
        
        # Apply revision rules
        allocations = self._apply_revision_rules(allocations, day, subjects)
        
        # Convert to tasks
        tasks = []
        total_planned = 0
        
        for allocation in allocations:
            if allocation['minutes'] > 0:
                subject = allocation['subject']
                # Handle both dict and object access
                if isinstance(subject, dict):
                    subject_id = subject['id']
                    subject_name = subject['name']
                    difficulty = subject['difficulty']
                else:
                    subject_id = subject.id
                    subject_name = subject.name
                    difficulty = subject.difficulty
                
                task = {
                    'id': str(uuid.uuid4()),
                    'subjectId': subject_id,
                    'subjectName': subject_name,
                    'difficulty': difficulty,
                    'plannedMinutes': allocation['minutes'],
                    'pomodoroBlocks': allocation['minutes'] // block_minutes,
                    'completedAt': None,
                    'notes': None
                }
                tasks.append(task)
                total_planned += allocation['minutes']
        
        return {
            'day': day.isoformat(),
            'totalPlannedMinutes': total_planned,
            'tasks': tasks
        }
    
    def _apply_revision_rules(self, allocations: List[Dict], day: datetime, 
                            subjects: List) -> List[Dict]:
        """Apply revision reservation rules for days near exams"""
        
        # If revision is disabled, return allocations as-is
        if not self.config.get('reserveRevision', True):
            return allocations
        
        # Default revision settings
        days_before_exam = 2
        max_revision_hours = 0.5
        max_revision_minutes = int(max_revision_hours * 60)
        
        # Check if any subjects are in revision window
        revision_subjects = []
        for subject in subjects:
            # Handle both dict and object access
            if isinstance(subject, dict):
                exam_date_str = subject['examDate']
            else:
                exam_date_str = subject.examDate
            
            exam_date = datetime.fromisoformat(exam_date_str.replace('Z', '+00:00'))
            days_until = (exam_date - day).days
            
            if 0 <= days_until <= days_before_exam:
                revision_subjects.append({
                    'subject': subject,
                    'daysUntil': days_until,
                    'isExamDay': days_until == 0
                })
        
        if not revision_subjects:
            return allocations
        
        # Calculate revision allocation
        total_allocated = sum(a['minutes'] for a in allocations)
        revision_minutes = min(max_revision_minutes, total_allocated * 0.25)
        
        # Distribute revision minutes among subjects in revision window
        revision_allocations = []
        for rev_subject in revision_subjects:
            if rev_subject['isExamDay']:
                # On exam day, only light revision
                revision_allocations.append({
                    'subject': rev_subject['subject'],
                    'minutes': min(50, revision_minutes // len(revision_subjects)),
                    'isRevision': True
                })
            else:
                # In revision window, allocate revision time
                revision_allocations.append({
                    'subject': rev_subject['subject'],
                    'minutes': revision_minutes // len(revision_subjects),
                    'isRevision': True
                })
        
        # Merge revision allocations with regular allocations
        final_allocations = []
        
        # Add revision allocations first
        for rev_alloc in revision_allocations:
            final_allocations.append(rev_alloc)
        
        # Add remaining regular allocations (excluding revision subjects)
        revision_subject_ids = set()
        for s in revision_subjects:
            subject = s['subject']
            if isinstance(subject, dict):
                revision_subject_ids.add(subject['id'])
            else:
                revision_subject_ids.add(subject.id)
        
        for alloc in allocations:
            subject = alloc['subject']
            if isinstance(subject, dict):
                subject_id = subject['id']
            else:
                subject_id = subject.id
            
            if subject_id not in revision_subject_ids:
                final_allocations.append(alloc)
        
        return final_allocations
    
    def compute_input_hash(self, subjects: List, daily_hours: float, 
                          start_date: str = None) -> str:
        """Compute deterministic hash of inputs for idempotency"""
        # Convert subjects to dict format for consistent hashing
        subjects_dict = []
        for s in subjects:
            if isinstance(s, dict):
                subjects_dict.append(s)
            else:
                subjects_dict.append({
                    'id': s.id,
                    'name': s.name,
                    'examDate': s.examDate,
                    'difficulty': s.difficulty,
                    'weightOverride': getattr(s, 'weightOverride', 1.0)
                })
        
        input_data = {
            'subjects': sorted(subjects_dict, key=lambda s: s['id']),
            'dailyHours': daily_hours,
            'startDate': start_date,
            'config': self.config
        }
        
        # Convert to JSON string and hash
        json_str = json.dumps(input_data, sort_keys=True, separators=(',', ':'))
        return hashlib.sha256(json_str.encode()).hexdigest()
    
    def validate_inputs(self, subjects: List, daily_hours: float) -> Tuple[bool, List[str]]:
        """Validate exam inputs and return errors if any"""
        errors = []
        
        # Validate subjects
        if not subjects:
            errors.append("At least one subject is required")
            return False, errors
        
        # Check for duplicate subject names (case-insensitive)
        subject_names = []
        for s in subjects:
            # Handle both dict and object access
            if isinstance(s, dict):
                subject_names.append(s['name'].lower())
            else:
                subject_names.append(s.name.lower())
        
        if len(subject_names) != len(set(subject_names)):
            errors.append("Subject names must be unique")
        
        # Validate exam dates
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        for subject in subjects:
            try:
                # Handle both dict and object access
                if isinstance(subject, dict):
                    exam_date_str = subject['examDate']
                    subject_name = subject['name']
                else:
                    exam_date_str = subject.examDate
                    subject_name = subject.name
                
                exam_date = datetime.fromisoformat(exam_date_str.replace('Z', '+00:00'))
                if exam_date < today:
                    errors.append(f"Exam date for {subject_name} cannot be in the past")
            except ValueError:
                errors.append(f"Invalid exam date format for {subject_name}")
        
        # Validate daily hours
        if daily_hours <= 0:
            errors.append("Daily study hours must be greater than 0")
        elif daily_hours > 16:
            errors.append("Daily study hours cannot exceed 16")
        
        # Validate weight overrides
        for subject in subjects:
            if isinstance(subject, dict):
                weight = subject.get('weightOverride')
                subject_name = subject['name']
            else:
                weight = getattr(subject, 'weightOverride', None)
                subject_name = subject.name
            
            if weight is not None and (weight < 0.5 or weight > 3.0):
                errors.append(f"Weight override for {subject_name} must be between 0.5 and 3.0")
        
        return len(errors) == 0, errors
