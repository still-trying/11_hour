'use client'

import { useState, useRef, useEffect } from 'react'
import { useTasks } from '@/lib/hooks/useTasks'
import { Sparkles, Plus, SendHorizonal } from 'lucide-react'
import { toast } from 'sonner'

export function QuickCapture() {
  const [text, setText] = useState('')
  const [useAi, setUseAi] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { createTask } = useTasks()

  // Focus input on mount
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'q' && !e.metaKey && !e.ctrlKey && document.activeElement?.tagName !== 'INPUT') {
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || loading) return

    setLoading(true)
    try {
      if (useAi) {
        // AI-parsed natural language
        await createTask({
          title: text.trim(),
          natural_input: text.trim(),
          useAi: true,
        })
      } else {
        // Quick capture: parse "Task by deadline importance" style
        const parts = text.split(' by ')
        const title = parts[0].trim()
        let deadline: string | undefined
        let importance = 3
        let estimatedMinutes = 30

        if (parts.length > 1) {
          // Try to parse deadline
          const rest = parts[1].trim()
          const dateMatch = rest.match(/(\d{1,2}[:\.]\d{2}\s*[ap]m)|(\d{1,2}\s*[ap]m)|(tomorrow)|(next\s+week)|(\d{1,2}\/\d{1,2})/i)
          if (dateMatch) {
            if (rest.toLowerCase().includes('tomorrow')) {
              const tomorrow = new Date()
              tomorrow.setDate(tomorrow.getDate() + 1)
              tomorrow.setHours(17, 0, 0, 0)
              deadline = tomorrow.toISOString()
            } else if (rest.toLowerCase().includes('next week')) {
              const nextWeek = new Date()
              nextWeek.setDate(nextWeek.getDate() + 7)
              nextWeek.setHours(17, 0, 0, 0)
              deadline = nextWeek.toISOString()
            } else if (dateMatch[1] || dateMatch[2]) {
              // Time pattern like "5pm" or "3:30pm"
              const timeStr = (dateMatch[1] || dateMatch[2]).trim()
              const isPM = /pm/i.test(timeStr)
              const timeParts = timeStr.replace(/[ap]m/i, '').split(/[:\.]/)
              let hours = parseInt(timeParts[0])
              const mins = timeParts[1] ? parseInt(timeParts[1]) : 0
              if (isPM && hours < 12) hours += 12
              if (!isPM && hours === 12) hours = 0
              const today = new Date()
              today.setHours(hours, mins, 0, 0)
              if (today.getTime() < Date.now()) today.setDate(today.getDate() + 1)
              deadline = today.toISOString()
            } else if (dateMatch[5]) {
              // Date pattern like "7/15"
              const [month, day] = dateMatch[5].split('/').map(Number)
              const date = new Date()
              date.setMonth(month - 1, day)
              date.setHours(17, 0, 0, 0)
              if (date.getTime() < Date.now()) date.setFullYear(date.getFullYear() + 1)
              deadline = date.toISOString()
            }
          }

          // Check for importance indicators
          if (rest.match(/high|extremely|very|critical|important/i)) importance = 5
          else if (rest.match(/medium|moderate/i)) importance = 3
          else if (rest.match(/low|minor/i)) importance = 1

          // Check for time estimates
          const timeMatch = rest.match(/(\d+)\s*(hour|min|hr|m)/i)
          if (timeMatch) {
            const val = parseInt(timeMatch[1])
            estimatedMinutes = timeMatch[2].toLowerCase().match(/hour|hr/) ? val * 60 : val
          }
        }

        await createTask({
          title,
          deadline,
          importance,
          estimated_minutes: estimatedMinutes,
        })
      }

      setText('')
      toast.success('Task created!')
    } catch (err) {
      toast.error('Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-1 flex items-center gap-2">
      <div className="flex items-center gap-1 pl-3">
        <button
          type="button"
          onClick={() => setUseAi(!useAi)}
          className={`p-1.5 rounded-lg transition-all ${
            useAi
              ? 'bg-brand/20 text-brand'
              : 'text-[#475569] hover:text-[#94A3B8]'
          }`}
          title={useAi ? 'AI parsing ON' : 'AI parsing OFF'}
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={
          useAi
            ? 'Type naturally... "Submit report by Friday 5pm, high priority"'
            : 'Quick add task... (press Q to focus)'
        }
        className="flex-1 bg-transparent text-sm text-[#F8FAFC] placeholder:text-[#475569] focus:outline-none py-2"
        disabled={loading}
      />

      <button
        type="submit"
        disabled={!text.trim() || loading}
        className="p-2 rounded-lg text-[#475569] hover:text-brand hover:bg-brand/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed mr-1"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        ) : (
          <SendHorizonal className="w-4 h-4" />
        )}
      </button>
    </form>
  )
}
