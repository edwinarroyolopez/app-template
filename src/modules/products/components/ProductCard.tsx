import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme';
import { Product } from '../types/product.type';
import { ProductStockBadge } from './ProductStockBadge';

type ProductListItem = Partial<Product> & {
  id?: string;
  _id?: string;
};

type ProductCardProps = {
  product: ProductListItem;
  onPress: () => void;
  selected?: boolean;
};

function formatMoney(value?: number) {
  return `$${Math.round(value || 0).toLocaleString('es-CO')}`;
}

export function ProductCard({ product, onPress, selected = false }: ProductCardProps) {
  const initials = (product.name || '?').trim().slice(0, 1).toUpperCase();

  return (
    <Pressable style={[styles.itemCard, selected && styles.itemCardSelected]} onPress={onPress}>
      {product.image ? (
        <Image source={{ uri: product.image }} style={styles.thumb} resizeMode="cover" />
      ) : (
        <View style={styles.thumbFallback}>
          <Text style={styles.thumbFallbackText}>{initials}</Text>
        </View>
      )}

      <View style={styles.metaCol}>
        <View style={styles.topRow}>
          <Text numberOfLines={2} style={styles.itemName}>
            {product.name || 'Producto sin nombre'}
          </Text>
          <Text style={styles.itemPrice}>{formatMoney(product.salePrice)}</Text>
        </View>

        <View style={styles.bottomRow}>
          <ProductStockBadge stock={product.stock} minStock={product.minStock} />
          <Text numberOfLines={1} style={styles.skuText}>
            SKU {product.sku || 'N/A'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  itemCard: {
    minHeight: 80,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#17355F',
    backgroundColor: '#101F37',
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemCardSelected: {
    borderColor: '#2E6BFF',
    backgroundColor: '#0D224A',
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1C3D6D',
    backgroundColor: '#0E1D36',
  },
  thumbFallback: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2B466E',
    backgroundColor: '#182845',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbFallbackText: {
    color: '#C8D8F5',
    fontWeight: theme.weight.semibold,
    fontSize: theme.font.md,
  },
  metaCol: {
    flex: 1,
    minWidth: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  itemName: {
    color: '#EAF1FF',
    fontSize: theme.font.md,
    fontWeight: theme.weight.semibold,
    lineHeight: 20,
    flex: 1,
  },
  itemPrice: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.md,
    fontWeight: theme.weight.bold,
    textAlign: 'right',
    flexShrink: 0,
  },
  bottomRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  skuText: {
    flex: 1,
    minWidth: 0,
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: theme.weight.medium,
    textAlign: 'right',
  },
});
