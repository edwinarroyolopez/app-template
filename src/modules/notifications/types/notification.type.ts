export type NotificationStatus = 'UNREAD' | 'READ';

export type AppNotification = {
  _id: string;
  userId: string;
  accountId: string;
  workspaceId?: string;
  type: string;
  title: string;
  message: string;
  status: NotificationStatus;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
};
