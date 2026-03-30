import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { productsApi } from '../services/products.api';

export function useUpdateProduct() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      productId: string;
      payload: {
        name?: string;
        image?: string;
        sku?: string;
        variant?: string;
        categoryId?: string;
        location?: string;
        purchasePrice?: number;
        salePrice?: number;
        stock?: number;
        minStock?: number;
      };
    }) => {
      if (!workspaceId) throw new Error('Missing workspaceId');
      return productsApi.updateProduct(workspaceId, params.productId, params.payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products', workspaceId] });
    },
  });
}
