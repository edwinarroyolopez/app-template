import { useQuery } from '@tanstack/react-query';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { productsApi } from '../services/products.api';
import { getLocalProductsByBusiness, saveRemoteProductsToLocal } from '@/storage/products.local';

type ProductStockFilter = 'ALL' | 'HIGH' | 'LOW' | 'FAVORITE';

function threshold(product: any) {
  const minStock = Number(product?.minStock || 0);
  return minStock > 0 ? minStock : 2;
}

function applyLocalFilter(products: any[], stockFilter: ProductStockFilter) {
  if (stockFilter === 'ALL') return products;
  if (stockFilter === 'LOW') return products.filter((product) => Number(product?.stock || 0) <= threshold(product));
  if (stockFilter === 'HIGH') return products.filter((product) => Number(product?.stock || 0) > threshold(product));
  return products.filter((product) => Number(product?.rating || 0) >= 4);
}

export function useProducts(search?: string, options?: { stockFilter?: ProductStockFilter }) {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const stockFilter = options?.stockFilter || 'ALL';

  return useQuery({
    queryKey: ['products', workspaceId, search || 'top', stockFilter],
    enabled: !!workspaceId,
    queryFn: async () => {
      if (!workspaceId) return [];

      try {
        const remote = await productsApi.listProducts(workspaceId, { q: search, stockFilter });
        saveRemoteProductsToLocal(workspaceId, remote);
        return remote;
      } catch {
        const local = getLocalProductsByBusiness(workspaceId);
        const localFiltered = applyLocalFilter(local, stockFilter);
        if (!search) return localFiltered;

        const term = search.toLowerCase();
        return localFiltered.filter(
          (product: any) =>
            product.name?.toLowerCase().includes(term) || product.sku?.toLowerCase().includes(term),
        );
      }
    },
  });
}
