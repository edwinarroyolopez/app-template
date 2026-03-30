import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Pencil, Trash2 } from 'lucide-react-native';

import { theme } from '@/theme';
import type { SaleWizardItem } from '../hooks/useSaleWizard';

function formatAmount(value: number) {
  return `$${(value || 0).toLocaleString('es-CO')}`;
}

type Props = {
  item: SaleWizardItem;
  index: number;
  summary?: boolean;
  onEdit?: (index: number) => void;
  onRemove?: (index: number) => void;
};

export function SaleLineRow({ item, index, summary = false, onEdit, onRemove }: Props) {
  return (
    <View style={[styles.row, summary && styles.rowSummary]}>
      <View style={styles.top}>
        <Text style={styles.name} numberOfLines={1}>
          {item.productName}
        </Text>
        <Text style={styles.subtotal}>{formatAmount(item.quantity * item.unitPrice)}</Text>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.meta}>
          {item.quantity} x {formatAmount(item.unitPrice)}
        </Text>

        <Text style={item.requiresManufacturing ? styles.flowTagManufacturing : styles.flowTagReady}>
          {item.requiresManufacturing ? 'Fabricacion' : 'Entrega directa'}
        </Text>

        {(onEdit || onRemove) && (
          <View style={styles.actions}>
            {!!onEdit && (
              <Pressable onPress={() => onEdit(index)} hitSlop={8} style={styles.editBtn}>
                <Pencil size={13} color="#9FC0FF" />
                <Text style={styles.editText}>Editar</Text>
              </Pressable>
            )}
            {!!onRemove && (
              <Pressable onPress={() => onRemove(index)} hitSlop={8} style={styles.removeBtn}>
                <Trash2 size={13} color="#F87171" />
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E406E',
    backgroundColor: '#0A2243',
    padding: 10,
    gap: 7,
  },
  rowSummary: {
    borderColor: '#244974',
    backgroundColor: '#0D274A',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  name: {
    flex: 1,
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.sm,
  },
  subtotal: {
    color: '#9FC0FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.sm,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  meta: {
    color: '#95A9CC',
    fontSize: theme.font.xs,
  },
  flowTagReady: {
    borderWidth: 1,
    borderColor: '#34D39966',
    borderRadius: 999,
    backgroundColor: '#0B2B25',
    paddingHorizontal: 8,
    paddingVertical: 2,
    color: '#34D399',
    fontSize: 10,
    fontWeight: theme.weight.semibold,
  },
  flowTagManufacturing: {
    borderWidth: 1,
    borderColor: '#A78BFA66',
    borderRadius: 999,
    backgroundColor: '#2A1F4D',
    paddingHorizontal: 8,
    paddingVertical: 2,
    color: '#C4B5FD',
    fontSize: 10,
    fontWeight: theme.weight.semibold,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editBtn: {
    minHeight: 26,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A4E7D',
    backgroundColor: '#122C4F',
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  editText: {
    color: '#9FC0FF',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  removeBtn: {
    width: 24,
    height: 26,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A2B38',
    backgroundColor: '#1F1520',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.88,
  },
});
