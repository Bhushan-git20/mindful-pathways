# MindMate 🧠💙

**MindMate** is a student-focused, comprehensive mental wellness and psychoeducation platform. Designed with a premium, glassmorphic UI, it empowers students to monitor, understand, and improve their mental well-being through science-backed screening tools, personalized insights, habit tracking, community support, and real-time AI-powered conversations.

---

## 🚀 Vision & Key Highlights

- **Vibrant & Modern UI**: Built with dynamic light/dark mode themes utilizing Tailwind CSS, Framer Motion, and premium glassmorphism aesthetics.
- **Science-Backed Self-Assessments**: Standardized clinical questionnaires (PHQ-9 & GAD-7) with immediate risk scoring and longitudinal progress tracking.
- **AI-Powered Companionship**: Real-time, evidence-based coping suggestions from a supportive AI chatbot running on Supabase Edge Functions via Google's Gemini 1.5 Flash.
- **Privacy & Safety First**: Fully client-side encrypted environment variables, private journaling, and a robust anonymous peer community feed with active content moderation edge functions.

---

## ✨ Comprehensive Feature Suite

### 🏠 Personalized Dashboard
- **Wellness Tracker**: Tracks check-in consistency, streaks, and overall wellness score (0–100).
- **Quick Actions**: One-click navigation to journaling, self-assessments, community, and breathing/habit routines.
- **Weekly Summary**: Visual preview of wellness metrics and active check-ins.

### 📋 Science-Backed Self-Assessments
- **Standardized Questionnaires**: PHQ-9 (Depression severity) & GAD-7 (Anxiety severity) with intuitive multi-choice selectors.
- **Dynamic Scoring**: Instant feedback mapping scores to clinical severity levels (Minimal, Mild, Moderate, Moderately Severe, Severe).
- **Edge Function Evaluation**: Dedicated Supabase Edge Function to securely calculate and record assessment scores.

### 📓 Mood-Coded Journaling
- **AI Sentiment Tagging**: Journal entries automatically analyzed for emotional sentiment (Positive, Neutral, Negative) upon submission.
- **Glassmorphic Calendar View**: A beautiful mood calendar showing historical daily emotional states.
- **Private Reflections**: Secure local database journal entries for daily thoughts.

### 🧘 Interactive Habit Tracking
- **Habit Builder**: Interactive daily habit check-ins (e.g., Meditation, Hydration, Sleep, Exercise).
- **Consistency Grid**: Beautiful 7-day visual progress grid to build positive mental wellness routines.
- **Streaks & Analysis**: Monitors consecutive days of completion to keep students motivated.

### 🤝 Anonymous Community Feed
- **Peer Support Safe Space**: Read and share positive, supportive posts anonymously with other students.
- **Positive Mood Tags**: Categorize community posts with uplifting tags (Gratitude, Support, Progress).
- **Moderate Post Edge Function**: Automatic content moderation to filter out sensitive or toxic content, keeping the community safe and encouraging.

### 🤖 Real-Time AI Chatbot
- **Responsive Guidance**: Empathetic, real-time wellness support powered by Gemini 1.5 Flash.
- **Coping Strategies**: Suggests mindfulness techniques, CBT exercises, and focus improvements.
- **Emergency Routing**: Detects crisis keywords and instantly overlays local helpline resources.

### 📊 Insights, Trends & History
- **Interactive Charts**: Beautiful data visualizations of depression and anxiety trends over time using Recharts.
- **History Logs**: Detailed tables and logs of all past PHQ-9/GAD-7 assessments, scores, and reflections to track long-term progress.

### 📚 Curated Resources Library
- **Educational Library**: Handpicked wellness articles, audio guides, and videos categorized by topic (Stress, Sleep, Focus, Mindfulness).
- **Helplines Catalog**: Easily accessible links and numbers for professional counseling and campus support.

