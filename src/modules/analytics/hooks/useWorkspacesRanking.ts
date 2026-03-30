import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { normalizeWorkspacesRankingPayload } from '../utils/wireCompatLabels';

export function useWorkspacesRanking(params: {
    from: string;
    to: string;
}) {
    return useQuery({
        queryKey: ['workspaces-ranking', params],
        queryFn: async () => {
            const { data } = await api.get(
                '/analytics/workspaces/ranking',
                { params }
            );
            return normalizeWorkspacesRankingPayload(data);
        },
    });
}
