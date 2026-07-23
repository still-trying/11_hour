/**
 * 11_HOUR — Sound & Effects Engine
 *
 * Generates all application sounds programmatically using the Web Audio API.
 * No external audio files required. Every sound is synthesized at runtime.
 * Settings are automatically persisted to localStorage.
 *
 * Usage:
 *   import { soundEngine } from '@/lib/utils/sounds';
 *   soundEngine.playTimerComplete();
 */

const STORAGE_KEY = '11hour_sound_settings';

export interface SoundEngineSettings {
  enabled: boolean;
  volume: number;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private _settings: SoundEngineSettings;

  constructor() {
    this._settings = this.loadSettings();
  }

  private loadSettings(): SoundEngineSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : true,
          volume: typeof parsed.volume === 'number' ? Math.max(0, Math.min(1, parsed.volume)) : 0.4,
        };
      }
    } catch {
      // localStorage unavailable or corrupt
    }
    return { enabled: true, volume: 0.4 };
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._settings));
    } catch {
      // localStorage unavailable
    }
  }

  configure(settings: Partial<SoundEngineSettings>): void {
    Object.assign(this._settings, settings);
    this.saveSettings();
  }

  get settings(): Readonly<SoundEngineSettings> {
    return { ...this._settings };
  }

  set enabled(val: boolean) {
    this._settings.enabled = val;
    this.saveSettings();
  }
  get enabled(): boolean {
    return this._settings.enabled;
  }

  set volume(val: number) {
    this._settings.volume = Math.max(0, Math.min(1, val));
    this.saveSettings();
  }
  get volume(): number {
    return this._settings.volume;
  }

  private getCtx(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {
        /* Audio context resume failed — non-critical */
      });
    }
    return this.ctx;
  }

  private osc(
    frequency: number,
    type: OscillatorType,
    dest: AudioNode,
    startTime: number,
    duration: number,
  ): OscillatorNode {
    const ctx = this.getCtx();
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = frequency;
    o.start(startTime);
    o.stop(startTime + duration);
    o.connect(dest);
    return o;
  }

  private envelope(
    gainNode: GainNode,
    startTime: number,
    attack: number,
    sustain: number,
    release: number,
    peakVolume = 1,
  ): void {
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(peakVolume * this._settings.volume, startTime + attack);
    gainNode.gain.setValueAtTime(
      peakVolume * this._settings.volume,
      startTime + attack + sustain,
    );
    gainNode.gain.linearRampToValueAtTime(0, startTime + attack + sustain + release);
  }

  playTimerComplete(): void {
    if (!this._settings.enabled) return;
    try {
      const ctx = this.getCtx();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      const noteDuration = 0.12;
      const gap = 0.08;
      notes.forEach((freq, i) => {
        const t = now + i * (noteDuration + gap);
        const g = ctx.createGain();
        this.envelope(g, t, 0.01, noteDuration * 0.6, 0.15, 0.35);
        g.connect(ctx.destination);
        this.osc(freq, 'sine', g, t, noteDuration + 0.15);
      });
    } catch {
      // Audio not available
    }
  }

  playTaskComplete(): void {
    if (!this._settings.enabled) return;
    try {
      const ctx = this.getCtx();
      const now = ctx.currentTime;
      const chord1 = [261.63, 329.63, 392.0, 523.25];
      const chord2 = [392.0, 493.88, 587.33, 783.99];
      const playChord = (frequencies: number[], time: number, vol: number) => {
        frequencies.forEach((freq) => {
          const g = ctx.createGain();
          this.envelope(g, time, 0.02, 0.6, 0.3, vol);
          g.connect(ctx.destination);
          this.osc(freq, 'triangle', g, time, 0.9);
        });
        const g2 = ctx.createGain();
        this.envelope(g2, time, 0.02, 0.5, 0.3, vol * 0.15);
        g2.connect(ctx.destination);
        this.osc(frequencies[0] * 2, 'sine', g2, time, 0.8);
      };
      playChord(chord1, now, 0.3);
      playChord(chord2, now + 0.25, 0.35);
    } catch {
      // Audio not available
    }
  }

  playCriticalAlert(): void {
    if (!this._settings.enabled) return;
    try {
      const ctx = this.getCtx();
      const now = ctx.currentTime;
      const duration = 1.2;
      const cycles = 4;
      const cycleDuration = duration / cycles;
      for (let i = 0; i < cycles; i++) {
        const t = now + i * cycleDuration;
        const freq = i % 2 === 0 ? 660 : 880;
        const g = ctx.createGain();
        this.envelope(g, t, 0.03, cycleDuration * 0.5, 0.1, 0.25);
        g.connect(ctx.destination);
        this.osc(freq, 'square', g, t, cycleDuration);
      }
    } catch {
      // Audio not available
    }
  }

  playMeltdownAlert(): void {
    if (!this._settings.enabled) return;
    try {
      const ctx = this.getCtx();
      const now = ctx.currentTime;
      const duration = 1.5;
      const cycles = 8;
      const cycleDuration = duration / cycles;
      for (let i = 0; i < cycles; i++) {
        const t = now + i * cycleDuration;
        const freq = 440 + Math.sin(i * 1.5) * 220;
        const g = ctx.createGain();
        this.envelope(g, t, 0.02, cycleDuration * 0.5, 0.05, 0.3);
        g.connect(ctx.destination);
        this.osc(freq, 'sawtooth', g, t, cycleDuration);
        const g2 = ctx.createGain();
        this.envelope(g2, t, 0.02, cycleDuration * 0.4, 0.05, 0.12);
        g2.connect(ctx.destination);
        this.osc(freq * 2.5, 'square', g2, t, cycleDuration);
      }
    } catch {
      // Audio not available
    }
  }

  playClick(): void {
    if (!this._settings.enabled) return;
    try {
      const ctx = this.getCtx();
      const now = ctx.currentTime;
      const g = ctx.createGain();
      this.envelope(g, now, 0.001, 0.01, 0.03, 0.1);
      g.connect(ctx.destination);
      this.osc(800, 'sine', g, now, 0.04);
    } catch {
      // Audio not available
    }
  }

  playTick(): void {
    if (!this._settings.enabled) return;
    try {
      const ctx = this.getCtx();
      const now = ctx.currentTime;
      const g = ctx.createGain();
      this.envelope(g, now, 0.001, 0.01, 0.04, 0.08);
      g.connect(ctx.destination);
      this.osc(1200, 'square', g, now, 0.05);
    } catch {
      // Audio not available
    }
  }

  playSwoosh(): void {
    if (!this._settings.enabled) return;
    try {
      const ctx = this.getCtx();
      const now = ctx.currentTime;
      const duration = 0.25;
      const g = ctx.createGain();
      this.envelope(g, now, 0.01, 0.1, 0.1, 0.12);
      g.connect(ctx.destination);
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(200, now);
      o.frequency.exponentialRampToValueAtTime(1200, now + duration * 0.4);
      o.frequency.exponentialRampToValueAtTime(800, now + duration);
      o.start(now);
      o.stop(now + duration);
      o.connect(g);
    } catch {
      // Audio not available
    }
  }

  playNotification(): void {
    if (!this._settings.enabled) return;
    try {
      const ctx = this.getCtx();
      const now = ctx.currentTime;
      const g = ctx.createGain();
      this.envelope(g, now, 0.01, 0.08, 0.2, 0.2);
      g.connect(ctx.destination);
      this.osc(880, 'sine', g, now, 0.3);
      const g2 = ctx.createGain();
      this.envelope(g2, now + 0.12, 0.01, 0.08, 0.2, 0.18);
      g2.connect(ctx.destination);
      this.osc(1320, 'sine', g2, now + 0.12, 0.3);
    } catch {
      // Audio not available
    }
  }
}

export const soundEngine = new SoundEngine();
export default soundEngine;
