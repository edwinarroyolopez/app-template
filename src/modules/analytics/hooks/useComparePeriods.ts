// src/modules/analytics/hooks/useComparePeriods.ts
import { useQuery } from '@tanstack/react-query';
import { comparePeriods } from '../services/analytics.api';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';

export function useComparePeriods(params: {
    from: string;
    to: string;
    prevFrom: string;
    prevTo: string;
}) {
    const workspaceId = useOperationalWorkspaceContextStore(s => s.activeWorkspaceContext?.workspace.id);

    return useQuery({
        queryKey: ['compare-periods', workspaceId, params],
        enabled: !!workspaceId,
        queryFn: () => comparePeriods(workspaceId!, params),
    });
}
