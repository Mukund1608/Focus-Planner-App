#!/usr/bin/env python3
"""
FocusBoard Troubleshooting Script
This script helps identify and fix common issues with notifications and recurring tasks.
"""

import os
import sys
import sqlite3
import json
from datetime import datetime, timedelta

def check_backend_database():
    """Check if the database exists and has the correct schema"""
    print("🔍 Checking backend database...")
    
    db_path = "backend/focusboard_dev.db"
    if not os.path.exists(db_path):
        print("❌ Database file not found:", db_path)
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
            print(f"❌ Missing tables: {missing_tables}")
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
            print(f"❌ Missing columns in tasks table: {missing_columns}")
            return False
        
        print("✅ Database structure looks good")
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

def check_backend_config():
    """Check backend configuration files"""
    print("\n🔍 Checking backend configuration...")
    
    config_files = [
        "backend/config.py",
        "backend/app.py",
        "backend/models.py",
        "backend/recurring_utils.py"
    ]
    
    for file_path in config_files:
        if not os.path.exists(file_path):
            print(f"❌ Missing file: {file_path}")
            return False
    
    print("✅ All backend config files exist")
    return True

def check_frontend_config():
    """Check frontend configuration files"""
    print("\n🔍 Checking frontend configuration...")
    
    config_files = [
        "frontend/src/config.tsx",
        "frontend/src/services/notificationService.ts",
        "frontend/src/services/api.ts",
        "frontend/vite.config.ts"
    ]
    
    for file_path in config_files:
        if not os.path.exists(file_path):
            print(f"❌ Missing file: {file_path}")
            return False
    
    print("✅ All frontend config files exist")
    return True

def check_ports():
    """Check if ports are available"""
    print("\n🔍 Checking port availability...")
    
    import socket
    
    ports_to_check = [3001, 5000]
    
    for port in ports_to_check:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('localhost', port))
        sock.close()
        
        if result == 0:
            print(f"⚠️  Port {port} is already in use")
        else:
            print(f"✅ Port {port} is available")
    
    return True

def create_test_data():
    """Create test data for debugging"""
    print("\n🔍 Creating test data...")
    
    db_path = "backend/focusboard_dev.db"
    if not os.path.exists(db_path):
        print("❌ Database not found, cannot create test data")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if we have any users
        cursor.execute("SELECT COUNT(*) FROM users;")
        user_count = cursor.fetchone()[0]
        
        if user_count == 0:
            print("⚠️  No users found in database")
            print("   You need to create a user account first")
            print("   Go to http://localhost:3001/auth to sign up")
        else:
            print(f"✅ Found {user_count} users in database")
        
        # Check if we have any tasks
        cursor.execute("SELECT COUNT(*) FROM tasks;")
        task_count = cursor.fetchone()[0]
        print(f"✅ Found {task_count} tasks in database")
        
        # Check recurring tasks
        cursor.execute("SELECT COUNT(*) FROM tasks WHERE is_recurring = 1;")
        recurring_count = cursor.fetchone()[0]
        print(f"✅ Found {recurring_count} recurring tasks")
        
        # Check tasks with reminders
        cursor.execute("SELECT COUNT(*) FROM tasks WHERE reminder_enabled = 1;")
        reminder_count = cursor.fetchone()[0]
        print(f"✅ Found {reminder_count} tasks with reminders")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error checking test data: {e}")
        return False

def generate_test_script():
    """Generate a test script for the frontend"""
    print("\n🔍 Generating frontend test script...")
    
    test_script = """
// Test script for FocusBoard - Run this in browser console
console.log('Starting FocusBoard tests...');

// Test 1: Check notification support
console.log('Notification support:', 'Notification' in window);
console.log('Notification permission:', Notification.permission);

// Test 2: Check if notification service is available
if (typeof window.notificationService !== 'undefined') {
    console.log('Notification service available');
    console.log('Status:', window.notificationService.getStatus());
} else {
    console.log('Notification service not available');
}

// Test 3: Test API connectivity
fetch('http://localhost:5000/health')
    .then(response => response.json())
    .then(data => {
        console.log('Backend API is running:', data);
    })
    .catch(error => {
        console.error('Backend API error:', error);
    });

// Test 4: Test SuperTokens session
fetch('http://localhost:5000/sessioninfo', {
    credentials: 'include'
})
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Not authenticated');
        }
    })
    .then(data => {
        console.log('User is authenticated:', data);
    })
    .catch(error => {
        console.log('User not authenticated:', error.message);
    });

console.log('Tests completed!');
"""
    
    with open("frontend/test-script.js", "w") as f:
        f.write(test_script)
    
    print("✅ Test script created: frontend/test-script.js")
    print("   Run this in your browser console to test the application")

def main():
    """Main troubleshooting function"""
    print("FocusBoard Troubleshooting Script")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("backend") or not os.path.exists("frontend"):
        print("❌ Please run this script from the focus-board directory")
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
    
    # Generate test script
    generate_test_script()
    
    print("\n" + "=" * 50)
    if all_passed:
        print("✅ All checks passed!")
        print("\n📋 Next steps:")
        print("1. Start the backend: cd backend && python app.py")
        print("2. Start the frontend: cd frontend && npm start")
        print("3. Go to http://localhost:3001")
        print("4. Sign up/login at http://localhost:3001/auth")
        print("5. Create some tasks with reminders")
        print("6. Run the test script in browser console")
    else:
        print("❌ Some checks failed. Please fix the issues above.")
    
    print("\n🔧 Manual fixes:")
    print("- If database is missing: cd backend && python init_db.py")
    print("- If ports are in use: Kill existing processes or change ports")
    print("- If files are missing: Check git status and restore files")

if __name__ == "__main__":
    main()
