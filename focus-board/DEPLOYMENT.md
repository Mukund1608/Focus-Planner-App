# FocusBoard Deployment Guide

This guide covers deploying FocusBoard to various platforms.

## Prerequisites

- Git repository with your FocusBoard code
- SuperTokens account and configuration
- Domain name (optional but recommended)

## Environment Setup

### 1. SuperTokens Configuration

1. **Create SuperTokens App**
   - Go to [SuperTokens Dashboard](https://supertokens.com/dashboard)
   - Create a new app
   - Choose "Email Password" recipe
   - Note your connection URI and API key

2. **Update Environment Variables**
   ```env
   SUPERTOKENS_CONNECTION_URI=your_connection_uri
   SUPERTOKENS_API_KEY=your_api_key
   ```

### 2. Database Setup

For production, consider using PostgreSQL instead of SQLite:

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

## Backend Deployment

### Option 1: Heroku

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew install heroku/brew/heroku
   
   # Windows
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Create Heroku App**
   ```bash
   heroku create your-focusboard-backend
   ```

3. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set SUPERTOKENS_CONNECTION_URI=your_connection_uri
   heroku config:set SUPERTOKENS_API_KEY=your_api_key
   heroku config:set ALLOWED_ORIGINS=https://your-frontend-domain.com
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 2: Railway

1. **Connect Repository**
   - Go to [Railway](https://railway.app/)
   - Connect your GitHub repository
   - Select the backend directory

2. **Configure Environment**
   - Add environment variables in Railway dashboard
   - Set up PostgreSQL database

3. **Deploy**
   - Railway automatically deploys on push to main branch

### Option 3: DigitalOcean App Platform

1. **Create App**
   - Go to DigitalOcean App Platform
   - Connect your repository
   - Select Python as runtime

2. **Configure**
   - Set build command: `pip install -r requirements.txt`
   - Set run command: `python app.py`
   - Add environment variables

3. **Deploy**
   - Deploy automatically on git push

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

3. **Configure Environment**
   - Set `VITE_API_URL` to your backend URL
   - Set `VITE_WEBSITE_URL` to your frontend URL

### Option 2: Netlify

1. **Connect Repository**
   - Go to Netlify
   - Connect your GitHub repository
   - Set build directory to `frontend`
   - Set build command: `npm run build`
   - Set publish directory: `frontend/dist`

2. **Environment Variables**
   ```env
   VITE_API_URL=https://your-backend-url.com
   VITE_WEBSITE_URL=https://your-frontend-url.com
   ```

### Option 3: GitHub Pages

1. **Update package.json**
   ```json
   {
     "homepage": "https://yourusername.github.io/focusboard",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

2. **Deploy**
   ```bash
   npm run deploy
   ```

## Docker Deployment

### Backend Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
```

### Frontend Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - SUPERTOKENS_CONNECTION_URI=${SUPERTOKENS_CONNECTION_URI}
      - SUPERTOKENS_API_KEY=${SUPERTOKENS_API_KEY}
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "3001:80"
    environment:
      - VITE_API_URL=http://localhost:5000
    depends_on:
      - backend

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=focusboard
      - POSTGRES_USER=focusboard
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## SSL/HTTPS Setup

### Vercel/Netlify
- Automatic SSL certificates
- Custom domain support

### Heroku
```bash
heroku certs:auto:enable
```

### Custom Domain
1. **Add Custom Domain**
   - Configure DNS records
   - Add domain in hosting platform
   - Enable SSL certificate

2. **Update SuperTokens**
   - Update website domain in SuperTokens dashboard
   - Update API domain if different

## Monitoring & Logging

### Backend Monitoring

1. **Add Logging**
   ```python
   import logging
   logging.basicConfig(level=logging.INFO)
   ```

2. **Health Checks**
   ```bash
   curl https://your-backend.com/health
   ```

### Frontend Monitoring

1. **Error Tracking**
   ```javascript
   // Add Sentry or similar
   import * as Sentry from "@sentry/react";
   Sentry.init({ dsn: "your-dsn" });
   ```

2. **Performance Monitoring**
   ```javascript
   // Add analytics
   import { Analytics } from '@vercel/analytics/react';
   ```

## CI/CD Pipeline

### GitHub Actions

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          cd frontend
          npm install
          npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.14
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: "your-app-name"
          heroku_email: "your-email@example.com"

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `ALLOWED_ORIGINS` environment variable
   - Ensure frontend URL is included

2. **Authentication Issues**
   - Verify SuperTokens configuration
   - Check domain settings in SuperTokens dashboard

3. **Database Connection**
   - Verify database URL
   - Check database permissions

4. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### Debug Commands

```bash
# Check backend logs
heroku logs --tail

# Check frontend build
npm run build

# Test API endpoints
curl https://your-backend.com/health

# Check environment variables
heroku config
```

## Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database credentials protected
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] Error messages don't expose sensitive data
- [ ] Regular security updates

## Performance Optimization

1. **Backend**
   - Enable database connection pooling
   - Implement caching (Redis)
   - Use CDN for static assets

2. **Frontend**
   - Enable code splitting
   - Optimize bundle size
   - Use service workers for caching

## Backup Strategy

1. **Database Backups**
   ```bash
   # PostgreSQL
   pg_dump $DATABASE_URL > backup.sql
   
   # Automated backups
   heroku pg:backups schedule DATABASE_URL --at '02:00 UTC'
   ```

2. **Code Backups**
   - Use Git for version control
   - Regular pushes to remote repository
   - Tag releases for easy rollback

## Maintenance

1. **Regular Updates**
   - Update dependencies monthly
   - Monitor security advisories
   - Keep SuperTokens SDK updated

2. **Monitoring**
   - Set up uptime monitoring
   - Monitor error rates
   - Track performance metrics

3. **Backup Verification**
   - Test restore procedures
   - Verify backup integrity
   - Document recovery procedures
