import { useMemo, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, CalendarRange, Clock3, Wallet } from 'lucide-react-native';
import type { FilterOption } from '@/components/FilterSelectorModal/types';
import type { TransactionKind, TransactionPeriod } from '../types/transaction.type';

export type TransactionsKindFilter = TransactionKind | 'ALL';

export const TRANSACTIONS_PERIOD_OPTIONS: FilterOption<TransactionPeriod>[] = [
  { value: 'TODAY', label: 'Hoy', icon: CalendarRange },
  { value: 'THIS_WEEK', label: 'Esta semana', icon: CalendarRange },
  { value: 'LAST_WEEK', label: 'Semana anterior', icon: Clock3 },
  { value: 'THIS_MONTH', label: 'Este mes', icon: CalendarRange },
  { value: 'LAST_MONTH', label: 'Mes anterior', icon: Clock3 },
  { value: 'ALL', label: 'Todas', icon: Wallet },
];

export const TRANSACTIONS_KIND_OPTIONS: FilterOption<TransactionsKindFilter>[] = [
  { value: 'ALL', label: 'Todos', icon: Wallet },
  { value: 'INCOME', label: 'Ingresos', icon: ArrowUpCircle },
  { value: 'EXPENSE', label: 'Egresos', icon: ArrowDownCircle },
];

export function useTransactionsFilters() {
  const defaultPeriod: TransactionPeriod = 'THIS_WEEK';
  const defaultKind: TransactionsKindFilter = 'ALL';

  const [period, setPeriod] = useState<TransactionPeriod>(defaultPeriod);
  const [kind, setKind] = useState<TransactionsKindFilter>(defaultKind);

  const [isPeriodModalOpen, setPeriodModalOpen] = useState(false);
  const [isKindModalOpen, setKindModalOpen] = useState(false);

  const selectedPeriod = useMemo(
    () => TRANSACTIONS_PERIOD_OPTIONS.find((item) => item.value === period) || TRANSACTIONS_PERIOD_OPTIONS[0],
    [period],
  );

  const selectedKind = useMemo(
    () => TRANSACTIONS_KIND_OPTIONS.find((item) => item.value === kind) || TRANSACTIONS_KIND_OPTIONS[0],
    [kind],
  );

  function resetFilters() {
    setPeriod(defaultPeriod);
    setKind(defaultKind);
    setPeriodModalOpen(false);
    setKindModalOpen(false);
  }

  return {
    period,
    kind,
    selectedPeriod,
    selectedKind,
    isPeriodModalOpen,
    isKindModalOpen,
    hasChanges: period !== defaultPeriod || kind !== defaultKind,
    openPeriodModal: () => setPeriodModalOpen(true),
    closePeriodModal: () => setPeriodModalOpen(false),
    openKindModal: () => setKindModalOpen(true),
    closeKindModal: () => setKindModalOpen(false),
    selectPeriod: (value: TransactionPeriod) => setPeriod(value),
    selectKind: (value: TransactionsKindFilter) => setKind(value),
    resetFilters,
  };
}
