#!/usr/bin/env python3
"""
Backend Startup Script for FocusBoard
This script starts the backend server with proper error handling.
"""

import os
import sys
import uvicorn
from dotenv import load_dotenv

def main():
    print("🚀 Starting FocusBoard Backend Server...")
    
    # Load environment variables
    load_dotenv("backend/.env")
    
    # Check environment variables
    api_port = os.getenv("API_PORT", "5000")
    print(f"📋 Using API Port: {api_port}")
    print(f"📋 SuperTokens URI: {os.getenv('SUPERTOKENS_CONNECTION_URI')}")
    print(f"📋 Database URL: {os.getenv('DATABASE_URL')}")
    
    try:
        # Import the app
        sys.path.append("backend")
        from app import app
        
        print("✅ Backend app imported successfully")
        print(f"🌐 Starting server on http://localhost:{api_port}")
        
        # Start the server
        uvicorn.run(
            "backend.app:app",
            host="0.0.0.0",
            port=int(api_port),
            reload=True,
            log_level="info"
        )
        
    except ImportError as e:
        print(f"❌ Error importing backend app: {e}")
        print("   Make sure all dependencies are installed:")
        print("   pip install -r backend/requirements.txt")
        return 1
    except Exception as e:
        print(f"❌ Error starting backend server: {e}")
        return 1

if __name__ == "__main__":
    main()
