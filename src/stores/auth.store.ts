import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccountCapabilities } from '@/types/capabilities';

export type UserRole = 'OWNER' | 'OWNER_VIEWER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export type AuthUser = {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  employeeRole?: 'WORKSPACE_MANAGER' | 'SELLER' | 'MANUFACTURER' | 'TRANSPORTER' | 'GENERAL_SUPPORT';
};

/** Workspace (tenant scope) summaries from `/auth/me`. */
export type WorkspaceSummary = {
  id: string;
  name: string;
};

export type AccountUsage = {
  workspaces: { used: number; max: number };
  members: { used: number; max: number };
};

export type AccountSummary = {
  id: string;
  tier: string;
  billingPlan: string;
  isActive: boolean;
  setupComplete: boolean;
  permissions: string[];
  subscriptionEndsAt?: string | Date;
  trialEndsAt?: string | Date;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  workspaces: WorkspaceSummary[];
  /** Active scope for shell + legacy hooks (usually a workspace id). */
  activeWorkspaceId: string | null;
  account: AccountSummary | null;
  accountCapabilities: AccountCapabilities | null;
  capabilities: AccountCapabilities | null;
  usage: AccountUsage | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setSession: (data: {
    token: string;
    user: AuthUser;
    workspaces?: WorkspaceSummary[];
    activeWorkspaceId?: string | null;
    account?: AccountSummary | null;
    capabilities?: AccountCapabilities | null;
    usage?: AccountUsage | null;
  }) => void;
  hydrateSession: (data: {
    user: AuthUser;
    workspaces?: WorkspaceSummary[];
    activeWorkspaceId?: string | null;
    account?: AccountSummary | null;
    capabilities?: AccountCapabilities | null;
    usage?: AccountUsage | null;
  }) => void;
  setActiveWorkspaceId: (id: string | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      workspaces: [],
      activeWorkspaceId: null,
      account: null,
      accountCapabilities: null,
      capabilities: null,
      usage: null,
      isAuthenticated: false,
      isHydrated: false,

      setSession: ({
        token,
        user,
        workspaces = [],
        activeWorkspaceId,
        account = null,
        capabilities = null,
        usage = null,
      }) =>
        set((state) => {
          const nextWorkspaces = workspaces.length > 0 ? workspaces : state.workspaces;
          const nextActive =
            activeWorkspaceId !== undefined
              ? activeWorkspaceId
              : state.activeWorkspaceId &&
                  nextWorkspaces.some((w) => w.id === state.activeWorkspaceId)
                ? state.activeWorkspaceId
                : nextWorkspaces[0]?.id ?? null;
          return {
            token,
            user,
            workspaces: nextWorkspaces,
            activeWorkspaceId: nextActive,
            account,
            accountCapabilities: capabilities ?? state.accountCapabilities,
            capabilities: capabilities ?? state.capabilities,
            usage: usage ?? state.usage,
            isAuthenticated: true,
            isHydrated: true,
          };
        }),

      hydrateSession: ({
        user,
        workspaces = [],
        activeWorkspaceId,
        account = null,
        capabilities = null,
        usage = null,
      }) =>
        set((state) => {
          const nextWorkspaces = workspaces.length > 0 ? workspaces : state.workspaces;
          const nextActive =
            activeWorkspaceId !== undefined
              ? activeWorkspaceId
              : state.activeWorkspaceId &&
                  nextWorkspaces.some((w) => w.id === state.activeWorkspaceId)
                ? state.activeWorkspaceId
                : nextWorkspaces[0]?.id ?? state.activeWorkspaceId;
          return {
            user,
            workspaces: nextWorkspaces,
            activeWorkspaceId: nextActive,
            account: account ?? state.account,
            accountCapabilities: capabilities ?? state.accountCapabilities,
            capabilities: capabilities ?? state.capabilities,
            usage: usage ?? state.usage,
            isAuthenticated: true,
            isHydrated: true,
          };
        }),

      setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),

      logout: () =>
        set({
          token: null,
          user: null,
          workspaces: [],
          activeWorkspaceId: null,
          account: null,
          accountCapabilities: null,
          capabilities: null,
          usage: null,
          isAuthenticated: false,
          isHydrated: true,
        }),
    }),
    {
      name: 'auth-storage',
      version: 3,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persistedState: unknown) => {
        if (!persistedState || typeof persistedState !== 'object') {
          return persistedState;
        }
        const p = persistedState as Record<string, unknown>;
        const state = (p.state as Record<string, unknown>) || p;

        if (Array.isArray(state.workspaceContexts) && !Array.isArray(state.workspaces)) {
          state.workspaces = state.workspaceContexts;
          delete state.workspaceContexts;
        }
        if (state.activeWorkspaceId === undefined) {
          const ws = state.workspaces as WorkspaceSummary[] | undefined;
          state.activeWorkspaceId = ws?.[0]?.id ?? null;
        }

        const usage = state.usage as Record<string, unknown> | null | undefined;
        if (usage && !usage.workspaces) {
          const legacyWs = (usage.businesses ?? usage.mines) as { used?: number; max?: number } | undefined;
          const legacyMembers = (usage.operations ?? usage.lavadas) as
            | { used?: number; max?: number }
            | undefined;
          // Old persisted keys only (never used in starter UI paths after migrate).
          const legacyMembersPb = usage.membersPerBusiness as { used?: number; max?: number } | undefined;
          state.usage = {
            workspaces: legacyWs ?? { used: 0, max: 0 },
            members: {
              used: legacyMembers?.used ?? legacyMembersPb?.used ?? 0,
              max: legacyMembers?.max ?? legacyMembersPb?.max ?? 0,
            },
          };
        }

        const capabilities = state.capabilities as Record<string, unknown> | null | undefined;
        if (capabilities) {
          const canCreate =
            capabilities.canCreateMultipleWorkspaces ??
            capabilities.canCreateMultipleBusinesses ??
            capabilities.canCreateMultipleBusinesss;
          const canInvite =
            capabilities.canInviteWorkspaceMembers ??
            capabilities.canInviteBusinessMembers ??
            capabilities.canInviteBusinessrs;
          state.capabilities = {
            ...capabilities,
            canCreateMultipleWorkspaces: canCreate,
            canInviteWorkspaceMembers: canInvite,
            canAddOperations: capabilities.canAddOperations ?? capabilities.canAddLavadas,
          };
          delete (state.capabilities as Record<string, unknown>).canCreateMultipleBusinesses;
          delete (state.capabilities as Record<string, unknown>).canInviteBusinessMembers;
        }

        return persistedState;
      },
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        workspaces: state.workspaces,
        activeWorkspaceId: state.activeWorkspaceId,
        account: state.account,
        accountCapabilities: state.accountCapabilities,
        capabilities: state.capabilities,
        usage: state.usage,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token && state?.user) {
          state.isAuthenticated = true;
        }
        if (state) {
          state.isHydrated = true;
        }
      },
    },
  ),
);
