# BioSearch Deployment Guide

## Frontend Deployment (Vercel)

### 1. Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set the following environment variables in Vercel:
   - `VITE_API_BASE_URL`: Your deployed backend URL (e.g., `https://your-backend.railway.app/api`)

### 2. Build Configuration

The project is configured with:
- **Root Directory**: `frontend/`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## Backend Deployment Options

### Option 1: Railway (Recommended)
1. Connect your GitHub repository to Railway
2. Set the root directory to `backend/`
3. Railway will automatically detect Python and install dependencies
4. Add environment variables if needed

### Option 2: Render
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set:
   - **Root Directory**: `backend/`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`

### Option 3: Heroku
1. Create a new Heroku app
2. Set the buildpack to Python
3. Deploy from the `backend/` directory

## Environment Variables

### Frontend (Vercel)
- `VITE_API_BASE_URL`: Backend API URL

### Backend (Railway/Render/Heroku)
- `FLASK_ENV`: `production`
- `SECRET_KEY`: Your secret key for Flask sessions

## Database

The current setup uses SQLite. For production, consider:
- PostgreSQL (Railway, Render, Heroku all support this)
- Update the database configuration in `backend/app.py`

## Current Configuration

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Flask + SQLAlchemy + SQLite
- **Authentication**: JWT tokens with SHA-256 password hashing
- **Database**: SQLite (can be upgraded to PostgreSQL)

## Quick Deploy Steps

1. **Deploy Backend First**:
   - Use Railway, Render, or Heroku
   - Get the deployed URL

2. **Deploy Frontend**:
   - Connect to Vercel
   - Set `VITE_API_BASE_URL` to your backend URL
   - Deploy

3. **Update Database**:
   - Run the seed script on your deployed backend
   - Or set up a production database
