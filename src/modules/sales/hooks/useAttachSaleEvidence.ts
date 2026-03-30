import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';

export function useAttachSaleEvidence() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      saleId,
      payload,
    }: {
      saleId: string;
      payload: {
        imageUrl: string;
        publicId?: string;
        label?: string;
      };
    }) => {
      const { data } = await api.put(
        `/workspaces/${workspaceId}/sales/${saleId}/evidence`,
        payload,
      );
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['sales', workspaceId] });
      qc.invalidateQueries({ queryKey: ['sale-detail', workspaceId, vars.saleId] });
    },
  });
}
