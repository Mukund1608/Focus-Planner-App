# 📚 Exam Mode - Study Planner Feature

## Overview

Exam Mode is a comprehensive study planning feature that helps students create personalized study schedules based on their subjects, exam dates, and available study time. The system uses a deterministic algorithm to allocate study time efficiently, considering subject difficulty, exam urgency, and revision requirements.

## Features

### 🎯 Core Features
- **Smart Schedule Generation**: AI-powered algorithm that creates optimal study schedules
- **Subject Management**: Add multiple subjects with exam dates, difficulty levels, and custom weights
- **Calendar View**: Visual calendar showing daily study tasks with subject colors
- **Task Board**: Kanban-style board with Today, Tomorrow, Upcoming, and Completed columns
- **Progress Tracking**: Mark tasks as complete and track your study progress
- **Schedule Regeneration**: Update your schedule when inputs change

### ⚙️ Advanced Features
- **Difficulty-Based Weighting**: Automatic time allocation based on subject difficulty
- **Urgency Calculation**: More time allocated to subjects with closer exam dates
- **Revision Windows**: Automatic revision time allocation before exams
- **Pomodoro Integration**: Tasks broken down into 50-minute study blocks
- **Deterministic Algorithm**: Same inputs always produce the same schedule

### 🔔 Notifications (Future)
- **AM Summary**: Daily morning notifications with study plan overview
- **PM Check-in**: Evening reminders to track daily progress
- **Configurable Times**: Customize notification timing and timezone

## Technical Architecture

### Backend Components

#### Database Schema
```sql
-- Exam inputs storage
exam_inputs (id, user_id, subjects, daily_hours, created_at, updated_at)

-- Schedule management
schedules (id, user_id, version, status, from_date, to_date, params)

-- Daily schedule breakdown
schedule_days (id, schedule_id, day, total_planned_minutes)

-- Individual study tasks
exam_tasks (id, schedule_day_id, subject_id, subject_name, difficulty, 
           planned_minutes, pomodoro_blocks, completed_at, notes)

-- Notification preferences
notification_prefs (user_id, am_enabled, am_time, pm_enabled, pm_time, tz)
```

#### API Endpoints
- `POST /api/schedule/generate` - Generate or regenerate study schedule
- `GET /api/schedule/get` - Get active schedule (full or day-specific)
- `POST /api/schedule/complete-task` - Mark task as complete/incomplete
- `GET /api/schedule/preferences` - Get notification preferences
- `PUT /api/schedule/preferences` - Update notification preferences

#### Scheduling Algorithm
The algorithm uses a weighted scoring system:

1. **Difficulty Weighting**: Easy (1.0), Medium (1.2), Hard (1.5)
2. **Urgency Calculation**: `1 / days_until_exam`
3. **Effective Score**: `difficulty_weight × urgency × weight_override`
4. **Time Allocation**: Proportional distribution based on scores
5. **Revision Rules**: Reserve time for revision 2 days before exams

### Frontend Components

#### Core Components
- `ExamMode.tsx` - Main component orchestrating the feature
- `ExamInput.tsx` - Form for adding subjects and configuring study parameters
- `ExamScheduleView.tsx` - Calendar and task board views
- `ExamMode.css` - Styling for all exam mode components

#### State Management
- React hooks for local state management
- API service layer for backend communication
- Real-time updates for task completion

## Setup Instructions

### 1. Database Migration

Run the migration script to create exam-related tables:

```bash
cd Focus-Planner-App/focus-board/backend
python migrate_exam_tables.py
```

### 2. Backend Setup

The backend automatically includes exam mode features. No additional setup required.

### 3. Frontend Setup

The frontend automatically includes exam mode components. The feature is accessible via the navigation menu.

### 4. Verification

1. Start the backend server
2. Start the frontend development server
3. Navigate to `/exam` in the application
4. You should see the Exam Mode interface

## Usage Guide

### Creating Your First Study Schedule

1. **Navigate to Exam Mode**
   - Click on "📚 Exam Mode" in the navigation menu

2. **Add Subjects**
   - Click "Create Study Schedule"
   - Add subject name (e.g., "Mathematics")
   - Select exam date (must be in the future)
   - Choose difficulty level (Easy/Medium/Hard)
   - Optionally set weight override (0.5-3.0)

3. **Configure Study Time**
   - Set daily available study hours (0.5-16 hours)
   - Use the slider to adjust time allocation

4. **Generate Schedule**
   - Click "Generate Study Plan"
   - Review the generated schedule

### Using the Schedule

#### Calendar View
- **Daily Overview**: See all study tasks for each day
- **Task Details**: Click on a day to see detailed task breakdown
- **Completion Tracking**: Mark tasks as complete with one click
- **Subject Colors**: Each subject has a consistent color across views

