import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArrowRight, CircleMinus } from 'lucide-react-native';
import { theme } from '@/theme';

export function InventoryLowRotationCard({ lowRotation }: { lowRotation: any[] }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Productos de baja rotación</Text>
      {(lowRotation || []).map((item: any) => (
        <View key={item.productId} style={styles.alertRow}>
          <CircleMinus size={13} color="#B8C8E5" />
          <View style={styles.lowRotationRow}>
            <Text numberOfLines={1} style={styles.alertName}>{item.name}</Text>
            <View style={styles.stockFlowRow}>
              <Text style={styles.productMeta}>{item.previousStock}</Text>
              <ArrowRight size={12} color="#9FB0CF" />
              <Text style={styles.productMeta}>{item.currentStock}</Text>
            </View>
          </View>
        </View>
      ))}
      {!lowRotation?.length && <Text style={styles.dimText}>No hay suficientes datos para medir rotación baja.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: { borderRadius: 16, borderWidth: 1, borderColor: '#16335E', backgroundColor: '#0A1B35', padding: 12 },
  sectionTitle: { color: '#EAF1FF', fontSize: theme.font.md, fontWeight: theme.weight.bold, marginBottom: 6 },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  lowRotationRow: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  alertName: { flex: 1, color: '#D5E4FF', fontSize: theme.font.sm },
  stockFlowRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  productMeta: { color: '#AFC3E6', fontSize: theme.font.xs },
  dimText: { color: '#8EA4CC', fontSize: theme.font.xs },
});
