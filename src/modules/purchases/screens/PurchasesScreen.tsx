import React, { useMemo, useRef, useState } from 'react';
import { Animated, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CheckCircle2, Clock3, Hourglass, Plus, RefreshCw, Search, TriangleAlert } from 'lucide-react-native';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { FilterChipField } from '@/components/FilterChipField/FilterChipField';
import { FilterSelectorModal } from '@/components/FilterSelectorModal/FilterSelectorModal';
import { theme } from '@/theme';
import { usePurchases } from '../hooks/usePurchases';
import { PurchaseInvoiceWizardModal } from '../components/PurchaseInvoiceWizardModal';
import { groupPurchasesByInvoice, shortInvoiceId } from '../utils/purchaseInvoices';
import type { Purchase, PurchaseStatus } from '../types/purchase.type';
import {
  PURCHASES_PERIOD_OPTIONS,
  PURCHASES_STATUS_OPTIONS,
  usePurchasesFilters,
} from '../hooks/usePurchasesFilters';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

function formatAmount(value: number) {
  return `$${(value || 0).toLocaleString('es-CO')}`;
}

function formatDate(value?: string) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
}

function getStatusUI(status: PurchaseStatus) {
  if (status === 'PAGADA') return { text: 'PAGADA', color: '#22C55E', bg: '#0B2B25', icon: CheckCircle2 };
  if (status === 'VENCIDA') return { text: 'VENCIDA', color: '#EF4444', bg: '#35121B', icon: TriangleAlert };
  return { text: 'PENDIENTE', color: '#F8C74A', bg: '#2E2412', icon: Clock3 };
}

