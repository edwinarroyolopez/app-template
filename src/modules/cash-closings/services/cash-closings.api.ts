import { api } from '@/services/api';

export type CashClosingPeriod =
  | 'TODAY'
  | 'THIS_WEEK'
  | 'LAST_WEEK'
  | 'THIS_MONTH'
  | 'LAST_MONTH'
  | 'THIS_YEAR'
  | 'ALL';

export type CashClosingItem = {
  id: string;
  workspaceId?: string;
  accountId?: string;
  dayKey: string;
  date: string;
  totalAmountCop: number;
  reportedAmountCop?: number;
  expectedIncomeCop?: number;
  expectedExpenseCop?: number;
  expectedNetCop?: number;
  differenceCop?: number;
  summaryBreakdown?: {
    salesCollectedCop: number;
    salePaymentsCollectedCop: number;
    otherIncomeCop: number;
    purchaseExpenseCop: number;
    purchasePaymentsExpenseCop: number;
    payablePaymentsExpenseCop: number;
    otherExpenseCop: number;
    incomesMovementCount: number;
    expensesMovementCount: number;
  };
  summaryMetadata?: {
    dayStartIso: string;
    dayEndIso: string;
    generatedAtIso: string;
    excludedOriginTypes: string[];
    source: 'TRANSACTIONS';
  };
  observations?: string;
  responsibleUserId: string;
  createdAt?: string;
};

export type CashClosingDailySummary = {
  dayKey: string;
  date: string;
  workspace: {
    id: string;
    name: string;
    type: string;
  };
  expectedIncomeCop: number;
  expectedExpenseCop: number;
  expectedNetCop: number;
  summaryBreakdown: {
    salesCollectedCop: number;
    salePaymentsCollectedCop: number;
    otherIncomeCop: number;
    purchaseExpenseCop: number;
    purchasePaymentsExpenseCop: number;
    payablePaymentsExpenseCop: number;
    otherExpenseCop: number;
    incomesMovementCount: number;
    expensesMovementCount: number;
  };
  movementCount: number;
  existingClosing: CashClosingItem | null;
  summaryMetadata: {
    dayStartIso: string;
    dayEndIso: string;
    generatedAtIso: string;
    excludedOriginTypes: string[];
    source: 'TRANSACTIONS';
  };
};

