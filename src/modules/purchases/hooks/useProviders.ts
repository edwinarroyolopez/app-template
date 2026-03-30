import { useQuery } from '@tanstack/react-query';

import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { getLocalProviders, saveRemoteProvidersToLocal } from '@/storage/providers.local';
import { providerService } from '../services/provider.service';

export function useProviders(search?: string) {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);

  return useQuery({
    queryKey: ['providers', workspaceId, search || ''],
    enabled: !!workspaceId,
    queryFn: async () => {
      if (!workspaceId) return [];

      try {
        const remote = await providerService.list(workspaceId, { search });
        if (remote.length > 0) {
          saveRemoteProvidersToLocal(remote as any[]);
        }
      } catch {
      }

      const list = getLocalProviders()
        .filter((item) => item.workspaceId === workspaceId)
        .sort((a, b) => {
          if (b.rating !== a.rating) return b.rating - a.rating;
          return a.name.localeCompare(b.name, 'es');
        });

      if (!search?.trim()) return list;

      const term = search.trim().toLowerCase();
      return list.filter((item) => item.name.toLowerCase().includes(term));
    },
  });
}
