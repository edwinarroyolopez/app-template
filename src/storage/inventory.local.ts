import { storage } from './mmkv';

export type LocalFlashAdjustment = {
  id: string;
  workspaceId: string;
  productId: string;
  physicalStock: number;
  reason?: string;
  syncStatus: 'LOCAL' | 'SYNCING' | 'SYNCED' | 'FAILED';
  createdAt: number;
};

export type LocalInventoryAuditDraft = {
  workspaceId: string;
  auditId?: string;
  status: 'IN_PROGRESS' | 'FINALIZED';
  countsByProductId: Record<string, number>;
  pendingSyncProductIds: string[];
  pendingFinalize: boolean;
  updatedAt: number;
};

const FLASH_KEY = 'inventory-flash-adjustments-local';
const DRAFTS_KEY = 'inventory-audit-drafts-local';

export function getLocalFlashAdjustments(): LocalFlashAdjustment[] {
  const raw = storage.getString(FLASH_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveLocalFlashAdjustments(items: LocalFlashAdjustment[]) {
  storage.set(FLASH_KEY, JSON.stringify(items));
}

export function addLocalFlashAdjustment(item: LocalFlashAdjustment) {
  const current = getLocalFlashAdjustments();
  saveLocalFlashAdjustments([item, ...current]);
}

export function updateLocalFlashAdjustment(id: string, patch: Partial<LocalFlashAdjustment>) {
  const current = getLocalFlashAdjustments();
  saveLocalFlashAdjustments(current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
}

function readDraftsMap(): Record<string, LocalInventoryAuditDraft> {
  const raw = storage.getString(DRAFTS_KEY);
  return raw ? JSON.parse(raw) : {};
}

function writeDraftsMap(map: Record<string, LocalInventoryAuditDraft>) {
  storage.set(DRAFTS_KEY, JSON.stringify(map));
}

export function getLocalInventoryAuditDraft(workspaceId: string): LocalInventoryAuditDraft | null {
  const map = readDraftsMap();
  return map[workspaceId] || null;
}

export function saveLocalInventoryAuditDraft(draft: LocalInventoryAuditDraft) {
  const map = readDraftsMap();
  map[draft.workspaceId] = draft;
  writeDraftsMap(map);
}

export function clearLocalInventoryAuditDraft(workspaceId: string) {
  const map = readDraftsMap();
  delete map[workspaceId];
  writeDraftsMap(map);
}

export function listLocalInventoryAuditDrafts(): LocalInventoryAuditDraft[] {
  return Object.values(readDraftsMap());
}
