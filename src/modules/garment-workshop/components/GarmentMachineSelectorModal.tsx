import React from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Search, Settings2, Wrench } from 'lucide-react-native';

import { Input } from '@/components/ui/Input';
import { theme } from '@/theme';

type Machine = {
  _id: string;
  name: string;
  code?: string;
};

type Props = {
  visible: boolean;
  searchValue: string;
  machines: Machine[];
  onSearchChange: (value: string) => void;
  onClose: () => void;
  onSelect: (machine: Machine | null) => void;
  onCreateRequest: (nameSeed: string) => void;
};

export function GarmentMachineSelectorModal({
  visible,
  searchValue,
  machines,
  onSearchChange,
  onClose,
  onSelect,
  onCreateRequest,
}: Props) {
  const term = searchValue.trim().toLowerCase();
  const filtered = term
    ? machines.filter((item) => item.name.toLowerCase().includes(term))
    : machines;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={8}>
              <ArrowLeft size={20} color={theme.colors.textPrimary} />
            </Pressable>
            <View style={styles.headerTextWrap}>
              <Text style={styles.headerTitle}>Seleccionar máquina</Text>
              <Text style={styles.headerSubtitle}>Usa una existente o crea una nueva.</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.content}>
            <View style={styles.searchWrap}>
              <Search size={16} color="#8EA4CC" />
              <Input
                value={searchValue}
                onChangeText={onSearchChange}
                placeholder="Buscar máquina"
                style={styles.searchInput}
              />
            </View>

            <Pressable style={styles.noneBtn} onPress={() => onSelect(null)}>
              <Settings2 size={15} color="#9FC0FF" />
              <Text style={styles.noneText}>Usar sin máquina</Text>
            </Pressable>

            <Pressable
              style={[styles.createSeedBtn, !term && styles.createSeedBtnDisabled]}
              onPress={() => term && onCreateRequest(searchValue.trim())}
              disabled={!term}
            >
              <Wrench size={15} color={term ? '#9FC0FF' : '#627DAA'} />
              <Text style={[styles.createSeedText, !term && styles.createSeedTextDisabled]} numberOfLines={1}>
                {term ? `Crear máquina "${searchValue.trim()}"` : 'Escribe un nombre para crear máquina'}
              </Text>
            </Pressable>

            <FlatList
              data={filtered}
              keyExtractor={(item) => item._id}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <Pressable style={styles.machineCard} onPress={() => onSelect(item)}>
                  <Text style={styles.machineName} numberOfLines={2}>{item.name}</Text>
                  {item.code ? <Text style={styles.machineCode}>{item.code}</Text> : null}
                </Pressable>
              )}
              ListEmptyComponent={
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>{term ? 'Sin coincidencias' : 'No hay máquinas'}</Text>
                  <Text style={styles.emptyText}>
                    {term
                      ? 'Ajusta la búsqueda o crea esta máquina.'
                      : 'Crea tu primera máquina para reutilizarla en operaciones.'}
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
  headerSpacer: { width: 20 },
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
  noneBtn: {
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
  },
  noneText: {
    color: '#9FC0FF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
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
  machineCard: {
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#274A7A',
    backgroundColor: '#112340',
    minHeight: 48,
    paddingHorizontal: 12,
    justifyContent: 'center',
    gap: 2,
  },
  machineName: {
    color: '#EAF1FF',
    fontWeight: theme.weight.semibold,
    fontSize: theme.font.sm,
    lineHeight: 19,
    paddingVertical: 5,
  },
  machineCode: {
    color: '#8EA4CC',
    fontSize: theme.font.xs,
    marginTop: -4,
    marginBottom: 6,
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
});
