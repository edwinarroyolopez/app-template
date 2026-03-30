import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Plus, Wallet } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import ImageViewerModal from '@/components/ui/ImageViewerModal';
import { FilterChipField } from '@/components/FilterChipField/FilterChipField';
import { FilterSelectorModal } from '@/components/FilterSelectorModal/FilterSelectorModal';
import { RefreshHeader } from '@/components/RefreshHeader/RefreshHeader';
import { theme } from '@/theme';
import { useTransactions } from '../hooks/useTransactions';
import { useTransactionsSummary } from '../hooks/useTransactionsSummary';
import {
  TRANSACTIONS_KIND_OPTIONS,
  TRANSACTIONS_PERIOD_OPTIONS,
  useTransactionsFilters,
} from '../hooks/useTransactionsFilters';
import { TransactionsSummaryCard } from '../components/TransactionsSummaryCard';
import { TransactionCard } from '../components/TransactionCard';
import { CreateTransactionModal } from '../components/CreateTransactionModal';
import { hasTransactionOriginNavigation, navigateToTransactionOrigin } from '../utils/transaction-origin-navigation';
import type { TransactionItem } from '../types/transaction.type';
import { TransactionDetailModal } from '../components/TransactionDetailModal';

export default function TransactionsScreen() {
  const navigation = useNavigation<any>();
  const filters = useTransactionsFilters();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewerImageUrl, setViewerImageUrl] = useState<string | undefined>(undefined);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionItem | null>(null);

  const { data = [], isFetching, refetch } = useTransactions({
    period: filters.period,
    kind: filters.kind,
  });

  const { data: summary } = useTransactionsSummary({
    period: filters.period,
    kind: filters.kind,
  });

  return (
    <MainLayout>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.pageTitle}>Transacciones</Text>
            <Text style={styles.pageSubtitle}>Flujo claro de dinero del negocio</Text>
          </View>

          <Pressable style={styles.fabBtn} onPress={() => setShowCreateModal(true)}>
            <Plus size={18} color="#F0F6FF" />
          </Pressable>
        </View>

        <View style={styles.toolsRow}>
          <RefreshHeader hideTitleSection isFetching={isFetching} onRefresh={refetch} helpKey="transactions_help" />
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
          <FilterChipField label="Periodo" value={filters.selectedPeriod.label} onPress={filters.openPeriodModal} />
          <FilterChipField label="Tipo" value={filters.selectedKind.label} onPress={filters.openKindModal} />
        </View>

        <TransactionsSummaryCard
          incomeCop={summary?.incomeCop || 0}
          expenseCop={summary?.expenseCop || 0}
          netCop={summary?.netCop || 0}
          movementCount={summary?.movementCount || 0}
        />

        <FlatList
          style={styles.list}
          data={data as TransactionItem[]}
          keyExtractor={(item) => item.id}
          refreshing={isFetching}
          onRefresh={refetch}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Wallet size={24} color="#7E94BE" />
              <Text style={styles.emptyTitle}>Sin movimientos en este rango</Text>
              <Text style={styles.emptySubtitle}>Prueba otro filtro o registra un movimiento manual.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TransactionCard
              item={item}
              onViewDetail={() => setSelectedTransaction(item)}
              onViewProof={
                item.manualProof?.url
                  ? () => setViewerImageUrl(item.manualProof?.url)
                  : undefined
              }
            />
          )}
        />
      </View>

      <FilterSelectorModal
        visible={filters.isPeriodModalOpen}
        title="Periodo"
        value={filters.period}
        options={TRANSACTIONS_PERIOD_OPTIONS}
        onClose={filters.closePeriodModal}
        onChange={filters.selectPeriod}
      />

      <FilterSelectorModal
        visible={filters.isKindModalOpen}
        title="Tipo de movimiento"
        value={filters.kind}
        options={TRANSACTIONS_KIND_OPTIONS}
        onClose={filters.closeKindModal}
        onChange={filters.selectKind}
      />

      <CreateTransactionModal visible={showCreateModal} onClose={() => setShowCreateModal(false)} />

      <TransactionDetailModal
        visible={!!selectedTransaction}
        item={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onViewProof={
          selectedTransaction?.manualProof?.url
            ? () => setViewerImageUrl(selectedTransaction.manualProof?.url)
            : undefined
        }
        onOpenOrigin={
          selectedTransaction && hasTransactionOriginNavigation(selectedTransaction)
            ? () => {
                navigateToTransactionOrigin(navigation, selectedTransaction);
                setSelectedTransaction(null);
              }
            : undefined
        }
      />

      <ImageViewerModal
        visible={!!viewerImageUrl}
        imageUrl={viewerImageUrl}
        onClose={() => setViewerImageUrl(undefined)}
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
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  filterResetText: {
    color: '#8FB8FF',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  filterResetDisabled: {
    opacity: 0.45,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  emptyCard: {
    marginTop: 20,
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
});
