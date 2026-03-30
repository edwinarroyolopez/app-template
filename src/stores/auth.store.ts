import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccountCapabilities } from '@/types/capabilities';
import { migrateAuthStorageV3 } from '@/storage/legacy/authStorageMigrateV3';

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
      migrate: migrateAuthStorageV3,
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
