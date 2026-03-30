import type { PaymentMethod } from '@/types/payment-method';

export type GarmentOperation = {
  _id: string;
  name: string;
  machineId?: string;
  machineName?: string;
  unitPriceCop: number;
  sequence: number;
};

export type GarmentMachine = {
  _id: string;
  name: string;
  code?: string;
};

export type Garment = {
  _id: string;
  name: string;
  defaultColor?: string;
  imageUrls?: string[];
  operations: Array<{
    operationId: string;
    name: string;
    machineId?: string;
    machineName?: string;
    unitPriceCop: number;
    sequence: number;
  }>;
  unitCostCop?: number;
};

export type GarmentLotColorLine = {
  color: string;
  totalUnits: number;
  sizeDistribution: Array<{ size: string; quantity: number }>;
};

export type GarmentLot = {
  _id: string;
  providerId: string;
  providerName: string;
  garmentId: string;
  garmentName: string;
  color?: string;
  unitAgreedPriceCop?: number;
  totalUnits: number;
  sizeDistribution: Array<{ size: string; quantity: number }>;
  colorLines?: GarmentLotColorLine[];
  receivedDate?: string;
  commitmentDate?: string;
  externalReference?: string;
  baseDocumentUrl?: string;
  technicalSheetUrl?: string;
  status: 'PENDIENTE' | 'EN_PROCESO' | 'LISTO_PARA_ENTREGAR' | 'ENTREGADO';
  observations?: string;
  operations: Array<{
    operationId: string;
    name: string;
    machineId?: string;
    machineName?: string;
    unitPriceCop: number;
    sequence: number;
    expectedUnits: number;
    completedUnits: number;
    pendingUnits?: number;
    isCompleted: boolean;
  }>;
  history: Array<{
    type: string;
    message: string;
    createdAt: string;
    createdBy?: string;
    metadata?: Record<string, any>;
  }>;
  finance?: {
    expectedIncome: number;
    incomeReceived: number;
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
  employeePayables?: Array<{
    employeeId: string;
    employeeName: string;
    accruedCop: number;
    paidCop: number;
    pendingCop: number;
    status: 'PENDIENTE' | 'PARCIALMENTE_PAGADA' | 'PAGADA';
  }>;
  progress?: {
    totalExpected: number;
    totalCompleted: number;
    percent: number;
  };
  garmentSummary?: {
    garmentName: string;
    unitCostCop: number;
    operationsCount: number;
    imageUrls?: string[];
  };
  garmentImageUrls?: string[];
  garmentUnitCostCop?: number;
  garmentOperationsCount?: number;
  timeline?: Array<{
    id: string;
    type: string;
    message: string;
    createdAt: string;
    createdBy?: string;
    metadata?: Record<string, any>;
    evidenceUrls?: string[];
  }>;
  progressByOperationAndSize?: Record<string, number>;
  operationCombinationProgress?: Array<{
    operationId: string;
    operationName: string;
    color: string;
    size: string;
    expectedUnits: number;
    completedUnits: number;
    pendingUnits: number;
  }>;
  registrationContext?: {
    colors: string[];
    sizes: string[];
  };
  participants?: Array<{
    workerEmployeeId: string;
    workerName: string;
    quantity: number;
    valueCop: number;
  }>;
  logs?: Array<{
    _id: string;
    operationId: string;
    operationName: string;
    size: string;
    color?: string;
    quantity: number;
    unitPriceCop: number;
    workerName: string;
    workedAt: string;
  }>;
  supplies?: Array<{
    productId: string;
    productName?: string;
    quantity: number;
    unitCostCop?: number;
    totalCostCop?: number;
    note?: string;
    evidenceUrl?: string;
    createdAt: string;
    createdBy?: string;
  }>;
  laborPayments?: Array<{
    employeeId: string;
    employeeName: string;
    amountCop: number;
    paidAt: string;
    paymentMethod?: 'EFECTIVO' | 'TRANSFERENCIA';
    note?: string;
    evidenceUrl?: string;
  }>;
  incomePayments?: Array<{
    amountCop: number;
    receivedAt: string;
    paymentMethod?: PaymentMethod;
    note?: string;
    evidenceUrl?: string;
  }>;
  additionalCosts?: Array<{
    type: 'TRANSPORT' | 'SUPPLY' | 'OTHER';
    supplySubtype?: 'GENERAL' | 'HILO' | 'NYLON';
    lines?: Array<{
      itemType: string;
      detail?: string;
      quantity?: number;
      totalPaidCop: number;
    }>;
    amountCop: number;
    occurredAt: string;
    note?: string;
    evidenceUrl?: string;
  }>;
};

export type GarmentWorkerSummary = {
  workerEmployeeId: string;
  workerName: string;
  totalQuantity: number;
  totalValueCop: number;
  lotsCount: number;
  operationsCount: number;
};
