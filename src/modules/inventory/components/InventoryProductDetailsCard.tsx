import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArrowDownRight, ArrowRight, ArrowUpRight, CircleMinus } from 'lucide-react-native';
import { theme } from '@/theme';

function money(value: number) {
  return `$${Number(value || 0).toLocaleString('es-CO')}`;
}

function movementStatus(delta: number) {
  if (delta > 0) return { label: `+${delta}`, bg: '#0E2F24', color: '#34D399', Icon: ArrowUpRight };
  if (delta < 0) return { label: `${delta}`, bg: '#361A20', color: '#F87171', Icon: ArrowDownRight };
  return { label: '0', bg: '#273348', color: '#B8C8E5', Icon: CircleMinus };
}

export function InventoryProductDetailsCard({ productDetails }: { productDetails: any[] }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Detalle completo de productos</Text>
      {(productDetails || []).slice(0, 40).map((item: any) => {
        const move = movementStatus(item.difference);
        const MoveIcon = move.Icon;

        return (
          <View key={item.productId} style={styles.productCard}>
            <View style={styles.productTop}>
              <Text numberOfLines={1} style={styles.productName}>{item.name}</Text>
              <Text style={styles.productValue}>{money(item.inventoryValue || 0)}</Text>
            </View>

            <View style={styles.productBottom}>
              <View style={styles.stockFlowRow}>
                <Text style={styles.productMeta}>Stock {item.previousStock}</Text>
                <ArrowRight size={12} color="#9FB0CF" />
                <Text style={styles.productMeta}>{item.currentStock}</Text>
              </View>

              <View style={[styles.deltaBadge, { backgroundColor: move.bg }]}>
                <MoveIcon size={12} color={move.color} />
                <Text style={[styles.deltaBadgeText, { color: move.color }]}>{move.label}</Text>
              </View>
            </View>
          </View>
        );
      })}

      {(productDetails || []).length > 40 && (
        <Text style={styles.dimText}>Mostrando 40 productos con mayor valor de inventario.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: { borderRadius: 16, borderWidth: 1, borderColor: '#16335E', backgroundColor: '#0A1B35', padding: 12 },
  sectionTitle: { color: '#EAF1FF', fontSize: theme.font.md, fontWeight: theme.weight.bold, marginBottom: 6 },
  productCard: { borderRadius: 12, borderWidth: 1, borderColor: '#173660', backgroundColor: '#0A213F', padding: 10, marginBottom: 8 },
  productTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  productName: { color: '#EAF1FF', fontSize: theme.font.sm, fontWeight: theme.weight.bold, flex: 1 },
  productValue: { color: '#9FC0FF', fontSize: theme.font.xs, fontWeight: theme.weight.bold },
  productBottom: { marginTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  stockFlowRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  productMeta: { color: '#AFC3E6', fontSize: theme.font.xs },
  deltaBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 4 },
  deltaBadgeText: { fontSize: 11, fontWeight: theme.weight.bold },
  dimText: { color: '#8EA4CC', fontSize: theme.font.xs },
});
