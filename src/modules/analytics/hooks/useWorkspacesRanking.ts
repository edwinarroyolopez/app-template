// src/modules/analytics/hooks/useBusinessesRanking.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

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
            return data;
        },
    });
}
