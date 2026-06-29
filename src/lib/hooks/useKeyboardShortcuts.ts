'use client'

import { useEffect, useRef } from 'react'

type ShortcutCallback = () => void

// Stable hook that doesn't re-register listeners on every render
export function useKeyboardShortcuts(shortcuts: Record<string, ShortcutCallback>) {
  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts // always up-to-date

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return
      }

      const key = e.key.toLowerCase()
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const cb = shortcutsRef.current[key]
      if (cb) {
        e.preventDefault()
        cb()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, []) // empty deps — stable listener, reads latest from ref
}
