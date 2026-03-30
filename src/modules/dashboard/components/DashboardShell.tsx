import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme';
import type { WorkspaceDashboardSummary } from '../types/dashboard.types';
import type { DashboardDefinition } from '../registry/dashboard.registry';
import { DashboardWidgetRenderer } from './DashboardWidgets';

export function DashboardShell({
  summary,
  definition,
  onRefresh,
  isRefreshing,
  onNavigate,
}: {
  summary: WorkspaceDashboardSummary;
  definition: DashboardDefinition;
  onRefresh: () => void;
  isRefreshing: boolean;
  onNavigate: (route: string) => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.heroTag}>{definition.intentLabel}</Text>
        <Text style={styles.heroQuestion}>{summary.summaryQuestion || definition.defaultQuestion}</Text>
        <View style={styles.heroActions}>
          <Pressable style={styles.primaryCta} onPress={() => onNavigate(summary.primaryCta?.route || definition.primaryRouteFallback)}>
            <Text style={styles.primaryCtaText}>{summary.primaryCta?.label || 'Ir a flujo principal'}</Text>
          </Pressable>
          <Pressable style={styles.secondaryCta} onPress={onRefresh} disabled={isRefreshing}>
            <Text style={styles.secondaryCtaText}>{isRefreshing ? 'Actualizando...' : 'Actualizar'}</Text>
          </Pressable>
        </View>
      </View>

      {definition.widgetOrder.map((widgetKey) => (
        <DashboardWidgetRenderer key={widgetKey} widgetKey={widgetKey} summary={summary} />
      ))}

      {summary.deepAnalytics ? (
        <Pressable style={styles.deepAnalytics} onPress={() => onNavigate(summary.deepAnalytics!.route)}>
          <Text style={styles.deepAnalyticsTitle}>{summary.deepAnalytics.label}</Text>
          <Text style={styles.deepAnalyticsHint}>Ver vista historica y comparativas detalladas.</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 10,
    paddingBottom: 24,
    gap: 10,
  },
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2d538f',
    backgroundColor: '#081936',
    padding: 14,
    gap: 8,
  },
  heroTag: {
    color: '#9db9e9',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  heroQuestion: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.md,
    fontWeight: theme.weight.bold,
  },
  heroActions: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryCta: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  primaryCtaText: {
    color: '#eff5ff',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.bold,
  },
  secondaryCta: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#335c9e',
    backgroundColor: '#10284e',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  secondaryCtaText: {
    color: '#b7cae8',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  deepAnalytics: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#294d82',
    backgroundColor: '#0d2142',
    padding: 12,
    gap: 3,
  },
  deepAnalyticsTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.sm,
    fontWeight: theme.weight.bold,
  },
  deepAnalyticsHint: {
    color: theme.colors.textMuted,
    fontSize: theme.font.xs,
  },
});
