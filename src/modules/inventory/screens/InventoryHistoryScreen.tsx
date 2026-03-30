import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { theme } from '@/theme';
import { inventoryApi } from '../services/inventory.api';

function formatDate(value?: string) {
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

function eventLabel(eventType?: string) {
  if (eventType === 'SALE_EVENT') return 'VENTA';
  if (eventType === 'PURCHASE_EVENT') return 'COMPRA';
  if (eventType === 'PRICE_UPDATE_EVENT') return 'PRECIO';
  if (eventType === 'FLASH_INVENTORY_EVENT') return 'INVENTARIO FLASH';
  if (eventType === 'LIQUIDATION_INVENTORY_EVENT') return 'INVENTARIO LIQUIDACIÓN';
  return 'EVENTO';
}

function resolveId(value: any): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value._id || value.id;
  return undefined;
}

function resolveUserLabel(value: any): string {
  if (!value) return '--';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const fullName = `${value.name || ''} ${value.lastName || ''}`.trim();
    return fullName || value.phone || value.email || value._id || '--';
  }
  return '--';
}

export default function InventoryHistoryScreen() {
  const navigation = useNavigation<any>();
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);

  const { data: events = [], isFetching, refetch } = useQuery({
    queryKey: ['inventory', 'events', workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      if (!workspaceId) return [];
      return inventoryApi.listEvents(workspaceId, 120);
    },
  });

  return (
    <MainLayout hideBottomBar>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <ArrowLeft size={20} color="#EAF1FF" />
          </Pressable>
          <Text style={styles.topBarTitle}>Histórico de Inventario</Text>
          <View style={styles.topBarSpacer} />
        </View>

        <Text style={styles.title}>Histórico de Inventario</Text>
        <Text style={styles.subtitle}>Eventos de compras, ventas y ajustes de stock.</Text>

        <FlatList
          data={events as any[]}
          keyExtractor={(item, index) => resolveId(item?._id) || `event-${index}`}
          refreshing={isFetching}
          onRefresh={refetch}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              style={styles.eventCard}
              onPress={() => {
                const auditId = resolveId(item.auditSessionId);
                if (item.eventType !== 'LIQUIDATION_INVENTORY_EVENT' || !auditId) return;
                navigation.navigate('InventoryLiquidationDetail', { auditId });
              }}
            >
              <View style={styles.eventTopRow}>
                <Text style={styles.eventType}>{eventLabel(item.eventType)}</Text>
                <Text style={styles.eventDate}>{formatDate(item.createdAt)}</Text>
              </View>

              <Text numberOfLines={1} style={styles.productName}>{item.productId?.name || 'Producto'}</Text>
              <Text style={styles.eventLine}>Anterior: {item.previousStock ?? 0}</Text>
              <Text style={styles.eventLine}>Nueva: {item.newStock ?? 0}</Text>
              <Text style={styles.eventLine}>Usuario: {resolveUserLabel(item.createdByUserId)}</Text>
              {item.eventType === 'LIQUIDATION_INVENTORY_EVENT' && !!item.auditSessionId && (
                <Text style={styles.detailLink}>Ver detalle de liquidación</Text>
              )}
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No hay eventos de inventario.</Text>
            </View>
          }
        />
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071427',
    padding: 16,
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
  title: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.lg,
  },
  subtitle: {
    marginTop: 4,
    color: '#91A7CC',
    fontSize: theme.font.sm,
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  eventCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#16335E',
    backgroundColor: '#0A1B35',
    padding: 10,
    marginBottom: 8,
  },
  eventTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventType: {
    color: '#2E8CFF',
    fontWeight: theme.weight.bold,
    fontSize: 11,
  },
  eventDate: {
    color: '#8EA4CC',
    fontSize: 11,
  },
  productName: {
    color: '#EAF1FF',
    fontSize: theme.font.md,
    fontWeight: theme.weight.bold,
    marginBottom: 4,
  },
  eventLine: {
    color: '#C8D7F1',
    fontSize: theme.font.xs,
    marginBottom: 1,
  },
  detailLink: {
    marginTop: 6,
    color: '#2E8CFF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.bold,
  },
  emptyCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    padding: 14,
    marginTop: 20,
  },
  emptyText: {
    color: '#9FB0CF',
    textAlign: 'center',
  },
});
