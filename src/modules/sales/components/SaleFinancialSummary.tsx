import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme';

function money(value?: number) {
  return `$${Number(value || 0).toLocaleString('es-CO')}`;
}

type Props = {
  totalAmountCop: number;
  paidAmountCop: number;
  pendingAmountCop: number;
};

export function SaleFinancialSummary({ totalAmountCop, paidAmountCop, pendingAmountCop }: Props) {
  const coverage = totalAmountCop > 0 ? Math.min(Math.round((paidAmountCop / totalAmountCop) * 100), 100) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Resumen financiero</Text>
        <Text style={styles.coverage}>Cobertura {coverage}%</Text>
      </View>

      <View style={styles.rowsWrap}>
        <View style={styles.row}>
          <Text style={styles.label}>Total de la venta</Text>
          <Text style={styles.value}>{money(totalAmountCop)}</Text>
        </View>
        <View style={styles.rowDivider} />
        <View style={styles.row}>
          <Text style={styles.label}>Pagado hasta ahora</Text>
          <Text style={[styles.value, styles.paidValue]}>{money(paidAmountCop)}</Text>
        </View>
        <View style={styles.rowDivider} />
        <View style={styles.row}>
          <Text style={styles.label}>Saldo pendiente</Text>
          <Text style={[styles.value, pendingAmountCop > 0 ? styles.pendingValue : styles.coveredValue]}>
            {money(pendingAmountCop)}
          </Text>
        </View>
      </View>

      <Text style={styles.hint}>{pendingAmountCop > 0 ? 'Venta con saldo por cobrar.' : 'Venta totalmente cubierta.'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 10,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.md,
    fontWeight: theme.weight.bold,
  },
  coverage: {
    color: '#8EA4CC',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  rowsWrap: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  row: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#1A2D52',
  },
  label: {
    color: '#8EA4CC',
    fontSize: theme.font.xs,
  },
  value: {
    color: '#EAF1FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.bold,
  },
  paidValue: {
    color: '#34D399',
  },
  pendingValue: {
    color: '#FCA5A5',
  },
  coveredValue: {
    color: '#86EFAC',
  },
  hint: {
    marginTop: 8,
    color: '#8EA4CC',
    fontSize: theme.font.xs,
  },
});
