# FocusBoard API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication

All API endpoints require authentication using SuperTokens. Include credentials in requests:

```javascript
fetch('/api/tasks', {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
})
```

## Endpoints

### Authentication

#### Sign In
```http
POST /auth/signin
Content-Type: application/json

{
  "formFields": [
    {
      "id": "email",
      "value": "user@example.com"
    },
    {
      "id": "password", 
      "value": "password123"
    }
  ]
}
```

#### Sign Up
```http
POST /auth/signup
Content-Type: application/json

{
  "formFields": [
    {
      "id": "email",
      "value": "user@example.com"
    },
    {
      "id": "password",
      "value": "password123"
    }
  ]
}
```

#### Sign Out
```http
POST /auth/signout
```

#### Refresh Session
```http
POST /auth/session/refresh
```

### Tasks

#### Get All Tasks
```http
GET /api/tasks
```

**Response:**
```json
[
  {
    "id": "1",
    "title": "Complete project",
    "description": "Finish the FocusBoard project",
    "priority": "high",
    "completed": false,
    "due_date": "2024-01-15",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### Create Task
```http
POST /api/tasks
Content-Type: application/json

{
  "title": "New Task",
  "description": "Task description",
  "priority": "high",
  "due_date": "2024-01-15"
}
```

**Response:**
```json
{
  "id": "2",
  "title": "New Task",
  "description": "Task description",
  "priority": "high",
  "completed": false,
  "due_date": "2024-01-15",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### Update Task
```http
PUT /api/tasks/{id}
Content-Type: application/json

{
  "title": "Updated Task",
  "priority": "medium"
}
```

#### Delete Task
```http
DELETE /api/tasks/{id}
```

### User Profile

#### Get User Profile
```http
GET /api/user/profile
```

**Response:**
```json
{
  "id": "user123",
  "metadata": {
    "name": "John Doe",
    "preferences": {
      "theme": "dark",
      "notifications": true
    }
  }
}
```

#### Update User Profile
```http
PUT /api/user/profile
Content-Type: application/json

{
  "metadata": {
    "name": "John Doe",
    "preferences": {
      "theme": "light",
      "notifications": false
    }
  }
}
```

### Health Check

#### Health Status
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Data Models

### Task
```typescript
interface Task {
  id: string
  title: string
  description?: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  completed: boolean
  due_date?: string
  created_at: string
  updated_at: string
}
```

### User
```typescript
interface User {
  id: string
  metadata: {
    name?: string
    preferences?: {
      theme: 'light' | 'dark'
      notifications: boolean
    }
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error",
  "detail": "Invalid priority value",
  "status_code": 400
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication error",
  "detail": "Invalid session",
  "status_code": 401
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "detail": "Task not found",
  "status_code": 404
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "detail": "An unexpected error occurred",
  "status_code": 500
}
```

## Rate Limiting

- **Authentication endpoints**: 10 requests per minute
- **API endpoints**: 100 requests per minute per user

## CORS

The API supports CORS for the following origins:
- `http://localhost:3001`
- `http://localhost:3000`
- `http://127.0.0.1:3001`
- `http://127.0.0.1:3000`

## WebSocket Events (Future)

Planned WebSocket support for real-time updates:

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:5000/ws')

// Listen for task updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  if (data.type === 'task_updated') {
    // Handle task update
  }
}
```

## SDK Examples

### JavaScript/TypeScript
```typescript
class FocusBoardAPI {
  private baseURL = 'http://localhost:5000'

  async getTasks(): Promise<Task[]> {
    const response = await fetch(`${this.baseURL}/api/tasks`, {
      credentials: 'include'
    })
    return response.json()
  }

  async createTask(task: Partial<Task>): Promise<Task> {
    const response = await fetch(`${this.baseURL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(task)
    })
    return response.json()
  }
}
```

### Python
```python
import requests

class FocusBoardAPI:
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def get_tasks(self):
        response = self.session.get(f"{self.base_url}/api/tasks")
        return response.json()
    
    def create_task(self, task_data):
        response = self.session.post(
            f"{self.base_url}/api/tasks",
            json=task_data
        )
        return response.json()
```

## Testing

### Test Endpoints

#### Test SuperTokens Configuration
```http
GET /test-supertokens
```

#### Test Auth Endpoint
```http
GET /auth/test
```

### Example Test Requests

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test tasks endpoint (requires authentication)
curl -X GET http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  --cookie "session=your-session-cookie"
```
