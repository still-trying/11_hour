import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { generateTaskSteps } from '@/lib/ai/groq'
import { checkRateLimit } from '@/lib/utils/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit: 20 requests per minute per user
    const rateLimit = checkRateLimit('steps:' + user.id, 20, 60_000)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        { status: 429 },
      )
    }

    const { title, description } = await request.json()

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const steps = await generateTaskSteps(title, description)

    return NextResponse.json({ steps }, {
      headers: {
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-RateLimit-Reset': String(rateLimit.resetAt),
      },
    })
  } catch (error: unknown) {
    console.error('AI steps error:', error)
    const message = error instanceof Error ? error.message : 'Failed to generate steps'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
