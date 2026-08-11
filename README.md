# AI Resume Platform

Production-oriented AI resume platform with a FastAPI backend, React + Vite frontend, Groq-powered analysis, and Supabase persistence.

## Stack

- Backend: FastAPI, PyMuPDF, Groq, Supabase Python SDK, fpdf2
- Frontend: React, React Router, Axios, Supabase JS
- Database: Supabase PostgreSQL, Auth, Storage

## Features

- PDF-only resume upload and parsing
- AI resume analysis with structured scoring
- ATS keyword match engine
- AI resume builder with strict JSON validation
- Resume chat assistant
- PDF generation without system dependencies
- Supabase-backed storage for resumes and analysis results
- Supabase-backed job application tracking with local browser fallback
- Auth-ready frontend with Supabase email/password and Google OAuth login

## Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Create `backend/.env` from the root `.env.example`. The backend will refuse to start if `GROQ_API_KEY` is missing.
Use your Supabase `service_role` key for `SUPABASE_KEY` on the backend. The backend writes resume rows and storage objects, so the publishable key is not enough for the current server flow.

For Render or any deployed backend, make sure `CORS_ORIGINS` includes both `https://resumeforgeai.online` and `https://www.resumeforgeai.online` so the apex domain can redirect cleanly while `https://www.resumeforgeai.online` remains the public app origin.

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env` with `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY`.

For Vercel production, set `VITE_API_BASE_URL` to the live Render backend URL so browser requests do not point at localhost.
Set `VITE_AUTH_REDIRECT_ORIGIN=https://www.resumeforgeai.online` so email confirmations and OAuth callbacks always return to the public site.

## Supabase Manual Setup

1. Open the Supabase SQL editor.
2. Run [`supabase/schema.sql`](supabase/schema.sql).
3. Confirm the `resume-files` storage bucket exists.
4. Enable email/password auth.
5. Enable Google under Supabase Auth providers, then add the Google OAuth client ID and secret from Google Cloud Console.
6. In Supabase Auth settings, add `https://www.resumeforgeai.online/auth` as the primary redirect URL and keep `https://resumeforgeai.online/auth` only if the apex domain may receive auth traffic before redirecting. For local testing, also add `http://localhost:5173/auth` and `http://127.0.0.1:5173/auth`.
7. In Google Cloud Console, add Supabase's callback URL from the Google provider panel as an authorized redirect URI. The public app redirects back to `https://www.resumeforgeai.online/auth` after Supabase completes OAuth.
8. In Supabase `Project Settings` -> `API`, copy the project URL into both frontend and backend config, use the publishable anon key in the frontend, and use the `service_role` key only in the backend.

The schema includes `applications` for the Job Tracker. Re-run the SQL after pulling updates so signed-in users can sync application records across devices.
