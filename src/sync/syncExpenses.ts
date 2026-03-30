import {
    getLocalExpenses,
    updateLocalExpense,
} from '@/storage/operation-expenses.local';
import { api } from '@/services/api';
import { queryClient } from '@/services/queryClient';

export async function syncExpenses() {
    const items = getLocalExpenses();
    if (!items.length) return;

    let didSync = false;

    for (const e of items) {
        if (e.syncStatus !== 'LOCAL') continue;

        try {
            updateLocalExpense(e.id, { syncStatus: 'SYNCING' });

            const form = new FormData();
            form.append('amountCop', String(e.amountCop));
            form.append('type', e.type);
            if (e.description) form.append('description', e.description);

            if (e.localImagePath) {
                form.append('image', {
                    uri: `file://${e.localImagePath}`,
                    name: 'expense.jpg',
                    type: 'image/jpeg',
                } as any);
            }

            const res = await api.post(
                `/workspaces/${e.workspaceId}/operations/${e.operationId}/expenses`,
                form,
                { headers: { 'Content-Type': 'multipart/form-data' } },
            );

            updateLocalExpense(e.id, {
                syncStatus: 'SYNCED',
                receiptImage: res.data?.receiptImage,
            });

            didSync = true;
        } catch {
            updateLocalExpense(e.id, { syncStatus: 'FAILED' });
        }
    }

    if (didSync) {
        queryClient.invalidateQueries({
            queryKey: ['expenses'],
        });
    }
}
