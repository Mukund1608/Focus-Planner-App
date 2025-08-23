# FocusBoard - Priority Task Management

A modern, offline-first task management application built with React, FastAPI, and SuperTokens authentication.

## 🚀 Features

- **Priority-Based Task Management** - Organize tasks by urgency (Urgent, High, Medium, Low)
- **Multiple Views** - Daily and Weekly task views
- **Offline-First** - Works without internet connection with automatic sync
- **Focus Mode** - Distraction-free task completion
- **Habit Tracking** - Build and track daily habits with streaks
- **Smart Notifications** - Browser notifications with customizable settings
- **Dark Mode** - Beautiful dark and light themes
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Real-time Sync** - Automatic synchronization when online

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Beautiful DnD** for drag-and-drop functionality
- **SuperTokens** for authentication
- **IndexedDB** for offline storage
- **Service Workers** for offline functionality

### Backend
- **FastAPI** with Python
- **SQLAlchemy** for database ORM
- **SQLite** for data storage
- **SuperTokens** for authentication
- **Pydantic** for data validation

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd focus-board
   ```

2. **Set up Python environment**
   ```bash
   cd backend
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the backend server**
   ```bash
   python app.py
   ```
   
   The backend will be available at `http://localhost:5000`

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server**
   ```bash
   npm start
   ```
   
   The frontend will be available at `http://localhost:3001`

## 🧪 Testing

### Unit Tests
```bash
cd frontend
npm test
```

### Integration Tests
```bash
npm run test:coverage
```

### End-to-End Tests
```bash
npm run test:e2e
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /auth/signin` - User sign in
- `POST /auth/signup` - User sign up
- `POST /auth/session/refresh` - Refresh session
- `POST /auth/signout` - User sign out

### Task Endpoints
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### User Endpoints
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

## 🏗️ Project Structure

```
focus-board/
├── backend/
│   ├── app.py              # FastAPI application
│   ├── config.py           # SuperTokens configuration
│   ├── models.py           # Database models
│   ├── schemas.py          # Pydantic schemas
│   ├── api.py              # API routes
│   ├── crud.py             # Database operations
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── contexts/       # React contexts
│   │   ├── types/          # TypeScript types
│   │   ├── styles/         # CSS styles
│   │   └── e2e/           # End-to-end tests
│   ├── public/            # Static assets
│   └── package.json       # Node.js dependencies
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# SuperTokens Configuration
SUPERTOKENS_CONNECTION_URI=https://try.supertokens.com
SUPERTOKENS_API_KEY=

# Database
DATABASE_URL=sqlite:///./focusboard_dev.db

# Server Configuration
API_PORT=5000
WEBSITE_PORT=3001

# CORS
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3000
```

## 🚀 Deployment

### Backend Deployment (Heroku)

1. **Create Heroku app**
   ```bash
   heroku create your-focusboard-app
   ```

2. **Set environment variables**
   ```bash
   heroku config:set SUPERTOKENS_CONNECTION_URI=your_connection_uri
   heroku config:set SUPERTOKENS_API_KEY=your_api_key
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Frontend Deployment (Vercel)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write unit tests for new features
- Ensure responsive design
- Follow accessibility guidelines
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/your-repo/focusboard/issues) page
2. Create a new issue with detailed information
3. Include browser console logs and error messages

## 🗺️ Roadmap

- [ ] Team collaboration features
- [ ] Advanced analytics and reporting
- [ ] Mobile app (React Native)
- [ ] Integration with calendar apps
- [ ] AI-powered task prioritization
- [ ] Time tracking features

## 🙏 Acknowledgments

- [SuperTokens](https://supertokens.com/) for authentication
- [React Beautiful DnD](https://github.com/atlassian/react-beautiful-dnd) for drag-and-drop
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [Vite](https://vitejs.dev/) for the build tool
