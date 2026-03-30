import React from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Search, UserPlus } from 'lucide-react-native';

import { Input } from '@/components/ui/Input';
import { theme } from '@/theme';
import type { Employee } from '@/modules/employees/types/employee.type';

type Props = {
  visible: boolean;
  searchValue: string;
  workers: Employee[];
  onSearchChange: (value: string) => void;
  onClose: () => void;
  onSelect: (worker: Employee) => void;
  onCreateRequest: () => void;
};

export function GarmentWorkerSelectorModal({
  visible,
  searchValue,
  workers,
  onSearchChange,
  onClose,
  onSelect,
  onCreateRequest,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={8}>
              <ArrowLeft size={20} color={theme.colors.textPrimary} />
            </Pressable>
            <View style={styles.headerTextWrap}>
              <Text style={styles.headerTitle}>Seleccionar confeccionista</Text>
              <Text style={styles.headerSubtitle}>Elige uno existente o créalo al instante.</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.content}>
            <View style={styles.searchWrap}>
              <Search size={16} color="#8EA4CC" />
              <Input
                value={searchValue}
                onChangeText={onSearchChange}
                placeholder="Buscar confeccionista"
                style={styles.searchInput}
              />
            </View>

            <Pressable style={styles.createSeedBtn} onPress={onCreateRequest}>
              <UserPlus size={15} color="#9FC0FF" />
              <Text style={styles.createSeedText}>Crear confeccionista</Text>
            </Pressable>

            <FlatList
              data={workers}
              keyExtractor={(item) => item._id}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <Pressable style={styles.workerCard} onPress={() => onSelect(item)}>
                  <Text style={styles.workerName} numberOfLines={1}>{item.name} {item.lastName}</Text>
                  <Text style={styles.workerRole}>{item.role}</Text>
                </Pressable>
              )}
              ListEmptyComponent={
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>Sin confeccionistas</Text>
                  <Text style={styles.emptyText}>Crea uno para poder registrar producción.</Text>
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
  createSeedText: {
    color: '#9FC0FF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  listContent: {
    marginTop: 10,
    gap: 8,
    paddingBottom: 4,
  },
  workerCard: {
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#274A7A',
    backgroundColor: '#112340',
    minHeight: 48,
    paddingHorizontal: 12,
    justifyContent: 'center',
    gap: 2,
  },
  workerName: {
    color: '#EAF1FF',
    fontWeight: theme.weight.semibold,
    fontSize: theme.font.sm,
  },
  workerRole: {
    color: '#8EA4CC',
    fontSize: theme.font.xs,
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
