import { useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';

type CustomerSearchResult = {
  _id: string;
  name?: string;
  phone: string;
  address?: string;
  isActive: boolean;
  lifecycle: 'ACTIVE' | 'OLD_OTHER';
} | null;

export function useSearchCustomerByPhone() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);

  return useMutation({
    mutationFn: async (phone: string): Promise<CustomerSearchResult> => {
      if (!workspaceId) return null;

      const { data } = await api.get(`/workspaces/${workspaceId}/customers/search-by-phone`, {
        params: { phone },
      });

      return data || null;
    },
  });
}
