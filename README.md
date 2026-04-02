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
- Auth-ready frontend with Supabase email/password login

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
5. In Supabase Auth settings, add `https://www.resumeforgeai.online/auth` as the primary redirect URL and keep `https://resumeforgeai.online/auth` only if the apex domain may receive auth traffic before redirecting.
6. In Supabase `Project Settings` -> `API`, copy the project URL into both frontend and backend config, use the publishable anon key in the frontend, and use the `service_role` key only in the backend.
