import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { useIsOnline } from '@/hooks/useIsOnline';
import { addLocalPurchase } from '@/storage/purchases.local';
import { generateObjectId } from '@/utils/generateId';
import { purchasesApi } from '../services/purchases.api';
import type { PurchasePaymentType, PurchaseStatus } from '../types/purchase.type';

export function useCreatePurchase() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const isOnline = useIsOnline();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      provider: string;
      providerId?: string;
      productId: string;
      productName?: string;
      quantity: number;
      unitPrice: number;
      invoiceDate: string;
      invoiceGroupId?: string;
      invoiceImageUrl?: string;
      paymentType?: PurchasePaymentType;
      status?: PurchaseStatus;
    }) => {
      const quantity = Math.max(1, Math.round(payload.quantity));
      const unitPrice = Math.max(0, Math.round(payload.unitPrice));
      const totalAmount = quantity * unitPrice;
      const resolvedStatus = payload.paymentType === 'CONTADO' ? 'PAGADA' : payload.status || 'PENDIENTE';

      if (!isOnline || !workspaceId) {
        addLocalPurchase({
          id: generateObjectId(),
          workspaceId: workspaceId!,
          provider: payload.provider,
          providerId: payload.providerId,
          productId: payload.productId,
          productName: payload.productName,
          quantity,
          unitPrice,
          totalAmount,
          invoiceDate: payload.invoiceDate,
          invoiceGroupId: payload.invoiceGroupId,
          invoiceImageUrl: payload.invoiceImageUrl,
          paymentType: payload.paymentType || 'CREDITO',
          status: resolvedStatus,
          paidAmountCop: resolvedStatus === 'PAGADA' ? totalAmount : 0,
          remainingAmountCop: resolvedStatus === 'PAGADA' ? 0 : totalAmount,
          events: [],
          syncStatus: 'LOCAL',
          createdAt: Date.now(),
        });

        return { offline: true };
      }

      return purchasesApi.createPurchase(workspaceId, {
        provider: payload.provider,
        providerId: payload.providerId,
        productId: payload.productId,
        quantity,
        unitPrice,
        invoiceDate: payload.invoiceDate,
        invoiceGroupId: payload.invoiceGroupId,
        invoiceImageUrl: payload.invoiceImageUrl,
        paymentType: payload.paymentType,
        status: resolvedStatus,
      });
    },
    onSuccess: (_result, variables) => {
      qc.invalidateQueries({ queryKey: ['purchases', workspaceId] });

      qc.setQueryData(['products', workspaceId, 'top'], (current: any) => {
        if (!Array.isArray(current)) return current;

        return current.map((item) => {
          if (item._id !== variables.productId) return item;
          return {
            ...item,
            stock: Math.max(0, Math.round((item.stock || 0) + variables.quantity)),
            purchasePrice: Math.max(0, Math.round(variables.unitPrice)),
          };
        });
      });

      qc.invalidateQueries({ queryKey: ['products', workspaceId] });
    },
  });
}
