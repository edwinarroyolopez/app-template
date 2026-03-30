// src/modules/payables/hooks/useDeletePayment.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { paymentsApi } from '../services/payments.api';

export function useDeletePayment(payableId: string) {
    const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (paymentId: string) => {
            if (!workspaceId) throw new Error('No active business');
            return paymentsApi.deletePayment(workspaceId, payableId, paymentId);
        },
        onSuccess: () => {
            // Same invalidations as create payment
            qc.invalidateQueries({ queryKey: ['payments', workspaceId, payableId] });
            qc.invalidateQueries({ queryKey: ['payable', workspaceId, payableId] });
            qc.invalidateQueries({ queryKey: ['payables', workspaceId] });
            qc.invalidateQueries({ queryKey: ['payables-summary', workspaceId] });
        },
        onError: () => {
            qc.invalidateQueries({ queryKey: ['payments', workspaceId, payableId] });
            qc.invalidateQueries({ queryKey: ['payable', workspaceId, payableId] });
        },
    });
}
