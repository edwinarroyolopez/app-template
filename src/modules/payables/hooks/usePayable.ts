// src/modules/payables/hooks/usePayable.ts
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { payablesApi } from '../services/payables.api';

export function usePayable(payableId?: string) {
    const workspaceId = useAuthStore((s) => s.activeWorkspaceId);

    return useQuery({
        queryKey: ['payable', workspaceId, payableId],
        enabled: !!workspaceId && !!payableId,
        queryFn: async () => {
            if (!workspaceId || !payableId) throw new Error('Missing workspaceId or payableId');
            return payablesApi.getPayable(workspaceId, payableId);
        },
    });
}
