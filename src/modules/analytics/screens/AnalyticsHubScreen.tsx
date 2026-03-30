import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BarChart3, RefreshCw } from 'lucide-react-native';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { Loader } from '@/components/ui/Loader';
import { theme } from '@/theme';
import { useAccountAnalyticsOverview } from '../hooks/useAccountAnalyticsOverview';

function money(value?: number) {
  return `$${Number(value || 0).toLocaleString('es-CO')}`;
}

export default function AnalyticsHubScreen() {
  const navigation = useNavigation<any>();
  const { data, isLoading, isError, refetch, isFetching } = useAccountAnalyticsOverview();

  const maxRevenue = useMemo(() => {
    const values = (data?.weeklySeries || []).map((item: any) => Number(item.revenue || 0));
    return Math.max(...values, 1);
  }, [data?.weeklySeries]);

  const topWeeklyDay = useMemo(() => {
    const series = data?.weeklySeries || [];
    if (series.length === 0) return null;

    return series.reduce((top: any, item: any) => {
      const topRevenue = Number(top?.revenue || 0);
      const itemRevenue = Number(item?.revenue || 0);
      return itemRevenue > topRevenue ? item : top;
    }, series[0]);
  }, [data?.weeklySeries]);

  const ranking = data?.ranking || [];
  const delayedOrders = data?.delayedSummary?.topDelayedOrders || [];
  const workload = data?.workload || [];
  const weeklySeries = data?.weeklySeries || [];
  const hasDelayedOrders = delayedOrders.length > 0;
  const hasWorkload = workload.length > 0;
  const singleWorkspace = ranking.length <= 1;
  const openOrdersCount = Number(data?.executive?.openOrders || 0);
  const pendingReceivable = Number(data?.executive?.pendingReceivableCop || 0);
  const delayedCount = Number(data?.executive?.delayedOrders || 0);
  const maxDelayedDays = useMemo(() => {
    const orders = data?.delayedSummary?.topDelayedOrders || [];
    if (orders.length === 0) return 0;
    return Math.max(...orders.map((item: any) => Number(item.delayedDays || 0)), 0);
  }, [data?.delayedSummary?.topDelayedOrders]);
  const pressureLevel = useMemo<'calm' | 'warning' | 'critical'>(() => {
    const highDelayedVolume = delayedCount >= 5;
    const hasDelayedTension = delayedCount > 0 || maxDelayedDays >= 5;
    const hasOpenLoad = openOrdersCount >= 12;
    const hasFinancialLoad = pendingReceivable > 0;

    if (highDelayedVolume || maxDelayedDays >= 9) return 'critical';
    if (hasDelayedTension || hasOpenLoad || hasFinancialLoad) return 'warning';
    return 'calm';
  }, [delayedCount, maxDelayedDays, openOrdersCount, pendingReceivable]);

  if (isLoading) {
    return (
      <MainLayout>
        <View style={styles.loaderWrap}>
          <Loader message="Analizando preguntas clave de la operación..." />
        </View>
      </MainLayout>
    );
  }

  if (isError || !data) {
    return (
      <MainLayout>
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>No pudimos cargar analytics</Text>
          <Text style={styles.errorSubtitle}>Intenta nuevamente para ver los indicadores.</Text>
          <Pressable style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryBtnText}>Reintentar</Text>
          </Pressable>
        </View>
      </MainLayout>
    );
  }

  const executive = data.executive;
  const showWeeklyBeforeOperational = !hasDelayedOrders && !hasWorkload;
  const weeklyHint = topWeeklyDay
    ? `Dia con mayor ingreso: ${topWeeklyDay.dayLabel}`
    : 'Lectura semanal de ingresos y pedidos';
  const rankingTitle = singleWorkspace ? 'Workspace activo hoy' : 'Ranking de workspaces hoy';

  const weeklySection = (
    <>
      <View style={styles.sectionHeaderWrap}>
        <SectionTitle title="Ritmo semanal global" prominent={showWeeklyBeforeOperational} />
        <Text style={styles.sectionSubtitle} numberOfLines={1}>{weeklyHint}</Text>
      </View>
      <View style={[styles.sectionCard, showWeeklyBeforeOperational && styles.sectionCardProminent]}>
        <View style={styles.weekHeaderRow}>
          <Text style={styles.weekHeaderDay}>Dia</Text>
          <Text style={styles.weekHeaderRevenue}>Monto</Text>
          <Text style={styles.weekHeaderOrders}>Ped.</Text>
        </View>

        {weeklySeries.map((item: any) => {
          const isTopDay = Number(item.revenue || 0) === Number(topWeeklyDay?.revenue || 0) && Number(item.revenue || 0) > 0;
          return (
            <View key={item.key} style={[styles.weekRow, isTopDay && styles.weekRowTop]}>
              <Text style={[styles.weekDay, isTopDay && styles.weekDayTop]}>{item.dayLabel}</Text>
              <View style={styles.weekTrackWrap}>
                <View style={styles.weekTrack}>
                  <View
                    style={[
                      styles.weekFill,
                      isTopDay && styles.weekFillTop,
                      { width: `${Math.max((item.revenue / maxRevenue) * 100, 2)}%` as `${number}%` },
                    ]}
                  />
                </View>
              </View>
              <Text style={[styles.weekRevenue, isTopDay && styles.weekRevenueTop]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.84}>
                {money(item.revenue)}
              </Text>
              <Text style={styles.weekOrders} numberOfLines={1}>{item.orders}</Text>
            </View>
          );
        })}
      </View>
    </>
  );

  return (
    <MainLayout>
      <ScrollView contentContainerStyle={styles.content}>
        <View
          style={[
            styles.heroBlock,
            pressureLevel === 'warning' && styles.heroBlockWarning,
            pressureLevel === 'critical' && styles.heroBlockCritical,
          ]}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerMainRow}>
              <View style={styles.headerIconWrap}>
                <BarChart3 size={17} color="#DCE8FF" />
              </View>
              <View style={styles.headerTextWrap}>
                <Text style={styles.headerTitle}>Analytics profundos</Text>
                <Text style={styles.headerSubtitle}>Compara workspaces y detecta fricciones operativas de la cuenta.</Text>
              </View>
            </View>

            <Pressable style={styles.refreshLink} onPress={() => refetch()}>
              <RefreshCw size={13} color="#89AFEE" />
              <Text style={styles.refreshLinkText}>{isFetching ? 'Actualizando...' : 'Actualizar'}</Text>
            </Pressable>
          </View>

          <View style={styles.contextStrip}>
            <View style={styles.contextPillWide}>
              <Text style={styles.contextLabel}>Pendiente total</Text>
              <Text style={styles.contextValueStrong} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.84}>
                {money(executive.pendingReceivableCop)}
              </Text>
              <Text style={styles.contextMeta} numberOfLines={1}>Comprometido en pedidos activos</Text>
            </View>

            <View style={[styles.contextPill, openOrdersCount >= 12 && styles.contextPillLoad]}>
              <Text style={styles.contextLabel}>Abiertos</Text>
              <Text style={[styles.contextValue, openOrdersCount >= 12 && styles.contextValueLoad]}>{executive.openOrders || 0}</Text>
            </View>

            <View
              style={[
                styles.contextPill,
                delayedCount > 0 && styles.contextPillWarning,
                delayedCount >= 5 && styles.contextPillCritical,
              ]}
            >
              <Text style={styles.contextLabel}>Atrasados</Text>
              <Text
                style={[
                  styles.contextValue,
                  delayedCount > 0 && styles.contextValueWarning,
                  delayedCount >= 5 && styles.contextValueCritical,
                ]}
              >
                {executive.delayedOrders || 0}
              </Text>
            </View>
          </View>
        </View>

        {hasDelayedOrders && (
          <View style={styles.sectionHeaderRow}>
            <SectionTitle title="Pedidos con mayor retraso" prominent />
            <Text style={styles.sectionMetaText}>Promedio: {data.delayedSummary?.averageDelayedDays || 0} dias</Text>
          </View>
        )}
        {hasDelayedOrders && (
          <View style={[styles.sectionCard, styles.sectionCardRisk]}>
            {delayedOrders.map((item: any, index: number) => (
              <Pressable
                key={item.id}
                onPress={() => navigation.navigate('SaleDetail', { saleId: item.id })}
                style={[styles.delayedRow, index === delayedOrders.length - 1 && styles.lastRow]}
              >
                <View style={styles.delayedLeft}>
                  <Text style={styles.delayedProduct} numberOfLines={1}>{item.productName || 'Producto sin nombre'}</Text>
                  <Text style={styles.delayedMeta} numberOfLines={1}>{item.workspaceName} • {item.clientName || 'Sin cliente'}</Text>
                </View>
                <Text style={styles.delayedDays}>{item.delayedDays} dias</Text>
              </Pressable>
            ))}
          </View>
        )}

        <SectionTitle title={rankingTitle} />
        <View style={styles.sectionCard}>
          {ranking.map((item: any, index: number) => (
            <View
              key={item.workspaceId}
              style={[
                styles.rankingRow,
                index === 0 && styles.rankingRowTop,
                item.deltaPercent < 0 && styles.rankingRowNegative,
                index === ranking.length - 1 && styles.lastRow,
              ]}
            >
              <View style={styles.rankingLeft}>
                {!singleWorkspace && (
                  <Text style={[styles.rankingPosition, index === 0 && styles.rankingPositionTop]}>#{index + 1}</Text>
                )}
                <Text style={styles.rankingName} numberOfLines={1}>{item.workspaceName}</Text>
                <Text style={styles.rankingMeta} numberOfLines={1}>{item.todayOrders} pedidos hoy</Text>
              </View>
              <View style={styles.rankingRight}>
                <Text style={styles.rankingValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>{money(item.todayRevenue)}</Text>
                <Text
                  style={[
                    styles.rankingDelta,
                    Math.abs(item.deltaPercent) < 1 ? styles.flat : item.deltaPercent >= 0 ? styles.positive : styles.negative,
                  ]}
                >
                  {item.deltaPercent >= 0 ? '+' : ''}{item.deltaPercent}%
                </Text>
              </View>
            </View>
          ))}
        </View>

        {showWeeklyBeforeOperational && weeklySection}

        {!hasDelayedOrders && (
          <View style={styles.sectionHeaderRow}>
            <SectionTitle title="Pedidos con mayor retraso" />
            <Text style={styles.sectionMetaText}>Promedio: 0 dias</Text>
          </View>
        )}
        {!hasDelayedOrders && (
          <View style={[styles.sectionCard, styles.sectionCardEmptyCompact]}>
            <Text style={styles.emptyTextCompact}>Sin pedidos atrasados activos.</Text>
            <Text style={styles.averageDelayedText} numberOfLines={1}>Retraso promedio: 0 dias</Text>
          </View>
        )}

        <View style={styles.sectionHeaderRow}>
          <SectionTitle title="Carga operativa por responsable" />
          {!hasWorkload && <Text style={styles.sectionQuietTag}>Sin carga</Text>}
        </View>
        <View style={[styles.sectionCard, !hasWorkload && styles.sectionCardEmptyCompact]}>
          {!hasWorkload ? (
            <Text style={styles.emptyTextCompact}>Sin carga operativa activa por responsable.</Text>
          ) : (
            workload.map((person: any, index: number) => (
              <View key={person.employeeId || person.name} style={[styles.workloadRow, index === workload.length - 1 && styles.lastRow]}>
                <View style={styles.workloadTopRow}>
                  <Text style={styles.workloadName} numberOfLines={1}>{person.name}</Text>
                  <Text style={[styles.workloadDelayed, person.delayedOrders > 0 && styles.workloadDelayedHot]} numberOfLines={1}>
                    Atrasados: {person.delayedOrders}
                  </Text>
                </View>
                <Text style={styles.workloadMeta} numberOfLines={1}>
                  Activos: {person.activeOrders} • Fabricacion: {person.fabricationOrders}
                </Text>
              </View>
            ))
          )}
        </View>

        {!showWeeklyBeforeOperational && weeklySection}
      </ScrollView>
    </MainLayout>
  );
}

