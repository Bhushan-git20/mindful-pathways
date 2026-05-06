# MindMate 🧠💙

**MindMate** is a student‑focused mental‑wellness platform that helps users track their mood, complete self‑assessments, journal, and access curated resources. The app uses a modern **React + TypeScript** front‑end, **Tailwind CSS** with a glass‑morphic design, and **Supabase** for authentication, database, and edge functions (including an AI‑powered chatbot). All sensitive configuration lives in a `.env` file which is now ignored by Git.

---

## ✨ Key Features

- **Dashboard** – Overview of wellness score, streaks, and quick actions.
- **Self‑Assessment** – PHQ‑9 & GAD‑7 questionnaires with risk‑level scoring and trend history.
- **Journal** – Private entries with AI‑driven sentiment tagging.
- **Insights & Trends** – Interactive charts (Recharts) visualising depression & anxiety over time.
- **AI Chatbot** – Real‑time mental‑health support via Gemini‑Flash (Supabase Edge Function).
- **Resources** – Curated mental‑health articles, videos and crisis helplines.
- **History Page** – Detailed view of past assessments, scores and trend analysis (restored).
- **Admin Panel** – User management and resource CRUD for supervisors.
- **Dark / Light Theme** – Seamless toggling using `next‑themes`.
- **Responsive Design** – Mobile‑first layout with glass‑morphic UI.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript |
| **Build** | Vite 8 |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Routing** | React‑Router v6 |
| **State / Data** | TanStack Query v5 |
| **Forms** | React‑Hook‑Form + Zod |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **Backend** | Supabase (Auth, Postgres, Edge Functions) |
| **AI** | Google Gemini 1.5 Flash (via Edge Function) |
| **Icons** | Lucide‑React |

---

## 🚀 Getting Started

### Prerequisites
- Node 18+ and npm
- A Supabase project (free tier works)

### 1️⃣ Clone the repository
```bash
git clone https://github.com/Bhushan-git20/mindful-pathways.git
cd mindful-pathways
```

### 2️⃣ Install dependencies
```bash
npm install --legacy-peer-deps
```

### 3️⃣ Configure environment variables (do **NOT** commit this file)
Create a `.env` in the project root:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```
The `.gitignore` already excludes `.env`.

### 4️⃣ Run the dev server
```bash
npm run dev
```
Open **http://localhost:8080** in your browser.

---

## 📁 Project Structure (high‑level)
```
mindful-pathways/
├─ src/
│  ├─ pages/            # Route components (Index, Auth, Dashboard, …, History, Resources)
│  ├─ components/       # UI primitives, charts, layout
│  ├─ hooks/            # Custom React hooks (useAuth, etc.)
│  ├─ integrations/     # Supabase client
│  └─ index.css         # Global Tailwind + design tokens
├─ supabase/functions/   # Edge functions (chatbot, evaluate‑assessment, …)
├─ .gitignore            # Includes .env
├─ README.md            # This file
└─ package.json
```

---

## ⚠️ Security Note
- **`.env` is ignored** and never pushed to the remote repository.
- No usage of `eval`, `innerHTML`, `child_process`, or direct `fs` imports.
- All API keys are stored as Supabase Edge‑Function secrets.

---

## 📜 License
Educational / demo purposes only. © 2025 MindMate.
