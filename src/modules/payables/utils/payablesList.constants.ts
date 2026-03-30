// src/modules/payables/utils/payablesList.constants.ts
import type { PayableStatus } from '../types/payables.types';

export const PAYABLE_STATUS_FILTERS: Array<{ label: string; value?: PayableStatus }> = [
    { label: 'Todos', value: undefined },
    { label: 'Pendientes', value: 'OPEN' },
    { label: 'Pagados', value: 'PAID' },
    { label: 'Cancelados', value: 'CANCELLED' },
];
