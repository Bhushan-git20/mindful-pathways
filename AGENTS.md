# MindMate — Agent Rules

## Stack
React 18 | TypeScript | Vite | Tailwind CSS | shadcn/ui | Supabase | Gemini API (via Edge Functions)

## Architecture
Frontend (React/Vite) -> Supabase (PostgreSQL / Auth / Realtime) -> Supabase Edge Functions (Gemini AI)

## Key Pages
- Index.tsx: Landing page
- Dashboard.tsx: Main user hub
- Chat.tsx: AI Companion
- Journal.tsx: Private mood entries
- Assessments.tsx: PHQ-9/GAD-7 screenings
- Resources.tsx: Curated library
- Community.tsx: Anonymous peer support
- Profile.tsx: User profile settings
- Settings.tsx: App configuration
- Notifications.tsx: User alerts
- Progress.tsx: Goal tracking
- Trends.tsx: Analytics visuals
- History.tsx: Activity logs
- Admin.tsx: Administrator dashboard
- NotFound.tsx: 404 Error page

## Rules
- Components: Use functional components and hooks. Follow shadcn/ui patterns.
- Styling: Tailwind CSS exclusively. Use glassmorphism tokens where applicable.
- State Management: Use TanStack Query for data fetching.
- DB Queries: Use Supabase JS client. Ensure RLS (Row Level Security) is respected.
- Routing: React Router v6.
