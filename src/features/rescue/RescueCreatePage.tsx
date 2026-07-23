/**
 * RescueCreatePage — Brain Dump Workspace
 *
 * AI-powered task decomposition: paste raw text, syllabi, or notes and
 * let Gemini break them into structured, actionable tasks with urgency scores.
 */

import React, { useState } from 'react';
import { Sparkles, MessageSquare, Loader2, Plus, CheckCircle2, Clock, Star } from 'lucide-react';
import { parseBrainDump } from '@/ai/orchestrator/engines/geminiService';
import { useTasksQuery } from '@/lib/hooks/useTasksQuery';
import { DefconBadge } from '@/components/ui/DefconBadge';
import { calculateUrgency } from '@/lib/utils/urgency';
import { toast } from 'sonner';
import type { AiStep } from '@/types';

interface ParsedTask {
  title: string;
  description: string;
  importance: number;
  estimated_minutes: number;
  deadline_suggestion: string;
  steps: AiStep[];
  selected: boolean;
}

export default function RescueCreatePage(): React.JSX.Element {
  const [rawText, setRawText] = useState('');
  const [parsedTasks, setParsedTasks] = useState<ParsedTask[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { createTask } = useTasksQuery();

  const handleParse = async () => {
    if (!rawText.trim()) {
      toast.error('Please enter some text to analyze');
      return;
    }

    setIsParsing(true);
    try {
      const results = await parseBrainDump(rawText);
      setParsedTasks(results.map((r) => ({ ...r, selected: true })));
      toast.success(`Found ${results.length} task${results.length !== 1 ? 's' : ''}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || 'Failed to parse with AI');
    } finally {
      setIsParsing(false);
    }
  };

  const toggleTask = (index: number) => {
    setParsedTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, selected: !t.selected } : t)),
    );
  };

  const handleCreateAll = async () => {
    const selected = parsedTasks.filter((t) => t.selected);
    if (selected.length === 0) {
      toast.error('Select at least one task');
      return;
    }

    setIsCreating(true);

    // Fire all task creations in parallel for dramatically lower wall-clock time
    const results = await Promise.allSettled(
      selected.map(async (task) => {
        const deadlineHours = parseDeadlineHours(task.deadline_suggestion);
        const deadline = new Date();
        deadline.setHours(deadline.getHours() + deadlineHours);

        await createTask({
          title: task.title,
          description: task.description,
          importance: task.importance,
          estimated_minutes: task.estimated_minutes,
          deadline: deadline.toISOString(),
          ai_generated_steps: task.steps,
        });
      }),
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    if (failed > 0) {
      results
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .forEach((r, i) => console.error(`Task ${i + 1} failed:`, r.reason));
      toast.error(
        `Created ${succeeded}/${selected.length} task${selected.length !== 1 ? 's' : ''} (${failed} failed)`,
      );
    } else {
      toast.success(`Created ${succeeded} task${succeeded !== 1 ? 's' : ''}`);
    }

    setParsedTasks([]);
    setRawText('');
    setIsCreating(false);
  };

  return (
    <div className="flex flex-col gap-sys-lg p-sys-md">
      {/* Header */}
      <div className="flex flex-col gap-sys-xs border-b border-border-muted pb-sys-sm">
        <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
          <MessageSquare size={14} className="text-accent-amber" />
          <span>AI BRAIN DUMP</span>
        </div>
        <h1 className="font-display text-xxl sm:text-xxxl font-semibold tracking-tight text-text-primary">
          Brain Dump Workspace
        </h1>
        <p className="text-text-muted text-sm max-w-2xl">
          Paste your raw notes, project requirements, or deadline list below. AI will decompose them
          into structured, prioritized tasks.
        </p>
      </div>

      {/* Input Area */}
      <div className="flex flex-col gap-3">
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder={`Paste your brain dump here...

Example:
"I need to finish the database migration by tonight, write unit tests for the auth module (probably 2 hours), and prepare the presentation slides for tomorrow's demo. Also should fix the CSS bug on the login page."`}
          rows={8}
          className="
            w-full px-4 py-3 bg-bg-primary border-2 border-border-muted rounded-sys-lg
            text-text-primary text-sm font-mono placeholder:text-text-muted/40 resize-y
            focus:outline-none focus:border-accent-amber focus:ring-1 focus:ring-accent-amber/20
            transition-all
          "
        />

        <button
          onClick={handleParse}
          disabled={isParsing || !rawText.trim()}
          className="
            self-start flex items-center gap-2 px-5 py-2.5
            bg-accent-amber text-black font-mono font-bold text-sm
            rounded-sys-md transition-all
            hover:bg-accent-amber/90 hover:shadow-lg hover:shadow-accent-amber/20
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {isParsing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              🧠 Analyze with AI
            </>
          )}
        </button>
      </div>

      {/* Parsed Tasks */}
      {parsedTasks.length > 0 && (
        <div className="flex flex-col gap-sys-md">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-semibold text-text-primary flex items-center gap-2">
              <Sparkles size={16} className="text-accent-amber" />
              AI Parsed Tasks
              <span className="text-sm font-mono text-text-muted">
                ({parsedTasks.filter((t) => t.selected).length}/{parsedTasks.length} selected)
              </span>
            </h2>
            <button
              onClick={handleCreateAll}
              disabled={isCreating || parsedTasks.filter((t) => t.selected).length === 0}
              className="
                flex items-center gap-2 px-4 py-2
                bg-accent-emerald text-black font-mono font-bold text-sm
                rounded-sys-md transition-all
                hover:bg-accent-emerald/90
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isCreating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Create All Selected
                </>
              )}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {parsedTasks.map((task, index) => {
              const deadlineHours = parseDeadlineHours(task.deadline_suggestion);
              const deadlineDate = new Date();
              deadlineDate.setHours(deadlineDate.getHours() + deadlineHours);
              const urgency = calculateUrgency(
                deadlineDate,
                task.importance,
                task.estimated_minutes,
                0,
              );

              return (
                <div
                  key={index}
                  onClick={() => toggleTask(index)}
                  className={`
                    p-4 rounded-sys-lg border-2 cursor-pointer transition-all duration-200
                    ${
                      task.selected
                        ? `defcon-${urgency.level} hover:shadow-md`
                        : 'border-border-muted bg-bg-secondary opacity-50 hover:opacity-70'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`
                      mt-1 w-5 h-5 rounded-sys-sm border-2 flex items-center justify-center
                      transition-colors
                      ${
                        task.selected
                          ? 'border-accent-emerald bg-accent-emerald/20'
                          : 'border-border-muted'
                      }
                    `}
                    >
                      {task.selected && <CheckCircle2 size={12} className="text-accent-emerald" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-text-primary">{task.title}</h3>
                        <DefconBadge
                          level={urgency.level}
                          size="sm"
                          score={urgency.score}
                          showScore
                        />
                      </div>
                      <p className="text-xs text-text-muted mb-2">{task.description}</p>

                      <div className="flex items-center gap-4 text-xs font-mono text-text-muted">
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {task.estimated_minutes}min
                        </span>
                        <span className="flex items-center gap-1">
                          <Star size={10} />P{task.importance}
                        </span>
                        <span>Deadline: {task.deadline_suggestion}</span>
                      </div>

                      {task.steps.length > 0 && (
                        <div className="mt-2 pl-2 border-l-2 border-border-muted/50">
                          {task.steps.map((step, si) => (
                            <div key={si} className="text-xs text-text-muted py-0.5">
                              {si + 1}. {step.text}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Parse deadline suggestion string into hours.
 */
function parseDeadlineHours(suggestion: string): number {
  const lower = suggestion.toLowerCase();
  const match = lower.match(/(\d+)\s*hour/);
  if (match) return parseInt(match[1]);
  if (lower.includes('tomorrow')) return 24;
  if (lower.includes('tonight') || lower.includes('today')) return 8;
  if (lower.includes('week')) return 168;
  if (lower.includes('30 min') || lower.includes('asap')) return 1;
  return 4; // default
}
