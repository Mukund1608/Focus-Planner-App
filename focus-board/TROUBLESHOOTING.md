# FocusBoard Troubleshooting Guide

This guide helps you fix common issues with the FocusBoard application, particularly with browser notifications and recurring tasks.

## 🚀 Quick Fix

If you're experiencing issues, run these commands in order:

```bash
# 1. Run the auto-fix script
python fix-issues.py

# 2. Run the troubleshooting script
python troubleshoot.py

# 3. Start the application
./start.sh
```

## 🔧 Common Issues and Solutions

### Issue 1: "Browser Notifications Disabled"

**Symptoms:**
- Notification permission shows as "denied" or "default"
- No notifications appear when tasks are due
- Settings page shows "Disabled" for notifications

**Solutions:**

1. **Check Browser Support:**
   ```javascript
   // Run in browser console
   console.log('Notification support:', 'Notification' in window);
   console.log('Permission:', Notification.permission);
   ```

2. **Request Permission:**
   - Go to Settings → Notifications
   - Click "Enable Notifications"
   - Allow notifications when prompted

3. **Manual Permission Request:**
   ```javascript
   // Run in browser console
   Notification.requestPermission().then(permission => {
     console.log('Permission:', permission);
   });
   ```

4. **Check Browser Settings:**
   - Chrome: Settings → Privacy and security → Site Settings → Notifications
   - Firefox: Settings → Privacy & Security → Permissions → Notifications
   - Safari: Preferences → Websites → Notifications

### Issue 2: "Failed to process recurring tasks"

**Symptoms:**
- Error message when clicking "Process Recurring Tasks"
- Recurring tasks don't create new occurrences
- Backend logs show import errors

**Solutions:**

1. **Check Backend Logs:**
   ```bash
   cd backend
   python app.py
   ```
   Look for error messages in the console.

2. **Verify Database:**
   ```bash
   python troubleshoot.py
   ```
   This will check if the database has the correct structure.

3. **Recreate Database:**
   ```bash
   cd backend
   python init_db.py
   ```

4. **Check Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

### Issue 3: Authentication Issues

**Symptoms:**
- Can't sign in or sign up
- Session errors
- Redirect loops

**Solutions:**

1. **Check SuperTokens Configuration:**
   - Verify `frontend/src/config.tsx` has correct ports
   - Verify `backend/config.py` has correct ports
   - Ensure CORS settings include both ports

2. **Clear Browser Data:**
   - Clear cookies and local storage
   - Try incognito/private mode

3. **Check Network:**
   - Ensure both frontend (3001) and backend (5000) are running
   - Check browser console for CORS errors

### Issue 4: Port Conflicts

**Symptoms:**
- "Port already in use" errors
- Can't start frontend or backend
- Connection refused errors

**Solutions:**

1. **Kill Existing Processes:**
   ```bash
   # On Windows
   netstat -ano | findstr :3001
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F

   # On Mac/Linux
   lsof -ti:3001 | xargs kill -9
   lsof -ti:5000 | xargs kill -9
   ```

2. **Use Different Ports:**
   - Edit `frontend/vite.config.ts` to use port 3002
   - Update SuperTokens config accordingly

### Issue 5: Database Issues

**Symptoms:**
- "Table doesn't exist" errors
- Missing data
- Schema errors

**Solutions:**

1. **Recreate Database:**
   ```bash
   cd backend
   python init_db.py
   ```

2. **Check Database File:**
   ```bash
   ls -la backend/focusboard_dev.db
   ```

3. **Verify Schema:**
   ```bash
   python troubleshoot.py
   ```

## 🧪 Testing and Debugging

### Basic Testing

1. **Check Backend Health:**
   ```bash
   cd backend
   python -c "
   from app import app
   from fastapi.testclient import TestClient
   client = TestClient(app)
   response = client.get('/health')
   print('Backend health:', response.json())
   "
   ```

2. **API Tests:**
   ```bash
   # Test backend health
   curl http://localhost:5000/health

   # Test SuperTokens session
   curl http://localhost:5000/sessioninfo
   ```

### Check Logs

1. **Frontend Logs:**
   - Open browser console (F12)
   - Look for errors in Console tab
   - Check Network tab for failed requests

2. **Backend Logs:**
   - Check terminal where backend is running
   - Look for Python errors and stack traces

3. **SuperTokens Logs:**
   - Check browser console for auth-related errors
   - Verify SuperTokens configuration

## 🔧 Manual Fixes

### Fix Notification Service

If notifications still don't work:

1. **Check Service Worker:**
   ```javascript
   // Run in browser console
   if ('serviceWorker' in navigator) {
     navigator.serviceWorker.getRegistrations().then(registrations => {
       console.log('Service Workers:', registrations);
     });
   }
   ```

2. **Test Notification API:**
   ```javascript
   // Run in browser console
   if ('Notification' in window) {
     Notification.requestPermission().then(permission => {
       if (permission === 'granted') {
         new Notification('Test', { body: 'This is a test' });
       }
     });
   }
   ```

### Fix Recurring Tasks

If recurring tasks don't work:

1. **Check Task Data:**
   ```sql
   -- Run in SQLite database
   SELECT * FROM tasks WHERE is_recurring = 1;
   ```

2. **Verify Recurring Config:**
   ```sql
   -- Run in SQLite database
   SELECT id, title, recurring_config, next_occurrence FROM tasks WHERE is_recurring = 1;
   ```

3. **Manual Processing:**
   ```python
   # Run in Python console
   from crud import process_recurring_tasks
   from database import get_db
   
   db = next(get_db())
   tasks = process_recurring_tasks(db, "your-user-id")
   print(f"Created {len(tasks)} new tasks")
   ```

## 📋 Step-by-Step Setup

If you're starting fresh:

1. **Clone and Setup:**
   ```bash
   git clone <repository>
   cd focus-board
   ```

2. **Install Dependencies:**
   ```bash
   # Backend
   cd backend
   pip install -r requirements.txt
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Initialize Database:**
   ```bash
   cd ../backend
   python init_db.py
   ```

4. **Start Services:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   python app.py
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

5. **Create Account:**
   - Go to http://localhost:3001
   - Click "Login" or go to http://localhost:3001/auth
   - Sign up for a new account

6. **Test Features:**
   - Create a task with a reminder
   - Create a recurring task
   - Test notifications

## 🆘 Getting Help

If you're still experiencing issues:

1. **Run the troubleshooting script:**
   ```bash
   python troubleshoot.py
   ```

2. **Check the logs:**
   - Backend terminal output
   - Browser console (F12)

3. **Verify your setup:**
   - Node.js version: `node --version`
   - Python version: `python --version`
   - Operating system and browser

4. **Common Requirements:**
   - Node.js 16+ and npm
   - Python 3.8+
   - Modern browser with notification support
   - Ports 3001 and 5000 available

## 🔄 Reset Everything

If all else fails, reset the entire setup:

```bash
# 1. Stop all processes
pkill -f "python.*app.py"
pkill -f "vite"

# 2. Delete database
rm backend/focusboard_dev.db

# 3. Clear node modules
rm -rf frontend/node_modules
rm frontend/package-lock.json

# 4. Reinstall everything
cd backend && pip install -r requirements.txt
cd ../frontend && npm install

# 5. Recreate database
cd ../backend && python init_db.py

# 6. Start fresh
cd .. && ./start.sh
```

This should resolve most issues with the FocusBoard application.
