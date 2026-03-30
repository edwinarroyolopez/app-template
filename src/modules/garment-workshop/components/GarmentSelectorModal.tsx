import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ArrowLeft, Search } from 'lucide-react-native';

import { theme } from '@/theme';

type Garment = {
  _id: string;
  name: string;
  defaultColor?: string;
  operations?: Array<{ unitPriceCop: number }>;
};

type Props = {
  visible: boolean;
  garments: Garment[];
  selectedGarmentId?: string;
  onClose: () => void;
  onSelect: (garment: Garment) => void;
};

function money(value: number) {
  return `$${Number(value || 0).toLocaleString('es-CO')}`;
}

export function GarmentSelectorModal({
  visible,
  garments,
  selectedGarmentId,
  onClose,
  onSelect,
}: Props) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return garments;
    return garments.filter((item) => item.name.toLowerCase().includes(term));
  }, [garments, search]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={8}>
            <ArrowLeft size={20} color={theme.colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Seleccionar prenda</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.searchWrap}>
            <Search size={16} color="#8EA4CC" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar prenda"
              placeholderTextColor="#6F87B3"
              style={styles.searchInput}
            />
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>No hay prendas disponibles.</Text>}
            renderItem={({ item }) => {
              const active = selectedGarmentId === item._id;
              const unitCost = (item.operations || []).reduce(
                (sum, op) => sum + Number(op.unitPriceCop || 0),
                0,
              );

              return (
                <Pressable
                  style={[styles.card, active && styles.cardActive]}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <View style={styles.rowLine}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardPrice}>{money(unitCost)}</Text>
                  </View>
                  <Text style={styles.cardMeta}>
                    Ops: {(item.operations || []).length} • Color base: {item.defaultColor || 'No definido'}
                  </Text>
                </Pressable>
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
  listContent: {
    marginTop: 10,
    paddingBottom: 24,
    gap: 8,
  },
  emptyText: {
    color: '#8EA4CC',
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    padding: 12,
    gap: 4,
  },
  cardActive: {
    borderColor: '#2E6BFF',
    backgroundColor: '#0D224A',
  },
  rowLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    flex: 1,
  },
  cardPrice: {
    color: '#86EFAC',
    fontWeight: theme.weight.semibold,
    fontSize: 12,
  },
  cardMeta: {
    color: '#8EA4CC',
    fontSize: 11,
  },
});
