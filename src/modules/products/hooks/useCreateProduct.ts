import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { productsApi } from '../services/products.api';

export function useCreateProduct() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      workspaceIds?: string[];
      image?: string;
      sku?: string;
      variant?: string;
      categoryId?: string;
      location?: string;
      purchasePrice?: number;
      salePrice?: number;
      stock?: number;
      minStock?: number;
    }) => {
      if (!workspaceId) throw new Error('Missing workspaceId');
      return productsApi.createProduct(workspaceId, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products', workspaceId] });
    },
  });
}
