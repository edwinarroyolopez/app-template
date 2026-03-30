import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';

/**
 * Example / legacy screens: require a rich operational context.
 * Starter navigator has no workspace-picker route; fall back to the protected home.
 */
export function useRequireActiveWorkspaceContext() {
  const activeWorkspaceContext = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext);
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (!activeWorkspaceContext) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'ProtectedOverview' }],
      });
    }
  }, [activeWorkspaceContext, navigation]);

  return activeWorkspaceContext;
}
