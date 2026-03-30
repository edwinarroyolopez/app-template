// src/modules/payables/hooks/usePayablesSummary.ts
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { payablesApi } from '../services/payables.api';

export function usePayablesSummary() {
    const workspaceId = useAuthStore((s) => s.activeWorkspaceId);

    return useQuery({
        queryKey: ['payables-summary', workspaceId],
        enabled: !!workspaceId,
        queryFn: async () => {
            if (!workspaceId) throw new Error('No active workspace');
            return payablesApi.getPayablesSummary(workspaceId);
        },
    });
}
