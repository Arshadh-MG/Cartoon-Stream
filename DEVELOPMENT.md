# Development Guide

## Project Architecture

This is a **Vite + React + Supabase** project:
- Frontend: Vite/React with React Router
- Backend: Supabase PostgreSQL + Storage
- Deployment: Static hosting (Vercel, Netlify, etc.)

## Local Development

### Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and add your Supabase credentials
3. Run Supabase schema: In Supabase Dashboard → SQL Editor, paste and run `supabase-schema.sql`
4. Start dev server: `npm run dev`

### Making Changes

- Frontend code is in `src/`
- Use `npm run dev` for hot reloading
- Check console for errors

### Before Committing

- Make sure `.env` is not committed (it's in `.gitignore`)
- Test the app with `npm run build && npm run preview`
- Update `.env.example` with placeholders if you add new env vars

## Common Tasks

### Adding a new page

1. Create `src/pages/NewPage.jsx`
2. Add route to `src/App.jsx`
3. Import and use in App component

### Adding a component

1. Create `src/components/NewComponent.jsx`
2. Import in the page where it's needed

### Updating Supabase schema

1. Make changes in Supabase Dashboard
2. Export schema from SQL Editor (if needed)
3. Update `supabase-schema.sql` with changes
4. Document the change in PR

## Debugging

### Supabase connection issues

- Check `.env` values match your Supabase project
- Look for errors in browser console
- Check Supabase Dashboard → Auth and SQL Editor for issues

### Video playback issues

- Check video URLs are valid and CORS-enabled
- Ensure videos are MP4 format
- Check browser console for specific errors

## Deployment

1. `npm run build`
2. Deploy `dist/` folder to Vercel/Netlify
3. Make sure environment variables are set on the hosting platform

For detailed deployment instructions, see README.md
