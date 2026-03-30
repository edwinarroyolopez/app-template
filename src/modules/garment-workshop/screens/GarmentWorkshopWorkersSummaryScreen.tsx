import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Medal } from 'lucide-react-native';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { theme } from '@/theme';
import { useGarmentWorkshopWorkersSummary } from '../hooks/useGarmentWorkshop';

function money(value?: number) {
  return `$${Number(value || 0).toLocaleString('es-CO')}`;
}

function buildRange(days: number) {
  const to = new Date();
  const from = new Date(to.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export default function GarmentWorkshopWorkersSummaryScreen() {
  const [windowDays, setWindowDays] = useState<7 | 15 | 30>(7);
  const range = useMemo(() => buildRange(windowDays), [windowDays]);
  const summaryQuery = useGarmentWorkshopWorkersSummary(range);

  const workers = (summaryQuery.data?.workers || []) as any[];

  return (
    <MainLayout>
      <View style={styles.container}>
        <Text style={styles.title}>Resumen por confeccionista</Text>
        <Text style={styles.subtitle}>Producción acumulada y valor económico por periodo.</Text>

        <View style={styles.filtersRow}>
          {[7, 15, 30].map((days) => {
            const active = windowDays === days;
            return (
              <Pressable
                key={days}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setWindowDays(days as 7 | 15 | 30)}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{days} días</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.rangeText}>Rango: {range.from} a {range.to}</Text>

        <FlatList
          data={workers}
          keyExtractor={(item) => item.workerEmployeeId}
          refreshing={summaryQuery.isFetching}
          onRefresh={summaryQuery.refetch}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Medal size={20} color="#8EA4CC" />
              <Text style={styles.emptyTitle}>Sin producción en el periodo</Text>
              <Text style={styles.emptySubtitle}>Registra operaciones para ver el acumulado por confeccionista.</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <View style={styles.rowTop}>
                <Text style={styles.rank}>#{index + 1}</Text>
                <Text style={styles.workerName}>{item.workerName}</Text>
                <Text style={styles.value}>{money(item.totalValueCop)}</Text>
              </View>

              <View style={styles.metricsRow}>
                <Text style={styles.metric}>Operaciones: {item.totalQuantity}</Text>
                <Text style={styles.metric}>Lotes: {item.lotsCount}</Text>
                <Text style={styles.metric}>Tipos: {item.operationsCount}</Text>
                <Text style={styles.metric}>Pagado: {money(item.paidValueCop || 0)}</Text>
                <Text style={styles.metric}>Pendiente: {money(item.pendingValueCop || 0)}</Text>
              </View>
            </View>
          )}
        />
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  title: {
    color: '#EAF1FF',
    fontSize: theme.font.xl,
    fontWeight: theme.weight.bold,
  },
  subtitle: {
    marginTop: 2,
    color: '#8EA4CC',
    fontSize: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 10,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterChipActive: {
    borderColor: '#2E6BFF',
    backgroundColor: '#0D224A',
  },
  filterText: {
    color: '#8EA4CC',
    fontSize: 11,
  },
  filterTextActive: {
    color: '#EAF1FF',
  },
  rangeText: {
    marginTop: 8,
    marginBottom: 10,
    color: '#8EA4CC',
    fontSize: 11,
  },
  listContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    padding: 12,
    marginBottom: 8,
    gap: 6,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rank: {
    width: 26,
    color: '#8EA4CC',
    fontSize: 11,
  },
  workerName: {
    flex: 1,
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: 13,
  },
  value: {
    color: '#86EFAC',
    fontWeight: theme.weight.semibold,
    fontSize: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  metric: {
    color: '#8EA4CC',
    fontSize: 11,
  },
  emptyCard: {
    marginTop: 60,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
  },
  emptySubtitle: {
    color: '#8EA4CC',
    fontSize: 12,
    textAlign: 'center',
  },
});
