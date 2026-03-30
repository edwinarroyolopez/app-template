import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';

export function useUpdateMembership() {
    const workspaceId = useAuthStore((s) => s.activeWorkspaceId);
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
