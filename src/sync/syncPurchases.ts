import { getLocalPurchases, updateLocalPurchase } from '@/storage/purchases.local';
import { api } from '@/services/api';
import { queryClient } from '@/services/queryClient';

export async function syncPurchases() {
  const purchases = getLocalPurchases();
  if (!purchases.length) return;

  let didSync = false;

  for (const purchase of purchases) {
    if (purchase.syncStatus !== 'LOCAL') continue;

    try {
      updateLocalPurchase(purchase.id, { syncStatus: 'SYNCING' });

      await api.post(`/workspaces/${purchase.workspaceId}/purchases`, {
        provider: purchase.provider,
        providerId: purchase.providerId,
        productId: purchase.productId,
        quantity: purchase.quantity,
        unitPrice: purchase.unitPrice,
        invoiceDate: purchase.invoiceDate,
        invoiceGroupId: purchase.invoiceGroupId,
        invoiceImageUrl: purchase.invoiceImageUrl,
        paymentType: purchase.paymentType,
        status: purchase.status,
      });

      updateLocalPurchase(purchase.id, { syncStatus: 'SYNCED' });
      didSync = true;
    } catch {
      updateLocalPurchase(purchase.id, { syncStatus: 'FAILED' });
    }
  }

  if (didSync) {
    queryClient.invalidateQueries({ queryKey: ['purchases'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  }
}
