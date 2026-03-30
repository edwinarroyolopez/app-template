import { useMemo, useState } from 'react';
import { CalendarRange, CheckCircle2, Clock3, TriangleAlert } from 'lucide-react-native';

import type { FilterOption } from '@/components/FilterSelectorModal/types';
import type { PurchasesPeriod } from './usePurchases';

export type PurchasesStatusFilter = 'ALL' | 'PENDIENTE' | 'PAGADA' | 'VENCIDA';

export const PURCHASES_PERIOD_OPTIONS: FilterOption<PurchasesPeriod>[] = [
  { value: 'THIS_WEEK', label: 'Esta semana', icon: CalendarRange },
  { value: 'LAST_WEEK', label: 'Semana anterior', icon: Clock3 },
  { value: 'THIS_MONTH', label: 'Este mes', icon: CalendarRange },
  { value: 'LAST_MONTH', label: 'Mes anterior', icon: Clock3 },
  { value: 'ALL', label: 'Todas', icon: CalendarRange },
];

export const PURCHASES_STATUS_OPTIONS: FilterOption<PurchasesStatusFilter>[] = [
  { value: 'ALL', label: 'Todas', icon: CalendarRange },
  { value: 'PENDIENTE', label: 'Pendiente', icon: Clock3 },
  { value: 'PAGADA', label: 'Pagada', icon: CheckCircle2 },
  { value: 'VENCIDA', label: 'Vencida', icon: TriangleAlert },
];

export function usePurchasesFilters() {
  const defaultPeriod: PurchasesPeriod = 'THIS_WEEK';
  const defaultStatus: PurchasesStatusFilter = 'ALL';

  const [period, setPeriod] = useState<PurchasesPeriod>(defaultPeriod);
  const [status, setStatus] = useState<PurchasesStatusFilter>(defaultStatus);
  const [search, setSearch] = useState('');
  const [isPeriodModalOpen, setPeriodModalOpen] = useState(false);
  const [isStatusModalOpen, setStatusModalOpen] = useState(false);

  const selectedPeriod = useMemo(
    () => PURCHASES_PERIOD_OPTIONS.find((item) => item.value === period) || PURCHASES_PERIOD_OPTIONS[0],
    [period],
  );

  const selectedStatus = useMemo(
    () => PURCHASES_STATUS_OPTIONS.find((item) => item.value === status) || PURCHASES_STATUS_OPTIONS[0],
    [status],
  );

  function selectPeriod(next: PurchasesPeriod) {
    setPeriod(next);
  }

  function selectStatus(next: PurchasesStatusFilter) {
    setStatus(next);
  }

  function resetFilters() {
    setPeriod(defaultPeriod);
    setStatus(defaultStatus);
    setSearch('');
    setPeriodModalOpen(false);
    setStatusModalOpen(false);
  }

  const hasChanges = period !== defaultPeriod || status !== defaultStatus || search.trim().length > 0;

  return {
    period,
    status,
    selectedPeriod,
    selectedStatus,
    search,
    setSearch,
    isPeriodModalOpen,
    isStatusModalOpen,
    openPeriodModal: () => setPeriodModalOpen(true),
    closePeriodModal: () => setPeriodModalOpen(false),
    openStatusModal: () => setStatusModalOpen(true),
    closeStatusModal: () => setStatusModalOpen(false),
    selectPeriod,
    selectStatus,
    resetFilters,
    hasChanges,
  };
}
