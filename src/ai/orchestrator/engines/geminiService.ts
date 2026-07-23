/**
 * Groq AI Service
 *
 * Provides AI-powered task analysis, decomposition, and recommendations
 * using the Groq API (llama-3.1-8b-instant) via groq-sdk.
 *
 * Replaces the previous Gemini implementation.
 * Same public API — callers don't need to change.
 */

import Groq from 'groq-sdk';
import type { AiStep } from '@/types';

// Initialize the client — key comes from env
const getApiKey = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env.VITE_GROQ_API_KEY || '') as string;
  }
  return '';
};

/**
 * Generate a UUID v4 with a safe fallback for non-HTTPS environments.
 */
function safeUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // fall through
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const GROQ_MODEL = 'llama-3.1-8b-instant';

let groqClient: Groq | null = null;

function getClient(): Groq {
  if (!groqClient) {
    const key = getApiKey();
    if (!key) {
      throw new Error('Groq API key not configured. Set VITE_GROQ_API_KEY in .env');
    }
    groqClient = new Groq({ apiKey: key, dangerouslyAllowBrowser: true });
  }
  return groqClient;
}

/**
 * Parse a raw text brain dump into structured tasks.
 */
export async function parseBrainDump(rawText: string): Promise<
  Array<{
    title: string;
    description: string;
    importance: number;
    estimated_minutes: number;
    deadline_suggestion: string;
    steps: AiStep[];
  }>
> {
  const client = getClient();
  const prompt = `You are a task management AI for an emergency productivity app called "11_HOUR - The Last Minute Life Saver".

Analyze the following raw text and extract structured tasks. For each task:
1. Create a clear, actionable title
2. Write a brief description
3. Rate importance (1-5, where 5 is most critical)
4. Estimate time needed in minutes
5. Suggest a deadline (relative to now, e.g., "2 hours", "4 hours", "tomorrow")
6. Break down into 3-5 micro-steps

Respond ONLY with a valid JSON array. Each element should have:
{
  "title": "string",
  "description": "string",
  "importance": number,
  "estimated_minutes": number,
  "deadline_suggestion": "string",
  "steps": [{"id": "uuid", "text": "step description", "completed": false}]
}

Raw text:
${rawText}`;

  try {
    const response = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const text = response.choices?.[0]?.message?.content ?? '';
    if (!text) throw new Error('AI returned empty response');

    // Groq returns JSON as a string — parse it
    const parsed = JSON.parse(text);

    // The response might be wrapped as { tasks: [...] } or just an array
    if (Array.isArray(parsed)) return parsed;
    if (parsed.tasks && Array.isArray(parsed.tasks)) return parsed.tasks;
    if (parsed.data && Array.isArray(parsed.data)) return parsed.data;

    return [parsed];
  } catch (error) {
    console.error('AI brain dump parsing failed:', error);
    throw new Error('Failed to parse brain dump with AI. Please try again.', { cause: error });
  }
}

/**
 * Generate micro-steps for a single task.
 */
export async function generateSteps(title: string, description?: string): Promise<AiStep[]> {
  const client = getClient();
  const prompt = `You are a productivity AI. Break down this task into 3-6 clear, actionable micro-steps.
Each step should be completable in under 10 minutes.

Task: ${title}
${description ? `Details: ${description}` : ''}

Respond ONLY with a valid JSON array of objects: [{"id": "unique-id", "text": "step text", "completed": false}]`;

  try {
    const response = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const text = response.choices?.[0]?.message?.content ?? '';
    if (!text) return [];
    const parsed = JSON.parse(text);

    // Handle wrapped responses like { steps: [...] }
    if (Array.isArray(parsed)) return parsed;
    if (parsed.steps && Array.isArray(parsed.steps)) return parsed.steps;
    if (parsed.data && Array.isArray(parsed.data)) return parsed.data;

    return [];
  } catch (error) {
    console.error('AI step generation failed:', error);
    // Return fallback steps
    return [
      { id: safeUuid(), text: `Start working on: ${title}`, completed: false },
      { id: safeUuid(), text: 'Review progress and adjust', completed: false },
      { id: safeUuid(), text: 'Finalize and mark complete', completed: false },
    ];
  }
}

/**
 * Get AI recommendation for what to do next based on current tasks.
 */
export async function getNextActionRecommendation(
  tasks: Array<{
    title: string;
    urgency_score?: number;
    defcon_level?: string;
    deadline?: string | null;
    estimated_minutes?: number;
  }>,
): Promise<{ recommendation: string; reasoning: string; taskTitle: string }> {
  if (tasks.length === 0) {
    return {
      recommendation: 'All clear! Create a new task or take a well-deserved break.',
      reasoning: 'No active tasks found.',
      taskTitle: '',
    };
  }

  const client = getClient();
  const taskSummary = tasks
    .slice(0, 10)
    .map(
      (t, i) =>
        `${i + 1}. "${t.title}" (urgency: ${t.urgency_score ?? 0}, defcon: ${t.defcon_level ?? 'calm'}, deadline: ${t.deadline ?? 'none'}, est: ${t.estimated_minutes ?? 30}min)`,
    )
    .join('\n');

  const prompt = `You are an emergency productivity AI. Based on these active tasks, recommend which ONE task the user should tackle RIGHT NOW.

Consider: urgency scores, deadlines, estimated time, and the principle of "maximum impact in minimum time."

Tasks:
${taskSummary}

Respond ONLY with valid JSON:
{
  "recommendation": "A brief, motivating 1-sentence directive",
  "reasoning": "A brief explanation of why this task first",
  "taskTitle": "The exact title of the recommended task"
}`;

  try {
    const response = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const text = response.choices?.[0]?.message?.content ?? '';
    if (!text) throw new Error('AI returned empty recommendation');
    return JSON.parse(text);
  } catch (error) {
    console.error('AI recommendation failed:', error);
    // Fallback: recommend highest urgency task
    const topTask = tasks[0];
    return {
      recommendation: `Focus on "${topTask.title}" — it has the highest urgency score.`,
      reasoning: 'Based on urgency score ranking.',
      taskTitle: topTask.title,
    };
  }
}
