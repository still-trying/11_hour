/**
 * SettingsPage — Settings Control Center
 *
 * Notification preferences, theme selection, and account settings.
 */

import React, { useState, useEffect } from 'react';
import { Settings, Bell, Palette, Shield, Volume2, VolumeX, Volume, Play, BellOff, type LucideIcon } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { soundEngine } from '@/lib/utils/sounds';
import { getPermissionStatus, requestNotificationPermission } from '@/lib/utils/browserNotifications';
import type { NotificationPermissionStatus } from '@/lib/utils/browserNotifications';

// Load persisted notification settings synchronously for initial state
function loadNotifSettings(): { enabled: boolean; meltdownAlerts: boolean } {
  try {
    const raw = localStorage.getItem('11hour_notif_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        enabled: typeof parsed.notifications === 'boolean' ? parsed.notifications : true,
        meltdownAlerts: typeof parsed.meltdownAlerts === 'boolean' ? parsed.meltdownAlerts : true,
      };
    }
  } catch {
    // Ignore parse errors
  }
  return { enabled: true, meltdownAlerts: true };
}

const defaultNotifSettings = loadNotifSettings();

function ToggleRow({
  label,
  description,
  enabled,
  onToggle,
  icon: Icon,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  icon: LucideIcon;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-bg-primary border border-border-muted rounded-sys-md">
      <div className="flex items-center gap-3">
        <Icon size={16} className="text-text-muted" />
        <div>
          <span className="text-sm font-medium text-text-primary">{label}</span>
          <p className="text-xs text-text-muted mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`
          w-10 h-5 rounded-full transition-colors relative
          ${enabled ? 'bg-accent-amber' : 'bg-border-muted'}
        `}
      >
        <div
          className={`
            absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform
            ${enabled ? 'translate-x-5' : 'translate-x-0.5'}
          `}
        />
      </button>
    </div>
  );
}

export default function SettingsPage(): React.JSX.Element {
  const { user } = useAppStore();
  const [notifications, setNotifications] = useState(defaultNotifSettings.enabled);
  const [meltdownAlerts, setMeltdownAlerts] = useState(defaultNotifSettings.meltdownAlerts);
  const [soundEnabled, setSoundEnabled] = useState(soundEngine.enabled);
  const [soundVolume, setSoundVolume] = useState(soundEngine.volume);
  const [focusDuration, setFocusDuration] = useState(25);
  const [notifPermission, setNotifPermission] = useState<NotificationPermissionStatus>(
    getPermissionStatus(),
  );

  // Sync sound setting with the sound engine
  useEffect(() => {
    soundEngine.enabled = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    soundEngine.volume = soundVolume;
  }, [soundVolume]);

  // Persist notification settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('11hour_notif_settings', JSON.stringify({ notifications, meltdownAlerts }));
    } catch {
      // localStorage may be unavailable
    }
  }, [notifications, meltdownAlerts]);

  return (
    <div className="flex flex-col gap-sys-lg p-sys-md max-w-2xl">
      {/* Header */}
      <div className="flex flex-col gap-sys-xs border-b border-border-muted pb-sys-sm">
        <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
          <Settings size={14} className="text-accent-amber" />
          <span>PREFERENCES ENGINE</span>
        </div>
        <h1 className="font-display text-xxl sm:text-xxxl font-semibold tracking-tight text-text-primary">
          Settings Control Center
        </h1>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-mono text-text-muted uppercase tracking-wider">Account</span>
        <div className="p-4 bg-bg-secondary border border-border-muted rounded-sys-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent-amber/20 flex items-center justify-center text-accent-amber font-bold text-lg">
            {(user?.displayName || user?.email || '?')[0].toUpperCase()}
          </div>
          <div>
            <span className="text-sm font-semibold text-text-primary">
              {user?.displayName || 'User'}
            </span>
            <p className="text-xs text-text-muted">{user?.email || 'Not signed in'}</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
          Notifications
        </span>
        <div className="flex flex-col gap-2">
          <ToggleRow
            label="Push Notifications"
            description="Receive browser notifications for task alerts and deadline reminders"
            enabled={notifications}
            onToggle={async () => {
              const newVal = !notifications;
              setNotifications(newVal);
              if (newVal) {
                // Request permission when enabling
                const granted = await requestNotificationPermission();
                setNotifPermission(getPermissionStatus());
                if (!granted) {
                  setNotifications(false);
                  return;
                }
              }
            }}
            icon={notifications && notifPermission === 'granted' ? Bell : BellOff}
          />

          {/* Permission status indicator */}
          {notifications && notifPermission !== 'granted' && (
            <div className="p-3 bg-bg-primary border border-border-muted rounded-sys-md flex items-start gap-2">
              <BellOff size={14} className="text-defcon-elevated shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-text-primary font-medium">
                  {notifPermission === 'denied'
                    ? 'Notifications are blocked in browser settings'
                    : 'Notifications require your permission'}
                </p>
                <p className="text-[10px] text-text-muted mt-0.5">
                  {notifPermission === 'denied'
                    ? 'Go to your browser site settings and enable notifications for this site.'
                    : 'Click the toggle above to grant permission.'}
                </p>
              </div>
            </div>
          )}

          <ToggleRow
            label="Meltdown Alerts"
            description="Extra browser alerts when tasks reach meltdown or critical urgency"
            enabled={meltdownAlerts}
            onToggle={() => setMeltdownAlerts(!meltdownAlerts)}
            icon={Shield}
          />
          <ToggleRow
            label="Sound Effects"
            description="Play sounds for critical alerts, timer completions, and UI feedback"
            enabled={soundEnabled}
            onToggle={() => {
              const newVal = !soundEnabled;
              setSoundEnabled(newVal);
              // Play a brief test tone when enabling
              if (newVal) {
                soundEngine.enabled = true;
                soundEngine.playNotification();
              }
            }}
            icon={soundEnabled ? Volume2 : VolumeX}
          />

          {/* Volume Slider — visible when sound is enabled */}
          {soundEnabled && (
            <div className="p-4 bg-bg-primary border border-border-muted rounded-sys-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Volume size={14} className="text-text-muted" />
                  <span className="text-sm font-medium text-text-primary">Volume</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-text-muted tabular-nums w-8 text-right">
                    {Math.round(soundVolume * 100)}%
                  </span>
                  <button
                    onClick={() => {
                      soundEngine.playNotification();
                    }}
                    className="p-1.5 text-text-muted hover:text-accent-amber border border-border-muted rounded-sys-sm hover:border-accent-amber/30 transition-colors"
                    title="Test volume"
                  >
                    <Play size={12} />
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(soundVolume * 100)}
                onChange={(e) => {
                  const val = Number(e.target.value) / 100;
                  setSoundVolume(val);
                }}
                style={{
                  background: `linear-gradient(to right, var(--sys-color-accent-amber) 0%, var(--sys-color-accent-amber) ${soundVolume * 100}%, var(--sys-color-border-muted) ${soundVolume * 100}%, var(--sys-color-border-muted) 100%)`,
                }}
                className="
                  w-full h-1.5 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-accent-amber
                  [&::-webkit-slider-thumb]:border-2
                  [&::-webkit-slider-thumb]:border-black
                  [&::-webkit-slider-thumb]:shadow-md
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:transition-transform
                  [&::-webkit-slider-thumb]:hover:scale-110
                  [&::-moz-range-thumb]:w-4
                  [&::-moz-range-thumb]:h-4
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-accent-amber
                  [&::-moz-range-thumb]:border-2
                  [&::-moz-range-thumb]:border-black
                  [&::-moz-range-thumb]:shadow-md
                  [&::-moz-range-thumb]:cursor-pointer
                "
                aria-label="Sound volume"
              />
              <div className="flex justify-between mt-1 text-[10px] font-mono text-text-muted/50">
                <span>Mute</span>
                <span>Max</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Focus Timer */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
          Focus Timer
        </span>
        <div className="p-4 bg-bg-primary border border-border-muted rounded-sys-md">
          <label className="text-sm font-medium text-text-primary">Default Duration</label>
          <div className="flex items-center gap-3 mt-2">
            {[15, 25, 45, 60].map((min) => (
              <button
                key={min}
                onClick={() => setFocusDuration(min)}
                className={`
                  px-3 py-1.5 text-sm font-mono rounded-sys-sm transition-colors
                  ${
                    focusDuration === min
                      ? 'bg-accent-amber/20 text-accent-amber border border-accent-amber/30'
                      : 'text-text-muted hover:text-text-primary hover:bg-bg-secondary border border-border-muted'
                  }
                `}
              >
                {min}min
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
          Appearance
        </span>
        <div className="flex items-center gap-2">
          {[
            { label: 'Auto', value: 'auto' },
            { label: 'Dark', value: 'dark' },
            { label: 'Light', value: 'light' },
          ].map((theme) => (
            <button
              key={theme.value}
              className="flex-1 py-2.5 text-sm font-mono border border-border-muted rounded-sys-md
                         text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors"
            >
              <Palette size={14} className="inline mr-1.5" />
              {theme.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
