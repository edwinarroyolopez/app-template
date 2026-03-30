export type PaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA';

export const PAYMENT_METHOD_OPTIONS: Array<{
  value: PaymentMethod;
  label: string;
}> = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'TARJETA', label: 'Tarjeta' },
];

export function normalizePaymentMethod(value?: string): PaymentMethod {
  const normalized = String(value || '').toUpperCase();
  if (normalized === 'TRANSFERENCIA') return 'TRANSFERENCIA';
  if (normalized === 'TARJETA') return 'TARJETA';
  return 'EFECTIVO';
}
