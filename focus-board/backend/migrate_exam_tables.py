#!/usr/bin/env python3
"""
Database migration script for Exam Mode tables
This script adds the exam-related tables to the existing database.
"""

import sqlite3
import os
from datetime import datetime

def create_exam_tables():
    """Create exam-related tables in the database"""
    
    # Database file path
    db_path = 'focusboard_dev.db'
    
    # Check if database exists
    if not os.path.exists(db_path):
        print(f"Database file {db_path} not found. Please run the main application first to create the database.")
        return False
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("Starting exam tables migration...")
        
        # Create exam_inputs table
        print("Creating exam_inputs table...")
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS exam_inputs (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                subjects TEXT NOT NULL,  -- JSON array of subject objects
                daily_hours INTEGER NOT NULL,  -- Stored as minutes
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Create schedules table
        print("Creating schedules table...")
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS schedules (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                version INTEGER DEFAULT 1,
                status TEXT DEFAULT 'active',  -- active, archived
                from_date TIMESTAMP NOT NULL,
                to_date TIMESTAMP NOT NULL,
                params TEXT NOT NULL,  -- JSON snapshot of inputs + algorithm config
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Create schedule_days table
        print("Creating schedule_days table...")
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS schedule_days (
                id TEXT PRIMARY KEY,
                schedule_id TEXT NOT NULL,
                day TIMESTAMP NOT NULL,
                total_planned_minutes INTEGER NOT NULL,
                FOREIGN KEY (schedule_id) REFERENCES schedules (id)
            )
        ''')
        
        # Create exam_tasks table
        print("Creating exam_tasks table...")
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS exam_tasks (
                id TEXT PRIMARY KEY,
                schedule_day_id TEXT NOT NULL,
                subject_id TEXT NOT NULL,
                subject_name TEXT NOT NULL,
                difficulty TEXT NOT NULL,  -- easy, medium, hard
                planned_minutes INTEGER NOT NULL,
                pomodoro_blocks INTEGER NOT NULL,
                completed_at TIMESTAMP NULL,
                notes TEXT NULL,
                FOREIGN KEY (schedule_day_id) REFERENCES schedule_days (id)
            )
        ''')
        
        # Create notification_prefs table
        print("Creating notification_prefs table...")
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notification_prefs (
                user_id TEXT PRIMARY KEY,
                am_enabled BOOLEAN DEFAULT 1,
                am_time TEXT DEFAULT '09:00',
                pm_enabled BOOLEAN DEFAULT 1,
                pm_time TEXT DEFAULT '20:00',
                tz TEXT DEFAULT 'Asia/Kolkata',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Create indexes for better performance
        print("Creating indexes...")
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_exam_inputs_user_id ON exam_inputs (user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON schedules (user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_schedules_status ON schedules (status)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_schedule_days_schedule_id ON schedule_days (schedule_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_schedule_days_day ON schedule_days (day)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_exam_tasks_schedule_day_id ON exam_tasks (schedule_day_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_exam_tasks_subject_id ON exam_tasks (subject_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_exam_tasks_completed_at ON exam_tasks (completed_at)')
        
        # Commit changes
        conn.commit()
        
        print("✅ Exam tables migration completed successfully!")
        
        # Verify tables were created
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%exam%' OR name LIKE '%schedule%' OR name LIKE '%notification%'")
        tables = cursor.fetchall()
        
        print(f"\nCreated tables:")
        for table in tables:
            print(f"  - {table[0]}")
        
        return True
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Migration error: {e}")
        return False
    finally:
        if conn:
            conn.close()

def verify_migration():
    """Verify that all exam tables exist and have correct structure"""
    
    db_path = 'focusboard_dev.db'
    
    if not os.path.exists(db_path):
        print(f"Database file {db_path} not found.")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if all required tables exist
        required_tables = [
            'exam_inputs',
            'schedules', 
            'schedule_days',
            'exam_tasks',
            'notification_prefs'
        ]
        
        print("Verifying migration...")
        
        for table in required_tables:
            cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
            if cursor.fetchone():
                print(f"  ✅ {table} table exists")
            else:
                print(f"  ❌ {table} table missing")
                return False
        
        print("✅ All exam tables verified successfully!")
        return True
        
    except sqlite3.Error as e:
        print(f"❌ Verification error: {e}")
        return False
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("=" * 50)
    print("Exam Mode Database Migration")
    print("=" * 50)
    
    # Run migration
    success = create_exam_tables()
    
    if success:
        print("\n" + "=" * 50)
        print("Verifying migration...")
        print("=" * 50)
        
        # Verify migration
        verify_migration()
        
        print("\n" + "=" * 50)
        print("Migration Summary")
        print("=" * 50)
        print("✅ Exam Mode tables have been successfully added to the database.")
        print("✅ The application is now ready to use Exam Mode features.")
        print("\nYou can now:")
        print("  - Generate exam study schedules")
        print("  - Track study progress")
        print("  - Configure notifications")
        print("  - View schedules in calendar and task board formats")
    else:
        print("\n❌ Migration failed. Please check the error messages above.")
        exit(1)
