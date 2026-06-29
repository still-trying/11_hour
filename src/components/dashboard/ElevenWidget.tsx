'use client'

import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '@/lib/store/useAppStore'
import { Sparkles, Send, X, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { AiMessage } from '@/types'

export function ElevenWidget() {
  const { elevenOpen, setElevenOpen, tasks } = useAppStore()
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      role: 'assistant',
      content:
        "Hey! I'm ELEVEN. I can see your tasks and deadlines. Need help prioritizing, breaking down a task, or just some motivation? 🚀",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      // Build task context for ELEVEN
      const taskContext = tasks
        .filter((t) => t.status !== 'completed')
        .slice(0, 5)
        .map((t) => ({
          title: t.title,
          urgency: t.urgency_score,
          deadline: t.deadline,
        }))

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, taskContext }),
      })

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }

      const response = await res.json()

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.message || "Sorry, I couldn't process that. Can you rephrase?",
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm having trouble connecting to my brain right now. Please try again in a moment.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!elevenOpen) {
    return (
      <button
        onClick={() => setElevenOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-brand flex items-center justify-center shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30 transition-all hover:scale-105 z-50"
      >
        <MessageSquare className="w-5 h-5 text-white" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 z-50 animate-slideUp">
      <div className="glass-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-elevated/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-brand" />
            </div>
            <span className="text-sm font-medium text-[#F8FAFC]">ELEVEN</span>
          </div>
          <button
            onClick={() => setElevenOpen(false)}
            className="p-1 rounded-lg text-[#475569] hover:text-[#F8FAFC] hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                'flex',
                msg.role === 'user' ? 'justify-end' : 'justify-start',
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] px-3 py-2 rounded-lg text-xs leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-brand/20 text-[#F8FAFC]'
                    : 'bg-surface text-[#94A3B8] border border-border',
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-surface border border-border px-3 py-2 rounded-lg">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask ELEVEN anything..."
              className="flex-1 bg-[#131320] border border-border rounded-lg px-3 py-2 text-xs text-[#F8FAFC] placeholder:text-[#475569] focus:outline-none focus:border-brand/50"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-2 rounded-lg bg-brand/10 text-brand hover:bg-brand/20 transition-all disabled:opacity-30"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
