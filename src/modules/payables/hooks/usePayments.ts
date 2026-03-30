// src/modules/payables/hooks/usePayments.ts
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { paymentsApi } from '../services/payments.api';

export function usePayments(payableId?: string) {
    const workspaceId = useAuthStore((s) => s.activeWorkspaceId);

    return useQuery({
        queryKey: ['payments', workspaceId, payableId],
        enabled: !!workspaceId && !!payableId,
        queryFn: async () => {
            if (!workspaceId || !payableId) return [];
            return paymentsApi.listPayments(workspaceId, payableId);
        },
    });
}
