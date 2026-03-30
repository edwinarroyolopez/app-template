import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ArrowLeft, Search, SlidersHorizontal } from 'lucide-react-native';

import { theme } from '@/theme';
import { useProducts } from '@/modules/products/hooks/useProducts';
import { ProductCard } from '@/modules/products/components/ProductCard';

type ProductOption = {
  _id: string;
  name: string;
  image?: string;
  sku?: string;
  stock: number;
  minStock?: number;
  salePrice: number;
};

type Props = {
  visible: boolean;
  selectedProductId?: string;
  onClose: () => void;
  onSelect: (product: ProductOption) => void;
};

type ProductFilter = 'ALL' | 'HIGH' | 'LOW' | 'FAVORITE';

const FILTER_OPTIONS: Array<{ key: ProductFilter; label: string }> = [
  { key: 'ALL', label: 'Todos' },
  { key: 'HIGH', label: 'Stock Alto' },
  { key: 'LOW', label: 'Stock Bajo' },
  { key: 'FAVORITE', label: 'Favoritos' },
];

export function ProductSelectorModal({ visible, selectedProductId, onClose, onSelect }: Props) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ProductFilter>('ALL');

  const searchQuery = search.trim().length >= 2 ? search.trim() : undefined;
  const { data: products = [], isFetching, refetch } = useProducts(searchQuery, { stockFilter: filter });

  const helperText = useMemo(() => {
    if (search.trim().length === 0) return 'Selecciona un producto de tu inventario.';
    if (search.trim().length < 2) return 'Escribe al menos 2 caracteres para buscar.';
    return `Resultados para "${search.trim()}"`;
  }, [search]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={8}>
            <ArrowLeft size={20} color={theme.colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Seleccionar producto</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.searchWrap}>
            <Search size={16} color="#8EA4CC" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por nombre o SKU..."
              placeholderTextColor="#6F87B3"
              style={styles.searchInput}
            />
            <SlidersHorizontal size={15} color="#8EA4CC" />
          </View>

          <View style={styles.filtersRow}>
            {FILTER_OPTIONS.map((option) => {
              const active = filter === option.key;
              return (
                <Pressable
                  key={option.key}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setFilter(option.key)}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.helperText}>{helperText}</Text>

          {isFetching && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={theme.colors.accent} />
              <Text style={styles.loadingText}>Actualizando productos...</Text>
            </View>
          )}

          <FlatList
            data={products as any[]}
            keyExtractor={(item) => item._id}
            refreshing={isFetching}
            onRefresh={refetch}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>No hay productos disponibles.</Text>}
            renderItem={({ item }) => {
              const active = selectedProductId === item._id;

              return (
                <ProductCard
                  product={item}
                  selected={active}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                />
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08142D',
  },
  header: {
    height: 56,
    borderBottomWidth: 1,
    borderColor: '#1A2D52',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
  },
  headerSpacer: {
    width: 20,
  },
  content: {
    padding: 16,
    flex: 1,
  },
  searchWrap: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#DCE8FF',
  },
  helperText: {
    marginTop: 6,
    marginBottom: 10,
    color: '#8EA4CC',
    fontSize: theme.font.xs,
  },
  filtersRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    borderColor: '#2E6BFF',
    backgroundColor: '#1B3F8A',
  },
  filterChipText: {
    color: '#8EA4CC',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  filterChipTextActive: {
    color: '#EAF1FF',
  },
  loadingRow: {
    marginTop: -2,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#8EA4CC',
    fontSize: 11,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyText: {
    color: '#8EA4CC',
    textAlign: 'center',
    marginTop: 20,
  },
});
