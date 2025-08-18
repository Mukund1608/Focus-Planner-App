#!/usr/bin/env python3
"""
Frontend Authentication Test Script
This script tests the frontend authentication configuration.
"""

import requests
import json

def test_frontend_connection():
    """Test if frontend is accessible"""
    try:
        response = requests.get("http://localhost:3001", timeout=5)
        print(f"✅ Frontend is accessible: {response.status_code}")
        return True
    except Exception as e:
        print(f"❌ Frontend is not accessible: {e}")
        return False

def test_backend_auth_endpoints():
    """Test backend authentication endpoints"""
    endpoints = [
        "/auth/signup",
        "/auth/signin", 
        "/auth/signout",
        "/auth/session"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"http://localhost:5000{endpoint}", timeout=5)
            print(f"✅ {endpoint}: {response.status_code}")
        except Exception as e:
            print(f"❌ {endpoint}: {e}")

def test_supertokens_connection():
    """Test SuperTokens connection"""
    try:
        response = requests.get("https://try.supertokens.com", timeout=5)
        print(f"✅ SuperTokens service is accessible: {response.status_code}")
        return True
    except Exception as e:
        print(f"❌ SuperTokens service is not accessible: {e}")
        return False

def main():
    print("🔍 Testing Frontend Authentication Configuration")
    print("=" * 50)
    
    # Test frontend
    frontend_ok = test_frontend_connection()
    
    # Test SuperTokens
    supertokens_ok = test_supertokens_connection()
    
    # Test backend auth endpoints
    print("\n🔍 Testing Backend Authentication Endpoints:")
    test_backend_auth_endpoints()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"   Frontend: {'✅ PASS' if frontend_ok else '❌ FAIL'}")
    print(f"   SuperTokens: {'✅ PASS' if supertokens_ok else '❌ FAIL'}")
    
    if frontend_ok and supertokens_ok:
        print("\n🎉 Basic connectivity is working!")
        print("🔧 Next steps:")
        print("1. Open http://localhost:3001 in your browser")
        print("2. Click 'Get Started' to access authentication")
        print("3. Check browser console for any JavaScript errors")
    else:
        print("\n⚠️  Some connectivity issues detected.")

if __name__ == "__main__":
    main()
