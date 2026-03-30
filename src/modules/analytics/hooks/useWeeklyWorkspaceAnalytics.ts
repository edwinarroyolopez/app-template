// src/modules/analytics/hooks/useWeeklyBusinessAnalytics.ts
import { useQuery } from '@tanstack/react-query';
import { getWeeklyWorkspaceAnalytics } from '../services/analytics.api';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';

export function useWeeklyWorkspaceAnalytics() {
    const workspaceId = useOperationalWorkspaceContextStore(
        (s) => s.activeWorkspaceContext?.workspace.id,
    );

    return useQuery({
        queryKey: ['analytics-weekly', workspaceId],
        enabled: !!workspaceId,
        queryFn: () =>
            getWeeklyWorkspaceAnalytics(workspaceId!),
    });
}
