import { useQuery } from '@tanstack/react-query';
import { getBusinessExecutiveSummary } from '../services/businesses.api';

export function useBusinessExecutiveSummary(workspaceId?: string) {
  return useQuery({
        queryKey: ['workspace-executive-summary', workspaceId],
    enabled: !!workspaceId,
    queryFn: () => getBusinessExecutiveSummary(workspaceId!),
  });
}
