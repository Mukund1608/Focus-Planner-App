#!/usr/bin/env python3
"""
Database migration script to add reminder and recurring task columns
Run this script to update the existing database schema
"""

import sqlite3
import os
from pathlib import Path

def migrate_database():
    """Add new columns for reminders and recurring tasks"""
    
    # Database file path
    db_path = Path(__file__).parent / "focusboard_dev.db"
    
    if not db_path.exists():
        print("Database file not found. Creating new database...")
        return
    
    print(f"Migrating database: {db_path}")
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(tasks)")
        columns = [column[1] for column in cursor.fetchall()]
        
        # Add new columns if they don't exist
        new_columns = [
            ("reminder_enabled", "BOOLEAN DEFAULT 0"),
            ("reminder_time", "DATETIME"),
            ("reminder_type", "TEXT DEFAULT 'none'"),
            ("reminder_sent", "BOOLEAN DEFAULT 0"),
            ("is_recurring", "BOOLEAN DEFAULT 0"),
            ("recurring_pattern", "TEXT DEFAULT 'none'"),
            ("recurring_config", "TEXT"),  # JSON as text
            ("parent_task_id", "INTEGER"),
            ("next_occurrence", "DATETIME")
        ]
        
        for column_name, column_def in new_columns:
            if column_name not in columns:
                print(f"Adding column: {column_name}")
                cursor.execute(f"ALTER TABLE tasks ADD COLUMN {column_name} {column_def}")
            else:
                print(f"Column {column_name} already exists")
        
        # Create index for recurring tasks
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_tasks_recurring ON tasks(is_recurring, parent_task_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_tasks_reminders ON tasks(reminder_enabled, reminder_time)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_tasks_next_occurrence ON tasks(next_occurrence)")
        
        # Commit changes
        conn.commit()
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Migration failed: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()
