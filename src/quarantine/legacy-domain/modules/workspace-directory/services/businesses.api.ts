// quarantine/legacy-domain/modules/workspace-directory/services/businesses.api.ts
import { api } from '@/services/api';
import type { WorkspaceOperationalType } from '@/types/workspace-operational';

export async function createBusiness(data: {
    name: string;
    type: WorkspaceOperationalType;
    address?: string;
    phone?: string;
    employee?: string;
}) {
    const res = await api.post('/workspaces', data);
    return res.data;
}

export async function getMyWorkspaces() {
    const res = await api.get('/workspaces/my');
    return res.data;
}

export async function getBusinessDetail(workspaceId: string) {
    const res = await api.get(`/workspaces/${workspaceId}/detail`);
    return res.data;
}

export async function getBusinessExecutiveSummary(workspaceId: string) {
    const res = await api.get(`/workspaces/${workspaceId}/executive-summary`);
    return res.data;
}

export async function getAccountAnalyticsOverview() {
    const res = await api.get('/workspaces/analytics/overview');
    return res.data;
}
