import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import type { AppStackParamList } from '@/navigation/AppNavigator';
import { theme } from '@/theme';
import { useInventoryLiquidationDetail } from '../hooks/useInventoryLiquidationDetail';
import { InventoryLiquidationSummaryCard } from '../components/InventoryLiquidationSummaryCard';
import { InventoryOperationalAlertsCard } from '../components/InventoryOperationalAlertsCard';
import { InventoryMovementMetricsCard } from '../components/InventoryMovementMetricsCard';
import { InventoryLowRotationCard } from '../components/InventoryLowRotationCard';
import { InventoryProductDetailsCard } from '../components/InventoryProductDetailsCard';

type Params = RouteProp<AppStackParamList, 'InventoryLiquidationDetail'>;

export default function InventoryLiquidationDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<Params>();
  const { data, isLoading, isFetching, refetch } = useInventoryLiquidationDetail(route.params?.auditId);

  if (isLoading) {
    return (
      <MainLayout hideBottomBar>
        <View style={styles.container}>
          <View style={styles.topBar}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
              <ArrowLeft size={20} color="#EAF1FF" />
            </Pressable>
            <Text style={styles.topBarTitle}>Detalle de Liquidación</Text>
            <View style={styles.topBarSpacer} />
          </View>

          <View style={styles.loadingWrap}>
            <ActivityIndicator color="#2E8CFF" />
            <Text style={styles.loadingText}>Cargando detalle de liquidación...</Text>
          </View>
        </View>
      </MainLayout>
    );
  }

  if (!data) {
    return (
      <MainLayout hideBottomBar>
        <View style={styles.container}>
          <View style={styles.topBar}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
              <ArrowLeft size={20} color="#EAF1FF" />
            </Pressable>
            <Text style={styles.topBarTitle}>Detalle de Liquidación</Text>
            <View style={styles.topBarSpacer} />
          </View>

          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No hay liquidaciones finalizadas</Text>
            <Text style={styles.emptyText}>Finaliza un inventario de liquidación para ver conclusiones operativas.</Text>
            <Pressable style={styles.backBtn} onPress={() => navigation.navigate('InventoryLiquidation')}>
              <Text style={styles.backBtnText}>Ir a Liquidación</Text>
            </Pressable>
          </View>
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout hideBottomBar>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <ArrowLeft size={20} color="#EAF1FF" />
          </Pressable>
          <Text style={styles.topBarTitle}>Detalle de Liquidación</Text>
          <View style={styles.topBarSpacer} />
        </View>

        <InventoryLiquidationSummaryCard summary={data.summary} audit={data.audit} />
        <InventoryOperationalAlertsCard alerts={data.alerts} />
        <InventoryMovementMetricsCard movement={data.movement} />
        <InventoryLowRotationCard lowRotation={data.lowRotation || []} />
        <InventoryProductDetailsCard productDetails={data.productDetails || []} />

        <Pressable style={styles.refreshBtn} onPress={() => refetch()} disabled={isFetching}>
          <Text style={styles.refreshBtnText}>{isFetching ? 'Actualizando...' : 'Actualizar análisis'}</Text>
        </Pressable>
      </ScrollView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#9FB0CF',
    fontSize: theme.font.sm,
  },
  container: {
    flex: 1,
    backgroundColor: '#071427',
  },
  content: {
    padding: 16,
    paddingBottom: 24,
    gap: 10,
  },
  topBar: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#16335E',
    backgroundColor: '#0A1B35',
    paddingHorizontal: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarTitle: {
    color: '#EAF1FF',
    fontSize: theme.font.md,
    fontWeight: theme.weight.bold,
  },
  topBarSpacer: {
    width: 20,
  },
  emptyCard: {
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#16335E',
    backgroundColor: '#0A1B35',
    padding: 14,
    marginHorizontal: 16,
  },
  emptyTitle: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
    marginBottom: 4,
  },
  emptyText: {
    color: '#91A7CC',
    fontSize: theme.font.sm,
  },
  backBtn: {
    marginTop: 10,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#2E6BFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: '#F0F6FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.sm,
  },
  refreshBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#1C4EAA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshBtnText: {
    color: '#EAF1FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.bold,
  },
});
