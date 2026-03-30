import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import type { SaleStatus } from '../types/sale.type';

export function useUpdateSaleLineOperationalStatus() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      saleId,
      saleItemId,
      payload,
    }: {
      saleId: string;
      saleItemId: string;
      payload: {
        operationalStatus: Extract<
          SaleStatus,
          'LISTO_PARA_ENTREGAR' | 'EN_REPARTO' | 'ENTREGADA' | 'CANCELADA'
        >;
        note?: string;
        rollbackReason?: string;
      };
    }) => {
      const { data } = await api.put(
        `/workspaces/${workspaceId}/sales/${saleId}/items/${saleItemId}/operational-status`,
        payload,
      );
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['sales', workspaceId] });
      qc.invalidateQueries({ queryKey: ['factory-orders', workspaceId] });
      qc.invalidateQueries({ queryKey: ['ready-for-delivery-orders', workspaceId] });
      qc.invalidateQueries({ queryKey: ['sale-detail', workspaceId, vars.saleId] });
    },
  });
}
