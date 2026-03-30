import { api } from '@/services/api';
import { queryClient } from '@/services/queryClient';
import { getLocalProviders, updateLocalProvider } from '@/storage/providers.local';

export async function syncProviders() {
  const providers = getLocalProviders();
  if (!providers.length) return;

  let didSync = false;

  for (const provider of providers) {
    if (provider.syncStatus !== 'LOCAL') continue;

    try {
      updateLocalProvider(provider.id, { syncStatus: 'SYNCING' });

      await api.post(`/workspaces/${provider.workspaceId}/providers`, {
        name: provider.name,
        phone: provider.phone,
        address: provider.address,
        rating: provider.rating,
      });

      updateLocalProvider(provider.id, { syncStatus: 'SYNCED' });
      didSync = true;
    } catch {
      updateLocalProvider(provider.id, { syncStatus: 'FAILED' });
    }
  }

  if (didSync) {
    queryClient.invalidateQueries({ queryKey: ['providers'] });
  }
}
