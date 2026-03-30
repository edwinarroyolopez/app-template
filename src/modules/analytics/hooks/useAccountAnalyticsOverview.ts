import { useQuery } from '@tanstack/react-query';
import { getAccountAnalyticsOverview } from '@/quarantine/legacy-domain/modules/workspace-directory/services/businesses.api';

export function useAccountAnalyticsOverview() {
  return useQuery({
    queryKey: ['account-analytics-overview'],
    queryFn: () => getAccountAnalyticsOverview(),
  });
}
