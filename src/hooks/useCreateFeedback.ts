// src/hooks/useCreateFeedback.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

export function useCreateFeedback() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            feature: string;
            easy: boolean | null;
            difficultyReason?: string;
            comment?: string;
        }) => {
            await api.post('/feedback', data);
        },
        onSuccess: (_, vars) => {
            qc.invalidateQueries({
                queryKey: ['feedback-can-ask', vars.feature],
            });
        },
    });
}
