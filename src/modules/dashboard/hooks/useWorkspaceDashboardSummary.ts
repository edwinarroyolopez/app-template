import { useQuery } from '@tanstack/react-query';
import { getWorkspaceDashboardSummary } from '../services/dashboard.api';

export function useWorkspaceDashboardSummary(
  workspaceId?: string,
  params?: { from?: string; to?: string },
) {
  return useQuery({
    queryKey: [
      'workspace-dashboard-summary',
      workspaceId,
      params?.from || '',
      params?.to || '',
    ],
    enabled: !!workspaceId,
    queryFn: () => getWorkspaceDashboardSummary(workspaceId!, params),
  });
}
