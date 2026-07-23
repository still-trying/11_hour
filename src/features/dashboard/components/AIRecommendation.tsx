/**
 * AIRecommendation — Smart "What should I do now?" widget
 *
 * Uses Gemini to analyze active tasks and suggest the optimal next action.
 * Shows on the dashboard to guide users under pressure.
 */

import React, { useState, useCallback } from 'react';
import { Brain, RefreshCw, ArrowRight } from 'lucide-react';
import { getNextActionRecommendation } from '@/ai/orchestrator/engines/geminiService';
import type { Task } from '@/types';

interface AIRecommendationProps {
  tasks: Task[];
  onNavigateToTask?: (taskId: string) => void;
}

export function AIRecommendation({
  tasks,
  onNavigateToTask,
}: AIRecommendationProps): React.JSX.Element {
  const [recommendation, setRecommendation] = useState<{
    recommendation: string;
    reasoning: string;
    taskTitle: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Build a lookup map from title → task ID to resolve the AI's title-based
   * recommendation into an actionable task ID for navigation.
   */
  const taskByTitle = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const task of tasks) {
      if (task.title && task.id) {
        // Store the *first* occurrence in case of duplicate titles
        if (!map.has(task.title)) {
          map.set(task.title, task.id);
        }
      }
    }
    return map;
  }, [tasks]);

  const fetchRecommendation = useCallback(async () => {
    setIsLoading(true);
    try {
      const activeTasks = tasks
        .filter((t) => t.status !== 'completed' && t.status !== 'cancelled')
        .map((t) => ({
          title: t.title,
          urgency_score: t.urgency_score,
          defcon_level: t.defcon_level,
          deadline: t.deadline,
          estimated_minutes: t.estimated_minutes,
        }));

      const result = await getNextActionRecommendation(activeTasks);
      setRecommendation(result);
    } catch (error) {
      console.error('Failed to get AI recommendation:', error);
    } finally {
      setIsLoading(false);
    }
  }, [tasks]);

  const handleNavigate = useCallback(() => {
    if (!recommendation?.taskTitle) return;
    const taskId = taskByTitle.get(recommendation.taskTitle);
    if (taskId) {
      onNavigateToTask?.(taskId);
    }
  }, [recommendation, taskByTitle, onNavigateToTask]);

  return (
    <div className="p-4 bg-bg-secondary border border-accent-amber/20 rounded-sys-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain size={16} className="text-accent-amber" />
          <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
            AI ADVISOR
          </span>
        </div>
        <button
          onClick={fetchRecommendation}
          disabled={isLoading}
          className="
            flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono
            text-accent-amber hover:bg-accent-amber/10 rounded-sys-sm
            transition-colors disabled:opacity-50
          "
        >
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          {recommendation ? 'Refresh' : 'Ask AI'}
        </button>
      </div>

      {recommendation ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-text-primary">
            🤖 {recommendation.recommendation}
          </p>
          <p className="text-xs text-text-muted">{recommendation.reasoning}</p>
          {recommendation.taskTitle &&
            onNavigateToTask &&
            taskByTitle.has(recommendation.taskTitle) && (
              <button
                onClick={handleNavigate}
                className="
                self-start flex items-center gap-1.5 mt-1 px-3 py-1.5
                text-xs font-mono text-accent-amber bg-accent-amber/10
                rounded-sys-md hover:bg-accent-amber/20 transition-colors
              "
              >
                Start "{recommendation.taskTitle}"
                <ArrowRight size={12} />
              </button>
            )}
        </div>
      ) : (
        <p className="text-sm text-text-muted">
          {isLoading
            ? '🧠 Analyzing your tasks...'
            : 'Click "Ask AI" to get a personalized recommendation based on your active tasks.'}
        </p>
      )}
    </div>
  );
}

export default AIRecommendation;
