'use client'

import { useAppStore } from '@/lib/store/useAppStore'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'

export default function AnalyticsPage() {
  const { tasks, habits, habitLogs } = useAppStore()

  // Stats calculations
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === 'completed').length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const overdueTasks = tasks.filter((t) => t.status === 'overdue').length
  const avgUrgency =
    tasks.length > 0
      ? Math.round(
          tasks
            .filter((t) => t.status !== 'completed')
            .reduce((sum, t) => sum + t.urgency_score, 0) /
            Math.max(tasks.filter((t) => t.status !== 'completed').length, 1),
        )
      : 0

  const defconDistribution = {
    meltdown: tasks.filter((t) => t.defcon_level === 'meltdown').length,
    critical: tasks.filter((t) => t.defcon_level === 'critical').length,
    urgent: tasks.filter((t) => t.defcon_level === 'urgent').length,
    focused: tasks.filter((t) => t.defcon_level === 'focused').length,
    calm: tasks.filter((t) => t.defcon_level === 'calm').length,
  }

  const totalLogs = Object.values(habitLogs).flat().length
  const totalHabits = habits.length
  const longestStreak = Math.max(...habits.map((h) => h.longest_streak), 0)

  const defconColors: Record<string, string> = {
    meltdown: '#EF4444',
    critical: '#F97316',
    urgent: '#F59E0B',
    focused: '#10B981',
    calm: '#22D3EE',
  }

  const taskStatusData = [
    { name: 'Pending', value: tasks.filter((t) => t.status === 'pending').length, color: '#6C63FF' },
    { name: 'In Progress', value: tasks.filter((t) => t.status === 'in_progress').length, color: '#22D3EE' },
    { name: 'Completed', value: completedTasks, color: '#10B981' },
    { name: 'Overdue', value: overdueTasks, color: '#EF4444' },
  ].filter((d) => d.value > 0)

  const defconChartData = Object.entries(defconDistribution).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    count: value,
    color: defconColors[key],
  }))

  const StatCard = ({
    label,
    value,
    color,
    suffix,
  }: {
    label: string
    value: number | string
    color: string
    suffix?: string
  }) => (
    <div className="glass-card p-4">
      <p className="text-xs text-[#475569] mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
        {suffix && <span className="text-sm text-[#475569] ml-0.5">{suffix}</span>}
      </p>
    </div>
  )

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card px-3 py-2 text-xs">
          <p className="text-[#F8FAFC]">{payload[0].name}: {payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#F8FAFC]">Analytics</h1>
        <p className="text-sm text-[#475569] mt-0.5">
          Your productivity overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Completion Rate" value={completionRate} color="#10B981" suffix="%" />
        <StatCard label="Avg Urgency" value={avgUrgency} color={avgUrgency > 60 ? '#EF4444' : '#22D3EE'} />
        <StatCard label="Overdue Tasks" value={overdueTasks} color="#EF4444" />
        <StatCard label="Longest Streak" value={longestStreak} color="#6C63FF" suffix="days" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DEFCON Distribution - Bar Chart */}
        <div className="glass-card p-5">
          <h3 className="text-xs font-medium text-[#94A3B8] mb-4">DEFCON Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={defconChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {defconChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Status - Pie Chart */}
        <div className="glass-card p-5">
          <h3 className="text-xs font-medium text-[#94A3B8] mb-4">Task Status Breakdown</h3>
          <div className="h-64 flex items-center">
            {taskStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-[#475569] w-full text-center">No tasks yet</p>
            )}
            {/* Legend */}
            <div className="space-y-2 ml-2">
              {taskStatusData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
                  <span className="text-[#94A3B8]">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Habits Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="text-xs font-medium text-[#94A3B8] mb-4">Habits Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-[#94A3B8]">Total Habits</span>
              <span className="text-sm font-medium text-[#F8FAFC]">{totalHabits}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-[#94A3B8]">Total Completions</span>
              <span className="text-sm font-medium text-[#F8FAFC]">{totalLogs}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-[#94A3B8]">Longest Streak</span>
              <span className="text-sm font-medium text-[#6C63FF]">{longestStreak} days</span>
            </div>
            {habits.slice(0, 5).map((habit) => (
              <div key={habit.id} className="flex items-center justify-between py-1">
                <span className="text-xs text-[#475569]">{habit.title}</span>
                <span className="text-xs font-medium" style={{ color: habit.color }}>
                  {habit.current_streak} day streak
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Urgency Score Distribution */}
        <div className="glass-card p-5">
          <h3 className="text-xs font-medium text-[#94A3B8] mb-4">Urgency Distribution</h3>
          <div className="space-y-3">
            {(Object.entries(defconDistribution) as [string, number][]).map(
              ([level, count]) => {
                const totalNonZero = Object.values(defconDistribution).reduce((a, b) => a + b, 0) || 1
                return (
                  <div key={level} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#94A3B8] uppercase">{level}</span>
                      <span className="font-medium" style={{ color: defconColors[level] }}>
                        {count} ({Math.round((count / totalNonZero) * 100)}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#131320] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(count / totalNonZero) * 100}%`,
                          backgroundColor: defconColors[level],
                        }}
                      />
                    </div>
                  </div>
                )
              },
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
