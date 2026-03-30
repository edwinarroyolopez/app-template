// src/modules/operational-costs/hooks/useTranscribeOperationalCost.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';

export function useTranscribeGeneralExpense() {
    const workspaceId = useOperationalWorkspaceContextStore(s => s.activeWorkspaceContext?.workspace.id);

    return useMutation({
        mutationFn: async (file: {
            uri: string;
            name: string;
            type: string;
        }) => {
            const form = new FormData();
            form.append('audio', file as any);

            const { data } = await api.post(
                `/workspaces/${workspaceId}/general-expenses/from-audio`,
                form,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                },
            );

            return data as {
                amountCop?: number;
                description?: string;
                confidence: number;
                rawText: string;
            };
        },
    });
}
