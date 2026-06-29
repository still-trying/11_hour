# ⏰ 11_HOUR - The Last-Minute Life Saver

**Tagline:** When you're out of time, we find more.

An AI-powered productivity companion for the procrastinator in all of us. Built for the Vibe2Ship Hackathon.

## ✨ Features

- **🚨 DEFCON Urgency System** — Real-time urgency scores (CALM → FOCUSED → URGENT → CRITICAL → MELTDOWN)
- **🤖 ELEVEN AI Companion** — Context-aware chat assistant that knows your tasks
- **📋 Smart Task Management** — Natural language input, AI step breakdown
- **🎯 Habit Tracking** — Visual habit rings with streak tracking
- **⏱️ Focus Timer** — Integrated Pomodoro timer linked to tasks
- **📊 Analytics Dashboard** — Completion rates, DEFCON distribution, productivity stats
- **🎨 3D Landing Page** — Interactive Three.js clock orb with particle field

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Framer Motion |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| AI | Groq (Llama 3.1) |
| 3D | Three.js, React Three Fiber |
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

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_APP_URL=https://11-hour.vercel.app
```

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

## 🚀 Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push to GitHub
2. Import to Vercel
3. Set environment variables
4. Update Supabase Auth settings with production URL

## 📄 License

MIT
