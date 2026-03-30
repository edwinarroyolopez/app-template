// src/modules/analytics/hooks/useBusinessHistory.ts
import { useQuery } from '@tanstack/react-query';
import { getWorkspaceHistory } from '../services/analytics.api';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';

export function useWorkspaceHistory(weeks = 8) {
    const workspaceId = useOperationalWorkspaceContextStore(s => s.activeWorkspaceContext?.workspace.id);

    return useQuery({
        queryKey: ['workspace-history', workspaceId, weeks],
        enabled: !!workspaceId,
        queryFn: () => getWorkspaceHistory(workspaceId!, weeks),
    });
}
