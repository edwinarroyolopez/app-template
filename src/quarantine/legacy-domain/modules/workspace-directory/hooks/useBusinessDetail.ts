// quarantine/legacy-domain/modules/workspace-directory/hooks/useBusinessDetail.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBusinessDetail } from '../services/businesses.api';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { useEffect, useCallback } from 'react';

export function useBusinessDetail(workspaceId: string) {
    const mergeActiveWorkspaceContext = useOperationalWorkspaceContextStore((s) => s.mergeActiveWorkspaceContext);
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['workspace-detail', workspaceId],
        queryFn: () => getBusinessDetail(workspaceId),
        enabled: !!workspaceId,
    });

    /* ================= MERGE STORE ================= */

    useEffect(() => {
        if (!query.data) return;

        mergeActiveWorkspaceContext({
            workspace: query.data.workspace ?? query.data.business,
            membership: query.data.membership,
            membershipCapabilities: query.data.membershipCapabilities,
            capabilities: query.data.capabilities,
            workspaceOperationalType: query.data.workspaceOperationalType ?? query.data.businessOperationalType,
            workspaceModuleFeatures: query.data.workspaceModuleFeatures ?? query.data.businessFeatures,
            validEmployeeRoles: query.data.validEmployeeRoles,
            effectivePermissions: query.data.effectivePermissions,
            stats: query.data.stats,
            historical: query.data.historical,
            owners: query.data.owners,
            positionsProduction: query.data.positionsProduction,
        });
    }, [query.data, mergeActiveWorkspaceContext]);

    /* ================= COMBINED REFRESH ================= */

    const refetchAll = useCallback(async () => {
        await query.refetch();

        await queryClient.invalidateQueries({
            queryKey: ['me'],
        });
    }, [query, queryClient]);

    return {
        ...query,
        refetchAll,
    };
}
