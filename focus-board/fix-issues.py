#!/usr/bin/env python3
"""
FocusBoard Auto-Fix Script
This script automatically fixes common issues with the FocusBoard application.
"""

import os
import sys
import sqlite3
import subprocess
import shutil
from datetime import datetime

def fix_database():
    """Fix database issues"""
    print("🔧 Fixing database issues...")
    
    db_path = "backend/focusboard_dev.db"
    
    # Backup existing database
    if os.path.exists(db_path):
        backup_path = f"{db_path}.backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        shutil.copy2(db_path, backup_path)
        print(f"✅ Database backed up to: {backup_path}")
    
    # Recreate database
    try:
        subprocess.run([sys.executable, "backend/init_db.py"], check=True)
        print("✅ Database recreated successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to recreate database: {e}")
        return False

def fix_dependencies():
    """Fix dependency issues"""
    print("🔧 Fixing dependency issues...")
    
    # Backend dependencies
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"], check=True)
        print("✅ Backend dependencies installed")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install backend dependencies: {e}")
        return False
    
    # Frontend dependencies
    try:
        subprocess.run(["npm", "install"], cwd="frontend", check=True)
        print("✅ Frontend dependencies installed")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install frontend dependencies: {e}")
        return False
    
    return True

def fix_config_files():
    """Fix configuration file issues"""
    print("🔧 Fixing configuration files...")
    
    # Fix Vite config
    vite_config = """import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3001,
        host: true
    },
});
"""
    
    with open("frontend/vite.config.ts", "w") as f:
        f.write(vite_config)
    
    print("✅ Vite configuration fixed")
    
    # Fix backend CORS
    app_py_path = "backend/app.py"
    if os.path.exists(app_py_path):
        with open(app_py_path, "r") as f:
            content = f.read()
        
        # Ensure CORS includes both ports
        if "allow_origins=[" in content and "localhost:3001" not in content:
            content = content.replace(
                'allow_origins=["http://localhost:3000"',
                'allow_origins=["http://localhost:3000", "http://localhost:3001"'
            )
            
            with open(app_py_path, "w") as f:
                f.write(content)
            
            print("✅ Backend CORS configuration fixed")
    
    return True

def create_sample_data():
    """Create sample data for testing"""
    print("🔧 Creating sample data...")
    
    db_path = "backend/focusboard_dev.db"
    if not os.path.exists(db_path):
        print("❌ Database not found, cannot create sample data")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if we have any users
        cursor.execute("SELECT COUNT(*) FROM users;")
        user_count = cursor.fetchone()[0]
        
        if user_count == 0:
            print("⚠️  No users found. You need to create a user account first.")
            print("   Go to http://localhost:3001/auth to sign up")
        else:
            print(f"✅ Found {user_count} users")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        return False

def generate_startup_script():
    """Generate a startup script"""
    print("🔧 Generating startup script...")
    
    startup_script = """#!/bin/bash
# FocusBoard Startup Script

echo "🚀 Starting FocusBoard..."

# Kill any existing processes on ports 3001 and 5000
echo "🔄 Stopping existing processes..."
pkill -f "python.*app.py" || true
pkill -f "vite.*3001" || true

# Start backend
echo "🔧 Starting backend..."
cd backend
python app.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🔧 Starting frontend..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo "✅ FocusBoard started!"
echo "📱 Frontend: http://localhost:3001"
echo "🔧 Backend: http://localhost:5000"
echo "🔐 Auth: http://localhost:3001/auth"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait
"""
    
    with open("start.sh", "w") as f:
        f.write(startup_script)
    
    # Make it executable
    os.chmod("start.sh", 0o755)
    
    print("✅ Startup script created: start.sh")
    print("   Run './start.sh' to start both servers")

def main():
    """Main fix function"""
    print("🔧 FocusBoard Auto-Fix Script")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("backend") or not os.path.exists("frontend"):
        print("❌ Please run this script from the focus-board directory")
        return
    
    # Run all fixes
    fixes = [
        fix_dependencies,
        fix_config_files,
        fix_database,
        create_sample_data,
        generate_startup_script
    ]
    
    all_passed = True
    for fix in fixes:
        if not fix():
            all_passed = False
    
    print("\n" + "=" * 50)
    if all_passed:
        print("✅ All fixes applied successfully!")
        print("\n📋 Next steps:")
        print("1. Run the troubleshooting script: python troubleshoot.py")
        print("2. Start the application: ./start.sh")
        print("3. Or start manually:")
        print("   - Backend: cd backend && python app.py")
        print("   - Frontend: cd frontend && npm start")
        print("4. Go to http://localhost:3001")
        print("5. Sign up/login at http://localhost:3001/auth")
    else:
        print("❌ Some fixes failed. Please check the errors above.")
    
    print("\n🔧 If issues persist:")
    print("- Run: python troubleshoot.py")
    print("- Check browser console for errors")
    print("- Check backend logs for errors")

if __name__ == "__main__":
    main()
