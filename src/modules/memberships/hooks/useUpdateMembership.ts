// src/modules/memberships/hooks/useUpdateMembership.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';

export function useUpdateMembership() {
    const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async ({
            membershipId,
            data,
        }: {
            membershipId: string;
            data: {
                puestoCount?: number;
                isActive?: boolean;
            };
        }) => {
            const res = await api.patch(
                `/workspaces/${workspaceId}/memberships/${membershipId}`,
                data,
            );
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['memberships'] });
        },
    });
}
