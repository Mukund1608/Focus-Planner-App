#!/usr/bin/env python3
"""
FocusBoard Simple Troubleshooting Script
This script helps identify and fix common issues with notifications and recurring tasks.
"""

import os
import sys
import sqlite3
import json
from datetime import datetime, timedelta

def check_backend_database():
    """Check if the database exists and has the correct schema"""
    print("Checking backend database...")
    
    db_path = "backend/focusboard_dev.db"
    if not os.path.exists(db_path):
        print("ERROR: Database file not found:", db_path)
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if tables exist
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        
        required_tables = ['users', 'priority_boards', 'tasks']
        missing_tables = [table for table in required_tables if table not in tables]
        
        if missing_tables:
            print(f"ERROR: Missing tables: {missing_tables}")
            return False
        
        # Check task table structure
        cursor.execute("PRAGMA table_info(tasks);")
        columns = [row[1] for row in cursor.fetchall()]
        
        required_columns = [
            'reminder_enabled', 'reminder_time', 'reminder_type', 'reminder_sent',
            'is_recurring', 'recurring_pattern', 'recurring_config', 'parent_task_id', 'next_occurrence'
        ]
        
        missing_columns = [col for col in required_columns if col not in columns]
        
        if missing_columns:
            print(f"ERROR: Missing columns in tasks table: {missing_columns}")
            return False
        
        print("OK: Database structure looks good")
        conn.close()
        return True
        
    except Exception as e:
        print(f"ERROR: Database error: {e}")
        return False

def check_backend_config():
    """Check backend configuration files"""
    print("\nChecking backend configuration...")
    
    config_files = [
        "backend/config.py",
        "backend/app.py",
        "backend/models.py",
        "backend/recurring_utils.py"
    ]
    
    for file_path in config_files:
        if not os.path.exists(file_path):
            print(f"ERROR: Missing file: {file_path}")
            return False
    
    print("OK: All backend config files exist")
    return True

def check_frontend_config():
    """Check frontend configuration files"""
    print("\nChecking frontend configuration...")
    
    config_files = [
        "frontend/src/config.tsx",
        "frontend/src/services/notificationService.ts",
        "frontend/src/services/api.ts",
        "frontend/vite.config.ts"
    ]
    
    for file_path in config_files:
        if not os.path.exists(file_path):
            print(f"ERROR: Missing file: {file_path}")
            return False
    
    print("OK: All frontend config files exist")
    return True

def check_ports():
    """Check if ports are available"""
    print("\nChecking port availability...")
    
    import socket
    
    ports_to_check = [3001, 5000]
    
    for port in ports_to_check:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('localhost', port))
        sock.close()
        
        if result == 0:
            print(f"WARNING: Port {port} is already in use")
        else:
            print(f"OK: Port {port} is available")
    
    return True

def create_test_data():
    """Create test data for debugging"""
    print("\nChecking test data...")
    
    db_path = "backend/focusboard_dev.db"
    if not os.path.exists(db_path):
        print("ERROR: Database not found, cannot check test data")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if we have any users
        cursor.execute("SELECT COUNT(*) FROM users;")
        user_count = cursor.fetchone()[0]
        
        if user_count == 0:
            print("WARNING: No users found in database")
            print("   You need to create a user account first")
            print("   Go to http://localhost:3001/auth to sign up")
        else:
            print(f"OK: Found {user_count} users in database")
        
        # Check if we have any tasks
        cursor.execute("SELECT COUNT(*) FROM tasks;")
        task_count = cursor.fetchone()[0]
        print(f"OK: Found {task_count} tasks in database")
        
        # Check recurring tasks
        cursor.execute("SELECT COUNT(*) FROM tasks WHERE is_recurring = 1;")
        recurring_count = cursor.fetchone()[0]
        print(f"OK: Found {recurring_count} recurring tasks")
        
        # Check tasks with reminders
        cursor.execute("SELECT COUNT(*) FROM tasks WHERE reminder_enabled = 1;")
        reminder_count = cursor.fetchone()[0]
        print(f"OK: Found {reminder_count} tasks with reminders")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"ERROR: Error checking test data: {e}")
        return False



def main():
    """Main troubleshooting function"""
    print("FocusBoard Troubleshooting Script")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("backend") or not os.path.exists("frontend"):
        print("ERROR: Please run this script from the focus-board directory")
        return
    
    # Run all checks
    checks = [
        check_backend_config,
        check_frontend_config,
        check_backend_database,
        check_ports,
        create_test_data
    ]
    
    all_passed = True
    for check in checks:
        if not check():
            all_passed = False
    
    # Test script generation removed for cleaner interface
    
    print("\n" + "=" * 50)
    if all_passed:
        print("OK: All checks passed!")
        print("\nNext steps:")
        print("1. Start the backend: cd backend && python app.py")
        print("2. Start the frontend: cd frontend && npm start")
        print("3. Go to http://localhost:3001")
        print("4. Sign up/login at http://localhost:3001/auth")
        print("5. Create some tasks with reminders")
    else:
        print("ERROR: Some checks failed. Please fix the issues above.")
    
    print("\nManual fixes:")
    print("- If database is missing: cd backend && python init_db.py")
    print("- If ports are in use: Kill existing processes or change ports")
    print("- If files are missing: Check git status and restore files")

if __name__ == "__main__":
    main()
