# FocusBoard Backend

This is the FastAPI backend for FocusBoard, providing priority task management with SuperTokens authentication.

## Features

- **Priority Boards**: Create and manage multiple priority boards
- **Task Management**: CRUD operations for tasks with priority levels
- **Drag & Drop**: API support for reordering tasks within and between boards
- **Authentication**: Secure API endpoints with SuperTokens session verification
- **Database**: PostgreSQL with SQLAlchemy ORM

## Setup

### Prerequisites

- Python 3.8+
- PostgreSQL database
- SuperTokens instance running

### Installation

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables**:
   ```bash
   export DATABASE_URL="postgresql://username:password@localhost:5432/focusboard"
   ```

3. **Initialize database**:
   ```bash
   python init_db.py
   ```

4. **Run the application**:
   ```bash
   python app.py
   ```

The API will be available at `http://localhost:3001`

## API Endpoints

### Priority Boards
- `POST /api/priority-boards` - Create a new priority board
- `GET /api/priority-boards` - Get all priority boards for the user
- `GET /api/priority-boards/{id}` - Get a specific priority board
- `PUT /api/priority-boards/{id}` - Update a priority board
- `DELETE /api/priority-boards/{id}` - Delete a priority board

### Tasks
- `POST /api/tasks` - Create a new task
- `GET /api/tasks` - Get all tasks for the user
- `GET /api/tasks/priority-board/{id}` - Get tasks for a specific priority board
- `GET /api/tasks/{id}` - Get a specific task
- `PUT /api/tasks/{id}` - Update a task
- `DELETE /api/tasks/{id}` - Delete a task
- `POST /api/tasks/{id}/reorder` - Reorder a task
- `POST /api/tasks/bulk-update` - Bulk update multiple tasks

## Database Schema

### Users
- `id` (String) - SuperTokens user ID
- `email` (String) - User email
- `created_at` (DateTime) - Account creation timestamp
- `updated_at` (DateTime) - Last update timestamp

### Priority Boards
- `id` (Integer) - Unique identifier
- `name` (String) - Board name
- `user_id` (String) - Foreign key to users table
- `created_at` (DateTime) - Creation timestamp
- `updated_at` (DateTime) - Last update timestamp

### Tasks
- `id` (Integer) - Unique identifier
- `title` (String) - Task title
- `description` (Text) - Task description
- `priority` (Enum) - Priority level (urgent, high, medium, low)
- `status` (Enum) - Task status (pending, in_progress, completed)
- `due_date` (DateTime) - Optional due date
- `user_id` (String) - Foreign key to users table
- `priority_board_id` (Integer) - Foreign key to priority_boards table
- `position` (Integer) - Position within the priority board
- `created_at` (DateTime) - Creation timestamp
- `updated_at` (DateTime) - Last update timestamp

## Authentication

All API endpoints require a valid SuperTokens session. The session is verified using the `verify_session()` dependency, which extracts the user ID from the session token.

## Development

### Running Tests
```bash
# Add test dependencies and run tests
pytest
```

### Database Migrations
For production use, consider using Alembic for database migrations instead of the simple `create_tables()` function.

### Environment Configuration
Create a `.env` file with the following variables:
```
DATABASE_URL=postgresql://username:password@localhost:5432/focusboard
SUPERTOKENS_CONNECTION_URI=your_supertokens_connection_uri
SUPERTOKENS_API_KEY=your_supertokens_api_key
```
