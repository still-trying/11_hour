export const queryKeys = {
  tasks: {
    all: ['tasks'] as const,
    list: (filters?: { status?: string; limit?: number }) =>
      ['tasks', 'list', filters].filter((f) => f != null) as readonly unknown[],
    detail: (id: string) => ['tasks', 'detail', id] as const,
  },
  habits: {
    all: ['habits'] as const,
    list: () => ['habits', 'list'] as const,
    detail: (id: string) => ['habits', 'detail', id] as const,
    logs: (date?: string) =>
      ['habits', 'logs', date].filter((f) => f != null) as readonly unknown[],
  },
  notifications: {
    all: ['notifications'] as const,
    list: () => ['notifications', 'list'] as const,
  },
  focusSessions: {
    all: ['focusSessions'] as const,
    list: () => ['focusSessions', 'list'] as const,
  },
  profile: {
    all: ['profile'] as const,
    detail: (userId: string) => ['profile', userId] as const,
  },
} as const;
