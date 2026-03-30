export function getStockDelta(physicalStock: number, systemStock: number) {
  const delta = Math.round((physicalStock || 0) - (systemStock || 0));

  if (delta > 0) {
    return {
      delta,
      tone: 'positive' as const,
      label: `+${delta}`,
    };
  }

  if (delta < 0) {
    return {
      delta,
      tone: 'negative' as const,
      label: String(delta),
    };
  }

  return {
    delta,
    tone: 'neutral' as const,
    label: '0',
  };
}
