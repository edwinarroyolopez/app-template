import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Clock3 } from 'lucide-react-native';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { ActionLoader } from '@/components/ui/ActionLoader';
import { RefreshHeader } from '@/components/RefreshHeader/RefreshHeader';
import { theme } from '@/theme';
import { useDelayedSales } from '../hooks/useDelayedSales';
import { useDailyDelayedReview } from '../hooks/useDailyDelayedReview';
import { DelayedSaleCard } from '../components/DelayedSaleCard';

export default function DelayedSalesScreen() {
  const navigation = useNavigation<any>();
  const { data = [], isFetching, refetch } = useDelayedSales();
  const { runDailyReview, isReviewing } = useDailyDelayedReview();
  const delayedSales = data as any[];
  const delayedCount = delayedSales.length;
  const highestDelay = delayedSales.reduce((max, sale) => Math.max(max, Number(sale.delayedDays || 0)), 0);

  useEffect(() => {
    runDailyReview();
  }, [runDailyReview]);

  async function handleRefresh() {
    await runDailyReview();
    refetch();
  }

  return (
    <MainLayout>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.pageTitle}>Pedidos atrasados</Text>
            <Text style={styles.pageSubtitle}>Prioriza incumplimientos activos</Text>
          </View>

          <RefreshHeader
            hideTitleSection
            isFetching={isFetching}
            onRefresh={handleRefresh}
            helpKey="sales_delayed_help"
          />
        </View>

        <View style={styles.focusRow}>
          <View style={styles.focusBadge}>
            <Clock3 size={14} color="#FCA5A5" />
            <Text style={styles.focusBadgeText}>{delayedCount}</Text>
          </View>
          <Text style={styles.focusText} numberOfLines={1}>
            {delayedCount === 0
              ? 'Sin casos comprometidos hoy.'
              : `Prioridad: ${highestDelay} dias de retraso primero.`}
          </Text>
        </View>

        <FlatList
          data={delayedSales}
          style={styles.list}
          refreshing={isFetching}
          onRefresh={handleRefresh}
          keyExtractor={(item: any) => item.id || item._id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={<View style={styles.listHeaderSpacer} />}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Clock3 size={24} color="#7E94BE" />
              <Text style={styles.emptyTitle}>No hay pedidos atrasados activos</Text>
              <Text style={styles.emptySubtitle}>Los pedidos al día aparecen en el listado principal.</Text>
            </View>
          }
          renderItem={({ item, index }: any) => (
            <DelayedSaleCard
              sale={{ ...item, id: item.id || item._id }}
              isTopPriority={index === 0 && delayedCount > 1}
              onViewDetail={() => navigation.navigate('SaleDetail', { saleId: item.id || item._id })}
            />
          )}
        />
      </View>

      <ActionLoader
        visible={isReviewing}
        steps={[
          'Revisando pedidos atrasados...',
          'Sincronizando pedidos atrasados...',
          'Actualizando prioridades...',
          'Finalizando revision...',
        ]}
      />
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  headerRow: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  pageTitle: {
    fontSize: theme.font.xl,
    fontWeight: theme.weight.bold,
    color: theme.colors.textPrimary,
  },
  pageSubtitle: {
    marginTop: 2,
    color: '#8EA4CC',
    fontSize: 12,
  },
  focusRow: {
    marginBottom: 6,
    minHeight: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#5A2430',
    backgroundColor: '#231420',
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  focusBadge: {
    minWidth: 32,
    height: 20,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#7A2630',
    backgroundColor: '#341720',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 6,
  },
  focusBadgeText: {
    color: '#FCA5A5',
    fontWeight: theme.weight.semibold,
    fontSize: 11,
  },
  focusText: {
    flex: 1,
    color: '#FECACA',
    fontSize: 11,
    fontWeight: theme.weight.medium,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  listHeaderSpacer: {
    height: 2,
  },
  emptyCard: {
    marginTop: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 14,
    alignItems: 'center',
    gap: 7,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.md,
    fontWeight: theme.weight.semibold,
  },
  emptySubtitle: {
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
