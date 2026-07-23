import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { notificationsApi } from '@/lib/services/notifications';
import { useAppStore } from '@/lib/store/useAppStore';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useNotificationsQuery() {
  const queryClient = useQueryClient();
  const { user, setNotifications } = useAppStore();

  // Main notifications query
  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: () => notificationsApi.fetch(),
    enabled: !!user,
    refetchInterval: 60_000, // Poll every minute as backup
  });

  // Sync to Zustand
  useEffect(() => {
    if (notificationsQuery.data) {
      setNotifications(notificationsQuery.data);
    }
  }, [notificationsQuery.data, setNotifications]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: queryKeys.notifications.list(),
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  // Sync DEF CON alerts
  const syncDefconAlertsMutation = useMutation({
    mutationFn: () => {
      const tasks = useAppStore.getState().tasks;
      return notificationsApi.syncDefconAlerts(tasks);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.list(),
      });
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.list(),
      });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.list(),
      });
    },
  });

  // Create notification mutation
  const createNotificationMutation = useMutation({
    mutationFn: (input: { title: string; message: string; type: string; task_id?: string }) =>
      notificationsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.list(),
      });
    },
  });

  return {
    // Data
    notifications: notificationsQuery.data ?? [],
    unreadCount: notificationsQuery.data?.filter((n) => !n.is_read).length ?? 0,
    isLoading: notificationsQuery.isLoading,
    isError: notificationsQuery.isError,

    // Mutations
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    createNotification: createNotificationMutation.mutateAsync,
    syncDefconAlerts: syncDefconAlertsMutation.mutateAsync,
  };
}
