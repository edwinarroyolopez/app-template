import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';

export function useWorkspaceMemberships(filter: 'ACTIVE' | 'INACTIVE' | 'ALL') {
    const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);

    return useQuery({
        queryKey: ['memberships', workspaceId, filter],
        queryFn: async () => {
            const params: any = {};

            if (filter === 'ALL' || filter === 'INACTIVE') {
                params.includeInactive = 'true';
            }

            const res = await api.get(
                `/workspaces/${workspaceId}/memberships`,
                { params }
            );

            let data = res.data;

            if (filter === 'INACTIVE') {
                data = data.filter((m: any) => !m.isActive);
            }

            if (filter === 'ACTIVE') {
                data = data.filter((m: any) => m.isActive);
            }

            return data;
        },
        enabled: !!workspaceId,
    });
}
