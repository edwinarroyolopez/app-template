// src/modules/payables/hooks/usePayablesSummary.ts
import { useQuery } from '@tanstack/react-query';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { payablesApi } from '../services/payables.api';

export function usePayablesSummary() {
    const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);

    return useQuery({
        queryKey: ['payables-summary', workspaceId],
        enabled: !!workspaceId,
        queryFn: async () => {
            if (!workspaceId) throw new Error('No active business');
            return payablesApi.getPayablesSummary(workspaceId);
        },
    });
}
