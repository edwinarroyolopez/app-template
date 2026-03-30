import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { theme } from '@/theme';
import type { TransactionItem } from '../types/transaction.type';

function money(value: number) {
  return `$${Number(value || 0).toLocaleString('es-CO')}`;
}

function originLabel(item: TransactionItem) {
  if (item.origin?.label) return item.origin.label;
  if (item.origin?.type === 'MANUAL') return 'Movimiento manual';
  return item.origin?.type?.replace(/_/g, ' ') || 'Origen';
}

export function TransactionCard({
  item,
  onViewDetail,
  onViewProof,
}: {
  item: TransactionItem;
  onViewDetail: () => void;
  onViewProof?: () => void;
}) {
  const isIncome = item.kind === 'INCOME';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.kindChip, isIncome ? styles.kindChipIncome : styles.kindChipExpense]}>
          <Text style={[styles.kindChipText, isIncome ? styles.income : styles.expense]}>
            {isIncome ? 'INGRESO' : 'EGRESO'}
          </Text>
        </View>

        <Text style={[styles.amount, isIncome ? styles.income : styles.expense]}>
          {isIncome ? '+' : '-'}{money(item.amountCop)}
        </Text>
      </View>

      <Text style={styles.title} numberOfLines={1}>{item.title || item.category || 'Movimiento'}</Text>
      <Text style={styles.meta} numberOfLines={1}>{originLabel(item)}</Text>
      <Text style={styles.meta}>{new Date(item.date).toLocaleString('es-CO')}</Text>

      <View style={styles.footerRow}>
        <Text style={styles.traceTag}>{item.isManual ? 'Manual' : 'Automática'}</Text>

        <View style={styles.footerActions}>
          {item.manualProof?.url && onViewProof ? (
            <Pressable style={styles.originBtn} onPress={onViewProof}>
              <Text style={styles.originBtnText}>Comprobante</Text>
              <ChevronRight size={14} color="#9FC0FF" />
            </Pressable>
          ) : null}
          <Pressable style={styles.originBtn} onPress={onViewDetail}>
            <Text style={styles.originBtnText}>Ver detalle</Text>
            <ChevronRight size={14} color="#9FC0FF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    padding: 10,
    marginBottom: 8,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  kindChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  kindChipIncome: {
    borderColor: '#1F6F59',
    backgroundColor: '#0E2C23',
  },
  kindChipExpense: {
    borderColor: '#7A2630',
    backgroundColor: '#321722',
  },
  kindChipText: {
    fontSize: 10,
    fontWeight: theme.weight.bold,
  },
  amount: {
    fontSize: theme.font.md,
    fontWeight: theme.weight.bold,
  },
  income: { color: '#4ADE80' },
  expense: { color: '#F87171' },
  title: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.sm,
  },
  meta: {
    color: '#8EA4CC',
    fontSize: 11,
  },
  footerRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  traceTag: {
    color: '#9FB4D8',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  originBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  originBtnText: {
    color: '#9FC0FF',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
});
