export function formatMoneyInput(value: string) {
  const numeric = value.replace(/\D/g, '');
  if (!numeric) return '';
  return Number(numeric).toLocaleString('es-CO');
}

export function parseMoneyInput(value: string) {
  return Number(value.replace(/\D/g, '')) || 0;
}
