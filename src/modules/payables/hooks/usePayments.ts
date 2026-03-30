// src/modules/payables/hooks/usePayments.ts
import { useQuery } from '@tanstack/react-query';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { paymentsApi } from '../services/payments.api';

export function usePayments(payableId?: string) {
    const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);

    return useQuery({
        queryKey: ['payments', workspaceId, payableId],
        enabled: !!workspaceId && !!payableId,
        queryFn: async () => {
            if (!workspaceId || !payableId) return [];
            return paymentsApi.listPayments(workspaceId, payableId);
        },
    });
}
