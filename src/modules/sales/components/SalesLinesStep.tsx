import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Package, Pencil, Plus } from 'lucide-react-native';

import { theme } from '@/theme';
import type { SaleWizardItem } from '../hooks/useSaleWizard';
import { SaleLineRow } from './SaleLineRow';

function formatAmount(value: number) {
  return `$${(value || 0).toLocaleString('es-CO')}`;
}

type Props = {
  selectedProductName: string;
  quantityInput: string;
  setQuantityInput: (value: string) => void;
  unitPriceInput: string;
  setUnitPriceInput: (value: string) => void;
  lineRequiresManufacturing: boolean;
  setLineRequiresManufacturing: (value: boolean) => void;
  editingIndex: number | null;
  items: SaleWizardItem[];
  orderedItems: Array<{ item: SaleWizardItem; index: number }>;
  onOpenProductSelector: () => void;
  onAddOrUpdateLine: () => { ok: true; mode: 'added' | 'updated' } | { ok: false; message: string };
  onEditLine: (index: number) => void;
  onRemoveLine: (index: number) => void;
  onFeedback: (type: 'success' | 'error', text: string) => void;
};

export function SalesLinesStep({
  selectedProductName,
  quantityInput,
  setQuantityInput,
  unitPriceInput,
  setUnitPriceInput,
  lineRequiresManufacturing,
  setLineRequiresManufacturing,
  editingIndex,
  items,
  orderedItems,
  onOpenProductSelector,
  onAddOrUpdateLine,
  onEditLine,
  onRemoveLine,
  onFeedback,
}: Props) {
  const quantity = Math.max(1, Math.round(Number(quantityInput) || 0));
  const unitPrice = Math.max(0, Number(String(unitPriceInput).replace(/\./g, '')) || 0);
  const previewSubtotal = quantity * unitPrice;

  return (
    <View style={styles.stepCard}>
      <Text style={styles.stepTitle}>Lineas de venta</Text>
      <Text style={styles.stepHint}>Primero construye la linea actual. Luego valida lo que ya quedo en la venta.</Text>

      <View style={styles.builderBlock}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nueva linea</Text>
          <Text style={styles.sectionHint}>Linea en edicion</Text>
        </View>

        <Text style={styles.label}>Producto</Text>
        <Pressable style={styles.selectorBtn} onPress={onOpenProductSelector}>
          <View style={styles.selectorLeft}>
            <Package size={16} color="#9FC0FF" />
            <Text style={selectedProductName ? styles.selectorText : styles.selectorPlaceholder}>
              {selectedProductName || 'Seleccionar producto'}
            </Text>
          </View>
          <Text style={styles.selectorAction}>Elegir</Text>
        </Pressable>

        <View style={styles.doubleRow}>
          <View style={styles.doubleCol}>
            <Text style={styles.labelCompact}>Cantidad</Text>
            <TextInput
              value={quantityInput}
              onChangeText={setQuantityInput}
              keyboardType="numeric"
              placeholder="1"
              placeholderTextColor="#6F87B3"
              style={styles.inlineInput}
            />
          </View>
          <View style={styles.doubleCol}>
            <Text style={styles.labelCompact}>Precio unitario</Text>
            <TextInput
              value={unitPriceInput}
              onChangeText={setUnitPriceInput}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#6F87B3"
              style={styles.inlineInput}
            />
          </View>
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>Subtotal de esta linea</Text>
          <Text style={styles.previewValue}>{formatAmount(previewSubtotal)}</Text>
        </View>

        <View style={styles.fulfillmentRow}>
          <Pressable
            style={[
              styles.fulfillmentChip,
              !lineRequiresManufacturing && styles.fulfillmentChipActiveReady,
            ]}
            onPress={() => setLineRequiresManufacturing(false)}
          >
            <Text
              style={[
                styles.fulfillmentChipText,
                !lineRequiresManufacturing && styles.fulfillmentChipTextActiveReady,
              ]}
            >
              Lista para entregar
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.fulfillmentChip,
              lineRequiresManufacturing && styles.fulfillmentChipActiveManufacturing,
            ]}
            onPress={() => setLineRequiresManufacturing(true)}
          >
            <Text
              style={[
                styles.fulfillmentChipText,
                lineRequiresManufacturing && styles.fulfillmentChipTextActiveManufacturing,
              ]}
            >
              Requiere fabricacion
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={[styles.addLineBtn, editingIndex !== null && styles.addLineBtnEditing]}
          onPress={() => {
            const result = onAddOrUpdateLine();
            if (!result.ok) {
              onFeedback('error', result.message);
              return;
            }
            onFeedback('success', result.mode === 'updated' ? 'Linea actualizada.' : 'Linea agregada a la venta.');
          }}
        >
          {editingIndex !== null ? <Pencil size={14} color="#DDE8FF" /> : <Plus size={14} color="#DDE8FF" />}
          <Text style={styles.addLineBtnText}>{editingIndex !== null ? 'Actualizar linea actual' : 'Incorporar linea a la venta'}</Text>
        </Pressable>

        <Text style={styles.addLineHint}>Esta accion solo afecta la linea en construccion.</Text>
      </View>

      <View style={styles.linesBlock}>
        <View style={styles.linesHeader}>
          <Text style={styles.linesTitle}>Documento en construccion</Text>
          <Text style={styles.linesCount}>{items.length} lineas</Text>
        </View>
        <Text style={styles.linesHint}>Estas lineas ya forman parte de la venta. Puedes editar o quitar cada una.</Text>
      </View>

      {orderedItems.length === 0 ? (
        <View style={styles.emptyLinesCard}>
          <Text style={styles.emptyLinesTitle}>Todavia no hay lineas</Text>
          <Text style={styles.emptyLinesHint}>Selecciona producto y agrega la primera linea para continuar.</Text>
        </View>
      ) : (
        orderedItems.map((line) => (
          <SaleLineRow
            key={`${line.item.productId || line.item.productName}-${line.index}`}
            item={line.item}
            index={line.index}
            onEdit={onEditLine}
            onRemove={onRemoveLine}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stepCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#17345F',
    backgroundColor: '#081A33',
    padding: 12,
  },
  stepTitle: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
    marginBottom: 4,
  },
  stepHint: {
    color: '#8EA4CC',
    fontSize: theme.font.xs,
    marginBottom: 10,
  },
  builderBlock: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3F6C',
    backgroundColor: '#0B2141',
    padding: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sectionTitle: {
    color: '#DDE8FF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.bold,
  },
  sectionHint: {
    color: '#89A9D8',
    fontSize: 11,
  },
  label: {
    color: '#9FB4D9',
    fontSize: theme.font.xs,
    marginBottom: 6,
    fontWeight: theme.weight.semibold,
  },
  labelCompact: {
    color: '#9FB4D9',
    fontSize: theme.font.xs,
    marginBottom: 6,
    fontWeight: theme.weight.semibold,
  },
  selectorBtn: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#274A7A',
    backgroundColor: '#112340',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingRight: 8,
  },
  selectorText: {
    color: '#DDE8FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
  },
  selectorPlaceholder: {
    color: '#6F87B3',
    fontSize: theme.font.sm,
  },
  selectorAction: {
    color: '#9FC0FF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  doubleRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
  },
  doubleCol: {
    flex: 1,
  },
  inlineInput: {
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A4E7D',
    backgroundColor: '#132A4D',
    paddingHorizontal: 10,
    color: '#DDE8FF',
  },
  previewCard: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A4E7D',
    backgroundColor: '#0F2748',
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewLabel: {
    color: '#89A9D8',
    fontSize: theme.font.xs,
  },
  previewValue: {
    color: '#DDE8FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.bold,
  },
  fulfillmentRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
  },
  fulfillmentChip: {
    flex: 1,
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  fulfillmentChipActiveReady: {
    borderColor: '#34D39966',
    backgroundColor: '#0B2B25',
  },
  fulfillmentChipActiveManufacturing: {
    borderColor: '#A78BFA66',
    backgroundColor: '#2A1F4D',
  },
  fulfillmentChipText: {
    color: '#9FB0CF',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  fulfillmentChipTextActiveReady: {
    color: '#34D399',
  },
  fulfillmentChipTextActiveManufacturing: {
    color: '#C4B5FD',
  },
  addLineBtn: {
    marginTop: 10,
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3569CC',
    backgroundColor: '#1A3F7A',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
  },
  addLineBtnEditing: {
    borderColor: '#2E6BFF',
    backgroundColor: '#193E70',
  },
  addLineBtnText: {
    color: '#DDE8FF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.bold,
  },
  addLineHint: {
    marginTop: 6,
    color: '#7893BD',
    fontSize: 11,
  },
  linesBlock: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#1A3762',
  },
  linesHeader: {
    marginBottom: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linesTitle: {
    color: '#BFD0EE',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  linesCount: {
    color: '#9FC0FF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.bold,
  },
  linesHint: {
    color: '#7E9CCA',
    fontSize: 11,
    marginBottom: 2,
  },
  emptyLinesCard: {
    marginTop: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3F6C',
    backgroundColor: '#0B1F3B',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  emptyLinesTitle: {
    color: '#BFD0EE',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
    textAlign: 'center',
  },
  emptyLinesHint: {
    marginTop: 4,
    color: '#8397BA',
    fontSize: theme.font.xs,
    textAlign: 'center',
  },
});
