# Cartoon Streaming Platform

A modern cartoon streaming platform built with **Vite + React** frontend and **Supabase** backend.

## Architecture

This project uses a **Vite + Supabase** architecture:
- **Frontend**: Vite/React with React Router (single-page app)
- **Backend**: Supabase PostgreSQL + Storage (serverless)
- **Deployment**: Can be deployed to Vercel, Netlify, or any static host

> **Note**: The old FastAPI backend (`backend_main.py`) is deprecated. Use Supabase instead.

## What is included

- `src/` – Vite/React source code with components and pages
- `supabase-schema.sql` – Database setup script (run in Supabase SQL editor)
- `.env.example` – Environment variable template
- `vite.config.js` – Vite bundler configuration
- `package.json` – Node.js dependencies

## Getting started

### Prerequisites

- Node.js 18+
- Supabase project (free at https://supabase.com)

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a Supabase project at https://supabase.com
2. Copy your project URL and public API key from Supabase dashboard
3. In your Supabase SQL editor, run `supabase-schema.sql` to create tables and storage
4. For admin uploads, set your user's `app_metadata.role` to `'admin'` in Supabase Auth

### 3. Configure environment variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Update `.env` with your Supabase values:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

### 4. Run the development server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### 5. Build for production

```bash
npm run build
```

Output is in `dist/` directory.

## Features

- **Browse**: Browse cartoons by category and season
- **Watch**: Stream episodes with adaptive controls (playback speed, volume, etc.)
- **Upload** (admin only): Upload new cartoons, categories, and episodes
- **Admin Panel** (admin only): Manage content (edit/delete episodes, categories)
- **Responsive**: Works on desktop, tablet, and mobile
- **Demo mode**: Works with sample data if Supabase is not configured

## Pages

- `/` – Homepage with featured cartoons
- `/browse` – Browse all cartoons
- `/watch/:episodeId` – Watch episode
- `/upload` – Upload new content (admin only)
- `/admin/videos` – Manage uploaded content (admin only)
- `/my-list` – Saved favorites (localStorage)
- `/feedback` – Send feedback

## Deployment

### Vercel / Netlify / Static Host

1. Build the project: `npm run build`
2. Deploy `dist/` folder
3. Configure SPA routing to redirect all routes to `index.html`:
   - **Vercel**: No config needed (auto-detects Vite)
   - **Netlify**: Add `_redirects` file (see below)
   - **Other hosts**: Configure to serve `index.html` for 404s

#### Netlify `_redirects` file

Create `public/_redirects`:

```
/*    /index.html   200
```

#### Vercel `vercel.json`

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Common Issues

### "Episode not found" message

- Check that `supabase-schema.sql` was run in your Supabase SQL editor
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env`
- Check that episodes exist in your Supabase database

### Upload/Admin pages say "Supabase is not configured"

- Add both environment variables to `.env`
- Restart dev server after changing `.env`

### Videos don't play

- Check that video URLs are valid and CORS-enabled
- Ensure video format is supported by your browser (H.264 MP4 recommended)

## Development

### File structure

```
src/
├── App.jsx              Main app component
├── main.jsx             Entry point
├── components/          Reusable components
├── pages/               Page components
├── lib/                 Utility functions
├── data/                Sample data
└── styles.css           Global styles
```

### Debugging Supabase connection

Enable Supabase debug logging by adding to `src/main.jsx`:

```javascript
if (import.meta.env.DEV) {
  // Supabase will log to console in development
}
```

## Security Notes

- **RLS Policies**: Admin-only writes are enforced via Row-Level Security
- Only users with `app_metadata.role = 'admin'` can upload/delete content
- Environment variables: `VITE_SUPABASE_PUBLISHABLE_KEY` is public (safe), but keep your project private
- Never commit `.env` (add to `.gitignore`)

## Support

- Supabase docs: https://supabase.com/docs
- Vite docs: https://vitejs.dev
- React docs: https://react.dev
