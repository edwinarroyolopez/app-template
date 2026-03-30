import { useQuery } from '@tanstack/react-query';

import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { getLocalProductsByBusiness } from '@/storage/products.local';
import { productsApi } from '../services/products.api';

export function useProductDetail(productId?: string) {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);

  return useQuery({
    queryKey: ['product-detail', workspaceId, productId],
    enabled: !!workspaceId && !!productId,
    queryFn: async () => {
      if (!workspaceId || !productId) return null;

      try {
        return await productsApi.getProduct(workspaceId, productId);
      } catch {
        const local = getLocalProductsByBusiness(workspaceId);
        return local.find((item: any) => item._id === productId || item.id === productId) || null;
      }
    },
  });
}
