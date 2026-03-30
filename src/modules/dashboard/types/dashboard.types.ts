import type { WorkspaceSurfaceType } from '@/types/workspace-operational';

export type DashboardRange = {
  from: string;
  to: string;
};

export type SalesSummaryBlock = {
  todayRevenueCop: number;
  yesterdayRevenueCop: number;
  revenueDeltaPercent: number;
  todayOrders: number;
  paidTodayCop: number;
  openOrders: number;
  delayedOrders: number;
  pendingReceivableCop: number;
};

export type CashSummaryBlock = {
  incomeCop: number;
  expenseCop: number;
  netCop: number;
  movementCount: number;
  closingStatus?: {
    isClosed: boolean;
    expectedNetCop?: number;
    reportedAmountCop?: number;
    differenceCop?: number;
  };
};

export type TopProductsBlockItem = {
  productName: string;
  quantity: number;
  revenueCop: number;
};

export type SalesTrendBlock = {
  weekSeries: Array<{
    key: string;
    dayLabel: string;
    revenueCop: number;
    orders: number;
  }>;
};

export type TransactionFlowBlock = {
  weekSeries: Array<{
    key: string;
    dayLabel: string;
    incomeCop?: number;
    expenseCop?: number;
    netCop?: number;
  }>;
};

export type ExpenseCategoryItem = {
  category: string;
  amountCop: number;
  movements: number;
};

export type InventoryHealthBlock = {
  productsTracked: number;
  totalStockUnits: number;
  inventoryValueCop: number;
  lowStockCount: number;
  zeroStockCount: number;
};

export type StockAlertItem = {
  productId: string;
  productName: string;
  stock: number;
  minStock: number;
  deficit: number;
};

export type PurchasePulseBlock = {
  purchasesTodayCount: number;
  purchasesTodayAmountCop: number;
  pendingInvoicesCount: number;
  overdueInvoicesCount: number;
  pendingInvoicesAmountCop: number;
};

export type MovementSummaryBlock = {
  inboundUnits: number;
  outboundUnits: number;
  netUnits: number;
  movementCount: number;
};

export type FactoryPipelineBlock = {
  inProductionItems: number;
  blockedByMaterialsItems: number;
  readyForDeliveryItems: number;
  delayedFactoryItems: number;
};

export type FulfillmentPulseBlock = {
  openManufactureOrders: number;
  readyForDeliveryOrders: number;
  inDeliveryOrders: number;
  delayedOrders: number;
  pendingReceivableCop: number;
};

export type LotPipelineBlock = {
  pending: number;
  inProcess: number;
  readyToDeliver: number;
  delivered: number;
  totalActive: number;
};

export type ProductionSummaryBlock = {
  expectedUnits: number;
  completedUnits: number;
  pendingUnits: number;
  progressPercent: number;
};

export type LotFinanceBlock = {
  expectedIncome: number;
  incomeReceived: number;
  incomePending: number;
  laborAccrued: number;
  laborPaid: number;
  laborPending: number;
  suppliesCost: number;
  transportCost: number;
  otherCosts: number;
  totalCost: number;
  resultExpected: number;
  resultCurrent: number;
};

export type WorkerPayableItem = {
  workerEmployeeId: string;
  workerName: string;
  accruedCop: number;
  paidCop: number;
  pendingCop: number;
  lotsInvolved: number;
  status: 'PENDIENTE' | 'PARCIALMENTE_PAGADA' | 'PAGADA';
};

export type WorkspaceDashboardSummary = {
  workspace: {
    id: string;
    name: string;
    type: WorkspaceSurfaceType;
    operationalType: 'STORE' | 'WAREHOUSE' | 'WAREHOUSE_WITH_FACTORY' | 'NIGHTCLUB' | 'GARMENT_WORKSHOP';
  };
  intent: string;
  summaryQuestion: string;
  primaryCta: {
    label: string;
    route: string;
  };
  range: DashboardRange;
  blocks: {
    salesSummary?: SalesSummaryBlock;
    salesTrend?: SalesTrendBlock;
    cashSummary?: CashSummaryBlock;
    topProducts?: TopProductsBlockItem[];
    transactionFlow?: TransactionFlowBlock;
    expenseCategories?: ExpenseCategoryItem[];
    inventoryHealth?: InventoryHealthBlock;
    stockAlerts?: StockAlertItem[];
    purchasePulse?: PurchasePulseBlock;
    movementSummary?: MovementSummaryBlock;
    factoryPipeline?: FactoryPipelineBlock;
    fulfillmentPulse?: FulfillmentPulseBlock;
    lotPipeline?: LotPipelineBlock;
    productionSummary?: ProductionSummaryBlock;
    lotFinance?: LotFinanceBlock;
    workerPayables?: WorkerPayableItem[];
  };
  deepAnalytics?: {
    label: string;
    route: string;
  };
};
