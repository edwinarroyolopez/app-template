import { useQuery } from '@tanstack/react-query';
import { getAccountAnalyticsOverview } from '../services/analytics.api';
import { normalizeAccountAnalyticsOverviewPayload } from '../utils/wireCompatLabels';

export function useAccountAnalyticsOverview() {
  return useQuery({
    queryKey: ['account-analytics-overview'],
    queryFn: async () => {
      const raw = await getAccountAnalyticsOverview();
      return normalizeAccountAnalyticsOverviewPayload(raw);
    },
  });
}
