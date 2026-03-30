import { useEffect } from 'react';

import { useAuthStore } from '@/stores/auth.store';
import { useIsOnline } from '@/hooks/useIsOnline';
import {
  flushPendingPushNavigation,
  handleInitialPushOpen,
  registerPushTokenForCurrentUser,
  setupPushMessageListeners,
} from '@/notifications/pushNotifications';

export default function PushNotificationsBootstrap() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = useAuthStore((s) => s.user?.id);
  const isOnline = useIsOnline();

  useEffect(() => {
    const unsubscribe = setupPushMessageListeners();
    handleInitialPushOpen();

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !userId || !isOnline) return;

    registerPushTokenForCurrentUser();
    flushPendingPushNavigation();
  }, [isAuthenticated, userId, isOnline]);

  return null;
}
