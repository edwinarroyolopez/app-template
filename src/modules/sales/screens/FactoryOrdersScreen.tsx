import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Hammer } from 'lucide-react-native';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { RefreshHeader } from '@/components/RefreshHeader/RefreshHeader';
import { theme } from '@/theme';
import { useFactoryOrders } from '../hooks/useFactoryOrders';
import { deriveDelayedInfo } from '../utils/delayedSales';
import { FactoryOrderCard } from '../components/FactoryOrderCard';
import { FactoryOrdersFocusBanner } from '../components/FactoryOrdersFocusBanner';

export default function FactoryOrdersScreen() {
  const navigation = useNavigation<any>();
  const { data = [], isFetching, refetch } = useFactoryOrders();
  const orders = data as any[];
  const delayedCount = orders.reduce((acc, order) => {
    const delayed = deriveDelayedInfo(order);
    return (order.isDelayed ?? delayed.isDelayed) ? acc + 1 : acc;
  }, 0);
  const maxDelayedDays = orders.reduce((max, order) => {
    const delayed = deriveDelayedInfo(order);
    const days = Number(order.delayedDays ?? delayed.delayedDays ?? 0);
    return Math.max(max, days);
  }, 0);

  return (
    <MainLayout>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.pageTitle}>Procesos en fabrica</Text>
            <Text style={styles.pageSubtitle}>Procesos operativos por linea fabricable</Text>
          </View>

          <RefreshHeader
            hideTitleSection
            isFetching={isFetching}
            onRefresh={refetch}
            helpKey="sales_factory_help"
          />
        </View>

        <FactoryOrdersFocusBanner
          totalOrders={orders.length}
          delayedOrders={delayedCount}
          maxDelayedDays={maxDelayedDays}
        />

        <FlatList
          data={orders}
          refreshing={isFetching}
          onRefresh={refetch}
          keyExtractor={(item: any) => item.id || item._id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={<View style={styles.listHeaderSpacer} />}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Hammer size={24} color="#7E94BE" />
              <Text style={styles.emptyTitle}>No hay procesos en fábrica</Text>
              <Text style={styles.emptySubtitle}>Cuando una linea entre a producción aparecerá aquí.</Text>
            </View>
          }
          renderItem={({ item, index }: any) => (
            <FactoryOrderCard
              process={item}
              isTopPriority={index === 0 && orders.length > 1}
              onPress={() =>
                navigation.navigate('FactoryOrderDetail', {
                  processId: item.id || item.manufacturingItemId,
                  saleId: item.saleId,
                  mode: 'FACTORY',
                })
              }
            />
          )}
        />
      </View>
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
  listContent: {
    paddingBottom: 24,
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
