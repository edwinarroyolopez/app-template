import {
    getLocalOperationalCosts,
    updateLocalOperationalCost,
} from '@/storage/general-expenses.local';
import { api } from '@/services/api';
import { queryClient } from '@/services/queryClient'; // 👈 IMPORTANTE

export async function syncOperationalCosts() {
    const costs = getLocalOperationalCosts();
    if (!costs || costs.length === 0) return;

    let didSyncSomething = false;

    for (const cost of costs) {
        if (cost.syncStatus !== 'LOCAL') continue;

        try {
            // 1️⃣ Marcamos como sincronizando
            updateLocalOperationalCost(cost.id, {
                syncStatus: 'SYNCING',
            });

            const form = new FormData();
            form.append('category', cost.category);
            form.append('date', cost.date);

            if (cost.amountCop !== undefined) {
                form.append('amountCop', String(cost.amountCop));
            }

            if (cost.description) {
                form.append('description', cost.description);
            }

            if (cost.localImagePath) {
                form.append('image', {
                    uri: `file://${cost.localImagePath}`,
                    name: 'receipt.jpg',
                    type: 'image/jpeg',
                } as any);
            }

            const res = await api.post(
                `/workspaces/${cost.workspaceId}/general-expenses`,
                form,
                { headers: { 'Content-Type': 'multipart/form-data' } },
            );

            // 2️⃣ Marcamos como sincronizado
            updateLocalOperationalCost(cost.id, {
                syncStatus: 'SYNCED',
                receiptImage: res.data?.receiptImage,
                audioUrl: res.data?.audioUrl,
            });

            didSyncSomething = true;
        } catch (e) {
            console.error('Fallo de sincronización', e);

            updateLocalOperationalCost(cost.id, {
                syncStatus: 'FAILED',
            });
        }
    }

    // 3️⃣ 🔁 REFRESCAMOS LA UI SOLO SI HUBO CAMBIOS
    if (didSyncSomething) {
        queryClient.invalidateQueries({
            queryKey: ['operational-costs'],
        });
    }
}
