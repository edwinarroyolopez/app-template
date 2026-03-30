// src/modules/operational-costs/hooks/useCreateOperationalCost.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { addLocalOperationalCost } from '@/storage/general-expenses.local';

import { useIsOnline } from '@/hooks/useIsOnline';
import { persistMedia } from '@/utils/mediaStorage';
import { generateObjectId } from '@/utils/generateId';

export function useCreateGeneralExpense() {
    const workspaceId = useOperationalWorkspaceContextStore(s => s.activeWorkspaceContext?.workspace.id);
    const qc = useQueryClient();
    const isOnline = useIsOnline();

    return useMutation({
        mutationFn: async (payload: {
            category: string;
            date: string;
            amountCop: number;
            description?: string;
            isPayable?: boolean;
            vendorName?: string;
            image?: any;
        }) => {
            // 📴 OFFLINE → guardar local
            if (!isOnline || !workspaceId) {
                try {
                    let localImagePath: string | undefined;

                    if (payload.image?.uri) {
                        localImagePath = await persistMedia(
                            payload.image.uri,
                            'image',
                        );
                    }

                    addLocalOperationalCost({
                        id: generateObjectId(),
                        workspaceId: workspaceId!,
                        category: payload.category,
                        date: payload.date,
                        amountCop: payload.amountCop,
                        description: payload.description,
                        source: 'TEXT',
                        localImagePath,
                        syncStatus: 'LOCAL',
                        createdAt: Date.now(),
                    });

                    return { offline: true };
                } catch (e) {
                    console.error('Offline save failed', e);
                    return { offline: true }; // 🔑 igual retornamos
                }
            }

            // 🌐 ONLINE → API normal
            const form = new FormData();
            form.append('category', payload.category);
            form.append('date', payload.date);
            form.append('amountCop', String(payload.amountCop));
            if (payload.description)
                form.append('description', payload.description);

            if (payload.image) {
                form.append('image', payload.image as any);
            }

            const { data } = await api.post(
                `/workspaces/${workspaceId}/general-expenses`,
                form,
                { headers: { 'Content-Type': 'multipart/form-data' } },
            );

            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: ['general-expenses', workspaceId],
            });
            qc.invalidateQueries({
                queryKey: ['feedback-can-ask', 'CREATE_GENERAL_EXPENSE'],
            });
        },
        onError: () => {
            qc.invalidateQueries({
                queryKey: ['general-expenses', workspaceId],
            });
            qc.invalidateQueries({
                queryKey: ['feedback-can-ask', 'CREATE_GENERAL_EXPENSE'],
            });
        },
    });
}
