import React from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Search, Star, UserPlus } from 'lucide-react-native';

import { Input } from '@/components/ui/Input';
import { theme } from '@/theme';
import type { Provider } from '../types/provider.type';

type Props = {
  visible: boolean;
  searchValue: string;
  providers: Provider[];
  onSearchChange: (value: string) => void;
  onClose: () => void;
  onSelect: (provider: Provider) => void;
  onCreateRequest: (nameSeed: string) => void;
};

export function PurchaseProviderSelectorModal({
  visible,
  searchValue,
  providers,
  onSearchChange,
  onClose,
  onSelect,
  onCreateRequest,
}: Props) {
  const trimmedSearch = searchValue.trim();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={8}>
              <ArrowLeft size={20} color={theme.colors.textPrimary} />
            </Pressable>
            <View style={styles.headerTextWrap}>
              <Text style={styles.headerTitle}>Seleccionar proveedor</Text>
              <Text style={styles.headerSubtitle}>Busca y elige. Si no existe, crealo al instante.</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.content}>
            <View style={styles.searchWrap}>
              <Search size={16} color="#8EA4CC" />
              <Input
                value={searchValue}
                onChangeText={onSearchChange}
                placeholder="Buscar por nombre"
                style={styles.searchInput}
              />
            </View>

            <Pressable
              style={[styles.createSeedBtn, !trimmedSearch && styles.createSeedBtnDisabled]}
              onPress={() => trimmedSearch && onCreateRequest(trimmedSearch)}
              disabled={!trimmedSearch}
            >
              <UserPlus size={15} color={trimmedSearch ? '#9FC0FF' : '#627DAA'} />
              <Text style={[styles.createSeedText, !trimmedSearch && styles.createSeedTextDisabled]} numberOfLines={1}>
                {trimmedSearch ? `Crear proveedor "${trimmedSearch}"` : 'Escribe un nombre para crear proveedor'}
              </Text>
            </Pressable>

            <FlatList
              data={providers}
              keyExtractor={(item) => String(item._id || item.id || item.name)}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <Pressable style={styles.providerCard} onPress={() => onSelect(item)}>
                  <Text style={styles.providerName} numberOfLines={2}>{item.name}</Text>
                  <View style={styles.ratingBadge}>
                    <Star size={12} color="#FBBF24" />
                    <Text style={styles.ratingText}>{item.rating || 3}</Text>
                  </View>
                </Pressable>
              )}
              ListEmptyComponent={
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>{trimmedSearch ? 'Sin coincidencias' : 'No hay proveedores'}</Text>
                  <Text style={styles.emptyText}>
                    {trimmedSearch
                      ? 'Ajusta la busqueda o crea este proveedor con el boton superior.'
                      : 'Crea tu primer proveedor para continuar con la factura.'}
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#08142D',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: '#1F3765',
    maxHeight: '85%',
  },
  header: {
    minHeight: 64,
    borderBottomWidth: 1,
    borderColor: '#1A2D52',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  headerTextWrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headerTitle: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
    textAlign: 'center',
  },
  headerSubtitle: {
    marginTop: 2,
    color: '#8EA4CC',
    fontSize: theme.font.xs,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 20,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#274A7A',
    backgroundColor: '#112340',
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  createSeedBtn: {
    marginTop: 8,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#29517E',
    backgroundColor: '#143052',
    paddingHorizontal: 11,
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  createSeedBtnDisabled: {
    borderColor: '#27406A',
    backgroundColor: '#10233F',
  },
  createSeedText: {
    flex: 1,
    color: '#9FC0FF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  createSeedTextDisabled: {
    color: '#6D86B1',
  },
  listContent: {
    marginTop: 10,
    gap: 8,
    paddingBottom: 4,
  },
  providerCard: {
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#274A7A',
    backgroundColor: '#112340',
    minHeight: 48,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  providerName: {
    flex: 1,
    color: '#EAF1FF',
    fontWeight: theme.weight.semibold,
    fontSize: theme.font.sm,
    lineHeight: 19,
    paddingVertical: 5,
  },
  emptyCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#274A7A',
    backgroundColor: '#102340',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  emptyTitle: {
    color: '#DCE8FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 4,
    color: '#8EA4CC',
    fontSize: theme.font.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
  ratingBadge: {
    minWidth: 34,
    height: 22,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#7A6026',
    backgroundColor: '#2E2412',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    marginTop: 12,
  },
  ratingText: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: theme.weight.bold,
  },
});
