import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, TextInput } from 'react-native';
import { Plus, Search, Wallet } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { RefreshHeader } from '@/components/RefreshHeader/RefreshHeader';
import { useSales } from '../hooks/useSales';
import { theme } from '@/theme';
import { RegisterSaleModal } from '../components/RegisterSaleModal';
import { SaleCard } from '../components/SaleCard';
import type { Sale } from '../types/sale.type';
import { ActionLoader } from '@/components/ui/ActionLoader';
import { useDailyDelayedReview } from '../hooks/useDailyDelayedReview';
import { FilterChipField } from '@/components/FilterChipField/FilterChipField';
import { FilterSelectorModal } from '@/components/FilterSelectorModal/FilterSelectorModal';
import {
  SALES_PAYMENT_STATE_OPTIONS,
  SALES_PERIOD_OPTIONS,
  useSalesFilters,
} from '../hooks/useSalesFilters';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export default function SalesScreen() {
  const navigation = useNavigation<any>();
  const filters = useSalesFilters();
  const normalizedSearch = filters.search.trim();
  const debouncedSearch = useDebouncedValue(normalizedSearch, 300);
  const searchQuery = debouncedSearch.length >= 2 ? debouncedSearch : undefined;
  const { data = [], isFetching, refetch } = useSales({
    period: filters.period,
    paymentState: filters.paymentState,
    q: searchQuery,
  });
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { runDailyReview, isReviewing } = useDailyDelayedReview();

  React.useEffect(() => {
    runDailyReview();
  }, [runDailyReview]);

  const sales = useMemo<(Sale & { id: string })[]>(() => {
    return (data as any[]).map((sale) => ({
      ...sale,
      id: sale.id || sale._id,
    }));
  }, [data]);

  return (
    <MainLayout>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.pageTitle}>Ventas</Text>
            <Text style={styles.pageSubtitle}>Registra y revisa ventas activas</Text>
          </View>

          <Pressable style={styles.fabBtn} onPress={() => setShowRegisterModal(true)}>
            <Plus size={18} color="#F0F6FF" />
          </Pressable>
        </View>

        <View style={styles.toolsRow}>
          <RefreshHeader
            hideTitleSection
            isFetching={isFetching}
            onRefresh={refetch}
            helpKey="sales_help"
          />
        </View>

        <View style={styles.filtersTopRow}>
          <Text style={styles.filtersLabel}>Filtros</Text>
          <Pressable
            onPress={filters.resetFilters}
            disabled={!filters.hasChanges}
            style={!filters.hasChanges ? styles.filterResetDisabled : undefined}
          >
            <Text style={styles.filterResetText}>Reiniciar</Text>
          </Pressable>
        </View>

        <View style={styles.filterRow}>
          <FilterChipField
            label="Periodo"
            value={filters.selectedPeriod.label}
            onPress={filters.openPeriodModal}
          />

          <FilterChipField
            label="Estado"
            value={filters.selectedPaymentState.label}
            onPress={filters.openStateModal}
          />
        </View>

        <View style={styles.searchWrap}>
          <Search size={15} color="#8EA4CC" />
          <TextInput
            value={filters.search}
            onChangeText={filters.setSearch}
            placeholder="Buscar cliente o telefono"
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

        <FlatList
          style={styles.list}
          refreshing={isFetching}
          onRefresh={refetch}
          data={sales}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={<View style={styles.listHeaderSpacer} />}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Wallet size={24} color="#7E94BE" />
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'Sin resultados para tu busqueda' : 'Aun no hay ventas registradas'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Prueba otro nombre, telefono o ajusta los filtros.'
                  : 'Registra tu primera venta para iniciar el historial.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <SaleCard
              sale={item}
              onViewDetail={() => navigation.navigate('SaleDetail', { saleId: item.id })}
            />
          )}
        />

        <RegisterSaleModal visible={showRegisterModal} onClose={() => setShowRegisterModal(false)} />

        <FilterSelectorModal
          visible={filters.isPeriodModalOpen}
          title="Periodo"
          value={filters.period}
          options={SALES_PERIOD_OPTIONS}
          onClose={filters.closePeriodModal}
          onChange={filters.selectPeriod}
        />

        <FilterSelectorModal
          visible={filters.isStateModalOpen}
          title="Estado"
          value={filters.paymentState}
          options={SALES_PAYMENT_STATE_OPTIONS}
          onClose={filters.closeStateModal}
          onChange={filters.selectPaymentState}
        />
      </View>

      <ActionLoader
        visible={isReviewing}
        steps={[
          'Revisando pedidos atrasados...',
          'Sincronizando pedidos atrasados...',
          'Actualizando prioridades...',
          'Finalizando revision...',
        ]}
      />
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
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  fabBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolsRow: {
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  filtersTopRow: {
    marginBottom: 5,
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
  listContent: {
    paddingTop: 0,
    paddingBottom: 20,
    flexGrow: 1,
  },
  list: {
    flex: 1,
  },
  listHeaderSpacer: {
    height: 2,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  searchWrap: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  searchInput: {
    flex: 1,
    color: '#DCE8FF',
  },
  searchClearText: {
    color: '#8FB8FF',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  searchHint: {
    marginTop: -2,
    marginBottom: 6,
    color: '#7D93BC',
    fontSize: 11,
  },
  filterResetText: {
    color: '#8FB8FF',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  filterResetDisabled: {
    opacity: 0.45,
  },
  emptyCard: {
    marginTop: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 15,
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
