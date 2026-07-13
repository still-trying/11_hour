'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { Badge } from '@/components/ui/Badge'
import { useAppStore } from '@/lib/store/useAppStore'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  User,
  Bell,
  Shield,
  Palette,
  LogOut,
  Save,
} from 'lucide-react'

const supabase = createClient()

const CATEGORY_COLORS = [
  { label: 'Work', value: 'work', color: '#6C63FF' },
  { label: 'Personal', value: 'personal', color: '#22D3EE' },
  { label: 'Health', value: 'health', color: '#10B981' },
  { label: 'Finance', value: 'finance', color: '#F59E0B' },
  { label: 'Education', value: 'education', color: '#EC4899' },
  { label: 'Other', value: 'other', color: '#94A3B8' },
]

export default function SettingsPage() {
  const router = useRouter()
  const { profile, user, setProfile } = useAppStore()

  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [loading, setLoading] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [compactView, setCompactView] = useState(false)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (error) throw error

      if (profile) {
        setProfile({ ...profile, full_name: fullName })
      }
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error('Failed to update profile')
      console.error('Profile update error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Failed to sign out')
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[#F8FAFC]">Settings</h1>
        <p className="text-sm text-[#475569] mt-0.5">
          Manage your account and application preferences
        </p>
      </div>

      {/* Profile Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-brand" />
          <h2 className="text-sm font-medium text-[#F8FAFC]">Profile</h2>
        </div>
        <Card>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your name"
              icon={<User className="w-4 h-4" />}
            />
            <Input
              label="Email"
              value={user?.email || ''}
              disabled
              icon={<User className="w-4 h-4" />}
            />
            <div className="flex items-center gap-2 text-xs text-[#475569]">
              <Badge variant="info" size="sm">
                {profile?.current_streak || 0} day streak
              </Badge>
              <Badge variant="success" size="sm">
                {profile?.tasks_completed || 0} tasks done
              </Badge>
            </div>
            <Button type="submit" loading={loading} icon={<Save className="w-4 h-4" />}>
              Save Changes
            </Button>
          </form>
        </Card>
      </section>

      {/* Notifications Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-medium text-[#F8FAFC]">Notifications</h2>
        </div>
        <Card className="space-y-4">
          <Switch
            checked={notificationsEnabled}
            onCheckedChange={setNotificationsEnabled}
            label="Push notifications"
          />
          <Switch
            checked={soundEnabled}
            onCheckedChange={setSoundEnabled}
            label="Sound effects"
          />
        </Card>
      </section>

      {/* Appearance Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-4 h-4 text-[#EC4899]" />
          <h2 className="text-sm font-medium text-[#F8FAFC]">Appearance</h2>
        </div>
        <Card className="space-y-4">
          <Switch
            checked={compactView}
            onCheckedChange={setCompactView}
            label="Compact view"
          />
          <div>
            <p className="text-xs font-medium text-[#94A3B8] mb-2">Category Colors</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map((cat) => (
                <Badge key={cat.value} variant="default" size="md">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.label}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* Account Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-medium text-[#F8FAFC]">Account</h2>
        </div>
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#F8FAFC]">Sign out</p>
              <p className="text-xs text-[#475569]">
                You can sign back in anytime
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={handleLogout}
              icon={<LogOut className="w-4 h-4" />}
            >
              Sign Out
            </Button>
          </div>
        </Card>
      </section>
    </div>
  )
}
