/** Canonical workspace surface / module feature vocabulary for sample domain code. */

export type WorkspaceOperationalType =
  | 'STORE'
  | 'WAREHOUSE'
  | 'WAREHOUSE_WITH_FACTORY'
  | 'NIGHTCLUB'
  | 'GARMENT_WORKSHOP';

/** Legacy slug values mapped onto `WorkspaceOperationalType` for old persisted/API data. */
export type LegacyWorkspaceSurfaceLabel = 'LAND' | 'RIVER';

export type WorkspaceSurfaceType = WorkspaceOperationalType | LegacyWorkspaceSurfaceLabel;

export type WorkspaceModuleFeature =
  | 'PURCHASES'
  | 'PROVIDERS'
  | 'INVENTORY'
  | 'INVENTORY_FLASH'
  | 'INVENTORY_LIQUIDATION'
  | 'SALES'
  | 'CUSTOMERS'
  | 'ORDERS'
  | 'MANUFACTURING'
  | 'DELIVERY_FLOW'
  | 'EMPLOYEES'
  | 'PAYABLES'
  | 'CASH_CLOSING'
  | 'GARMENT_GARMENTS'
  | 'GARMENT_OPERATIONS'
  | 'GARMENT_LOTS'
  | 'GARMENT_PRODUCTION_LOGS'
  | 'GARMENT_ANALYTICS';

export const WORKSPACE_OPERATIONAL_TYPE_LABELS: Record<WorkspaceOperationalType, string> = {
  STORE: 'Tienda',
  WAREHOUSE: 'Bodega',
  WAREHOUSE_WITH_FACTORY: 'Bodega + Fabrica',
  NIGHTCLUB: 'Discoteca',
  GARMENT_WORKSHOP: 'Taller de confecciones',
};

const WORKSPACE_MODULE_FEATURES_BY_TYPE: Record<WorkspaceOperationalType, WorkspaceModuleFeature[]> = {
  STORE: ['PURCHASES', 'PROVIDERS', 'INVENTORY', 'INVENTORY_FLASH', 'INVENTORY_LIQUIDATION', 'EMPLOYEES', 'PAYABLES', 'CASH_CLOSING'],
  WAREHOUSE: ['PURCHASES', 'PROVIDERS', 'INVENTORY', 'SALES', 'CUSTOMERS', 'ORDERS', 'EMPLOYEES', 'PAYABLES', 'CASH_CLOSING'],
  WAREHOUSE_WITH_FACTORY: ['PURCHASES', 'PROVIDERS', 'INVENTORY', 'SALES', 'CUSTOMERS', 'ORDERS', 'MANUFACTURING', 'DELIVERY_FLOW', 'EMPLOYEES', 'PAYABLES', 'CASH_CLOSING'],
  NIGHTCLUB: ['PURCHASES', 'PROVIDERS', 'INVENTORY', 'EMPLOYEES', 'PAYABLES', 'CASH_CLOSING'],
  GARMENT_WORKSHOP: ['PROVIDERS', 'EMPLOYEES', 'GARMENT_GARMENTS', 'GARMENT_OPERATIONS', 'GARMENT_LOTS', 'GARMENT_PRODUCTION_LOGS', 'GARMENT_ANALYTICS'],
};

const LEGACY_SURFACE_MAP: Record<LegacyWorkspaceSurfaceLabel, WorkspaceOperationalType> = {
  LAND: 'STORE',
  RIVER: 'WAREHOUSE',
};

export function resolveWorkspaceOperationalType(type?: WorkspaceSurfaceType): WorkspaceOperationalType | undefined {
  if (!type) return undefined;

  if (type in WORKSPACE_OPERATIONAL_TYPE_LABELS) {
    return type as WorkspaceOperationalType;
  }

  return LEGACY_SURFACE_MAP[type as LegacyWorkspaceSurfaceLabel];
}

export function resolveWorkspaceModuleFeaturesByType(type?: WorkspaceSurfaceType): WorkspaceModuleFeature[] {
  const operationalType = resolveWorkspaceOperationalType(type);
  if (!operationalType) return [];

  return WORKSPACE_MODULE_FEATURES_BY_TYPE[operationalType];
}
