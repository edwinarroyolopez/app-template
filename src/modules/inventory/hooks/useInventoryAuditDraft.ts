import { useEffect, useMemo, useState } from 'react';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { useIsOnline } from '@/hooks/useIsOnline';
import {
  getLocalInventoryAuditDraft,
  saveLocalInventoryAuditDraft,
  type LocalInventoryAuditDraft,
} from '@/storage/inventory.local';
import { inventoryApi } from '../services/inventory.api';

export function useInventoryAuditDraft(totalProducts: number) {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const isOnline = useIsOnline();
  const [draft, setDraft] = useState<LocalInventoryAuditDraft | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);

  function buildFreshDraft(currentWorkspaceId: string): LocalInventoryAuditDraft {
    return {
      workspaceId: currentWorkspaceId,
      status: 'IN_PROGRESS',
      countsByProductId: {},
      pendingSyncProductIds: [],
      pendingFinalize: false,
      updatedAt: Date.now(),
    };
  }

  useEffect(() => {
    if (!workspaceId) return;

    const local = getLocalInventoryAuditDraft(workspaceId);
    if (local) {
      const hasPending = (local.pendingSyncProductIds || []).length > 0 || local.pendingFinalize;
      if (local.status === 'FINALIZED' && !hasPending) {
        const fresh = buildFreshDraft(workspaceId);
        setDraft(fresh);
        saveLocalInventoryAuditDraft(fresh);
      } else {
        setDraft(local);
      }
      return;
    }

    const fresh = buildFreshDraft(workspaceId);
    setDraft(fresh);
    saveLocalInventoryAuditDraft(fresh);
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId || !isOnline) return;

    (async () => {
      try {
        const active = await inventoryApi.getActiveAudit(workspaceId);
        if (!active?._id) {
          setDraft((prev) => {
            if (!prev) return prev;
            const hasPending = (prev.pendingSyncProductIds || []).length > 0 || prev.pendingFinalize;
            if (hasPending) return prev;
            const fresh = buildFreshDraft(workspaceId);
            saveLocalInventoryAuditDraft(fresh);
            return fresh;
          });
          return;
        }

        const map: Record<string, number> = {};
        for (const item of active.items || []) {
          const productId = item.productId?.toString?.() || item.productId;
          if (!productId) continue;
          map[productId] = Math.max(0, Math.round(item.physicalStock || 0));
        }

        const nextDraft: LocalInventoryAuditDraft = {
          workspaceId,
          auditId: active._id,
          status: 'IN_PROGRESS',
          countsByProductId: map,
          pendingSyncProductIds: [],
          pendingFinalize: false,
          updatedAt: Date.now(),
        };

        setDraft((prev) => {
          const merged = {
            ...nextDraft,
            pendingSyncProductIds: prev?.pendingSyncProductIds || [],
            pendingFinalize: prev?.pendingFinalize || false,
            countsByProductId: {
              ...map,
              ...(prev?.countsByProductId || {}),
            },
          };
          saveLocalInventoryAuditDraft(merged);
          return merged;
        });
      } catch {
      }
    })();
  }, [workspaceId, isOnline]);

  const countedProducts = useMemo(() => Object.keys(draft?.countsByProductId || {}).length, [draft]);
  const progressPercent = useMemo(() => {
    if (!totalProducts) return 0;
    return Math.min(100, Math.round((countedProducts / totalProducts) * 100));
  }, [countedProducts, totalProducts]);

  function persist(next: LocalInventoryAuditDraft) {
    setDraft(next);
    saveLocalInventoryAuditDraft(next);
  }

  async function setCount(productId: string, physicalStock: number) {
    if (!workspaceId || !draft) return;

    let next = {
      ...draft,
      countsByProductId: {
        ...draft.countsByProductId,
        [productId]: Math.max(0, Math.round(physicalStock)),
      },
      pendingSyncProductIds: Array.from(new Set([...(draft.pendingSyncProductIds || []), productId])),
      updatedAt: Date.now(),
    };

    if (isOnline && !next.auditId) {
      try {
        const created = await inventoryApi.startAudit(workspaceId);
        if (created?._id) {
          next = { ...next, auditId: created._id };
        }
      } catch {
      }
    }

    persist(next);

    if (isOnline && next.auditId) {
      try {
        await inventoryApi.upsertAuditItem(workspaceId, next.auditId, {
          productId,
          physicalStock: Math.max(0, Math.round(physicalStock)),
        });

        const synced = {
          ...next,
          pendingSyncProductIds: (next.pendingSyncProductIds || []).filter((id) => id !== productId),
          updatedAt: Date.now(),
        };
        persist(synced);
      } catch {
      }
    }
  }

  async function finalize() {
    setIsFinalizing(true);

    try {
    if (!workspaceId || !draft) return { queued: true };

    let next = { ...draft, pendingFinalize: true, updatedAt: Date.now() };
    persist(next);

    if (!isOnline) {
      return { queued: true };
    }

    if (!next.auditId) {
      try {
        const created = await inventoryApi.startAudit(workspaceId);
        if (created?._id) {
          next = { ...next, auditId: created._id };
          persist(next);
        }
      } catch {
        return { queued: true };
      }
    }

    if (!next.auditId) return { queued: true };

    for (const productId of Object.keys(next.countsByProductId || {})) {
      await inventoryApi.upsertAuditItem(workspaceId, next.auditId, {
        productId,
        physicalStock: Math.max(0, Math.round(next.countsByProductId[productId] || 0)),
      });
    }

    const finalized = await inventoryApi.finalizeAudit(workspaceId, next.auditId);

    const done = {
      ...next,
      status: 'FINALIZED' as const,
      pendingFinalize: false,
      pendingSyncProductIds: [],
      updatedAt: Date.now(),
    };
    persist(done);
    return {
      queued: false,
      auditId: finalized?.auditId || next.auditId,
      alreadyFinalized: Boolean(finalized?.alreadyFinalized),
    };
    } finally {
      setIsFinalizing(false);
    }
  }

  return {
    draft,
    countedProducts,
    progressPercent,
    setCount,
    finalize,
    isFinalizing,
  };
}
