// src/modules/operational-costs/hooks/useUpdateOperationalCost.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';

export function useUpdateGeneralExpense() {
    const workspaceId = useOperationalWorkspaceContextStore(s => s.activeWorkspaceContext?.workspace.id);
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async ({
            costId,
            payload,
            image,
        }: {
            costId: string;
            payload: any;
            image?: any;
        }) => {
            const form = new FormData();

            Object.entries(payload).forEach(([k, v]) => {
                if (v !== undefined && v !== null)
                    form.append(k, String(v));
            });

            if (image) {
                form.append('image', image as any);
            }

            const { data } = await api.put(
                `/workspaces/${workspaceId}/general-expenses/${costId}`,
                form,
                { headers: { 'Content-Type': 'multipart/form-data' } },
            );

            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: ['general-expenses', workspaceId],
            });
        },
    });
}
