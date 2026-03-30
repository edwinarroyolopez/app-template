// src/modules/payables/hooks/usePayables.ts
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { payablesApi } from '../services/payables.api';
import type { ListPayablesQuery } from '../types/payables.types';

export function usePayables(query?: ListPayablesQuery) {
    const workspaceId = useAuthStore((s) => s.activeWorkspaceId);

    return useQuery({
        queryKey: ['payables', workspaceId, query?.status, query?.search],
        enabled: !!workspaceId,
        queryFn: async () => {
            if (!workspaceId) return [];
            return payablesApi.listPayables(workspaceId, query);
        },
    });
}
