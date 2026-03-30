import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChartNoAxesColumnDecreasing, ChartNoAxesColumnIncreasing, CircleMinus, CircleX, PlusCircle } from 'lucide-react-native';
import { theme } from '@/theme';

export function InventoryMovementMetricsCard({ movement }: { movement: any }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Movimiento de productos</Text>
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}><View style={styles.metricHead}><ChartNoAxesColumnIncreasing size={14} color="#34D399" /><Text style={styles.metricLabel}>Aumentaron</Text></View><Text style={styles.metricValue}>{movement?.increased?.length || 0}</Text></View>
        <View style={styles.metricCard}><View style={styles.metricHead}><ChartNoAxesColumnDecreasing size={14} color="#F87171" /><Text style={styles.metricLabel}>Disminuyeron</Text></View><Text style={styles.metricValue}>{movement?.decreased?.length || 0}</Text></View>
        <View style={styles.metricCard}><View style={styles.metricHead}><CircleMinus size={14} color="#B8C8E5" /><Text style={styles.metricLabel}>Sin cambio</Text></View><Text style={styles.metricValue}>{movement?.unchanged?.length || 0}</Text></View>
        <View style={styles.metricCard}><View style={styles.metricHead}><CircleX size={14} color="#F87171" /><Text style={styles.metricLabel}>Desaparecieron</Text></View><Text style={styles.metricValue}>{movement?.disappeared?.length || 0}</Text></View>
        <View style={styles.metricCard}><View style={styles.metricHead}><PlusCircle size={14} color="#34D399" /><Text style={styles.metricLabel}>Nuevos</Text></View><Text style={styles.metricValue}>{movement?.appeared?.length || 0}</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: { borderRadius: 16, borderWidth: 1, borderColor: '#16335E', backgroundColor: '#0A1B35', padding: 12 },
  sectionTitle: { color: '#EAF1FF', fontSize: theme.font.md, fontWeight: theme.weight.bold, marginBottom: 6 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metricCard: { width: '48%', borderRadius: 12, borderWidth: 1, borderColor: '#1A3D70', backgroundColor: '#0B2345', padding: 10 },
  metricHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  metricLabel: { color: '#A9C0E8', fontSize: 11, fontWeight: theme.weight.semibold },
  metricValue: { color: '#EAF1FF', fontSize: theme.font.md, fontWeight: theme.weight.bold },
});