function SectionTitle({ title, prominent = false }: { title: string; prominent?: boolean }) {
  return <Text style={[styles.sectionTitle, prominent && styles.sectionTitleProminent]}>{title}</Text>;
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 30,
  },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
  },
  errorSubtitle: {
    color: '#8EA4CC',
    marginTop: 6,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 12,
    borderRadius: 999,
    backgroundColor: '#2E6BFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  retryBtnText: {
    color: '#F0F6FF',
    fontWeight: theme.weight.semibold,
  },
  heroBlock: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1A335D',
    backgroundColor: '#07142D',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  heroBlockWarning: {
    borderColor: '#2C4775',
    backgroundColor: '#0A1A37',
  },
  heroBlockCritical: {
    borderColor: '#5A3E1A',
    backgroundColor: '#1A1620',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 1,
  },
  headerMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 4,
  },
  refreshLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#294E82',
    backgroundColor: '#0D2140',
  },
  refreshLinkText: {
    color: '#89AFEE',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  headerIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15315D',
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.sm,
  },
  headerSubtitle: {
    marginTop: 2,
    color: '#89A3CE',
    fontSize: theme.font.xs,
  },
  contextStrip: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 7,
  },
  contextPillWide: {
    flex: 1.35,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D4168',
    backgroundColor: '#0C1D3D',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  contextPill: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#243B63',
    backgroundColor: '#0A1A36',
    paddingHorizontal: 9,
    paddingVertical: 8,
  },
  contextPillWarning: {
    borderColor: '#5B4721',
    backgroundColor: '#2B230F',
  },
  contextPillCritical: {
    borderColor: '#844D3B',
    backgroundColor: '#361F1A',
  },
  contextPillLoad: {
    borderColor: '#2E4E81',
    backgroundColor: '#102443',
  },
  contextLabel: {
    color: '#8EA4CC',
    fontSize: 10,
    fontWeight: theme.weight.medium,
  },
  contextMeta: {
    marginTop: 2,
    color: '#6F89B4',
    fontSize: 10,
  },
  contextValueStrong: {
    marginTop: 3,
    color: '#F0F6FF',
    fontSize: theme.font.md,
    fontWeight: theme.weight.bold,
  },
  contextValue: {
    marginTop: 3,
    color: '#EAF1FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.bold,
  },
  contextValueWarning: {
    color: '#FFDFA1',
  },
  contextValueCritical: {
    color: '#FFC7B4',
  },
  contextValueLoad: {
    color: '#D5E4FF',
  },
  sectionHeaderRow: {
    marginTop: 12,
    marginBottom: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sectionMetaText: {
    color: '#86A2CF',
    fontSize: 11,
    fontWeight: theme.weight.medium,
  },
  sectionTitle: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.sm,
  },
  sectionTitleProminent: {
    marginTop: 14,
    fontSize: theme.font.md,
  },
  sectionHeaderWrap: {
    marginTop: 4,
  },
  sectionSubtitle: {
    color: '#7E98C5',
    fontSize: 11,
    marginTop: -3,
    marginBottom: 7,
  },
  sectionCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#19345C',
    backgroundColor: '#0A1835',
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 6,
  },
  sectionCardProminent: {
    borderColor: '#224576',
    backgroundColor: '#0B1D3D',
  },
  sectionCardRisk: {
    borderColor: '#3B4A6A',
    backgroundColor: '#111D37',
  },
  sectionCardEmptyCompact: {
    borderColor: '#142C50',
    backgroundColor: '#081528',
    paddingVertical: 7,
    gap: 4,
  },
  rankingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#163260',
    paddingVertical: 5,
  },
  rankingRowTop: {
    backgroundColor: '#112749',
    borderRadius: 8,
    paddingHorizontal: 6,
    marginHorizontal: -6,
    borderBottomWidth: 0,
    marginBottom: 2,
  },
  rankingRowNegative: {
    borderBottomColor: '#2E3F62',
  },
  lastRow: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  rankingLeft: {
    flex: 1,
    paddingRight: 8,
  },
  rankingName: {
    color: '#EAF1FF',
    fontWeight: theme.weight.semibold,
    fontSize: theme.font.sm,
  },
  rankingPosition: {
    color: '#86A6D6',
    fontSize: 10,
    fontWeight: theme.weight.semibold,
    marginBottom: 1,
  },
  rankingPositionTop: {
    color: '#BCD6FF',
  },
  rankingMeta: {
    color: '#8EA4CC',
    fontSize: theme.font.xs,
    marginTop: 1,
  },
  rankingRight: {
    alignItems: 'flex-end',
    minWidth: 108,
  },
  rankingValue: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.sm,
  },
  rankingDelta: {
    marginTop: 1,
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  positive: {
    color: '#34D399',
  },
  negative: {
    color: '#F87171',
  },
  flat: {
    color: '#88A0C8',
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  weekRowTop: {
    borderRadius: 7,
    backgroundColor: '#10284D',
    paddingHorizontal: 4,
    marginHorizontal: -4,
  },
  weekHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  weekHeaderDay: {
    width: 42,
    color: '#7F96BF',
    fontSize: 10,
  },
  weekHeaderRevenue: {
    width: 96,
    textAlign: 'right',
    color: '#7F96BF',
    fontSize: 10,
  },
  weekHeaderOrders: {
    width: 26,
    textAlign: 'right',
    color: '#7F96BF',
    fontSize: 10,
  },
  weekDay: {
    width: 42,
    color: '#A9BCDF',
    textTransform: 'capitalize',
    fontSize: 11,
    fontWeight: theme.weight.medium,
  },
  weekDayTop: {
    color: '#D8E7FF',
  },
  weekTrackWrap: {
    flex: 1,
    paddingRight: 2,
  },
  weekTrack: {
    height: 7,
    borderRadius: 999,
    backgroundColor: '#132A55',
    overflow: 'hidden',
  },
  weekFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#2E6BFF',
  },
  weekFillTop: {
    backgroundColor: '#5D8EFF',
  },
  weekRevenue: {
    width: 96,
    textAlign: 'right',
    color: '#DCE8FF',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  weekRevenueTop: {
    color: '#EDF4FF',
  },
  weekOrders: {
    width: 26,
    textAlign: 'right',
    color: '#8EA4CC',
    fontSize: 11,
  },
  workloadRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#163260',
    paddingVertical: 6,
  },
  workloadTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  workloadName: {
    color: '#EAF1FF',
    fontWeight: theme.weight.semibold,
    fontSize: theme.font.sm,
    flex: 1,
    paddingRight: 8,
  },
  workloadDelayed: {
    color: '#8EA4CC',
    fontSize: 11,
    fontWeight: theme.weight.medium,
  },
  workloadDelayedHot: {
    color: '#F7C58A',
    fontWeight: theme.weight.semibold,
  },
  workloadMeta: {
    marginTop: 3,
    color: '#8EA4CC',
    fontSize: theme.font.xs,
  },
  delayedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#163260',
    paddingVertical: 5,
  },
  delayedLeft: {
    flex: 1,
    paddingRight: 10,
  },
  delayedProduct: {
    color: '#EAF1FF',
    fontWeight: theme.weight.semibold,
    fontSize: theme.font.sm,
  },
  delayedMeta: {
    marginTop: 2,
    color: '#8EA4CC',
    fontSize: theme.font.xs,
  },
  delayedDays: {
    color: '#FCA5A5',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.sm,
    minWidth: 54,
    textAlign: 'right',
  },
  emptyText: {
    color: '#6F87B3',
    fontSize: 11,
    lineHeight: 16,
  },
  emptyTextCompact: {
    color: '#6F87B3',
    fontSize: 11,
    lineHeight: 15,
  },
  sectionQuietTag: {
    color: '#6F87B3',
    fontSize: 10,
    fontWeight: theme.weight.medium,
  },
  averageDelayedText: {
    color: '#8EA4CC',
    fontSize: 11,
    flexShrink: 1,
    marginTop: 2,
  },
  averageDelayedTextWithData: {
    color: '#9DB9EA',
    fontWeight: theme.weight.medium,
  },
});
