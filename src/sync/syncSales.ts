import { getLocalSales, updateLocalSale } from '@/storage/sales.local';
import { api } from '@/services/api';
import { queryClient } from '@/services/queryClient';

export async function syncSales() {
  const sales = getLocalSales();
  if (!sales.length) return;

  let didSync = false;

  for (const sale of sales) {
    if (sale.syncStatus !== 'LOCAL') continue;

    try {
      updateLocalSale(sale.id, { syncStatus: 'SYNCING' });

      await api.post(`/workspaces/${sale.workspaceId}/sales`, {
        amountCop: sale.amountCop,
        date: sale.date,
        paymentMethod: sale.paymentMethod,
        description: sale.description,
        saleType: sale.saleType,
        status: sale.status,
        priority: sale.priority,
        initialPaidAmountCop: sale.initialPaidAmountCop ?? sale.paidAmountCop,
        deliveryType: sale.deliveryType,
        deliveryDate: sale.deliveryDate,
        clientId: sale.clientId || sale.client?.id,
        clientName: sale.client?.name,
        clientPhone: sale.client?.phone,
        clientAddress: sale.client?.address,
        productId: sale.productId || sale.product?.id,
        productName: sale.product?.name,
        productDetails: sale.product?.details,
        dimensions: sale.product?.dimensions,
        productImageUrl: sale.product?.imageUrl,
        items: sale.items,
        observations: sale.observations,
        invoiceImageUrl: sale.invoiceImageUrl,
      });

      updateLocalSale(sale.id, { syncStatus: 'SYNCED' });
      didSync = true;
    } catch {
      updateLocalSale(sale.id, { syncStatus: 'FAILED' });
    }
  }

  if (didSync) {
    queryClient.invalidateQueries({ queryKey: ['sales'] });
  }
}
