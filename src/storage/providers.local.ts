import { storage } from './mmkv';

export type LocalProvider = {
  id: string;
  workspaceId: string;
  name: string;
  phone?: string;
  address?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  syncStatus: 'LOCAL' | 'SYNCING' | 'SYNCED' | 'FAILED';
  createdAt: number;
};

const KEY = 'providers-local';

export function getLocalProviders(): LocalProvider[] {
  const raw = storage.getString(KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveLocalProviders(items: LocalProvider[]) {
  storage.set(KEY, JSON.stringify(items));
}

export function addLocalProvider(item: LocalProvider) {
  const current = getLocalProviders();
  saveLocalProviders([item, ...current]);
}

export function updateLocalProvider(id: string, patch: Partial<LocalProvider>) {
  const current = getLocalProviders();
  saveLocalProviders(current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
}

export function saveRemoteProvidersToLocal(remoteProviders: any[]) {
  const local = getLocalProviders();
  const map = new Map(local.map((item) => [item.id, item]));

  remoteProviders.forEach((remote) => {
    map.set(remote._id, {
      id: remote._id,
      workspaceId: remote.workspaceId,
      name: remote.name,
      phone: remote.phone,
      address: remote.address,
      rating: Math.max(1, Math.min(5, Math.round(remote.rating || 3))) as 1 | 2 | 3 | 4 | 5,
      syncStatus: 'SYNCED',
      createdAt: remote.createdAt ? new Date(remote.createdAt).getTime() : Date.now(),
    });
  });

  saveLocalProviders(Array.from(map.values()));
}
