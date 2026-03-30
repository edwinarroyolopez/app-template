// src/modules/payables/hooks/usePayable.ts
import { useQuery } from '@tanstack/react-query';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { payablesApi } from '../services/payables.api';

export function usePayable(payableId?: string) {
    const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);

    return useQuery({
        queryKey: ['payable', workspaceId, payableId],
        enabled: !!workspaceId && !!payableId,
        queryFn: async () => {
            if (!workspaceId || !payableId) throw new Error('Missing workspaceId or payableId');
            return payablesApi.getPayable(workspaceId, payableId);
        },
    });
}
