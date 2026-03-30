export type TransactionPeriod = 'TODAY' | 'THIS_WEEK' | 'LAST_WEEK' | 'THIS_MONTH' | 'LAST_MONTH' | 'ALL';

export type TransactionKind = 'INCOME' | 'EXPENSE';

export type TransactionOriginType =
  | 'CASH_CLOSING'
  | 'SALE'
  | 'SALE_PAYMENT'
  | 'PURCHASE'
  | 'PURCHASE_PAYMENT'
  | 'PAYABLE_PAYMENT'
  | 'MANUAL';

export type TransactionItem = {
  id: string;
  accountId: string;
  workspaceId: string;
  kind: TransactionKind;
  amountCop: number;
  date: string;
  category?: string;
  title?: string;
  origin: {
    type: TransactionOriginType;
    id?: string;
    label?: string;
    meta?: Record<string, any>;
  };
  notes?: string;
  manualProof?: {
    url: string;
    publicId?: string;
    uploadedAt?: string;
    label?: string;
  };
  createdByUserId?: string;
  createdBy?: {
    id: string;
    name?: string;
    role?: string;
  };
  isManual: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type TransactionsSummary = {
  incomeCop: number;
  expenseCop: number;
  netCop: number;
  movementCount: number;
};
