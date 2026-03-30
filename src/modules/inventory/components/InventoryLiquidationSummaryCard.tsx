import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArrowDownRight, ArrowUpRight, Boxes, CalendarClock, Wallet } from 'lucide-react-native';
import { theme } from '@/theme';

function money(value: number) {
  return `$${Number(value || 0).toLocaleString('es-CO')}`;
}

function dateLabel(value?: string) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function dateShort(value?: string) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export function InventoryLiquidationSummaryCard({ summary, audit }: { summary: any; audit: any }) {
  const currentValue = Number(summary?.totalInventoryValue || 0);
  const previousValue = Number(summary?.previousInventoryValue || 0);
  const changeValue = Number(summary?.valueDifference || 0);
  const improved = currentValue >= previousValue;

  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Resumen del inventario</Text>
      <Text style={styles.sectionSub}>Liquidación: {dateLabel(audit?.finalizedAt)}</Text>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <View style={styles.metricHead}><Wallet size={14} color="#9FC0FF" /><Text style={styles.metricLabel}>Valor inventario</Text></View>
          <Text numberOfLines={1} style={styles.metricValue}>{money(currentValue)}</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHead}><Wallet size={14} color="#9FC0FF" /><Text style={styles.metricLabel}>Valor anterior</Text></View>
          <Text numberOfLines={1} style={styles.metricValue}>{money(previousValue)}</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHead}>
            {changeValue >= 0 ? <ArrowUpRight size={14} color="#34D399" /> : <ArrowDownRight size={14} color="#F87171" />}
            <Text style={styles.metricLabel}>Cambio</Text>
          </View>
          <Text numberOfLines={1} style={[styles.metricValue, changeValue < 0 ? styles.metricValueNegative : styles.metricValuePositive]}>{money(changeValue)}</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHead}><Boxes size={14} color="#9FC0FF" /><Text style={styles.metricLabel}>Productos</Text></View>
          <Text style={styles.metricValue}>{summary?.totalProducts || 0}</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHead}><CalendarClock size={14} color="#9FC0FF" /><Text style={styles.metricLabel}>Fecha</Text></View>
          <Text style={styles.metricValue}>{dateShort(audit?.finalizedAt)}</Text>
        </View>
      </View>

      <View style={[styles.trendCard, improved ? styles.trendCardGood : styles.trendCardBad]}>
        <View style={styles.trendRow}>
          {improved ? <ArrowUpRight size={16} color="#34D399" /> : <ArrowDownRight size={16} color="#F87171" />}
          <Text style={styles.trendTitle}>Comparativo vs inventario anterior</Text>
        </View>
        <Text style={styles.trendText}>{money(Math.abs(currentValue - previousValue))}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: { borderRadius: 16, borderWidth: 1, borderColor: '#16335E', backgroundColor: '#0A1B35', padding: 12 },
  sectionTitle: { color: '#EAF1FF', fontSize: theme.font.md, fontWeight: theme.weight.bold, marginBottom: 6 },
  sectionSub: { color: '#91A7CC', fontSize: theme.font.xs, marginBottom: 6 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metricCard: { width: '48%', borderRadius: 12, borderWidth: 1, borderColor: '#1A3D70', backgroundColor: '#0B2345', padding: 10 },
  metricHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  metricLabel: { color: '#A9C0E8', fontSize: 11, fontWeight: theme.weight.semibold },
  metricValue: { color: '#EAF1FF', fontSize: theme.font.md, fontWeight: theme.weight.bold },
  metricValuePositive: { color: '#34D399' },
  metricValueNegative: { color: '#F87171' },
  trendCard: { marginTop: 8, borderRadius: 12, borderWidth: 1, padding: 10 },
  trendCardGood: { borderColor: '#1E5C4B', backgroundColor: '#0E2F24' },
  trendCardBad: { borderColor: '#6A2A34', backgroundColor: '#3A1A22' },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trendTitle: { color: '#EAF1FF', fontSize: theme.font.sm, fontWeight: theme.weight.bold },
  trendText: { marginTop: 3, color: '#EAF1FF', fontSize: theme.font.sm, fontWeight: theme.weight.bold },
});
