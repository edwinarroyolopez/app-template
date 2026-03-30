import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';

export function useAddSalePayment() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      saleId,
      payload,
    }: {
      saleId: string;
      payload: {
        amountCop: number;
        note?: string;
        paymentMethod?: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | string;
        evidence?: {
          imageUrl: string;
          publicId?: string;
          label?: string;
        };
      };
    }) => {
      const { data } = await api.post(`/workspaces/${workspaceId}/sales/${saleId}/payments`, payload);
      return data;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['sales', workspaceId] });
      qc.invalidateQueries({ queryKey: ['factory-orders', workspaceId] });
      qc.invalidateQueries({ queryKey: ['ready-for-delivery-orders', workspaceId] });
      qc.invalidateQueries({ queryKey: ['sale-detail', workspaceId, variables.saleId] });
    },
  });
}
