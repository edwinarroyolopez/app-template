// src/modules/payables/hooks/useCreatePayable.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { payablesApi } from '../services/payables.api';
import type { CreatePayableInput } from '../types/payables.types';

export function useCreatePayable() {
    const workspaceId = useAuthStore((s) => s.activeWorkspaceId);
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreatePayableInput) => {
            if (!workspaceId) throw new Error('No active workspace');
            return payablesApi.createPayable(workspaceId, input);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['payables', workspaceId] });
            qc.invalidateQueries({ queryKey: ['payables-summary', workspaceId] });
        },
        onError: () => {
            // invalidate for potential retry/refresh
            qc.invalidateQueries({ queryKey: ['payables', workspaceId] });
        },
    });
}
