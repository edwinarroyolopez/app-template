import { useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';

type UpgradeIntentPayload = {
    sourceScreen?: string;
    capability?: string;
    suggestedPlan?: 'PREMIUM' | 'PRO';
    context?: string;
};

export function useUpgradeIntent() {
    return useMutation({
        mutationFn: async (payload: UpgradeIntentPayload) => {
            await api.post('/accounts/upgrade-intent', payload);
        },
    });
}
