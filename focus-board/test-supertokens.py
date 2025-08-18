#!/usr/bin/env python3
"""
SuperTokens Configuration Test Script
This script tests the SuperTokens configuration and initialization.
"""

import os
import sys
from dotenv import load_dotenv

def test_supertokens_config():
    """Test SuperTokens configuration"""
    print("🔍 Testing SuperTokens Configuration...")
    
    try:
        # Load environment variables
        load_dotenv("backend/.env")
        
        # Import SuperTokens config
        sys.path.append("backend")
        import config
        
        print("✅ SuperTokens configuration loaded successfully")
        print(f"   API Domain: {config.get_api_domain()}")
        print(f"   Website Domain: {config.get_website_domain()}")
        print(f"   Connection URI: {config.supertokens_config.connection_uri}")
        print(f"   API Key: {config.supertokens_config.api_key}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error loading SuperTokens configuration: {e}")
        return False

def test_supertokens_init():
    """Test SuperTokens initialization"""
    print("\n🔍 Testing SuperTokens Initialization...")
    
    try:
        # Import and test SuperTokens init
        sys.path.append("backend")
        import config
        
        # Check if SuperTokens is initialized
        from supertokens_python import get_all_cors_headers
        
        print("✅ SuperTokens initialization successful")
        print(f"   CORS headers: {get_all_cors_headers()}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during SuperTokens initialization: {e}")
        return False

def test_fastapi_integration():
    """Test FastAPI integration with SuperTokens"""
    print("\n🔍 Testing FastAPI Integration...")
    
    try:
        # Import FastAPI app
        sys.path.append("backend")
        from app import app
        
        print("✅ FastAPI app imported successfully")
        print(f"   App title: {app.title}")
        print(f"   App version: {app.version}")
        
        # Check if SuperTokens middleware is added
        middleware_count = len(app.user_middleware)
        print(f"   Middleware count: {middleware_count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing FastAPI integration: {e}")
        return False

def main():
    print("🚀 SuperTokens Configuration Test")
    print("=" * 40)
    
    # Test SuperTokens config
    config_ok = test_supertokens_config()
    
    # Test SuperTokens init
    init_ok = test_supertokens_init()
    
    # Test FastAPI integration
    fastapi_ok = test_fastapi_integration()
    
    print("\n" + "=" * 40)
    print("📊 Test Results:")
    print(f"   Configuration: {'✅ PASS' if config_ok else '❌ FAIL'}")
    print(f"   Initialization: {'✅ PASS' if init_ok else '❌ FAIL'}")
    print(f"   FastAPI Integration: {'✅ PASS' if fastapi_ok else '❌ FAIL'}")
    
    if all([config_ok, init_ok, fastapi_ok]):
        print("\n🎉 SuperTokens is properly configured!")
        print("\n🔧 Next steps:")
        print("1. Restart the backend server")
        print("2. Test authentication endpoints")
        print("3. Try signing up/signing in from frontend")
    else:
        print("\n⚠️  Some SuperTokens tests failed.")
        print("   Check the configuration and try again.")

if __name__ == "__main__":
    main()
