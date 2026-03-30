import React from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Search } from 'lucide-react-native';

import { theme } from '@/theme';

type ProductLite = {
  _id: string;
  name: string;
  sku?: string;
  stock?: number;
};

type Props = {
  visible: boolean;
  searchValue: string;
  products: ProductLite[];
  onSearchChange: (value: string) => void;
  onClose: () => void;
  onSelect: (product: ProductLite) => void;
};

export function PurchaseInvoiceProductSelectorModal({
  visible,
  searchValue,
  products,
  onSearchChange,
  onClose,
  onSelect,
}: Props) {
  const hasSearch = searchValue.trim().length > 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.headerWrap}>
            <Text style={styles.title}>Seleccionar producto</Text>
            <Text style={styles.subtitle}>Busca por nombre o SKU y toca para agregarlo.</Text>
          </View>

          <View style={styles.searchInputWrap}>
            <Search size={14} color="#8EA4CC" />
            <TextInput
              value={searchValue}
              onChangeText={onSearchChange}
              placeholder="Buscar por nombre o SKU"
              placeholderTextColor="#6F87B3"
              style={styles.searchInput}
            />
          </View>

          <FlatList
            data={products}
            keyExtractor={(item) => item._id}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable style={styles.item} onPress={() => onSelect(item)}>
                <View style={styles.itemTopRow}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                  <View style={styles.stockBadge}>
                    <Text style={styles.stockLabel}>Stock</Text>
                    <Text style={styles.stockValue}>{item.stock ?? 0}</Text>
                  </View>
                </View>
                <View style={styles.itemMetaRow}>
                  <Text style={styles.itemSku} numberOfLines={1}>SKU: {item.sku || '--'}</Text>
                </View>
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyTitle}>{hasSearch ? 'No hay coincidencias' : 'No hay productos disponibles'}</Text>
                <Text style={styles.emptyHint}>
                  {hasSearch ? 'Prueba con otro nombre o SKU para encontrarlo.' : 'Agrega productos al inventario para poder seleccionarlos.'}
                </Text>
              </View>
            }
          />

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Cerrar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  card: {
    backgroundColor: '#091A35',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: '#16315E',
    padding: 14,
    maxHeight: '74%',
  },
  headerWrap: {
    marginBottom: 8,
    gap: 3,
  },
  title: { color: '#EAF1FF', fontWeight: theme.weight.bold, fontSize: theme.font.md },
  subtitle: { color: '#8EA4CC', fontSize: theme.font.xs },
  searchInputWrap: {
    height: 42,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#2A4F7F',
    backgroundColor: '#132A4C',
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: { flex: 1, color: '#DDE8FF', fontSize: theme.font.sm },
  list: { marginTop: 10 },
  item: {
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#274A7A',
    backgroundColor: '#112340',
    paddingHorizontal: 11,
    paddingVertical: 10,
    marginBottom: 8,
    gap: 7,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  itemName: {
    flex: 1,
    color: '#EAF1FF',
    fontWeight: theme.weight.semibold,
    fontSize: theme.font.sm,
    lineHeight: 19,
  },
  stockBadge: {
    minWidth: 56,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#2E5A91',
    backgroundColor: '#18365E',
    paddingVertical: 4,
    paddingHorizontal: 7,
    alignItems: 'center',
  },
  stockLabel: {
    color: '#9FB4D9',
    fontSize: 10,
  },
  stockValue: {
    color: '#D8E7FF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.bold,
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  itemSku: {
    flex: 1,
    color: '#95A9CC',
    fontSize: theme.font.xs,
  },
  emptyWrap: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#274A7A',
    backgroundColor: '#102340',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginTop: 2,
  },
  emptyTitle: {
    color: '#DCE8FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
    textAlign: 'center',
  },
  emptyHint: {
    marginTop: 4,
    color: '#8FA5C9',
    fontSize: theme.font.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
  closeBtn: {
    marginTop: 4,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#11233F',
    borderWidth: 1,
    borderColor: '#274A7A',
  },
  closeText: { color: '#9FC0FF', fontWeight: theme.weight.semibold, fontSize: theme.font.xs },
});
