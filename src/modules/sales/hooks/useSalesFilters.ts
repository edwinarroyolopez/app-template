import { useMemo, useState } from 'react';
import { CalendarRange, CheckCircle2, Clock3, TriangleAlert } from 'lucide-react-native';

import type { FilterOption } from '@/components/FilterSelectorModal/types';
import type { SalesPaymentState, SalesPeriod } from './useSales';

export const SALES_PERIOD_OPTIONS: FilterOption<SalesPeriod>[] = [
  { value: 'THIS_WEEK', label: 'Esta semana', icon: CalendarRange },
  { value: 'LAST_WEEK', label: 'Semana anterior', icon: Clock3 },
  { value: 'THIS_MONTH', label: 'Este mes', icon: CalendarRange },
  { value: 'LAST_MONTH', label: 'Mes anterior', icon: Clock3 },
  { value: 'ALL', label: 'Todas', icon: CalendarRange },
];

export const SALES_PAYMENT_STATE_OPTIONS: FilterOption<SalesPaymentState>[] = [
  { value: 'ALL', label: 'Todas', icon: CalendarRange },
  { value: 'PENDIENTE', label: 'Pendiente', icon: Clock3 },
  { value: 'PAGADA', label: 'Pagada', icon: CheckCircle2 },
  { value: 'VENCIDA', label: 'Vencida', icon: TriangleAlert },
];

export function useSalesFilters() {
  const defaultPeriod: SalesPeriod = 'THIS_WEEK';
  const defaultPaymentState: SalesPaymentState = 'ALL';

  const [period, setPeriod] = useState<SalesPeriod>(defaultPeriod);
  const [paymentState, setPaymentState] = useState<SalesPaymentState>(defaultPaymentState);
  const [search, setSearch] = useState('');
  const [isPeriodModalOpen, setPeriodModalOpen] = useState(false);
  const [isStateModalOpen, setStateModalOpen] = useState(false);

  const selectedPeriod = useMemo(
    () => SALES_PERIOD_OPTIONS.find((item) => item.value === period) || SALES_PERIOD_OPTIONS[0],
    [period],
  );

  const selectedPaymentState = useMemo(
    () => SALES_PAYMENT_STATE_OPTIONS.find((item) => item.value === paymentState) || SALES_PAYMENT_STATE_OPTIONS[0],
    [paymentState],
  );

  function selectPeriod(next: SalesPeriod) {
    setPeriod(next);
    setPeriodModalOpen(false);
  }

  function selectPaymentState(next: SalesPaymentState) {
    setPaymentState(next);
    setStateModalOpen(false);
  }

  function resetFilters() {
    setPeriod(defaultPeriod);
    setPaymentState(defaultPaymentState);
    setSearch('');
    setPeriodModalOpen(false);
    setStateModalOpen(false);
  }

  const hasChanges =
    period !== defaultPeriod ||
    paymentState !== defaultPaymentState ||
    search.trim().length > 0;

  return {
    period,
    paymentState,
    search,
    setSearch,
    selectedPeriod,
    selectedPaymentState,
    isPeriodModalOpen,
    isStateModalOpen,
    openPeriodModal: () => setPeriodModalOpen(true),
    openStateModal: () => setStateModalOpen(true),
    closePeriodModal: () => setPeriodModalOpen(false),
    closeStateModal: () => setStateModalOpen(false),
    selectPeriod,
    selectPaymentState,
    resetFilters,
    hasChanges,
  };
}
