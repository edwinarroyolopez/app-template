import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PackageCheck } from 'lucide-react-native';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { RefreshHeader } from '@/components/RefreshHeader/RefreshHeader';
import { theme } from '@/theme';
import { useReadyForDeliveryOrders } from '../hooks/useReadyForDeliveryOrders';
import { deriveDelayedInfo } from '../utils/delayedSales';
import { ReadyForDeliveryOrderCard } from '../components/ReadyForDeliveryOrderCard';
import { ReadyForDeliveryFocusBanner } from '../components/ReadyForDeliveryFocusBanner';

export default function ReadyForDeliveryOrdersScreen() {
  const navigation = useNavigation<any>();
  const { data = [], isFetching, refetch } = useReadyForDeliveryOrders();
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
            <Text style={styles.pageTitle}>Listos para entregar</Text>
            <Text style={styles.pageSubtitle}>Procesos listos por linea para salida y despacho</Text>
          </View>

          <RefreshHeader
            hideTitleSection
            isFetching={isFetching}
            onRefresh={refetch}
            helpKey="sales_delivery_help"
          />
        </View>

        <ReadyForDeliveryFocusBanner
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
              <PackageCheck size={24} color="#7E94BE" />
              <Text style={styles.emptyTitle}>No hay procesos listos para entregar</Text>
              <Text style={styles.emptySubtitle}>Cuando una linea quede lista para salida aparecerá aquí.</Text>
            </View>
          }
          renderItem={({ item, index }: any) => (
            <ReadyForDeliveryOrderCard
              process={item}
              isTopPriority={index === 0 && orders.length > 1}
              onPress={() =>
                navigation.navigate('FactoryOrderDetail', {
                  processId: item.id || item.manufacturingItemId,
                  saleId: item.saleId,
                  mode: 'DELIVERY',
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
