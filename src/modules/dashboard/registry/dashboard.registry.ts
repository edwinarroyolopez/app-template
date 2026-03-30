import type { WorkspaceOperationalType } from '@/types/workspace-operational';

export type DashboardWidgetKey =
  | 'salesSummary'
  | 'salesTrend'
  | 'cashSummary'
  | 'topProducts'
  | 'transactionFlow'
  | 'expenseCategories'
  | 'inventoryHealth'
  | 'stockAlerts'
  | 'purchasePulse'
  | 'movementSummary'
  | 'factoryPipeline'
  | 'fulfillmentPulse'
  | 'lotPipeline'
  | 'productionSummary'
  | 'lotFinance'
  | 'workerPayables';

export type DashboardDefinition = {
  intentLabel: string;
  defaultQuestion: string;
  primaryRouteFallback: string;
  widgetOrder: DashboardWidgetKey[];
};

export const DASHBOARD_REGISTRY: Record<WorkspaceOperationalType, DashboardDefinition> = {
  STORE: {
    intentLabel: 'Operacion comercial diaria',
    defaultQuestion: 'Como va la venta de hoy y que producto esta jalonando?',
    primaryRouteFallback: 'Sales',
    widgetOrder: ['salesSummary', 'salesTrend', 'topProducts', 'cashSummary'],
  },
  NIGHTCLUB: {
    intentLabel: 'Operacion de caja diaria',
    defaultQuestion: 'Como va la caja hoy?',
    primaryRouteFallback: 'Transactions',
    widgetOrder: ['cashSummary', 'expenseCategories', 'transactionFlow'],
  },
  GARMENT_WORKSHOP: {
    intentLabel: 'Operacion por lotes',
    defaultQuestion: 'Que lotes se estan moviendo y cuanto cuestan?',
    primaryRouteFallback: 'GarmentWorkshopLots',
    widgetOrder: ['lotPipeline', 'productionSummary', 'lotFinance', 'workerPayables'],
  },
  WAREHOUSE: {
    intentLabel: 'Operacion de inventario, compra y movimiento',
    defaultQuestion: 'Que te va a faltar primero y que compra debes priorizar hoy?',
    primaryRouteFallback: 'Purchases',
    widgetOrder: ['inventoryHealth', 'stockAlerts', 'purchasePulse', 'movementSummary'],
  },
  WAREHOUSE_WITH_FACTORY: {
    intentLabel: 'Orquestacion bodega + fabrica + entrega',
    defaultQuestion: 'Que cuello de botella debes resolver hoy entre insumos, fabrica y despacho?',
    primaryRouteFallback: 'FactoryOrders',
    widgetOrder: ['factoryPipeline', 'fulfillmentPulse', 'inventoryHealth', 'purchasePulse', 'stockAlerts'],
  },
};
