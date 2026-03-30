import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { productCategoriesApi } from '../services/product-categories.api';

export function useCreateProductCategory() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name: string; code?: string }) => {
      if (!workspaceId) throw new Error('Missing workspaceId');
      return productCategoriesApi.createCategory(workspaceId, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product-categories', workspaceId] });
    },
  });
}
