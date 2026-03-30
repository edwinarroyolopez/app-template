// src/modules/payables/hooks/useUpdatePayable.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { payablesApi } from '../services/payables.api';
import type { UpdatePayableInput } from '../types/payables.types';

export function useUpdatePayable(payableId: string) {
    const workspaceId = useAuthStore((s) => s.activeWorkspaceId);
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (input: UpdatePayableInput) => {
            if (!workspaceId) throw new Error('No active workspace');
            return payablesApi.updatePayable(workspaceId, payableId, input);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['payables', workspaceId] });
            qc.invalidateQueries({ queryKey: ['payable', workspaceId, payableId] });
            qc.invalidateQueries({ queryKey: ['payables-summary', workspaceId] });
        },
        onError: () => {
            qc.invalidateQueries({ queryKey: ['payables', workspaceId] });
            qc.invalidateQueries({ queryKey: ['payable', workspaceId, payableId] });
        },
    });
}
