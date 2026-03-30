import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';

function money(value: number) {
  return `$${Number(value || 0).toLocaleString('es-CO')}`;
}

export function TransactionsSummaryCard({
  incomeCop,
  expenseCop,
  netCop,
  movementCount,
}: {
  incomeCop: number;
  expenseCop: number;
  netCop: number;
  movementCount: number;
}) {
  const netPositive = netCop >= 0;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.label}>Ingresos</Text>
          <Text style={[styles.value, styles.income]}>{money(incomeCop)}</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Egresos</Text>
          <Text style={[styles.value, styles.expense]}>{money(expenseCop)}</Text>
        </View>
      </View>

      <View style={styles.netRow}>
        <View>
          <Text style={styles.netLabel}>Balance neto</Text>
          <Text style={[styles.netValue, netPositive ? styles.income : styles.expense]}>{money(netCop)}</Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>{movementCount} mov.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    padding: 12,
    gap: 10,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  item: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1A3158',
    backgroundColor: '#081632',
    padding: 8,
  },
  label: {
    color: '#8EA4CC',
    fontSize: theme.font.xs,
  },
  value: {
    marginTop: 3,
    fontWeight: theme.weight.bold,
    fontSize: theme.font.sm,
  },
  income: {
    color: '#4ADE80',
  },
  expense: {
    color: '#F87171',
  },
  netRow: {
    borderTopWidth: 1,
    borderColor: '#1A3158',
    paddingTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  netLabel: {
    color: '#A8BCDE',
    fontSize: theme.font.xs,
  },
  netValue: {
    marginTop: 2,
    fontSize: theme.font.md,
    fontWeight: theme.weight.bold,
  },
  countBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2A4E7D',
    backgroundColor: '#10284F',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: {
    color: '#9FC0FF',
    fontWeight: theme.weight.semibold,
    fontSize: 11,
  },
});
