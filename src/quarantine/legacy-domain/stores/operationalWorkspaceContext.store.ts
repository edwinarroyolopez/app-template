/**
 * @quarantine legacy-domain
 * Rich operational context for **example** modules (sales, inventory, …) not on the starter navigator.
 * The **shell** uses `auth.store` (`workspaces`, `activeWorkspaceId`). Do not import this store from starter-public / starter-protected / auth.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { storage } from '@/storage/mmkv';
import { WorkspaceContextCapabilities } from '@/types/capabilities';
import type {
  WorkspaceModuleFeature,
  WorkspaceOperationalType,
  WorkspaceSurfaceType,
} from '@/types/workspace-operational';

export type OperationalWorkspaceStats = {
  ownerPuestos: number;
  operatorPuestos: number;
  equipmentPuestos: number;
  totalPuestos: number;
  totalMembers: number;
  operationsCount: number;
};

export type OperationalWorkspaceHistorical = {
  operationsCount: number;
  goldTotalGrams: number;
  expensesTotalCop: number;
  ownersNet: number;
  operatorsNet: number;
  externalNet: number;
  landNet: number;
  businessNetTotal: number;
  groupNets?: {
    key: string;
    label: string;
    amountCop: number;
    payoutType: 'EXTERNAL' | 'LAND' | 'OPERATORS_POOL';
  }[];
  series?: any[];
};

/** Example-domain context: scoped **workspace** (not starter shell summary). */
export type OperationalWorkspaceContext = {
  workspace: {
    id: string;
    name: string;
    type: WorkspaceSurfaceType;
    address?: string;
    phone?: string;
    employee?: string;
    settlementType?: 'POSITIONS' | 'PERCENTAGE';
    settlementConfig?: {
      isSequential: boolean;
      percentages?: { key: string; label: string; percent: number }[];
      allies?: { key: string; label: string; grams: number }[];
      savings?: { enabled: boolean; key?: string; label?: string; grams: number };
      externalPercent?: number;
      landPercent?: number;
      operatorsPercent?: number;
      ownersPercent?: number;
      expensesFromOwners: boolean;
      ownersDistribution: { userId: string; percent: number }[];
    };
    isActive?: boolean;
  };
  membership: {
    id: string;
    puestoCount: number;
    isInside: boolean;
    role: string;
  };
  membershipCapabilities?: WorkspaceContextCapabilities;
  workspaceOperationalType?: WorkspaceOperationalType;
  workspaceModuleFeatures?: WorkspaceModuleFeature[];
  validEmployeeRoles?: Array<'WORKSPACE_MANAGER' | 'SELLER' | 'MANUFACTURER' | 'TRANSPORTER' | 'GENERAL_SUPPORT'>;
  effectivePermissions?: string[];
  owners?: { userId: string; name: string; puestoCount: number }[];
  capabilities: WorkspaceContextCapabilities;
  stats?: OperationalWorkspaceStats;
  historical?: OperationalWorkspaceHistorical;
  positionsProduction?: {
    refId: string;
    role: 'SOCIO' | 'OPERADOR';
    name: string;
    puestoCount: number;
    amountCop: number;
  }[];
};

function normalizeContext(ctx: any): OperationalWorkspaceContext {
  const workspace = ctx.workspace ?? ctx.business;
  const membershipCapabilities = ctx.membershipCapabilities ?? ctx.capabilities;
  const rawFeatures = ctx.workspaceModuleFeatures ?? ctx.businessFeatures;
  const workspaceModuleFeatures = Array.isArray(rawFeatures) ? rawFeatures : [];

  return {
    ...ctx,
    workspace,
    capabilities: membershipCapabilities,
    membershipCapabilities,
    workspaceModuleFeatures,
    workspaceOperationalType: ctx.workspaceOperationalType ?? ctx.businessOperationalType,
  };
}

function contextId(ctx?: OperationalWorkspaceContext | null) {
  return ctx?.workspace?.id;
}

type OperationalWorkspaceContextState = {
  workspaceContexts: OperationalWorkspaceContext[];
  activeWorkspaceContext: OperationalWorkspaceContext | null;
  settlementViewMode: 'MONEY' | 'GRAMS';
  goldPriceToday: {
    date: string;
    gramPriceCop: number;
    castellanoPriceCop: number;
    source: 'AI';
  } | null;
  setWorkspaceContexts: (contexts: any[]) => void;
  setActiveWorkspaceContext: (context: any) => void;
  mergeActiveWorkspaceContext: (data: Partial<OperationalWorkspaceContext> & Record<string, unknown>) => void;
  clearActiveWorkspaceContext: () => void;
  setSettlementViewMode: (mode: 'MONEY' | 'GRAMS') => void;
  setGoldPriceToday: (price: {
    date: string;
    gramPriceCop: number;
    castellanoPriceCop: number;
    source: 'AI';
  } | null) => void;
};

