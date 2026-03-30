// src/hooks/useCanAskFeedback.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export function useCanAskFeedback(feature: string) {
    return useQuery({
        queryKey: ['feedback-can-ask', feature],
        queryFn: async () => {
            const res = await api.get('/feedback/can-ask', {
                params: { feature },
            });
            return res.data as { canAsk: boolean };
        },
    });
}
