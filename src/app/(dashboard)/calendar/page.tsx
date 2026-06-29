'use client'

import { CalendarView } from '@/components/calendar/CalendarView'

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#F8FAFC]">Calendar</h1>
        <p className="text-sm text-[#475569] mt-0.5">
          View and manage tasks by their deadlines
        </p>
      </div>

      <CalendarView />
    </div>
  )
}
