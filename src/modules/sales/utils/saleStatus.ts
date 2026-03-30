import { theme } from '@/theme';
import type {
  SaleDeliveryType,
  SalePaymentStatus,
  SalePriority,
  SaleStatus,
  SaleType,
} from '../types/sale.type';

export const saleStatusConfig: Record<
  SaleStatus,
  { label: string; color: string; bg: string }
> = {
  PENDIENTE: { label: 'Pendiente', color: '#F8C74A', bg: '#F8C74A22' },
  EN_PROCESO: { label: 'En proceso', color: '#60A5FA', bg: '#60A5FA22' },
  EN_FABRICACION: { label: 'En fabricacion', color: '#A78BFA', bg: '#A78BFA22' },
  LISTO_PARA_ENTREGAR: { label: 'Listo para entregar', color: '#34D399', bg: '#34D39922' },
  EN_REPARTO: { label: 'En reparto', color: '#38BDF8', bg: '#38BDF822' },
  ENTREGADA: { label: 'Entregada', color: theme.colors.success, bg: '#22C55E22' },
  CANCELADA: { label: 'Cancelada', color: theme.colors.danger, bg: '#F8717122' },
};

export const saleTypeConfig: Record<SaleType, { label: string }> = {
  IMMEDIATE: { label: 'Entrega inmediata' },
  SPECIAL_ORDER: { label: 'Pedido por encargo' },
  MANUFACTURE: { label: 'Fabricacion' },
};

export const salePriorityConfig: Record<SalePriority, { label: string; color: string; bg: string }> = {
  NORMAL: { label: 'Normal', color: '#7E94BE', bg: '#7E94BE22' },
  HIGH: { label: 'Alta', color: '#F59E0B', bg: '#F59E0B22' },
  URGENT: { label: 'Urgente', color: '#F87171', bg: '#F8717122' },
};

export const salePaymentStatusConfig: Record<
  SalePaymentStatus,
  { label: string; color: string; bg: string }
> = {
  PENDING: { label: 'Pago pendiente', color: '#F8C74A', bg: '#F8C74A22' },
  PARTIAL: { label: 'Abonada', color: '#60A5FA', bg: '#60A5FA22' },
  PAID: { label: 'Pagada', color: '#22C55E', bg: '#22C55E22' },
};

export const saleStatusOrder: Record<SaleStatus, number> = {
  PENDIENTE: 1,
  EN_PROCESO: 2,
  EN_FABRICACION: 3,
  LISTO_PARA_ENTREGAR: 4,
  EN_REPARTO: 5,
  ENTREGADA: 6,
  CANCELADA: 7,
};

export const allowedStatusesBySaleType: Record<SaleType, SaleStatus[]> = {
  IMMEDIATE: ['PENDIENTE', 'EN_PROCESO', 'EN_REPARTO', 'ENTREGADA', 'CANCELADA'],
  SPECIAL_ORDER: [
    'PENDIENTE',
    'EN_PROCESO',
    'LISTO_PARA_ENTREGAR',
    'EN_REPARTO',
    'ENTREGADA',
    'CANCELADA',
  ],
  MANUFACTURE: [
    'PENDIENTE',
    'EN_PROCESO',
    'EN_FABRICACION',
    'LISTO_PARA_ENTREGAR',
    'EN_REPARTO',
    'ENTREGADA',
    'CANCELADA',
  ],
};

export function normalizeSaleStatus(status?: string): SaleStatus {
  if (!status) return 'PENDIENTE';

  if (status in saleStatusConfig) {
    return status as SaleStatus;
  }

  return 'PENDIENTE';
}

export function deliveryTypeLabel(deliveryType?: SaleDeliveryType | string) {
  return deliveryType === 'MANUFACTURE' ? 'Fabricacion' : 'Entrega inmediata';
}

export function normalizeSaleType(saleType?: string, deliveryType?: string): SaleType {
  if (saleType === 'IMMEDIATE' || saleType === 'SPECIAL_ORDER' || saleType === 'MANUFACTURE') {
    return saleType;
  }

  if (deliveryType === 'MANUFACTURE') {
    return 'MANUFACTURE';
  }

  return 'IMMEDIATE';
}

export function normalizeSalePriority(priority?: string): SalePriority {
  if (priority === 'HIGH' || priority === 'URGENT') return priority;
  return 'NORMAL';
}

export function normalizePaymentStatus(paymentStatus?: string): SalePaymentStatus {
  if (paymentStatus === 'PARTIAL' || paymentStatus === 'PAID') return paymentStatus;
  return 'PENDING';
}
