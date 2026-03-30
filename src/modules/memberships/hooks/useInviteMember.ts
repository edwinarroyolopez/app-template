import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inviteWorkspaceMember } from '../services/memberships.api';
import { useAuthStore } from '@/stores/auth.store';
import { Role } from '@/types/user';

export function useInviteMember() {
    const qc = useQueryClient();
    const workspaceId = useAuthStore((s) => s.activeWorkspaceId);

    return useMutation({
        mutationFn: (data: {
            phone: string;
            name: string;
            role: Role;
            puestoCount: number;
        }) => inviteWorkspaceMember(workspaceId!, data),

        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['memberships', workspaceId] });
            qc.invalidateQueries({ queryKey: ['me'] });
        },
    });
}
