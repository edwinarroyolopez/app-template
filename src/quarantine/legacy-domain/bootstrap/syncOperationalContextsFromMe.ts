import type { AuthUser } from '@/stores/auth.store';
import type { MeResponse } from '@/modules/auth/services/auth.api';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { minimalOperationalContextFromWorkspaceSummary } from '@/quarantine/legacy-domain/utils/minimalOperationalContextFromWorkspaceSummary';

/**
 * Keeps quarantined example modules in sync with `/auth/me` without pulling them into the shell.
 */
function contextId(c: any): string | undefined {
  return (c?.workspace ?? c?.business)?.id;
}

export function syncOperationalWorkspaceContextsFromMe(data: MeResponse, user: AuthUser) {
  const legacyList = data.businesses as { business?: { id: string; name: string } }[] | undefined;
  const workspaces = data.workspaces?.length
    ? data.workspaces
    : legacyList?.length
      ? legacyList.map((b) => ({
          id: b.business!.id,
          name: b.business!.name,
        }))
      : [];

  const fromApi = data.operationalWorkspaceContexts;
  const legacyPayload = legacyList;

  const contexts =
    Array.isArray(fromApi) && fromApi.length > 0
      ? fromApi
      : legacyPayload && legacyPayload.length > 0
        ? legacyPayload
        : workspaces.map((w) => minimalOperationalContextFromWorkspaceSummary(w, user));

  const setWorkspaceContexts = useOperationalWorkspaceContextStore.getState().setWorkspaceContexts;
  const setActiveWorkspaceContext = useOperationalWorkspaceContextStore.getState().setActiveWorkspaceContext;

  setWorkspaceContexts(contexts as any);

  const currentId = useOperationalWorkspaceContextStore.getState().activeWorkspaceContext?.workspace?.id;
  const pick = (contexts as any[]).find((c: any) => contextId(c) === currentId) ?? (contexts as any[])[0];
  if (pick) {
    setActiveWorkspaceContext(pick as any);
  }
}

export function clearOperationalWorkspaceContexts() {
  useOperationalWorkspaceContextStore.getState().setWorkspaceContexts([]);
  useOperationalWorkspaceContextStore.getState().clearActiveWorkspaceContext();
}
