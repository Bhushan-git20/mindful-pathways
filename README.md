# MindMate 🧠💙

**MindMate** is a comprehensive student mental health and wellness platform built to help students monitor, understand, and improve their mental well-being through science-backed tools, AI-powered support, and personal insights.

---

## 📸 Screenshots

> _Dashboard, Self-Assessment, Journal, and Chatbot views_

---

## ✨ Features

### 🏠 Dashboard
- Personalized welcome with wellness streak tracker
- Overall wellness score (0–100)
- Quick action cards for all major features
- Weekly check-in overview

### 📋 Self-Assessment
- **PHQ-9** — Depression screening questionnaire
- **GAD-7** — Anxiety screening questionnaire
- Research-backed scoring with severity levels (Minimal → Severe)
- Assessment history and trend tracking

### 📓 Journal
- Personal journal entries with mood tracking
- AI-assisted mood tagging and sentiment analysis
- Private and encrypted entries

### 📊 Insights & Trends
- Visual wellness dashboards using Recharts
- Historical data visualization
- Risk level indicators
- Progress tracking over time

### 🤖 AI Chatbot
- Mental health support chatbot (powered by AI)
- Evidence-based coping strategy suggestions
- Crisis keyword detection with emergency helpline routing
- FAQ matching for common mental health questions

### 📚 Resources
- Curated mental health articles and videos
- Campus counseling service directories
- Crisis helpline information (India-focused)
- Mindfulness techniques, stress management, focus improvement

### 🔔 Notifications
- Wellness reminders and check-in nudges
- Assessment due alerts

### 📜 History
- Full history of assessments, journal entries, and chatbot conversations

### ⚙️ Settings & Profile
- Theme toggle (Light / Dark mode)
- Profile management
- Privacy controls

### 🛡️ Admin Panel
- User management and platform-wide analytics
- **Resource Management** — Full CRUD (Create, Read, Update, Delete) for educational materials
- Engagement monitoring and risk alerts

### 🧘 Guided Breathing
- Interactive breathing exercises (Box Breathing, 4-7-8, Deep Calm)
- Visual-led animations for inhalation, holding, and exhalation
- Progress session tracking

### 🎯 Habit Tracking
- Daily habit builder with visual 7-day progress grid
- Streak counting and consistency analysis
- Healthy habit suggestions (Meditation, Journaling, etc.)

### 🤝 Community Support
- Anonymous peer-to-peer support feed
- Positive mood tagging (Gratitude, Progress, Support)
- Safe space guidelines and moderation-ready design

### 🎨 Mood-Coded Journaling
- Journal entries color-coded by AI-detected sentiment
- Visual calendar of emotional states
- Detailed reflection cards with mood-based aesthetics

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Routing** | React Router v6 |
| **State/Data** | TanStack Query v5 |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **Backend** | Supabase (Auth + PostgreSQL + Edge Functions) |
| **AI Chatbot** | Google Gemini 1.5 Flash (via Supabase Edge Function) |
| **Icons** | Lucide React |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm
- A Supabase account

### 1. Clone the repository
```bash
git clone https://github.com/Bhushan-git20/mindful-pathways.git
cd mindful-pathways
```

### 2. Install dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Set up environment variables

Create a `.env` file in the root:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### 4. Run the development server
```bash
npm run dev
```

The app will be available at **http://localhost:8080**

---

## 🗄️ Supabase Setup

This project uses Supabase for:
- **Authentication** — Email/password sign up and login
- **Database** — PostgreSQL for storing assessments, journal entries, user profiles
- **Edge Functions** — AI chatbot backend (`chatbot`), journal analysis (`analyze-journal`)
- **Secrets** — API keys stored securely as Edge Function secrets

### Edge Function Secrets Required
| Secret Name | Description |
|-------------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key for the chatbot |

---

## 📁 Project Structure

```
mindful-pathways/
├── src/
│   ├── pages/           # Route-level page components
│   │   ├── Index.tsx    # Landing page
│   │   ├── Auth.tsx     # Sign in / Sign up
│   │   ├── Dashboard.tsx
│   │   ├── Assessments.tsx
│   │   ├── Journal.tsx
│   │   ├── Chat.tsx
│   │   ├── Trends.tsx
│   │   ├── Resources.tsx
│   │   ├── Breathing.tsx
│   │   ├── Habits.tsx
│   │   ├── Community.tsx
│   │   ├── History.tsx
│   │   ├── Profile.tsx
│   │   ├── Settings.tsx
│   │   ├── Notifications.tsx
│   │   └── Admin.tsx
│   ├── components/      # Reusable UI components
│   ├── hooks/           # Custom React hooks (useAuth, etc.)
│   ├── integrations/    # Supabase client setup
│   ├── lib/             # Utility functions
│   └── index.css        # Global styles & design tokens
├── supabase/
│   └── functions/
│       ├── chatbot/     # AI chatbot edge function
│       └── analyze-journal/ # Journal AI analysis
├── index.html
├── vite.config.ts
└── package.json
```

---

## 🧠 Mental Health Resources (India)

If you or someone you know is in crisis:

| Helpline | Number |
|----------|--------|
| iCall Psychosocial Helpline | 9152987821 |
| Vandrevala Foundation (24/7) | 1860-2662-345 |
| NIMHANS Helpline | 080-46110007 |
| National Emergency | 112 |

---

## ⚠️ Disclaimer

MindMate is a **self-help and psychoeducation tool**, not a substitute for professional mental health care. If you are experiencing a mental health crisis, please contact a licensed mental health professional or emergency services immediately.

---

## 📄 License

This project is for educational purposes. All rights reserved © 2025 MindMate.
