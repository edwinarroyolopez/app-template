import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AlertCircle, CheckCircle2, TriangleAlert } from 'lucide-react-native';

import { theme } from '@/theme';
import { getStockStatus } from '../utils/stockStatus';

type ProductStockBadgeProps = {
  stock?: number;
  minStock?: number;
};

export function ProductStockBadge({ stock = 0, minStock }: ProductStockBadgeProps) {
  const safeStock = Math.max(0, Math.round(Number(stock || 0)));
  const status = getStockStatus(safeStock, minStock);
  const isOutOfStock = safeStock === 0;

  const stockUi =
    status === 'critical'
      ? {
        icon: AlertCircle,
        textColor: '#FCA5A5',
        borderColor: '#7D1D2A',
        bgColor: '#2A121A',
      }
      : status === 'low'
        ? {
          icon: TriangleAlert,
          textColor: '#FCD34D',
          borderColor: '#6E5321',
          bgColor: '#2A2110',
        }
        : {
          icon: CheckCircle2,
          textColor: '#8AA1C8',
          borderColor: '#274770',
          bgColor: 'transparent',
        };

  const StockIcon = stockUi.icon;

  return (
    <View
      style={[
        styles.stockBadge,
        {
          backgroundColor: stockUi.bgColor,
          borderColor: stockUi.borderColor,
        },
      ]}
    >
      <StockIcon size={12} color={stockUi.textColor} />
      <Text style={[styles.stockBadgeText, { color: stockUi.textColor }]}>
        {isOutOfStock ? 'SIN STOCK' : `STOCK ${safeStock}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stockBadge: {
    minHeight: 22,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  stockBadgeText: {
    fontWeight: theme.weight.semibold,
    fontSize: 10,
    letterSpacing: 0.2,
  },
});
