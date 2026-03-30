import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { useRequireActiveWorkspaceContext } from '@/quarantine/legacy-domain/modules/workspace-directory/hooks/useRequireActiveWorkspaceContext';
import { DashboardShell } from '@/modules/dashboard/components/DashboardShell';
import { useWorkspaceDashboardSummary } from '@/modules/dashboard/hooks/useWorkspaceDashboardSummary';
import { DASHBOARD_REGISTRY } from '@/modules/dashboard/registry/dashboard.registry';
import { theme } from '@/theme';
import { resolveWorkspaceOperationalType } from '@/types/workspace-operational';

export default function BusinessDetailScreen() {
  const navigation = useNavigation<any>();
  const activeWorkspaceContext = useRequireActiveWorkspaceContext();
  const workspaceId = activeWorkspaceContext?.workspace?.id;

  const { data, isLoading, isError, refetch, isFetching } = useWorkspaceDashboardSummary(workspaceId);

  if (!activeWorkspaceContext) return null;

  if (isLoading) {
    return (
      <MainLayout>
        <View style={styles.centered}>
          <Text style={styles.stateTitle}>Preparando dashboard operativo...</Text>
          <Text style={styles.stateSubtitle}>Estamos consolidando los bloques del negocio.</Text>
        </View>
      </MainLayout>
    );
  }

  if (isError || !data) {
    return (
      <MainLayout>
        <View style={styles.centered}>
          <Text style={styles.stateTitle}>No pudimos cargar el dashboard</Text>
          <Text style={styles.stateSubtitle}>Actualiza para intentarlo de nuevo.</Text>
          <Pressable style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryBtnText}>Reintentar</Text>
          </Pressable>
        </View>
      </MainLayout>
    );
  }

  const fallbackOperationalType =
    resolveWorkspaceOperationalType(activeWorkspaceContext.workspace?.type) || 'STORE';
  const operationalType =
    data.workspace?.operationalType ||
    (fallbackOperationalType === 'GARMENT_WORKSHOP'
      ? 'GARMENT_WORKSHOP'
      : fallbackOperationalType);
  const definition =
    DASHBOARD_REGISTRY[operationalType] ||
    DASHBOARD_REGISTRY[fallbackOperationalType] ||
    DASHBOARD_REGISTRY.STORE;

  return (
    <MainLayout>
      <DashboardShell
        summary={data}
        definition={definition}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
        onNavigate={(route) => navigation.navigate(route)}
      />
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  stateTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.md,
    fontWeight: theme.weight.bold,
  },
  stateSubtitle: {
    marginTop: 6,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 12,
    borderRadius: 999,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  retryBtnText: {
    color: '#f0f6ff',
    fontWeight: theme.weight.semibold,
  },
});
