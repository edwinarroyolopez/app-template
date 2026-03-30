import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

export function useAIAnalysis() {
    const qc = useQueryClient();

    const latest = useQuery({
        queryKey: ['ai-analysis-latest'],
        queryFn: async () => {
            const { data } = await api.get('/ai-analysis/latest');
            return data;
        },
    });

    const history = useQuery({
        queryKey: ['ai-analysis-history'],
        queryFn: async () => {
            const { data } = await api.get('/ai-analytics/history');
            return data;
        },
    });

    const generate = useMutation({
        mutationFn: async (params: { from: string; to: string }) => {
            const { data } = await api.post('/ai-analytics/generate', null, {
                params,
            });
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['ai-analysis-latest'] });
            qc.invalidateQueries({ queryKey: ['ai-analysis-history'] });
        },
        onError: () => {
            qc.invalidateQueries({ queryKey: ['ai-analysis-latest'] });
            qc.invalidateQueries({ queryKey: ['ai-analysis-history'] });
        },
    });

    return { latest, history, generate };
}