#### Task Board View
- **Today Column**: Current day's study tasks
- **Tomorrow Column**: Next day's planned tasks
- **Upcoming Column**: Tasks for the next 7 days
- **Completed Column**: All completed tasks with timestamps

#### Schedule Management
- **Regenerate Plan**: Update schedule when inputs change
- **Progress Tracking**: Monitor completion rates
- **Version Control**: Automatic versioning of schedules

### Best Practices

1. **Realistic Time Allocation**: Set achievable daily study hours
2. **Accurate Difficulty**: Be honest about subject difficulty levels
3. **Regular Updates**: Regenerate schedule when exam dates change
4. **Consistent Tracking**: Mark tasks complete as you finish them
5. **Review Progress**: Use the task board to monitor completion rates

## Algorithm Details

### Weighting System

```python
# Base difficulty weights
DIFFICULTY_WEIGHTS = {
    'easy': 1.0,
    'medium': 1.2, 
    'hard': 1.5
}

# Effective weight calculation
effective_weight = base_weight × weight_override

# Urgency calculation
urgency = 1 / max(1, days_until_exam)

# Final score
score = effective_weight × urgency
```

### Time Allocation Rules

1. **Proportional Distribution**: Time allocated based on relative scores
2. **Minimum Blocks**: At least one 50-minute block per active subject
3. **Revision Windows**: 2 days before exam, reserve revision time
4. **Exam Day**: Light revision only (≤50 minutes)
5. **Block Alignment**: All time rounded to nearest 50-minute blocks

### Edge Cases Handled

- **Same-day Exams**: Minimal preparation time allocated
- **Overlapping Exams**: Algorithm naturally prioritizes closer exams
- **Insufficient Time**: Warning messages with suggested adjustments
- **Past Dates**: Validation prevents scheduling for past dates
- **Duplicate Subjects**: Validation ensures unique subject names

## API Reference

### Generate Schedule

```typescript
POST /api/schedule/generate
{
  "subjects": [
    {
      "id": "math_001",
      "name": "Mathematics",
      "examDate": "2024-12-15",
      "difficulty": "hard",
      "weightOverride": 1.2
    }
  ],
  "dailyHours": 3.5,
  "startDate": "2024-11-01",
  "reserveRevision": {
    "daysBeforeExam": 2,
    "maxDailyRevisionHours": 0.5
  }
}
```

### Get Schedule

```typescript
GET /api/schedule/get
GET /api/schedule/get?day=2024-11-15
```

### Complete Task

```typescript
POST /api/schedule/complete-task
{
  "taskId": "task_123",
  "completed": true
}
```

## Performance Considerations

### Algorithm Performance
- **Time Complexity**: O(D×S) where D = days, S = subjects
- **Typical Performance**: <1 second for 10 subjects over 120 days
- **Memory Usage**: Minimal, processes one day at a time

### Database Optimization
- **Indexes**: Created on frequently queried columns
- **JSON Storage**: Efficient storage of complex data structures
- **Archiving**: Old schedules archived, not deleted

### Frontend Performance
- **Lazy Loading**: Components load only when needed
- **Optimistic Updates**: UI updates immediately, syncs with backend
- **Caching**: Schedule data cached locally for faster access

## Troubleshooting

### Common Issues

1. **Schedule Not Generating**
   - Check that exam dates are in the future
   - Ensure daily hours > 0
   - Verify subject names are unique

2. **Tasks Not Updating**
   - Refresh the page
   - Check network connectivity
   - Verify user authentication

3. **Database Errors**
   - Run migration script again
   - Check database file permissions
   - Verify SQLite installation

### Debug Information

Enable debug logging in the browser console to see:
- API request/response details
- Algorithm calculation steps
- State management updates

## Future Enhancements

### Planned Features
- **Push Notifications**: Real-time study reminders
- **Study Analytics**: Progress charts and insights
- **Collaborative Planning**: Share schedules with study groups
- **Content Integration**: Link to study materials and resources
- **Adaptive Scheduling**: AI-powered schedule optimization

### Technical Improvements
- **Offline Support**: Work without internet connection
- **Data Export**: Export schedules to calendar applications
- **API Rate Limiting**: Prevent abuse of generation endpoint
- **Caching Strategy**: Improved performance for large schedules

## Contributing

### Development Setup
1. Fork the repository
2. Create feature branch
3. Implement changes
4. Add tests for new functionality
5. Submit pull request

### Testing
- Unit tests for scheduling algorithm
- Integration tests for API endpoints
- E2E tests for user workflows
- Performance tests for large datasets

## License

This feature is part of the Focus Planner App and follows the same license terms.

---

**Note**: Exam Mode is designed to be a helpful study planning tool. While the algorithm is sophisticated, it should be used as a guide rather than a strict requirement. Students should adjust their study plans based on their individual needs and circumstances.
