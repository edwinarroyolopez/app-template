/**
 * Auth persist migration (v3). Reads **obsolete** AsyncStorage key names from pre-starter clients only.
 * Do not import from feature modules; `auth.store` uses this solely inside `persist.migrate`.
 */
type WorkspaceSummaryLite = { id: string; name: string };

const LEGACY_USAGE_WS = 'businesses';
const LEGACY_USAGE_WS_ALT = 'mines';
const LEGACY_MEMBERS_ALT = 'operations';
const LEGACY_MEMBERS_ALT_2 = 'lavadas';
const LEGACY_MEMBERS_PER_WS = 'membersPerBusiness';
const LEGACY_CAP_CREATE_1 = 'canCreateMultipleBusinesses';
const LEGACY_CAP_CREATE_TYPO = 'canCreateMultipleBusinesss';
const LEGACY_CAP_INVITE = 'canInviteBusinessMembers';
const LEGACY_CAP_INVITE_TYPO = 'canInviteBusinessrs';
const LEGACY_CAP_ADD = 'canAddLavadas';

function readRecord(obj: unknown): Record<string, unknown> | null {
  if (!obj || typeof obj !== 'object') return null;
  return obj as Record<string, unknown>;
}

export function migrateAuthStorageV3(persistedState: unknown): unknown {
  if (!persistedState || typeof persistedState !== 'object') {
    return persistedState;
  }
  const p = persistedState as Record<string, unknown>;
  const state = (readRecord(p.state) ?? p) as Record<string, unknown>;

  if (Array.isArray(state.workspaceContexts) && !Array.isArray(state.workspaces)) {
    state.workspaces = state.workspaceContexts;
    delete state.workspaceContexts;
  }
  if (state.activeWorkspaceId === undefined) {
    const ws = state.workspaces as WorkspaceSummaryLite[] | undefined;
    state.activeWorkspaceId = ws?.[0]?.id ?? null;
  }

  const usage = readRecord(state.usage);
  if (usage && !usage.workspaces) {
    const legacyWs = (usage[LEGACY_USAGE_WS] ?? usage[LEGACY_USAGE_WS_ALT]) as
      | { used?: number; max?: number }
      | undefined;
    const legacyMembers = (usage[LEGACY_MEMBERS_ALT] ?? usage[LEGACY_MEMBERS_ALT_2]) as
      | { used?: number; max?: number }
      | undefined;
    const legacyMembersPb = usage[LEGACY_MEMBERS_PER_WS] as { used?: number; max?: number } | undefined;
    state.usage = {
      workspaces: legacyWs ?? { used: 0, max: 0 },
      members: {
        used: legacyMembers?.used ?? legacyMembersPb?.used ?? 0,
        max: legacyMembers?.max ?? legacyMembersPb?.max ?? 0,
      },
    };
  }

  const capabilities = readRecord(state.capabilities);
  if (capabilities) {
    const canCreate =
      capabilities.canCreateMultipleWorkspaces ??
      capabilities[LEGACY_CAP_CREATE_1] ??
      capabilities[LEGACY_CAP_CREATE_TYPO];
    const canInvite =
      capabilities.canInviteWorkspaceMembers ??
      capabilities[LEGACY_CAP_INVITE] ??
      capabilities[LEGACY_CAP_INVITE_TYPO];
    const next = { ...capabilities } as Record<string, unknown>;
    next.canCreateMultipleWorkspaces = canCreate;
    next.canInviteWorkspaceMembers = canInvite;
    next.canAddOperations = capabilities.canAddOperations ?? capabilities[LEGACY_CAP_ADD];
    delete next[LEGACY_CAP_CREATE_1];
    delete next[LEGACY_CAP_CREATE_TYPO];
    delete next[LEGACY_CAP_INVITE];
    delete next[LEGACY_CAP_INVITE_TYPO];
    state.capabilities = next;
  }

  return persistedState;
}
