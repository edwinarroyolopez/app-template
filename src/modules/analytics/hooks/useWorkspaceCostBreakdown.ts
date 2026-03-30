import { useQuery } from '@tanstack/react-query';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { getWorkspaceCostBreakdown } from '../services/analytics.api';

export function useWorkspaceCostBreakdown(params: {
    from: string;
    to: string;
}) {
    const workspaceId = useOperationalWorkspaceContextStore(s => s.activeWorkspaceContext?.workspace.id);

    return useQuery({
        queryKey: ['workspace-cost-breakdown', workspaceId, params],
        enabled: !!workspaceId,
        queryFn: () => getWorkspaceCostBreakdown(workspaceId!, params),
    });
}
