// ============================================================
// 11_HOUR - Groq AI Client
// ============================================================

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.1-70b-versatile'

interface GroqMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface GroqResponse {
  id: string
  choices: {
    message: {
      content: string
    }
  }[]
  usage: {
    total_tokens: number
  }
}

async function groqCompletion(
  messages: GroqMessage[],
  temperature: number = 0.3,
  maxTokens: number = 1024,
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured')
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Groq API error: ${response.status} - ${error}`)
  }

  const data: GroqResponse = await response.json()
  return data.choices[0]?.message?.content || '{}'
}

// Parse natural language into a structured task
export async function parseNaturalTask(text: string) {
  const systemPrompt = `You are a task parsing AI. Extract structured task data from natural language.
Respond with ONLY valid JSON in this exact format:
{
  "title": "clear task title",
  "description": "any additional context",
  "deadline": "ISO date string or null if not specified",
  "importance": number between 1-5,
  "estimated_minutes": number,
  "category": "work|personal|health|study|finance|general",
  "steps": [{"title": "step description", "estimated_minutes": number}]
}`

  const content = await groqCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Parse this task: "${text}"` },
  ])

  const parsed = JSON.parse(content)
  return {
    title: parsed.title || text,
    description: parsed.description || '',
    deadline: parsed.deadline || null,
    importance: Math.min(Math.max(parsed.importance || 3, 1), 5),
    estimated_minutes: parsed.estimated_minutes || 30,
    category: parsed.category || 'general',
    steps: parsed.steps || [],
  }
}

// Generate AI-powered step breakdown for a task
export async function generateTaskSteps(title: string, description?: string) {
  const systemPrompt = `You are a task breakdown AI. Break down tasks into actionable steps.
Respond with ONLY valid JSON in this format:
{
  "steps": [
    {"title": "step 1", "estimated_minutes": 15},
    {"title": "step 2", "estimated_minutes": 30}
  ]
}
Keep steps actionable and realistic. 3-5 steps max.`

  const content = await groqCompletion([
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `Break down this task into steps: "${title}"${description ? `\nDescription: ${description}` : ''}`,
    },
  ])

  const parsed = JSON.parse(content)
  return parsed.steps || []
}

// Chat with ELEVEN AI companion
export async function elevenChat(
  message: string,
  taskContext?: { title: string; urgency: number; deadline?: string }[],
) {
  const contextStr = taskContext?.length
    ? `\nUser's current tasks:\n${taskContext.map((t) => `- ${t.title} (urgency: ${t.urgency}/100${t.deadline ? `, due: ${t.deadline}` : ''})`).join('\n')}`
    : ''

  const systemPrompt = `You are ELEVEN, an AI productivity companion for the 11_HOUR app. Your personality is:
- Direct but supportive
- Uses occasional humor
- Gets more urgent when deadlines are close
- Speaks concisely - short paragraphs
- Calls the user by name when you know it
- Uses emojis sparingly but effectively
- Never judgmental, always focused on solutions

You help users prioritize tasks, break down work, and stay motivated.
Keep responses under 150 words unless asked for details.`

  const content = await groqCompletion(
    [
      { role: 'system', content: systemPrompt + contextStr },
      { role: 'user', content: message },
    ],
    0.7,
    512,
  )

  try {
    const parsed = JSON.parse(content)
    return {
      message: parsed.message || parsed.response || content,
      suggestedActions: parsed.suggestedActions || [],
    }
  } catch {
    return { message: content, suggestedActions: [] }
  }
}

// Get motivational message based on context
export async function getMotivation(taskTitle: string, urgencyScore: number) {
  const systemPrompt = `You are a motivational AI. Generate a brief, powerful motivational message.
Respond with ONLY JSON: {"message": "your message", "tone": "urgent|calm|encouraging"}`

  const content = await groqCompletion(
    [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Task: "${taskTitle}" has urgency score ${urgencyScore}/100. Motivate me.`,
      },
    ],
    0.8,
    256,
  )

  try {
    const parsed = JSON.parse(content)
    return parsed.message || "You've got this. Start now."
  } catch {
    return "You've got this. Start now."
  }
}
