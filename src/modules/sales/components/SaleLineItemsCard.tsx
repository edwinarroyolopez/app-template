import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme';
import type { SaleStatus } from '../types/sale.type';
import { SaleLineItemRow } from './SaleLineItemRow';

type SaleLineItem = {
  itemId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotalCop: number;
  requiresManufacturing?: boolean;
  operationalStatus?: SaleStatus;
};

function money(value?: number) {
  return `$${Number(value || 0).toLocaleString('es-CO')}`;
}

type Props = {
  items: SaleLineItem[];
  totalAmountCop: number;
  onMarkReadyForDelivery?: (itemId: string) => void;
  onMarkDelivered?: (itemId: string) => void;
  actionsDisabled?: boolean;
};

export function SaleLineItemsCard({
  items,
  totalAmountCop,
  onMarkReadyForDelivery,
  onMarkDelivered,
  actionsDisabled,
}: Props) {
  const totalUnits = items.reduce((acc, item) => acc + Number(item.quantity || 0), 0);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Seguimiento por productos</Text>
        <Text style={styles.count}>{items.length}</Text>
      </View>
      <Text style={styles.subtitle}>Estado operativo por linea, sin perder el contexto comercial.</Text>

      {items.map((item, index) => (
        <SaleLineItemRow
          key={`${item.productName}-${index}`}
          productName={item.productName}
          quantity={item.quantity}
          unitPrice={item.unitPrice}
          subtotalCop={item.subtotalCop}
          requiresManufacturing={item.requiresManufacturing}
          operationalStatus={item.operationalStatus}
          onMarkReadyForDelivery={
            item.itemId && onMarkReadyForDelivery
              ? () => onMarkReadyForDelivery(item.itemId!)
              : undefined
          }
          onMarkDelivered={
            item.itemId && onMarkDelivered ? () => onMarkDelivered(item.itemId!) : undefined
          }
          actionsDisabled={actionsDisabled}
        />
      ))}

      <View style={styles.footerRow}>
        <Text style={styles.footerMeta}>{totalUnits} unidades vendidas</Text>
        <Text style={styles.footerTotal}>Total: {money(totalAmountCop)}</Text>
      </View>
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
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.md,
    fontWeight: theme.weight.bold,
  },
  count: {
    color: '#9FC0FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.bold,
  },
  subtitle: {
    marginTop: 2,
    color: '#8EA4CC',
    fontSize: theme.font.xs,
    marginBottom: 8,
  },
  footerRow: {
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: '#1A2D52',
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerMeta: {
    color: '#8EA4CC',
    fontSize: theme.font.xs,
  },
  footerTotal: {
    color: '#EAF1FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.bold,
  },
});
