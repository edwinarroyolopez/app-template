import { api } from '@/services/api';
import type { AppNotification } from '../types/notification.type';

export const notificationsApi = {
  async listLatest(limit = 7): Promise<AppNotification[]> {
    const { data } = await api.get<AppNotification[]>('/notifications', {
      params: { limit },
    });
    return data;
  },

  async unreadCount(): Promise<{ count: number }> {
    const { data } = await api.get<{ count: number }>('/notifications/unread-count');
    return data;
  },

  async markRead(notificationId: string): Promise<{ ok: boolean; notification?: AppNotification }> {
    const { data } = await api.patch<{ ok: boolean; notification?: AppNotification }>(
      `/notifications/${notificationId}/read`,
    );
    return data;
  },
};
