// src/modules/payables/hooks/useCreatePayment.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { paymentsApi } from '../services/payments.api';
import type { CreatePaymentInput } from '../types/payments.types';

export function useCreatePayment(payableId: string) {
    const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreatePaymentInput) => {
            if (!workspaceId) throw new Error('No active business');
            return paymentsApi.createPayment(workspaceId, payableId, input);
        },
        onSuccess: () => {
            // Invalidate payments list for this payable
            qc.invalidateQueries({ queryKey: ['payments', workspaceId, payableId] });
            // Invalidate the payable itself (to update paidCop/remainingCop/status)
            qc.invalidateQueries({ queryKey: ['payable', workspaceId, payableId] });
            // Invalidate payables list
            qc.invalidateQueries({ queryKey: ['payables', workspaceId] });
            // Invalidate summary
            qc.invalidateQueries({ queryKey: ['payables-summary', workspaceId] });
        },
        onError: () => {
            qc.invalidateQueries({ queryKey: ['payments', workspaceId, payableId] });
            qc.invalidateQueries({ queryKey: ['payable', workspaceId, payableId] });
        },
    });
}
