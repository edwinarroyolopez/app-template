import { storage } from '@/storage/mmkv';
import type { OperationalWorkspaceContext } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';

export type LocalWorkspaceContext = OperationalWorkspaceContext & {
  syncStatus?: 'LOCAL' | 'SYNCING' | 'SYNCED' | 'FAILED';
  createdAt?: string;
};

const KEY = 'workspaces-local';

export function getLocalWorkspaceContexts(): LocalWorkspaceContext[] {
  const raw = storage.getString(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalWorkspaceContexts(contexts: LocalWorkspaceContext[]) {
  storage.set(KEY, JSON.stringify(contexts));
}

export function saveRemoteWorkspaceContextsToLocal(remote: OperationalWorkspaceContext[]) {
  const local = getLocalWorkspaceContexts();

  const localMap = new Map(local.map((l) => [l.workspace.id, l]));

  remote.forEach((remoteCtx) => {
    const previous = localMap.get(remoteCtx.workspace.id);
    localMap.set(remoteCtx.workspace.id, {
      ...previous,
      ...remoteCtx,
      capabilities: (remoteCtx as any).capabilities ?? (remoteCtx as any).membershipCapabilities ?? (previous as any)?.capabilities,
      membershipCapabilities:
        (remoteCtx as any).membershipCapabilities ??
        (remoteCtx as any).capabilities ??
        (previous as any)?.membershipCapabilities,
      workspaceModuleFeatures:
        (remoteCtx as any).workspaceModuleFeatures ??
        (remoteCtx as any).businessFeatures ??
        (previous as any)?.workspaceModuleFeatures ??
        (previous as any)?.businessFeatures,
      workspaceOperationalType:
        (remoteCtx as any).workspaceOperationalType ??
        (remoteCtx as any).businessOperationalType ??
        (previous as any)?.workspaceOperationalType ??
        (previous as any)?.businessOperationalType,
      validEmployeeRoles: (remoteCtx as any).validEmployeeRoles ?? (previous as any)?.validEmployeeRoles,
      effectivePermissions: (remoteCtx as any).effectivePermissions ?? (previous as any)?.effectivePermissions,
      syncStatus: 'SYNCED',
      createdAt: previous?.createdAt || new Date().toISOString(),
    });
  });

  const merged = Array.from(localMap.values());
  saveLocalWorkspaceContexts(merged);
}

export function updateLocalWorkspaceContext(workspaceId: string, patch: Partial<LocalWorkspaceContext>) {
  const current = getLocalWorkspaceContexts();
  saveLocalWorkspaceContexts(
    current.map((l) => {
      if (l.workspace.id === workspaceId) {
        return {
          ...l,
          ...patch,
          workspace: patch.workspace ? { ...l.workspace, ...patch.workspace } : l.workspace,
          membership: patch.membership ? { ...l.membership, ...patch.membership } : l.membership,
        };
      }
      return l;
    }),
  );
}
