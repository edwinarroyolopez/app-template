import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

import { useAuthStore } from '@/stores/auth.store';

/**
 * Canonical starter guard: require `activeWorkspaceId` from `auth.store`.
 * Resets navigation when none is selected (aligned with shell workspace switcher).
 */
export function useRequireActiveWorkspace() {
  const activeWorkspaceId = useAuthStore((s) => s.activeWorkspaceId);
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (!activeWorkspaceId) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'ProtectedOverview' }],
      });
    }
  }, [activeWorkspaceId, navigation]);

  return activeWorkspaceId;
}
