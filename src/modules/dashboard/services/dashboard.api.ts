import { api } from '@/services/api';
import { WIRE_ALT_WORKSPACE_OBJECT_KEY } from '@/utils/wireWorkspaceBody';
import type { WorkspaceDashboardSummary } from '../types/dashboard.types';

export async function getWorkspaceDashboardSummary(
  workspaceId: string,
  params?: { from?: string; to?: string },
): Promise<WorkspaceDashboardSummary> {
  const res = await api.get(`/workspaces/${workspaceId}/dashboard-summary`, {
    params: params || {},
  });
  const raw = res.data as WorkspaceDashboardSummary & Record<string, unknown>;
  const workspace =
    raw.workspace ??
    (raw[WIRE_ALT_WORKSPACE_OBJECT_KEY] as WorkspaceDashboardSummary['workspace'] | undefined);
  if (!workspace) {
    throw new Error('dashboard-summary: expected workspace summary in response');
  }
  return { ...raw, workspace };
}
