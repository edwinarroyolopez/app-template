import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import type { SaleStatus, SaleDeliveryType, SalePriority, SaleType } from '../types/sale.type';

export function useUpdateSale() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      saleId,
      payload,
    }: {
      saleId: string;
      payload: {
        amountCop?: number;
        date?: string;
        paymentMethod?: string;
        description?: string;
        saleType?: SaleType;
        status?: SaleStatus;
        priority?: SalePriority;
        deliveryType?: SaleDeliveryType;
        deliveryDate?: string;
        clientId?: string;
        clientName?: string;
        clientPhone?: string;
        clientAddress?: string;
        productId?: string;
        productName?: string;
        productDetails?: string;
        dimensions?: string;
        productImageUrl?: string;
        observations?: string;
        responsibleEmployeeId?: string;
        delayReason?: string;
        eventMessage?: string;
        rollbackReason?: string;
      };
    }) => {
      const { data } = await api.put(`/workspaces/${workspaceId}/sales/${saleId}`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales', workspaceId] });
      qc.invalidateQueries({ queryKey: ['factory-orders', workspaceId] });
      qc.invalidateQueries({ queryKey: ['ready-for-delivery-orders', workspaceId] });
    },
  });
}
