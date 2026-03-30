// src/modules/memberships/hooks/useInviteMember.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inviteBusinessMember } from '../services/memberships.api';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { Role } from '@/types/user';

export function useInviteMember() {
    const qc = useQueryClient();
    const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);

    return useMutation({
        mutationFn: (data: {
            phone: string;
            name: string;
            role: Role;
            puestoCount: number;
        }) => inviteBusinessMember(workspaceId!, data),

        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['memberships', workspaceId] });
            qc.invalidateQueries({ queryKey: ['me'] });
        },
    });
}
