import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme';
import type { SaleStatus } from '../types/sale.type';
import { saleStatusConfig } from '../utils/saleStatus';

function money(value?: number) {
  return `$${Number(value || 0).toLocaleString('es-CO')}`;
}

type Props = {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotalCop: number;
  requiresManufacturing?: boolean;
  operationalStatus?: SaleStatus;
  onMarkReadyForDelivery?: () => void;
  onMarkDelivered?: () => void;
  actionsDisabled?: boolean;
};

export function SaleLineItemRow({
  productName,
  quantity,
  unitPrice,
  subtotalCop,
  requiresManufacturing,
  operationalStatus,
  onMarkReadyForDelivery,
  onMarkDelivered,
  actionsDisabled,
}: Props) {
  const normalizedStatus = operationalStatus || (requiresManufacturing ? 'EN_FABRICACION' : 'LISTO_PARA_ENTREGAR');
  const statusUi = saleStatusConfig[normalizedStatus];

  return (
    <View style={styles.row}>
      <View style={styles.rowTop}>
        <Text style={styles.name} numberOfLines={1}>{productName || 'Producto sin nombre'}</Text>
        <Text style={styles.subtotal}>{money(subtotalCop)}</Text>
      </View>
      <Text style={styles.meta}>{quantity} unidades x {money(unitPrice)}</Text>
      {requiresManufacturing ? <Text style={styles.fabricationTag}>Requiere fabricacion</Text> : null}

      <View style={[styles.statusChip, { borderColor: `${statusUi.color}66`, backgroundColor: statusUi.bg }]}>
        <Text style={[styles.statusText, { color: statusUi.color }]}>{statusUi.label}</Text>
      </View>

      {!requiresManufacturing && (
        <View style={styles.actionsRow}>
          {normalizedStatus !== 'LISTO_PARA_ENTREGAR' && normalizedStatus !== 'ENTREGADA' && (
            <Pressable
              style={[styles.actionBtn, actionsDisabled && styles.actionBtnDisabled]}
              onPress={onMarkReadyForDelivery}
              disabled={actionsDisabled}
            >
              <Text style={styles.actionBtnText}>Marcar lista</Text>
            </Pressable>
          )}
          {normalizedStatus !== 'ENTREGADA' && (
            <Pressable
              style={[styles.actionBtn, styles.actionBtnPrimary, actionsDisabled && styles.actionBtnDisabled]}
              onPress={onMarkDelivered}
              disabled={actionsDisabled}
            >
              <Text style={styles.actionBtnText}>Marcar entregada</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    paddingVertical: 9,
    paddingHorizontal: 8,
    marginTop: 6,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    flex: 1,
    color: '#EAF1FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.bold,
  },
  subtotal: {
    color: '#9FC0FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.bold,
  },
  meta: {
    marginTop: 3,
    color: '#9FB0CF',
    fontSize: theme.font.xs,
  },
  fabricationTag: {
    marginTop: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#2E6BFF66',
    borderRadius: 999,
    backgroundColor: '#0D224A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    color: '#9FC0FF',
    fontSize: 10,
    fontWeight: theme.weight.semibold,
  },
  statusChip: {
    marginTop: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 10,
    fontWeight: theme.weight.semibold,
  },
  actionsRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0F2748',
    borderRadius: 8,
    minHeight: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  actionBtnPrimary: {
    borderColor: '#34D39966',
    backgroundColor: '#0B2B25',
  },
  actionBtnText: {
    color: '#BFD0EE',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  actionBtnDisabled: {
    opacity: 0.5,
  },
});
