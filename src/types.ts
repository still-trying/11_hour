export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
}

export interface MicroStep {
  id: string;
  title: string;
  duration: number; // in seconds
  status: 'pending' | 'running' | 'completed';
  completedAt?: string;
}

export interface RescueEpisode {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'abandoned';
  createdAt: string;
  completedAt?: string;
  targetDeadline: string;
}

export interface Alert {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: string;
}
