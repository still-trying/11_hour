<<<<<<< HEAD
# 11_HOUR - When you're out of time, we find more.

**AI-powered productivity companion** that transforms deadline panic into structured action. Built for the Vibe2Ship Hackathon.

## Features

- **🚨 Urgency Engine** — Real-time DEFCON scoring (0-100) with color-coded task cards
- **🤖 ELEVEN AI** — Groq-powered AI companion that knows your tasks and helps you prioritize
- **📋 Smart Tasks** — Natural language task creation, AI step breakdown, quick capture
- **⭕ Habit Rings** — Apple Watch-style daily habit tracking with streaks
- **📊 Analytics** — Interactive charts showing DEFCON distribution, task status breakdown
- **⏱️ Focus Timer** — Pomodoro and Deep Work modes integrated with tasks
- **🎨 3D Landing Page** — Interactive Three.js clock orb with particle field

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| 3D | Three.js, React Three Fiber, Drei |
| State | Zustand |
| Forms | React Hook Form, Zod |
| Charts | Recharts |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (JWT) |
| AI | Groq (Llama 3.1 70B) |
| Animations | Framer Motion |
| Icons | Lucide React |
=======
# ⏰ 11_HOUR - The Last-Minute Life Saver
>>>>>>> e29e4ee (feat: complete 11_HOUR - AI productivity companion with 3D landing page, urgency engine, ELEVEN AI, habits, analytics)

**Tagline:** When you're out of time, we find more.

<<<<<<< HEAD
```bash
# 1. Clone and install
cd 11_hour
npm install

# 2. Set up Supabase
# - Create project at supabase.com
# - Run SQL in supabase/supabase-schema.sql
# - Run supabase/supabase-rls-policies.sql
# - Run supabase/supabase-functions.sql
# - Enable Realtime on tasks table

# 3. Set up Groq
# - Get API key at console.groq.com

# 4. Configure environment
cp .env.example .env.local
# Fill in your Supabase credentials and Groq API key

# 5. Run
npm run dev
```

## Environment Variables
=======
An AI-powered productivity companion for the procrastinator in all of us.

## ✨ Features

- **🚨 DEFCON Urgency System** — Real-time urgency scores (CALM → FOCUSED → URGENT → CRITICAL → MELTDOWN)
- **🤖 ELEVEN AI Companion** — Context-aware chat assistant that knows your tasks
- **📋 Smart Task Management** — Natural language input, AI step breakdown
- **🎯 Habit Tracking** — Visual habit rings with streak tracking
- **⏱️ Focus Timer** — Integrated Pomodoro timer linked to tasks
- **📊 Analytics Dashboard** — Completion rates, DEFCON distribution, productivity stats

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Framer Motion |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| AI | Groq (Llama 3.1) |
| State | Zustand |
| Icons | Lucide React |
| Toasts | Sonner |

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- A Supabase account (free)
- A Groq API key (free)

### Installation

```bash
# Clone and install
git clone <your-repo-url>
cd 11_hour
npm install

# Set up environment
cp .env.example .env.local
# Fill in your Supabase URL + anon key and Groq API key

# Set up database
# Run the SQL files in supabase/ in this order:
# 1. supabase-schema.sql
# 2. supabase-rls-policies.sql
# 3. supabase-functions.sql

# Start dev server
npm run dev
```

### Environment Variables
>>>>>>> e29e4ee (feat: complete 11_HOUR - AI productivity companion with 3D landing page, urgency engine, ELEVEN AI, habits, analytics)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

<<<<<<< HEAD
## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push to GitHub
2. Import to Vercel
3. Set environment variables
4. Update Supabase Auth settings with production URL
=======
## 📁 Project Structure

```
src/
├── app/              # Pages + API routes
│   ├── (auth)/       # Login/Signup
│   ├── (dashboard)/  # Dashboard, Tasks, Habits, Analytics
│   └── api/          # Tasks, AI chat, Prioritize
├── components/       # React components
│   ├── dashboard/    # UrgencyMeter, ElevenWidget, FocusTimer
│   ├── habits/       # HabitRing
│   ├── layout/       # Sidebar, Navbar
│   └── tasks/        # TaskCard, TaskList, QuickCapture
├── lib/              # Utilities
│   ├── ai/           # Groq integration
│   ├── hooks/        # useTasks, useHabits
│   ├── store/        # Zustand store
│   ├── supabase/     # Client/Server
│   └── utils/        # urgency.ts, cn.ts
└── types/            # TypeScript definitions
```

## 🎯 Core Algorithm

The urgency engine calculates scores in real-time:

```typescript
urgency = (deadline_factor × 0.58 + importance_factor × 0.32 + effort_factor + snooze_penalty) × 100
```

- **0-20**: CALM (cyan)
- **21-40**: FOCUSED (green)
- **41-60**: URGENT (amber)
- **61-80**: CRITICAL (orange)
- **81-100**: MELTDOWN (red, pulsing)

## 📄 License

MIT
>>>>>>> e29e4ee (feat: complete 11_HOUR - AI productivity companion with 3D landing page, urgency engine, ELEVEN AI, habits, analytics)
