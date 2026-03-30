import { useQuery } from '@tanstack/react-query';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { productCategoriesApi } from '../services/product-categories.api';

export function useProductCategories(search?: string) {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);

  return useQuery({
    queryKey: ['product-categories', workspaceId, search || 'all'],
    enabled: !!workspaceId,
    queryFn: async () => {
      if (!workspaceId) return [];
      return productCategoriesApi.listCategories(workspaceId, { q: search });
    },
  });
}
