// src/modules/payables/hooks/useDeletePayable.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { payablesApi } from '../services/payables.api';

export function useDeletePayable() {
    const workspaceId = useAuthStore((s) => s.activeWorkspaceId);
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (payableId: string) => {
            if (!workspaceId) throw new Error('No active workspace');
            return payablesApi.deletePayable(workspaceId, payableId);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['payables', workspaceId] });
            qc.invalidateQueries({ queryKey: ['payables-summary', workspaceId] });
        },
        onError: () => {
            qc.invalidateQueries({ queryKey: ['payables', workspaceId] });
        },
    });
}
