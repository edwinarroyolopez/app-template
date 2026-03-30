import { api } from '@/services/api';
import { Role } from '@/types/user';

export async function inviteWorkspaceMember(
    workspaceId: string,
    data: {
        phone: string;
        name: string;
        role: Role;
        puestoCount: number;
    }
) {
    const res = await api.post(`/workspaces/${workspaceId}/memberships/invite`, data);
    return res.data;
}
