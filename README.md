# Cartoon Streaming Platform

A full-stack cartoon streaming platform built with FastAPI and React.

## What is included

- `backend_main.py` – FastAPI backend with SQLite persistence and file uploads.
- `cartoon-streaming-frontend.jsx` – React frontend component for the streaming UI.
- `requirements.txt` – Python dependencies required to run the backend.
- `setup.sh` – Unix-compatible setup script for Linux/macOS environments.
- `setup.ps1` – Windows PowerShell setup script for Windows environments.
- `PROJECT_SUMMARY.md` – Feature overview and technology details.
- `SETUP_GUIDE.md` – Detailed installation and deployment instructions.

## Getting started

### Backend

1. Install dependencies:
   - On Windows: `.uild.ps1` is available, or use `python -m venv venv` and `python -m pip install -r requirements.txt`.
   - On Linux/macOS: `bash setup.sh`.
2. Run the backend:
   - `python backend_main.py`
3. Open the API docs:
   - `http://localhost:8000/docs`

### Frontend

1. Install dependencies:
   - `npm install`
2. Create a `.env` file from `.env.example`:
   - `copy .env.example .env`
3. Update `.env` with your Supabase project values:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Start the frontend:
   - `npm run dev`
5. Open the app:
   - `http://localhost:5173`

### Supabase setup

To power uploads and dynamic content, configure Supabase tables and storage:

- Create a storage bucket named `cartoon-assets`.
- Create tables: `cartoons`, `categories`, and `episodes`.
- Use the following columns:
  - `cartoons`: `id`, `title`, `description`, `image_url`, `rating`, `year`
  - `categories`: `id`, `cartoon_id`, `name`, `order`
  - `episodes`: `id`, `cartoon_id`, `category_id`, `episode_number`, `name`, `description`, `duration`, `video_url`, `thumbnail_url`, `views`

### Backend (optional)

The existing Python backend remains available for local uploads and API testing.

1. Install backend dependencies:
   - `python -m pip install -r requirements.txt`
2. Start the backend:
   - `python backend_main.py`
3. Open the API docs:
   - `http://localhost:8000/docs`

## Notes

- The new frontend is built with Vite and React, using `src/App.jsx` and `src/main.jsx`.
- The upload page supports Supabase magic-link authentication.
- The app falls back to sample content if Supabase is not configured.
- Local backend uploads continue to be stored under `uploads/videos/` and `uploads/thumbnails/`.
