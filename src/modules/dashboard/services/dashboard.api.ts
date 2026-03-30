import { api } from '@/services/api';
import type { WorkspaceDashboardSummary } from '../types/dashboard.types';

export async function getWorkspaceDashboardSummary(
  workspaceId: string,
  params?: { from?: string; to?: string },
): Promise<WorkspaceDashboardSummary> {
  const res = await api.get(`/workspaces/${workspaceId}/dashboard-summary`, {
    params: params || {},
  });
  const raw = res.data as WorkspaceDashboardSummary & { business?: WorkspaceDashboardSummary['workspace'] };
  const workspace = raw.workspace ?? raw.business;
  if (!workspace) {
    throw new Error('dashboard-summary: expected `workspace` (or legacy `business`) in response');
  }
  return { ...raw, workspace };
}
