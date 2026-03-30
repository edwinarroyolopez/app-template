import { useQuery } from '@tanstack/react-query';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { api } from '@/services/api';

export function useWorkspaceWeeklyCostBreakdown(week?: string) {
    const workspaceId = useOperationalWorkspaceContextStore(s => s.activeWorkspaceContext?.workspace.id);

    return useQuery({
        queryKey: ['workspace-weekly-cost-breakdown', workspaceId, week],
        enabled: !!workspaceId,
        queryFn: async () => {
            const { data } = await api.get(
                `/analytics/workspaces/${workspaceId}/cost-breakdown`,
                { params: { week } }
            );
            return data;
        },
    });
}
