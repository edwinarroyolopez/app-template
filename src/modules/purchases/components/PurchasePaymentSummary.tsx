import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme';

function formatAmount(value: number) {
  return `$${(value || 0).toLocaleString('es-CO')}`;
}

export function PurchasePaymentSummary({
  totalAmount,
  paidAmount,
  remainingAmount,
}: {
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.card}>
        <Text style={styles.label}>Total</Text>
        <Text style={styles.value}>{formatAmount(totalAmount)}</Text>
      </View>
      <View style={[styles.card, styles.paidCard]}>
        <Text style={styles.label}>Abonado</Text>
        <Text style={[styles.value, styles.paidValue]}>{formatAmount(paidAmount)}</Text>
      </View>
      <View style={[styles.card, styles.pendingCard]}>
        <Text style={styles.label}>Pendiente</Text>
        <Text style={[styles.value, styles.pendingValue]}>{formatAmount(remainingAmount)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 62,
  },
  paidCard: {
    borderColor: '#1F6F59',
    backgroundColor: '#0B2B25',
  },
  pendingCard: {
    borderColor: '#7A2630',
    backgroundColor: '#341720',
  },
  label: {
    color: '#8EA4CC',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
    textTransform: 'uppercase',
  },
  value: {
    marginTop: 4,
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
});
