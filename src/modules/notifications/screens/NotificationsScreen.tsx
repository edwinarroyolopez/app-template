import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Bell, BellRing } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { Loader } from '@/components/ui/Loader';
import { Card } from '@/components/ui/Card';
import { RefreshHeader } from '@/components/RefreshHeader/RefreshHeader';
import { theme } from '@/theme';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { useNotifications } from '../hooks/useNotifications';
import { useMarkNotificationRead } from '../hooks/useMarkNotificationRead';
import type { AppNotification } from '../types/notification.type';

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('es-CO', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const workspaceContexts = useOperationalWorkspaceContextStore((s) => s.workspaceContexts);
  const activeWorkspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const setActiveWorkspaceContext = useOperationalWorkspaceContextStore((s) => s.setActiveWorkspaceContext);
  const { data = [], isLoading, isFetching, refetch } = useNotifications(7);
  const markRead = useMarkNotificationRead();

  async function handlePressItem(item: AppNotification) {
    if (item.status === 'UNREAD') {
      await markRead.mutateAsync(item._id);
    }

    const targetWorkspaceId =
      item.workspaceId ||
      (item.metadata as any)?.workspaceId ||
      (item.metadata as any)?.businessId;
    if (targetWorkspaceId && targetWorkspaceId !== activeWorkspaceId) {
      const target = workspaceContexts.find((ctx) => ctx.workspace?.id === targetWorkspaceId);
      if (target) {
        setActiveWorkspaceContext(target as any);
      }
    }

    const targetScreen = (item.metadata as any)?.screen as string | undefined;
    const targetMode = (item.metadata as any)?.mode as 'FACTORY' | 'DELIVERY' | undefined;

    if (targetScreen === 'FactoryOrderDetail' && item.entityId) {
      navigation.navigate('FactoryOrderDetail', { saleId: item.entityId, mode: targetMode });
      return;
    }

    if (targetScreen === 'SaleDetail' && item.entityId) {
      navigation.navigate('SaleDetail', { saleId: item.entityId });
      return;
    }

    if (targetScreen === 'FactoryOrders') {
      navigation.navigate('FactoryOrders');
      return;
    }

    if (targetScreen === 'ReadyForDeliveryOrders') {
      navigation.navigate('ReadyForDeliveryOrders');
      return;
    }

    if (targetScreen === 'Sales') {
      navigation.navigate('Sales');
      return;
    }

    if (item.entityType === 'SALE' && item.entityId) {
      navigation.navigate('SaleDetail', { saleId: item.entityId });
      return;
    }

    if (item.entityType === 'FACTORY_ORDER' && item.entityId) {
      navigation.navigate('FactoryOrderDetail', { saleId: item.entityId, mode: 'FACTORY' });
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <Loader message="Cargando notificaciones..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <View style={styles.container}>
        <Card>
          <RefreshHeader
            title="Notificaciones"
            subtitle="Ultimas 7 actividades"
            icon={<BellRing size={20} color={theme.colors.accent} />}
            isFetching={isFetching}
            onRefresh={refetch}
          />
        </Card>

        <FlatList
          data={data}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={NotificationItemSeparator}
          ListEmptyComponent={<NotificationsEmptyState />}
          renderItem={({ item }) => {
            const unread = item.status === 'UNREAD';
            return (
              <Pressable
                style={[styles.itemCard, unread && styles.itemCardUnread]}
                onPress={() => handlePressItem(item)}
              >
                <View style={styles.itemTopRow}>
                  <Text style={[styles.itemTitle, unread && styles.itemTitleUnread]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <View style={[styles.statusPill, unread ? styles.unreadPill : styles.readPill]}>
                    <Text style={[styles.statusPillText, unread ? styles.unreadPillText : styles.readPillText]}>
                      {unread ? 'UNREAD' : 'READ'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.itemMessage}>{item.message}</Text>
                <Text style={styles.itemDate}>{formatDateTime(item.createdAt)}</Text>
              </Pressable>
            );
          }}
        />
      </View>
    </MainLayout>
  );
}

function NotificationsEmptyState() {
  return (
    <View style={styles.emptyCard}>
      <Bell size={22} color={theme.colors.textMuted} />
      <Text style={styles.emptyTitle}>No tienes notificaciones</Text>
      <Text style={styles.emptySubtitle}>Aqui veras actividades recientes del sistema.</Text>
    </View>
  );
}

function NotificationItemSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 18,
    flexGrow: 1,
  },
  separator: {
    height: 10,
  },
  itemCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  itemCardUnread: {
    borderColor: '#2E6BFF88',
    backgroundColor: '#0A1835',
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  itemTitle: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
  },
  itemTitleUnread: {
    color: '#EAF1FF',
  },
  itemMessage: {
    color: theme.colors.textSecondary,
    fontSize: theme.font.sm,
  },
  itemDate: {
    color: theme.colors.textMuted,
    fontSize: theme.font.xs,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
  },
  unreadPill: {
    borderColor: '#2E6BFF88',
    backgroundColor: '#10284F',
  },
  readPill: {
    borderColor: '#2E4C7E',
    backgroundColor: '#0C1E40',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: theme.weight.bold,
  },
  unreadPillText: {
    color: '#60A5FA',
  },
  readPillText: {
    color: '#9FB0CF',
  },
  emptyCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 20,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
  },
  emptySubtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.font.sm,
    textAlign: 'center',
  },
});
