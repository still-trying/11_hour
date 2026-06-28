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

## Getting Started

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

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push to GitHub
2. Import to Vercel
3. Set environment variables
4. Update Supabase Auth settings with production URL
