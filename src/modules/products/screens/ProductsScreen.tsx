import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Plus, Search } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { theme } from '@/theme';
import { useProducts } from '../hooks/useProducts';
import { CreateProductModal } from '../components/CreateProductModal';
import { ProductCard } from '../components/ProductCard';

export default function ProductsScreen() {
  const navigation = useNavigation<any>();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState('');

  const searchQuery = search.trim().length >= 2 ? search.trim() : undefined;
  const { data: products = [], isFetching, refetch } = useProducts(searchQuery);

  const helperText = useMemo(() => {
    if (search.trim().length === 0) return null;
    if (search.trim().length < 2) return 'Escribe al menos 2 caracteres para filtrar.';
    return `Resultados para "${search.trim()}"`;
  }, [search]);

  return (
    <MainLayout>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Productos</Text>

          <Pressable style={styles.fabBtn} onPress={() => setShowCreateModal(true)}>
            <Plus size={18} color="#F0F6FF" />
          </Pressable>
        </View>

        <View style={styles.searchWrap}>
          <Search size={16} color="#8EA4CC" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar producto"
            placeholderTextColor="#6F87B3"
            style={styles.searchInput}
          />
        </View>

        {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}

        <FlatList
          data={products as any[]}
          keyExtractor={(item) => item._id || item.id}
          refreshing={isFetching}
          onRefresh={refetch}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No hay productos</Text>
              <Text style={styles.emptySubtitle}>Crea el primero para empezar el control de inventario.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const itemId = item._id || item.id;

            return (
              <ProductCard
                product={item}
                onPress={() => navigation.navigate('ProductDetail', { productId: itemId })}
              />
            );
          }}
        />

        <CreateProductModal visible={showCreateModal} onClose={() => setShowCreateModal(false)} />
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: '#081226',
  },
  title: {
    color: '#EAF1FF',
    fontSize: theme.font.xl,
    fontWeight: theme.weight.bold,
  },
  headerRow: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fabBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#2E6BFF',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#7D93BC',
    fontSize: 11,
  },
  listContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  emptyCard: {
    marginTop: 60,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    padding: 14,
  },
  emptyTitle: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
  },
  emptySubtitle: {
    marginTop: 4,
    color: '#9FB0CF',
    fontSize: theme.font.sm,
  },
});