export const useOperationalWorkspaceContextStore = create<OperationalWorkspaceContextState>()(
  persist(
    (set, get) => ({
      workspaceContexts: [],
      activeWorkspaceContext: null,
      settlementViewMode: 'MONEY',
      goldPriceToday: null,

      setWorkspaceContexts: (incoming) => {
        const previous = get().workspaceContexts;
        const previousById = new Map(previous.map((item) => [contextId(item), item]));
        const normalized = incoming.map((raw) => {
          const next = normalizeContext(raw);
          const prev = previousById.get(contextId(next));

          if (!prev) return next;

          return normalizeContext({
            ...prev,
            ...next,
            membershipCapabilities:
              next.membershipCapabilities ?? next.capabilities ?? prev.membershipCapabilities ?? prev.capabilities,
            capabilities:
              next.capabilities ?? next.membershipCapabilities ?? prev.capabilities ?? prev.membershipCapabilities,
            workspaceModuleFeatures: next.workspaceModuleFeatures?.length
              ? next.workspaceModuleFeatures
              : prev.workspaceModuleFeatures,
            workspaceOperationalType: next.workspaceOperationalType ?? prev.workspaceOperationalType,
            validEmployeeRoles: next.validEmployeeRoles?.length ? next.validEmployeeRoles : prev.validEmployeeRoles,
            effectivePermissions: next.effectivePermissions?.length ? next.effectivePermissions : prev.effectivePermissions,
          });
        });
        const activeId = contextId(get().activeWorkspaceContext);
        const nextActive =
          normalized.find((item) => contextId(item) === activeId) || get().activeWorkspaceContext;

        set({
          workspaceContexts: normalized,
          activeWorkspaceContext: nextActive,
        });
      },

      setActiveWorkspaceContext: (context) => {
        set({ activeWorkspaceContext: normalizeContext(context) });
      },

      mergeActiveWorkspaceContext: (data) =>
        set((state) => {
          if (!state.activeWorkspaceContext) return state;

          const legacy = data as Record<string, unknown>;
          const workspacePatch = data.workspace ?? legacy.business;

          return {
            activeWorkspaceContext: normalizeContext({
              ...state.activeWorkspaceContext,
              ...data,
              workspace: {
                ...state.activeWorkspaceContext.workspace,
                ...((workspacePatch as object) || {}),
              },
              membership: {
                ...state.activeWorkspaceContext.membership,
                ...(data.membership || {}),
              },
              capabilities: data.capabilities ?? state.activeWorkspaceContext.capabilities,
              membershipCapabilities:
                data.membershipCapabilities ??
                data.capabilities ??
                state.activeWorkspaceContext.membershipCapabilities ??
                state.activeWorkspaceContext.capabilities,
              workspaceOperationalType:
                data.workspaceOperationalType ??
                (legacy.businessOperationalType as WorkspaceOperationalType | undefined) ??
                state.activeWorkspaceContext.workspaceOperationalType,
              workspaceModuleFeatures:
                data.workspaceModuleFeatures ??
                (legacy.businessFeatures as WorkspaceModuleFeature[] | undefined) ??
                state.activeWorkspaceContext.workspaceModuleFeatures,
              validEmployeeRoles: data.validEmployeeRoles ?? state.activeWorkspaceContext.validEmployeeRoles,
              effectivePermissions: data.effectivePermissions ?? state.activeWorkspaceContext.effectivePermissions,
              historical: data.historical ?? state.activeWorkspaceContext.historical,
              stats: data.stats ?? state.activeWorkspaceContext.stats,
            }),
          };
        }),

      clearActiveWorkspaceContext: () => set({ activeWorkspaceContext: null }),
      setSettlementViewMode: (mode) => set({ settlementViewMode: mode }),
      setGoldPriceToday: (price) => set({ goldPriceToday: price }),
    }),
    {
      name: 'operational-workspace-context-store',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        workspaceContexts: state.workspaceContexts,
        activeWorkspaceContext: state.activeWorkspaceContext,
        settlementViewMode: state.settlementViewMode,
        goldPriceToday: state.goldPriceToday,
      }),
    },
  ),
);
