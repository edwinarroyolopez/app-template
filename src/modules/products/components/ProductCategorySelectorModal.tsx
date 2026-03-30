import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { Input } from '@/components/ui/Input';
import { theme } from '@/theme';
import { useCreateProductCategory } from '../hooks/useCreateProductCategory';
import type { ProductCategory } from '../types/product-category.type';

type Props = {
  visible: boolean;
  searchValue: string;
  categories: ProductCategory[];
  selectedCategoryId?: string;
  onClose: () => void;
  onSearchChange: (value: string) => void;
  onSelect: (category?: ProductCategory) => void;
};

function buildCategoryCodePreview(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 3);
}

export function ProductCategorySelectorModal({
  visible,
  searchValue,
  categories,
  selectedCategoryId,
  onClose,
  onSearchChange,
  onSelect,
}: Props) {
  const createCategory = useCreateProductCategory();
  const [createName, setCreateName] = useState('');

  const codePreview = useMemo(() => buildCategoryCodePreview(createName), [createName]);

  async function handleCreateCategory() {
    const name = createName.trim();
    if (!name || createCategory.isPending) {
      return;
    }

    try {
      const created = await createCategory.mutateAsync({ name });
      onSelect(created);
      setCreateName('');
      onSearchChange('');
      onClose();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo crear categoria',
        text2: error?.response?.data?.message || undefined,
      });
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Seleccionar categoria</Text>
          <Text style={styles.modalSubtitle}>Busca una categoria existente o crea una nueva.</Text>

          <Input value={searchValue} onChangeText={onSearchChange} placeholder="Buscar categoria" style={styles.inputSpacing} />

          <ScrollView style={styles.optionsList}>
            {categories.map((category) => {
              const active = selectedCategoryId === category._id;

              return (
                <Pressable
                  key={category._id}
                  style={[styles.option, active && styles.optionActive]}
                  onPress={() => {
                    onSelect(category);
                    onClose();
                  }}
                >
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>{category.name}</Text>
                  <Text style={styles.optionMeta}>{category.code}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.createWrap}>
            <Text style={styles.createTitle}>Crear nueva categoria</Text>
            <Input value={createName} onChangeText={setCreateName} placeholder="Nombre de categoria" />
            <Text style={styles.createCode}>Codigo sugerido: {codePreview || '---'}</Text>

            <View style={styles.actionsRow}>
              <Pressable style={styles.ghostBtn} onPress={onClose}>
                <Text style={styles.ghostText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.primaryBtn} onPress={handleCreateCategory}>
                <Text style={styles.primaryText}>Crear y seleccionar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 14,
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.md,
    fontWeight: theme.weight.bold,
  },
  modalSubtitle: {
    marginTop: 4,
    color: '#8EA4CC',
    fontSize: theme.font.sm,
  },
  inputSpacing: {
    marginTop: 8,
  },
  optionsList: {
    marginTop: 10,
    maxHeight: 220,
  },
  option: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#0A1835',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionActive: {
    borderColor: '#F8C74A',
    backgroundColor: '#2E2412',
  },
  optionText: {
    color: theme.colors.textPrimary,
    fontWeight: theme.weight.semibold,
    fontSize: theme.font.sm,
  },
  optionTextActive: {
    color: '#F8C74A',
  },
  optionMeta: {
    color: theme.colors.textMuted,
    fontSize: theme.font.xs,
    fontWeight: theme.weight.bold,
  },
  createWrap: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 10,
  },
  createTitle: {
    color: '#EAF1FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.bold,
    marginBottom: 6,
  },
  createCode: {
    marginTop: 6,
    color: '#8EA4CC',
    fontSize: theme.font.xs,
  },
  actionsRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  ghostBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    color: theme.colors.textSecondary,
    fontWeight: theme.weight.semibold,
  },
  primaryBtn: {
    flex: 1.3,
    height: 42,
    borderRadius: 12,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#041427',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.xs,
  },
});
