import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { elevenChat } from '@/lib/ai/groq'
import { checkRateLimit } from '@/lib/utils/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit: 20 requests per minute per user
    const rateLimit = checkRateLimit('chat:' + user.id, 20, 60_000)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimit.resetAt),
          },
        },
      )
    }

    const { message, taskContext } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    let context = taskContext
    if (!context) {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('title, urgency_score, deadline')
        .neq('status', 'completed')
        .order('urgency_score', { ascending: false })
        .limit(5)

      if (tasks) {
        context = tasks.map((t: any) => ({
          title: t.title,
          urgency: t.urgency_score,
          deadline: t.deadline,
        }))
      }
    }

    const response = await elevenChat(message, context)

    return NextResponse.json(response, {
      headers: {
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-RateLimit-Reset': String(rateLimit.resetAt),
      },
    })
  } catch (error: unknown) {
    console.error('AI chat error:', error)
    const message = error instanceof Error ? error.message : 'AI chat failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
