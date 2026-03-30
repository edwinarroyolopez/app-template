import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AlertCircle, CheckCircle2, TriangleAlert } from 'lucide-react-native';

import { theme } from '@/theme';
import { getStockStatus } from '../utils/stockStatus';

type ProductStockHealthBadgeProps = {
  stock?: number;
  minStock?: number;
};

export function ProductStockHealthBadge({ stock = 0, minStock }: ProductStockHealthBadgeProps) {
  const safeStock = Math.max(0, Math.round(Number(stock || 0)));
  const status = getStockStatus(safeStock, minStock);
  const isOutOfStock = safeStock === 0;

  const ui =
    status === 'critical'
      ? {
        icon: AlertCircle,
        label: isOutOfStock ? 'Sin stock' : 'Stock critico',
        textColor: '#FCA5A5',
        borderColor: '#7D1D2A',
        bgColor: '#2A121A',
      }
      : status === 'low'
        ? {
          icon: TriangleAlert,
          label: 'Stock bajo',
          textColor: '#FCD34D',
          borderColor: '#6E5321',
          bgColor: '#2A2110',
        }
        : {
          icon: CheckCircle2,
          label: 'Stock saludable',
          textColor: '#96AECF',
          borderColor: '#2A4A72',
          bgColor: '#10203A',
        };

  const Icon = ui.icon;

  return (
    <View style={[styles.badge, { borderColor: ui.borderColor, backgroundColor: ui.bgColor }]}>
      <Icon size={13} color={ui.textColor} />
      <Text style={[styles.badgeText, { color: ui.textColor }]}>{ui.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    height: 28,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: theme.weight.semibold,
    letterSpacing: 0.1,
  },
});
