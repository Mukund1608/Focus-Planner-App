#!/usr/bin/env python3
"""
Environment Setup Script for FocusBoard
This script creates the necessary .env files for both frontend and backend.
"""

import os
import sys

def create_backend_env():
    """Create .env file for backend"""
    backend_env_content = """# SuperTokens Configuration
SUPERTOKENS_CONNECTION_URI=https://try.supertokens.com
SUPERTOKENS_API_KEY=

# Database Configuration
DATABASE_URL=sqlite:///./focusboard_dev.db

# Server Configuration
API_PORT=5000
WEBSITE_PORT=3001

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3000
"""
    
    backend_env_path = os.path.join("backend", ".env")
    try:
        with open(backend_env_path, "w") as f:
            f.write(backend_env_content)
        print(f"✅ Created backend .env file: {backend_env_path}")
    except Exception as e:
        print(f"❌ Error creating backend .env file: {e}")

def create_frontend_env():
    """Create .env file for frontend"""
    frontend_env_content = """# Frontend Environment Variables
VITE_API_PORT=5000
VITE_API_URL=http://localhost:5000
VITE_WEBSITE_PORT=3001
VITE_WEBSITE_URL=http://localhost:3001

# SuperTokens Configuration
VITE_SUPERTOKENS_CONNECTION_URI=https://try.supertokens.com
"""
    
    frontend_env_path = os.path.join("frontend", ".env")
    try:
        with open(frontend_env_path, "w") as f:
            f.write(frontend_env_content)
        print(f"✅ Created frontend .env file: {frontend_env_path}")
    except Exception as e:
        print(f"❌ Error creating frontend .env file: {e}")

def main():
    print("🚀 Setting up environment variables for FocusBoard...")
    print()
    
    # Create backend .env
    create_backend_env()
    
    # Create frontend .env
    create_frontend_env()
    
    print()
    print("📋 Environment setup complete!")
    print()
    print("🔧 Next steps:")
    print("1. Start the backend server: cd backend && python app.py")
    print("2. Start the frontend server: cd frontend && npm run dev")
    print("3. Access the app at: http://localhost:3001")
    print()
    print("⚠️  Note: Make sure to add your actual SuperTokens API key to the backend .env file")
    print("   if you're using a hosted SuperTokens instance.")

if __name__ == "__main__":
    main()