export default function PurchasesScreen() {
  const navigation = useNavigation<any>();
  const filters = usePurchasesFilters();
  const normalizedSearch = filters.search.trim();
  const debouncedSearch = useDebouncedValue(normalizedSearch, 300);
  const searchQuery = debouncedSearch.length >= 2 ? debouncedSearch : undefined;
  const { data: purchases = [], isFetching, refetch } = usePurchases({
    period: filters.period,
    status: filters.status,
    q: searchQuery,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const refreshRotate = useRef(new Animated.Value(0)).current;

  const invoices = useMemo(() => groupPurchasesByInvoice(purchases as Purchase[]), [purchases]);
  const pendingCount = invoices.filter((item) => item.status !== 'PAGADA').length;
  const paidCount = invoices.length - pendingCount;
  const pendingAmount = invoices
    .filter((item) => item.status !== 'PAGADA')
    .reduce((acc, item) => acc + (item.remainingAmountCop || 0), 0);
  const paidAmount = invoices
    .filter((item) => item.status === 'PAGADA')
    .reduce((acc, item) => acc + (item.paidAmountCop || item.totalAmount || 0), 0);

  const refreshRotateDeg = refreshRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '170deg'],
  });

  function onRefreshPressIn() {
    Animated.timing(refreshRotate, {
      toValue: 1,
      duration: 170,
      useNativeDriver: true,
    }).start();
  }

  function onRefreshPressOut() {
    Animated.timing(refreshRotate, {
      toValue: 0,
      duration: 190,
      useNativeDriver: true,
    }).start();
  }

  return (
    <MainLayout>
      <View style={styles.container}>
        <FlatList
          data={invoices}
          keyExtractor={(item) => item.invoiceKey}
          contentContainerStyle={styles.content}
          ListHeaderComponent={
            <>
              <View style={styles.heroTopRow}>
                <View style={styles.heroMain}>
                  <Text style={styles.heroTitle}>Facturas de compra</Text>
                  <Text style={styles.heroSubtitle}>Controla proveedores y pagos por factura.</Text>
                </View>

                <Pressable style={styles.fabBtn} onPress={() => setShowCreateModal(true)}>
                  <Plus size={18} color="#F0F6FF" />
                </Pressable>
              </View>

              <View style={styles.summaryRow}>
                <View style={[styles.summaryChip, styles.summaryChipPending]}>
                  <View style={styles.summaryTopRow}>
                    <Hourglass size={14} color="#F8C74A" />
                    <Text style={styles.summaryLabel}>PENDIENTES</Text>
                  </View>
                  <View style={styles.summaryMainRow}>
                    <Text style={styles.summaryMoney}>{formatAmount(pendingAmount)}</Text>
                    <Text style={styles.summaryCount}>{pendingCount}</Text>
                  </View>
                </View>
                <View style={[styles.summaryChip, styles.summaryChipPaid]}>
                  <View style={styles.summaryTopRow}>
                    <CheckCircle2 size={14} color="#22C55E" />
                    <Text style={styles.summaryLabel}>PAGADAS</Text>
                  </View>
                  <View style={styles.summaryMainRow}>
                    <Text style={styles.summaryMoney}>{formatAmount(paidAmount)}</Text>
                    <Text style={styles.summaryCount}>{paidCount}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.exploreBlock}>
                <View style={styles.searchWrap}>
                  <Search size={15} color="#8EA4CC" />
                  <TextInput
                    value={filters.search}
                    onChangeText={filters.setSearch}
                    placeholder="Buscar proveedor o telefono"
                    placeholderTextColor="#6F87B3"
                    style={styles.searchInput}
                  />
                  {filters.search.trim().length > 0 ? (
                    <Pressable onPress={() => filters.setSearch('')}>
                      <Text style={styles.searchClearText}>Limpiar</Text>
                    </Pressable>
                  ) : null}
                </View>

                {normalizedSearch.length > 0 && normalizedSearch.length < 2 ? (
                  <Text style={styles.searchHint}>Escribe al menos 2 caracteres para buscar.</Text>
                ) : null}

                <View style={styles.filterRow}>
                  <FilterChipField label="Periodo" value={filters.selectedPeriod.label} onPress={filters.openPeriodModal} />
                  <FilterChipField label="Estado" value={filters.selectedStatus.label} onPress={filters.openStatusModal} />
                </View>

                <View style={styles.filterActionsRow}>
                  <Text style={styles.filterHint}>{invoices.length} facturas</Text>
                  <Pressable
                    onPress={filters.resetFilters}
                    disabled={!filters.hasChanges}
                    style={!filters.hasChanges ? styles.filterResetDisabled : undefined}
                  >
                    <Text style={styles.filterResetText}>Reiniciar filtros</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.listHeaderRow}>
                <Text style={styles.listTitle}>Facturas</Text>
                <Pressable
                  onPress={() => refetch()}
                  onPressIn={onRefreshPressIn}
                  onPressOut={onRefreshPressOut}
                  style={[styles.refreshBtn, isFetching && styles.refreshBtnDisabled]}
                >
                  <Animated.View style={{ transform: [{ rotate: refreshRotateDeg }] }}>
                    <RefreshCw size={14} color="#8EA4CC" />
                  </Animated.View>
                </Pressable>
              </View>
            </>
          }
          renderItem={({ item }) => {
            const statusUI = getStatusUI(item.status);
            const StatusIcon = statusUI.icon;

            return (
              <Pressable
                style={styles.invoiceCard}
                onPress={() => navigation.navigate('PurchaseInvoiceDetail', { invoiceKey: item.invoiceKey })}
              >
                <View style={[styles.statusIconWrap, { backgroundColor: statusUI.bg }]}>
                  <StatusIcon size={16} color={statusUI.color} />
                </View>

                <View style={styles.invoiceMain}>
                  <Text style={styles.providerText} numberOfLines={2}>{item.provider || 'Proveedor sin nombre'}</Text>
                  <Text style={styles.idText} numberOfLines={1}>#{shortInvoiceId(item.invoiceKey)}</Text>
                  <Text style={styles.metaText} numberOfLines={1}>
                    {formatDate(item.invoiceDate)} • {item.lineCount} productos
                  </Text>
                </View>

                <View style={styles.invoiceRight}>
                  <Text style={styles.amountText} numberOfLines={1}>{formatAmount(item.totalAmount)}</Text>
                  <View style={[styles.statusPill, { backgroundColor: statusUI.bg }]}> 
                    <Text style={[styles.statusPillText, { color: statusUI.color }]}>{statusUI.text}</Text>
                  </View>
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'Sin resultados para tu busqueda' : 'Aun no tienes facturas'}
              </Text>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? 'Prueba otro nombre, telefono o ajusta los filtros.'
                  : 'Registra tu primera factura para empezar a controlar compras.'}
              </Text>
              {!searchQuery ? (
                <Pressable style={styles.emptyBtn} onPress={() => setShowCreateModal(true)}>
                  <Text style={styles.emptyBtnText}>Crear primera factura</Text>
                </Pressable>
              ) : null}
            </View>
          }
        />

        <PurchaseInvoiceWizardModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSaved={() => refetch()}
        />

        <FilterSelectorModal
          visible={filters.isPeriodModalOpen}
          title="Periodo"
          value={filters.period}
          options={PURCHASES_PERIOD_OPTIONS}
          density="compact"
          showOptionIcon={false}
          onClose={filters.closePeriodModal}
          onChange={filters.selectPeriod}
        />

        <FilterSelectorModal
          visible={filters.isStatusModalOpen}
          title="Estado"
          value={filters.status}
          options={PURCHASES_STATUS_OPTIONS}
          density="compact"
          showOptionIcon={false}
          onClose={filters.closeStatusModal}
          onChange={filters.selectStatus}
        />
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#081226' },
  content: { padding: 16, paddingBottom: 30, gap: 8 },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  heroMain: { gap: 2, flex: 1, paddingRight: 10 },
  heroTitle: { color: '#EAF1FF', fontSize: theme.font.lg, fontWeight: theme.weight.bold },
  heroSubtitle: { color: '#8EA4CC', fontSize: theme.font.xs, lineHeight: 16 },
  fabBtn: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: '#2C64E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryRow: { flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 6 },
  summaryChip: {
    flex: 1,
    borderRadius: 11,
    borderWidth: 1,
    minHeight: 50,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  summaryChipPending: { borderColor: '#7A6026', backgroundColor: '#2E2412' },
  summaryChipPaid: { borderColor: '#1F6F59', backgroundColor: '#0B2B25' },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryLabel: { color: '#AFC3E6', fontSize: 11, letterSpacing: 0.3, fontWeight: theme.weight.semibold },
  summaryMainRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  summaryMoney: { color: '#F0F6FF', fontSize: theme.font.sm, textAlign: 'right', fontWeight: theme.weight.bold },
  summaryCount: {
    color: '#9FB0CF',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  exploreBlock: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A3761',
    backgroundColor: '#0A1835',
    padding: 9,
    gap: 7,
    marginBottom: 2,
  },
  searchWrap: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#274A7A',
    backgroundColor: '#112340',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#DCE8FF',
  },
  searchClearText: {
    color: '#89AFEE',
    fontSize: 11,
    fontWeight: theme.weight.medium,
  },
  searchHint: {
    marginTop: -1,
    color: '#6F87B3',
    fontSize: 11,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  filterActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 1,
  },
  filterHint: {
    color: '#6F87B3',
    fontSize: 11,
  },
  filterResetText: {
    color: '#89AFEE',
    fontSize: 11,
    fontWeight: theme.weight.medium,
  },
  filterResetDisabled: {
    opacity: 0.45,
  },
  listHeaderRow: { marginTop: 6, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listTitle: { color: '#DCE8FF', fontWeight: theme.weight.semibold, fontSize: theme.font.sm },
  refreshBtn: {
    width: 26,
    height: 26,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshBtnDisabled: {
    opacity: 0.6,
  },
  invoiceCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#16365F',
    backgroundColor: '#0A1D39',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    opacity: 0.82,
  },
  invoiceMain: { flex: 1 },
  providerText: { color: '#EAF1FF', fontWeight: theme.weight.bold, fontSize: theme.font.sm, lineHeight: 19 },
  idText: { color: '#8FAFE4', marginTop: 1, fontSize: 11, fontWeight: theme.weight.semibold },
  metaText: { color: '#8397BA', marginTop: 1, fontSize: theme.font.xs },
  invoiceRight: { alignItems: 'flex-end', gap: 5, maxWidth: 118 },
  amountText: { color: '#F0F6FF', fontWeight: theme.weight.bold, fontSize: theme.font.sm },
  statusPill: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  statusPillText: { fontSize: 10, fontWeight: theme.weight.bold },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#16315E',
    backgroundColor: '#08182F',
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: { color: '#EAF1FF', fontSize: theme.font.md, fontWeight: theme.weight.bold },
  emptyText: { color: '#9FB0CF', textAlign: 'center', lineHeight: 18, fontSize: theme.font.sm },
  emptyBtn: {
    marginTop: 6,
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E6BFF',
  },
  emptyBtnText: { color: '#F0F6FF', fontWeight: theme.weight.bold, fontSize: theme.font.xs },
});
