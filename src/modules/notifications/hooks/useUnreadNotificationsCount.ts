import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '../services/notifications.api';

export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationsApi.unreadCount,
    refetchInterval: 30000,
  });
}