function toLocalDayKey(value: Date): string {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function normalizeCashClosing(item: any): CashClosingItem {
  const dateValue = item?.date ? new Date(item.date) : new Date();

  return {
    id: String(item?.id ?? item?._id ?? ''),
    workspaceId: item?.workspaceId ? String(item.workspaceId) : undefined,
    accountId: item?.accountId ? String(item.accountId) : undefined,
    dayKey: String(item?.dayKey ?? toLocalDayKey(dateValue)),
    date: item?.date ? String(item.date) : dateValue.toISOString(),
    totalAmountCop: Number(item?.totalAmountCop ?? 0),
    reportedAmountCop: Number(item?.reportedAmountCop ?? item?.totalAmountCop ?? 0),
    expectedIncomeCop: Number(item?.expectedIncomeCop ?? 0),
    expectedExpenseCop: Number(item?.expectedExpenseCop ?? 0),
    expectedNetCop: Number(item?.expectedNetCop ?? 0),
    differenceCop: Number(item?.differenceCop ?? 0),
    summaryBreakdown: item?.summaryBreakdown
      ? {
          salesCollectedCop: Number(item.summaryBreakdown.salesCollectedCop ?? 0),
          salePaymentsCollectedCop: Number(item.summaryBreakdown.salePaymentsCollectedCop ?? 0),
          otherIncomeCop: Number(item.summaryBreakdown.otherIncomeCop ?? 0),
          purchaseExpenseCop: Number(item.summaryBreakdown.purchaseExpenseCop ?? 0),
          purchasePaymentsExpenseCop: Number(item.summaryBreakdown.purchasePaymentsExpenseCop ?? 0),
          payablePaymentsExpenseCop: Number(item.summaryBreakdown.payablePaymentsExpenseCop ?? 0),
          otherExpenseCop: Number(item.summaryBreakdown.otherExpenseCop ?? 0),
          incomesMovementCount: Number(item.summaryBreakdown.incomesMovementCount ?? 0),
          expensesMovementCount: Number(item.summaryBreakdown.expensesMovementCount ?? 0),
        }
      : undefined,
    summaryMetadata: item?.summaryMetadata
      ? {
          dayStartIso: String(item.summaryMetadata.dayStartIso || ''),
          dayEndIso: String(item.summaryMetadata.dayEndIso || ''),
          generatedAtIso: String(item.summaryMetadata.generatedAtIso || ''),
          excludedOriginTypes: Array.isArray(item.summaryMetadata.excludedOriginTypes)
            ? item.summaryMetadata.excludedOriginTypes.map((value: any) => String(value))
            : [],
          source: 'TRANSACTIONS',
        }
      : undefined,
    observations: item?.observations ? String(item.observations) : undefined,
    responsibleUserId: String(item?.responsibleUserId ?? ''),
    createdAt: item?.createdAt ? String(item.createdAt) : undefined,
  };
}

export async function listCashClosings(
  workspaceId: string,
  options?: { limit?: number; period?: CashClosingPeriod },
) {
  const limit = Number(options?.limit || 30);
  const { data } = await api.get(`/workspaces/${workspaceId}/cash-closings`, {
    params: { limit, period: options?.period },
  });

  const rows = Array.isArray(data) ? data : [];
  return rows.map((item) => normalizeCashClosing(item));
}

export async function createCashClosing(
  workspaceId: string,
  payload: {
    totalAmountCop: number;
    reportedAmountCop?: number;
    observations?: string;
    date?: string;
  },
) {
  const { data } = await api.post(`/workspaces/${workspaceId}/cash-closings`, payload);
  return normalizeCashClosing(data);
}

export async function getCashClosingDailySummary(workspaceId: string, date?: string): Promise<CashClosingDailySummary> {
  const { data } = await api.get(`/workspaces/${workspaceId}/cash-closings/daily-summary`, {
    params: date ? { date } : {},
  });

  return {
    dayKey: String(data?.dayKey || ''),
    date: String(data?.date || new Date().toISOString()),
    workspace: {
      id: String(data?.workspace?.id || data?.business?.id || ''),
      name: String(data?.workspace?.name || data?.business?.name || ''),
      type: String(data?.workspace?.type || data?.business?.type || ''),
    },
    expectedIncomeCop: Number(data?.expectedIncomeCop || 0),
    expectedExpenseCop: Number(data?.expectedExpenseCop || 0),
    expectedNetCop: Number(data?.expectedNetCop || 0),
    summaryBreakdown: {
      salesCollectedCop: Number(data?.summaryBreakdown?.salesCollectedCop || 0),
      salePaymentsCollectedCop: Number(data?.summaryBreakdown?.salePaymentsCollectedCop || 0),
      otherIncomeCop: Number(data?.summaryBreakdown?.otherIncomeCop || 0),
      purchaseExpenseCop: Number(data?.summaryBreakdown?.purchaseExpenseCop || 0),
      purchasePaymentsExpenseCop: Number(data?.summaryBreakdown?.purchasePaymentsExpenseCop || 0),
      payablePaymentsExpenseCop: Number(data?.summaryBreakdown?.payablePaymentsExpenseCop || 0),
      otherExpenseCop: Number(data?.summaryBreakdown?.otherExpenseCop || 0),
      incomesMovementCount: Number(data?.summaryBreakdown?.incomesMovementCount || 0),
      expensesMovementCount: Number(data?.summaryBreakdown?.expensesMovementCount || 0),
    },
    movementCount: Number(data?.movementCount || 0),
    existingClosing: data?.existingClosing ? normalizeCashClosing(data.existingClosing) : null,
    summaryMetadata: {
      dayStartIso: String(data?.summaryMetadata?.dayStartIso || ''),
      dayEndIso: String(data?.summaryMetadata?.dayEndIso || ''),
      generatedAtIso: String(data?.summaryMetadata?.generatedAtIso || ''),
      excludedOriginTypes: Array.isArray(data?.summaryMetadata?.excludedOriginTypes)
        ? data.summaryMetadata.excludedOriginTypes.map((value: any) => String(value))
        : [],
      source: 'TRANSACTIONS',
    },
  };
}
