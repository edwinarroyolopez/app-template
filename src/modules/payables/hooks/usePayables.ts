// src/modules/payables/hooks/usePayables.ts
import { useQuery } from '@tanstack/react-query';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { payablesApi } from '../services/payables.api';
import type { ListPayablesQuery } from '../types/payables.types';

export function usePayables(query?: ListPayablesQuery) {
    const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);

    return useQuery({
        queryKey: ['payables', workspaceId, query?.status, query?.search],
        enabled: !!workspaceId,
        queryFn: async () => {
            if (!workspaceId) return [];
            return payablesApi.listPayables(workspaceId, query);
        },
    });
}
