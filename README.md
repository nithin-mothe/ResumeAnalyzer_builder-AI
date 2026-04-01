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

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env` with `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY`.

## Supabase Manual Setup

1. Open the Supabase SQL editor.
2. Run [`supabase/schema.sql`](supabase/schema.sql).
3. Confirm the `resume-files` storage bucket exists.
4. Enable email/password auth.

