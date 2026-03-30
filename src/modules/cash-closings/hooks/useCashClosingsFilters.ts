import { useMemo, useState } from 'react';
import { CalendarRange, Clock3 } from 'lucide-react-native';

import type { FilterOption } from '@/components/FilterSelectorModal/types';
import type { CashClosingPeriod } from '../services/cash-closings.api';

export const CASH_CLOSING_PERIOD_OPTIONS: FilterOption<CashClosingPeriod>[] = [
  { value: 'TODAY', label: 'Hoy', icon: CalendarRange },
  { value: 'THIS_WEEK', label: 'Esta semana', icon: CalendarRange },
  { value: 'LAST_WEEK', label: 'Semana anterior', icon: Clock3 },
  { value: 'THIS_MONTH', label: 'Este mes', icon: CalendarRange },
  { value: 'LAST_MONTH', label: 'Mes anterior', icon: Clock3 },
  { value: 'THIS_YEAR', label: 'Este ano', icon: CalendarRange },
  { value: 'ALL', label: 'Todos', icon: CalendarRange },
];

export function useCashClosingsFilters() {
  const defaultPeriod: CashClosingPeriod = 'THIS_WEEK';
  const [period, setPeriod] = useState<CashClosingPeriod>(defaultPeriod);
  const [isPeriodModalOpen, setPeriodModalOpen] = useState(false);

  const selectedPeriod = useMemo(
    () =>
      CASH_CLOSING_PERIOD_OPTIONS.find((item) => item.value === period) ||
      CASH_CLOSING_PERIOD_OPTIONS[0],
    [period],
  );

  return {
    period,
    selectedPeriod,
    isPeriodModalOpen,
    hasChanges: period !== defaultPeriod,
    openPeriodModal: () => setPeriodModalOpen(true),
    closePeriodModal: () => setPeriodModalOpen(false),
    selectPeriod: (value: CashClosingPeriod) => {
      setPeriod(value);
      setPeriodModalOpen(false);
    },
    resetFilters: () => {
      setPeriod(defaultPeriod);
      setPeriodModalOpen(false);
    },
  };
}
