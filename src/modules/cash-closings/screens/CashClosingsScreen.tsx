import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AlertTriangle, ArrowRight, CircleDollarSign, Landmark, ReceiptText } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { Loader } from '@/components/ui/Loader';
import { RefreshHeader } from '@/components/RefreshHeader/RefreshHeader';
import { useRequireActiveWorkspaceContext } from '@/quarantine/legacy-domain/modules/workspace-directory/hooks/useRequireActiveWorkspaceContext';
import {
  useCashClosings,
  useCashClosingsDailySummary,
  useCreateCashClosing,
} from '../hooks/useCashClosings';
import {
  CASH_CLOSING_PERIOD_OPTIONS,
  useCashClosingsFilters,
} from '../hooks/useCashClosingsFilters';
import { theme } from '@/theme';
import { FilterChipField } from '@/components/FilterChipField/FilterChipField';
import { FilterSelectorModal } from '@/components/FilterSelectorModal/FilterSelectorModal';

function money(value: number) {
  return `$${Number(value || 0).toLocaleString('es-CO')}`;
}

function parseAmountInput(rawValue: string) {
  const onlyDigits = rawValue.replace(/\D/g, '');
  return onlyDigits.length ? Number(onlyDigits) : 0;
}

export default function CashClosingsScreen() {
  const navigation = useNavigation<any>();
  const activeWorkspaceContext = useRequireActiveWorkspaceContext();
  const workspaceId = activeWorkspaceContext?.workspace?.id;
  const filters = useCashClosingsFilters();

  const closingsQuery = useCashClosings(workspaceId, filters.period);
  const summaryQuery = useCashClosingsDailySummary(workspaceId);
  const createMutation = useCreateCashClosing(workspaceId);

  const [reportedInput, setReportedInput] = useState('');
  const [observations, setObservations] = useState('');

  const summary = summaryQuery.data;
  const history = closingsQuery.data || [];
  const alreadyClosed = Boolean(summary?.existingClosing);
  const reportedAmount = parseAmountInput(reportedInput);
  const expectedNetCop = Number(summary?.expectedNetCop || 0);
  const draftDifferenceCop = reportedAmount - expectedNetCop;

  const differenceTone = useMemo(() => {
    if (draftDifferenceCop > 0) return styles.diffPositive;
    if (draftDifferenceCop < 0) return styles.diffNegative;
    return styles.diffNeutral;
  }, [draftDifferenceCop]);

  async function refreshAll() {
    await Promise.all([closingsQuery.refetch(), summaryQuery.refetch()]);
  }

  async function submit() {
    if (!summary) return;

    if (!reportedInput.trim()) {
      Toast.show({ type: 'info', text1: 'Ingresa el valor reportado' });
      return;
    }

    if (Number.isNaN(reportedAmount) || reportedAmount < 0) {
      Toast.show({ type: 'info', text1: 'Ingresa un valor valido' });
      return;
    }

    try {
      await createMutation.mutateAsync({
        date: summary.dayKey,
        totalAmountCop: reportedAmount,
        reportedAmountCop: reportedAmount,
        observations: observations.trim() || undefined,
      });

      setReportedInput('');
      setObservations('');
      Toast.show({ type: 'success', text1: 'Cierre guardado', text2: 'La diferencia quedó registrada.' });
    } catch (error: any) {
      if (error?.response?.status === 409) {
        Toast.show({
          type: 'info',
          text1: 'Este día ya está cerrado',
          text2: 'Revisa el historial para validar la diferencia.',
        });
        return;
      }

      Toast.show({ type: 'error', text1: 'No se pudo guardar el cierre' });
    }
  }

  if ((summaryQuery.isLoading || closingsQuery.isLoading) && !summary && history.length === 0) {
    return (
      <MainLayout>
        <View style={styles.loaderWrap}>
          <Loader message="Preparando cierre de caja..." />
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <RefreshHeader
            title="Cierre de caja"
            subtitle={summary?.workspace?.name || 'Consolidación operativa del día'}
            icon={<CircleDollarSign size={18} color={theme.colors.accent} />}
            isFetching={summaryQuery.isFetching || closingsQuery.isFetching}
            onRefresh={refreshAll}
            helpKey="cash_closing_help"
          />

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Resumen del día según sistema</Text>

            <View style={styles.metricsGrid}>
              <Metric label="Ventas cobradas" value={summary?.summaryBreakdown?.salesCollectedCop || 0} />
              <Metric label="Abonos recibidos" value={summary?.summaryBreakdown?.salePaymentsCollectedCop || 0} />
              <Metric label="Otros ingresos" value={summary?.summaryBreakdown?.otherIncomeCop || 0} />
              <Metric label="Egresos del día" value={summary?.expectedExpenseCop || 0} tone="danger" />
            </View>

            <View style={styles.expectedRow}>
              <Text style={styles.expectedLabel}>Esperado por sistema</Text>
              <Text style={styles.expectedValue}>{money(expectedNetCop)}</Text>
            </View>

            <View style={styles.traceRow}>
              <TraceLink
                label="Ventas"
                onPress={() => navigation.navigate('Sales')}
              />
              <TraceLink
                label="Movimientos"
                onPress={() => navigation.navigate('Transactions')}
              />
              <TraceLink
                label="Compras"
                onPress={() => navigation.navigate('Purchases')}
              />
            </View>
          </View>

          <View style={styles.filtersTopRow}>
            <Text style={styles.filtersLabel}>Historial por periodo</Text>
            <Pressable
              onPress={filters.resetFilters}
              disabled={!filters.hasChanges}
              style={!filters.hasChanges ? styles.filterResetDisabled : undefined}
            >
              <Text style={styles.filterResetText}>Reiniciar</Text>
            </Pressable>
          </View>

          <FilterChipField
            label="Periodo"
            value={filters.selectedPeriod.label}
            onPress={filters.openPeriodModal}
          />

          {alreadyClosed ? (
            <View style={styles.closedCard}>
              <Text style={styles.closedTitle}>Este día ya está cerrado</Text>
              <Text style={styles.closedLine}>Reportado: {money(summary?.existingClosing?.reportedAmountCop || 0)}</Text>
              <Text style={styles.closedLine}>Diferencia: {money(summary?.existingClosing?.differenceCop || 0)}</Text>
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Registrar cierre</Text>

              <Text style={styles.inputLabel}>Valor reportado por negocio</Text>
              <TextInput
                value={reportedInput}
                onChangeText={setReportedInput}
                keyboardType="numeric"
                placeholder="Ej: 180000"
                placeholderTextColor="#7E94BE"
                style={styles.input}
              />

              <View style={[styles.differenceCard, differenceTone]}>
                <View style={styles.differenceHead}>
                  <AlertTriangle size={14} color="#D7E6FF" />
                  <Text style={styles.differenceTitle}>Diferencia actual</Text>
                </View>
                <Text style={styles.differenceValue}>{money(draftDifferenceCop)}</Text>
                <Text style={styles.differenceHint}>Esperado {money(expectedNetCop)} vs reportado {money(reportedAmount)}</Text>
              </View>

              <Text style={styles.inputLabel}>Observaciones</Text>
              <TextInput
                value={observations}
                onChangeText={setObservations}
                placeholder="Ej: ventas rápidas no registradas"
                placeholderTextColor="#7E94BE"
                style={[styles.input, styles.inputArea]}
                multiline
                scrollEnabled
                textAlignVertical="top"
              />

              <Pressable style={styles.submit} onPress={submit} disabled={createMutation.isPending}>
                <Text style={styles.submitText}>{createMutation.isPending ? 'Guardando...' : 'Guardar cierre'}</Text>
              </Pressable>
            </View>
          )}

          <Text style={styles.sectionTitle}>Historial</Text>

          {history.length > 0 ? history.map((item) => (
            <View key={item.id || `${item.dayKey}-${item.totalAmountCop}`} style={styles.historyRow}>
              <View>
                <Text style={styles.historyDate}>{item.dayKey}</Text>
                <Text style={styles.historySub}>Esperado {money(item.expectedNetCop || 0)}</Text>
              </View>
              <View style={styles.historyRight}>
                <Text style={styles.historyMain}>{money(item.reportedAmountCop ?? item.totalAmountCop)}</Text>
                <Text
                  style={[
                    styles.historyDiff,
                    (item.differenceCop || 0) > 0
                      ? styles.textSuccess
                      : (item.differenceCop || 0) < 0
                        ? styles.textDanger
                        : styles.textMuted,
                  ]}
                >
                  Dif. {money(item.differenceCop || 0)}
                </Text>
              </View>
            </View>
          )) : (
            <View style={styles.emptyCard}>
              <Landmark size={22} color="#7E94BE" />
              <Text style={styles.emptyTitle}>Sin cierres registrados</Text>
              <Text style={styles.emptySubtitle}>Cierra caja al final del día para dejar trazabilidad.</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <FilterSelectorModal
        visible={filters.isPeriodModalOpen}
        title="Periodo"
        value={filters.period}
        options={CASH_CLOSING_PERIOD_OPTIONS}
        onClose={filters.closePeriodModal}
        onChange={filters.selectPeriod}
      />
    </MainLayout>
  );
}

function Metric({ label, value, tone = 'normal' }: { label: string; value: number; tone?: 'normal' | 'danger' }) {
  return (
    <View style={styles.metricItem}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, tone === 'danger' ? styles.textDanger : styles.textPrimary]}>{money(value)}</Text>
    </View>
  );
}

function TraceLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.traceLink} onPress={onPress}>
      <ReceiptText size={13} color="#9FC0FF" />
      <Text style={styles.traceText}>{label}</Text>
      <ArrowRight size={13} color="#9FC0FF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xs,
    backgroundColor: theme.colors.background,
    gap: 10,
  },
  scrollContent: {
    gap: 10,
    paddingBottom: 36,
  },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    padding: 12,
    gap: 10,
  },
  cardTitle: {
    color: '#EAF1FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.bold,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricItem: {
    width: '48%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1A3158',
    backgroundColor: '#081632',
    paddingVertical: 8,
    paddingHorizontal: 9,
  },
  metricLabel: {
    color: '#8EA4CC',
    fontSize: theme.font.xs,
  },
  metricValue: {
    marginTop: 3,
    fontWeight: theme.weight.bold,
    fontSize: theme.font.sm,
  },
  expectedRow: {
    borderTopWidth: 1,
    borderColor: '#1A3158',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expectedLabel: {
    color: '#9FB4D8',
    fontSize: theme.font.xs,
  },
  expectedValue: {
    color: '#F0F6FF',
    fontSize: theme.font.lg,
    fontWeight: theme.weight.bold,
  },
  traceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  traceLink: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2A4E7D',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#10284F',
  },
  traceText: {
    color: '#CFE0FF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.medium,
  },
  inputLabel: {
    color: '#8EA4CC',
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#1F3765',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#DCE8FF',
    backgroundColor: '#081632',
  },
  inputArea: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  differenceCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    gap: 3,
  },
  differenceHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  differenceTitle: {
    color: '#D7E6FF',
    fontWeight: theme.weight.semibold,
    fontSize: theme.font.xs,
  },
  differenceValue: {
    color: '#F0F6FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
  },
  differenceHint: {
    color: '#AFC3E4',
    fontSize: 11,
  },
  diffPositive: {
    borderColor: '#1E7A56',
    backgroundColor: '#123F31',
  },
  diffNegative: {
    borderColor: '#8A3545',
    backgroundColor: '#3B1C26',
  },
  diffNeutral: {
    borderColor: '#2A4E7D',
    backgroundColor: '#132B50',
  },
  submit: {
    marginTop: 2,
    borderRadius: 10,
    backgroundColor: '#2E6BFF',
    paddingVertical: 10,
    alignItems: 'center',
  },
  submitText: {
    color: '#F0F6FF',
    fontWeight: theme.weight.bold,
  },
  closedCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2A4E7D',
    backgroundColor: '#10284F',
    padding: 12,
    gap: 5,
  },
  closedTitle: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.sm,
  },
  closedLine: {
    color: '#BFD2F1',
    fontSize: theme.font.xs,
  },
  sectionTitle: {
    color: '#9FB4D8',
    fontWeight: theme.weight.semibold,
    marginTop: 2,
  },
  filtersTopRow: {
    marginTop: 2,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filtersLabel: {
    color: '#7E94BE',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
    letterSpacing: 0.3,
  },
  filterResetText: {
    color: '#8FB8FF',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  filterResetDisabled: {
    opacity: 0.45,
  },
  historyRow: {
    borderWidth: 1,
    borderColor: '#1F3765',
    borderRadius: 10,
    backgroundColor: '#081632',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyDate: {
    color: '#E2EEFF',
    fontWeight: theme.weight.semibold,
  },
  historySub: {
    color: '#8EA4CC',
    marginTop: 2,
    fontSize: theme.font.xs,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyMain: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
  },
  historyDiff: {
    marginTop: 2,
    fontSize: theme.font.xs,
    fontWeight: theme.weight.medium,
  },
  emptyCard: {
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    color: '#C8D7F1',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.sm,
  },
  emptySubtitle: {
    color: '#8EA4CC',
    textAlign: 'center',
    fontSize: theme.font.xs,
  },
  textPrimary: {
    color: '#DCE8FF',
  },
  textMuted: {
    color: '#9FB4D8',
  },
  textSuccess: {
    color: '#4ADE80',
  },
  textDanger: {
    color: '#F87171',
  },
});
