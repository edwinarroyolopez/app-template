import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '../services/notifications.api';

export function useNotifications(limit = 7) {
  return useQuery({
    queryKey: ['notifications', 'latest', limit],
    queryFn: () => notificationsApi.listLatest(limit),
  });
}