### 🛡️ Admin & Supervisor Panel
- **User Dashboard**: Platform engagement analytics and risk alert flags for super-admin or counseling supervisors.
- **Content CRUD**: Full dashboard to Create, Read, Update, and Delete articles, resources, and helpline details directly.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18 + TypeScript |
| **Build & Dev Tool** | Vite 8 |
| **Styling & Theme** | Tailwind CSS + shadcn/ui + next-themes |
| **Routing** | React Router v6 |
| **Data Fetching** | TanStack Query v5 |
| **Form Management** | React Hook Form + Zod validation |
| **Data Visuals** | Recharts (responsive charts) |
| **Animations** | Framer Motion (premium micro-interactions) |
| **Database & Auth** | Supabase (PostgreSQL, Realtime, Row-Level Security) |
| **Edge Compute** | Supabase Edge Functions (Deno / TypeScript) |
| **AI Integration** | Google Gemini 1.5 Flash |
| **Iconography** | Lucide React |

---

## 📁 Project Structure (High-Level)

```
mindful-pathways/
├── src/
│   ├── pages/           # Premium, glassmorphic route components
│   │   ├── Index.tsx    # Vibrant landing page with modern typography
│   │   ├── Auth.tsx     # Clean signup & login screens
│   │   ├── Dashboard.tsx # Streaks, scores, and quick features
│   │   ├── Assessments.tsx # PHQ-9 and GAD-7 questionnaires
│   │   ├── Journal.tsx   # Mood-coded private entries & calendar
│   │   ├── Chat.tsx      # Real-time AI chatbot interface
│   │   ├── Habits.tsx    # Interactive daily routine tracker
│   │   ├── Community.tsx # Anonymous peer support board
│   │   ├── Trends.tsx    # Analytics & Recharts visualizations
│   │   ├── History.tsx   # Restored assessment & activity history logs
│   │   ├── Resources.tsx # Curated library and CRUD panel
│   │   ├── Profile.tsx   # User personal settings & security
│   │   └── Admin.tsx     # Administrator analytics & Resource CRUD
│   ├── components/      # Glassmorphic shells, forms, charts, & navigation
│   ├── hooks/           # Custom React hooks (useAuth, etc.)
│   ├── integrations/    # Supabase connection client
│   └── index.css        # Core styling, HSL color tokens, glassmorphic filters
├── supabase/
│   └── functions/       # Serverless Edge Functions
│       ├── chatbot/              # Core Gemini AI chatbot integration
│       ├── evaluate-assessment/  # Computes and persists screening scores
│       ├── moderate-post/        # Content moderation for community board
│       └── analyze-journal/      # Mood sentiment analysis on journal text
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node 18+ and npm
- A Supabase project (Free tier works perfectly)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Bhushan-git20/mindful-pathways.git
cd mindful-pathways
```

### 2️⃣ Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3️⃣ Configure Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-anon-key
VITE_SUPABASE_PROJECT_ID=your-supabase-project-id
```
*(Note: `.env` is already configured in `.gitignore` to prevent any credentials from being pushed to Git).*

### 4️⃣ Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:8080](http://localhost:8080) to access the application.

---

## 🗄️ Supabase Edge Functions Setup

Ensure that your Supabase environment has the required secrets configured so the Edge Functions can execute successfully:

| Secret Key | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API developer key to power chatbot and journal sentiment. |

Deploy edge functions using the Supabase CLI:
```bash
supabase functions deploy chatbot
supabase functions deploy evaluate-assessment
supabase functions deploy moderate-post
supabase functions deploy analyze-journal
```

---

## 🧠 Mental Health Support Resources (India)

If you are experiencing a crisis, please connect with standard counseling services:

| Service Provider | Contact Number | Availability |
|---|---|---|
| **iCall Psychosocial Helpline** | +91 9152987821 | Monday—Saturday (10 AM to 8 PM) |
| **Vandrevala Foundation** | 1860-2662-345 / +91 9999666555 | 24 / 7 Support |
| **NIMHANS Helpline** | 080-46110007 | 24 / 7 Support |
| **National Emergency** | 112 | 24 / 7 Emergency Response |

---

## ⚠️ Medical Disclaimer

MindMate is a **self-guided support, tracking, and psychoeducational tool**, not a substitute for clinical diagnosis, professional medical treatment, or therapy. If you are experiencing a mental health emergency, please contact a licensed therapist or emergency response services immediately.

---

## 📜 License

Educational and research purposes only. © 2026 MindMate. All rights reserved.
