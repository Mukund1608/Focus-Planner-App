#!/usr/bin/env python3
"""
Authentication Test Script for FocusBoard
This script tests the SuperTokens configuration and environment variables.
"""

import os
import sys
import requests
from dotenv import load_dotenv

def test_environment_variables():
    """Test if environment variables are loaded correctly"""
    print("🔍 Testing environment variables...")
    
    # Load .env file from backend directory
    load_dotenv("backend/.env")
    
    # Check backend environment variables
    backend_vars = {
        "SUPERTOKENS_CONNECTION_URI": os.getenv("SUPERTOKENS_CONNECTION_URI"),
        "API_PORT": os.getenv("API_PORT", "5000"),
        "WEBSITE_PORT": os.getenv("WEBSITE_PORT", "3001"),
        "ALLOWED_ORIGINS": os.getenv("ALLOWED_ORIGINS")
    }
    
    print("📋 Backend Environment Variables:")
    for var, value in backend_vars.items():
        status = "✅" if value else "❌"
        print(f"   {status} {var}: {value}")
    
    return all(backend_vars.values())

def test_backend_connection():
    """Test if backend is running and accessible"""
    print("\n🔍 Testing backend connection...")
    
    try:
        api_port = os.getenv("API_PORT", "5000")
        response = requests.get(f"http://localhost:{api_port}/", timeout=5)
        
        if response.status_code == 200:
            print("✅ Backend is running and accessible")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ Backend returned status code: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Backend is not running or not accessible")
        print("   Start the backend with: cd backend && python app.py")
        return False
    except Exception as e:
        print(f"❌ Error connecting to backend: {e}")
        return False

def test_supertokens_config():
    """Test SuperTokens configuration"""
    print("\n🔍 Testing SuperTokens configuration...")
    
    try:
        # Import and test SuperTokens config
        sys.path.append("backend")
        import config
        
        print("✅ SuperTokens configuration loaded successfully")
        print(f"   API Domain: {config.get_api_domain()}")
        print(f"   Website Domain: {config.get_website_domain()}")
        print(f"   Connection URI: {config.supertokens_config.connection_uri}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error loading SuperTokens configuration: {e}")
        return False

def main():
    print("🚀 FocusBoard Authentication Test")
    print("=" * 40)
    
    # Test environment variables
    env_ok = test_environment_variables()
    
    # Test SuperTokens config
    config_ok = test_supertokens_config()
    
    # Test backend connection
    backend_ok = test_backend_connection()
    
    print("\n" + "=" * 40)
    print("📊 Test Results:")
    print(f"   Environment Variables: {'✅ PASS' if env_ok else '❌ FAIL'}")
    print(f"   SuperTokens Config: {'✅ PASS' if config_ok else '❌ FAIL'}")
    print(f"   Backend Connection: {'✅ PASS' if backend_ok else '❌ FAIL'}")
    
    if all([env_ok, config_ok, backend_ok]):
        print("\n🎉 All tests passed! Authentication should work correctly.")
        print("\n🔧 Next steps:")
        print("1. Start the frontend: cd frontend && npm run dev")
        print("2. Access the app at: http://localhost:3001")
        print("3. Try signing up/signing in")
    else:
        print("\n⚠️  Some tests failed. Please fix the issues above.")
        
        if not env_ok:
            print("   - Check that .env files are created correctly")
        if not config_ok:
            print("   - Check SuperTokens configuration in backend/config.py")
        if not backend_ok:
            print("   - Start the backend server first")

if __name__ == "__main__":
    main()
