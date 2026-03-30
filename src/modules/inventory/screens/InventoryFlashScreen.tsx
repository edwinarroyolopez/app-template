import React, { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowDownRight, ArrowLeft, ArrowRightLeft, ArrowUpRight, Info, Minus, Package, Plus, Save } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { theme } from '@/theme';
import { useProducts } from '@/modules/products/hooks/useProducts';
import { ProductSelectorModal } from '@/modules/sales/components/ProductSelectorModal';
import { useFlashAdjustInventory } from '../hooks/useFlashAdjustInventory';
import { useNavigation } from '@react-navigation/native';
import { getStockDelta } from '../utils/stockDelta';

function clampStock(value: number) {
  return Math.max(0, Math.round(value));
}

export default function InventoryFlashScreen() {
  const navigation = useNavigation<any>();
  const { data: products = [] } = useProducts();
  const flashAdjust = useFlashAdjustInventory();

  const [showSelector, setShowSelector] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);
  const [physicalStockInput, setPhysicalStockInput] = useState('0');

  const selectedProduct = useMemo(
    () => (products as any[]).find((item) => item._id === selectedProductId) || (products as any[])[0],
    [products, selectedProductId],
  );

  const physicalStock = clampStock(Number(physicalStockInput) || 0);
  const systemStock = clampStock(Number(selectedProduct?.stock ?? 0));
  const stockDelta = getStockDelta(physicalStock, systemStock);

  function applyDelta(delta: number) {
    setPhysicalStockInput(String(clampStock(physicalStock + delta)));
  }

  async function handleSave() {
    if (!selectedProduct?._id) {
      Toast.show({ type: 'error', text1: 'Selecciona un producto' });
      return;
    }

    try {
      await flashAdjust.mutateAsync({
        productId: selectedProduct._id,
        physicalStock,
        reason: 'Ajuste flash',
      });

      Toast.show({ type: 'success', text1: 'Stock guardado' });
      setPhysicalStockInput(String(physicalStock));
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudo guardar el ajuste' });
    }
  }

  return (
    <MainLayout hideBottomBar>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <ArrowLeft size={20} color={theme.colors.textPrimary} />
          </Pressable>
          <Text style={styles.topBarTitle}>Inventario Flash</Text>
          <View style={styles.topBarSpacer} />
        </View>

        <View style={styles.workspaceCard}>
          <View style={styles.productTopRow}>
            <Text style={styles.sectionLabel}>Auditando producto</Text>
            <Pressable style={styles.changeBtn} onPress={() => setShowSelector(true)}>
              <ArrowRightLeft size={14} color="#9FC0FF" />
              <Text style={styles.changeBtnText}>Cambiar</Text>
            </Pressable>
          </View>

          <View style={styles.productRow}>
            {selectedProduct?.image ? (
              <Image source={{ uri: selectedProduct.image }} style={styles.productImage} resizeMode="cover" />
            ) : (
              <View style={styles.productImageFallback}>
                <Package size={20} color="#9FC0FF" />
              </View>
            )}

            <View style={styles.productMeta}>
              <Text numberOfLines={2} style={styles.productName}>{selectedProduct?.name || 'Sin producto'}</Text>
              <Text style={styles.productSub}>SKU: {selectedProduct?.sku || '--'}</Text>
              <Text style={styles.productSub}>Variante: {selectedProduct?.variant || '--'}</Text>
            </View>
          </View>



          <Text style={styles.sectionLabel}>Cantidad física actual</Text>
          <TextInput
            value={physicalStockInput}
            onChangeText={(value) => setPhysicalStockInput(String(clampStock(Number(value) || 0)))}
            keyboardType="numeric"
            style={styles.stockInput}
            placeholder="0"
            placeholderTextColor="#6F87B3"
          />

          <View style={styles.quickActions}>
            <Pressable style={styles.quickBtn} onPress={() => applyDelta(-1)}>
              <Text style={styles.quickBtnText}><Minus size={14} color="#D6E5FF" /> 1</Text>
              <Text style={styles.quickBtnHint}>RESTAR</Text>
            </Pressable>
            <Pressable style={styles.quickBtn} onPress={() => applyDelta(1)}>

              <Text style={styles.quickBtnText}><Plus size={14} color="#D6E5FF" /> 1</Text>
              <Text style={styles.quickBtnHint}>SUMAR</Text>
            </Pressable>
            <Pressable style={styles.quickBtn} onPress={() => applyDelta(10)}>
              <Text style={styles.quickBtnText}><Plus size={14} color="#D6E5FF" /> 10</Text>
              <Text style={styles.quickBtnHint}>LOTE</Text>
            </Pressable>
          </View>

          <View style={styles.contextRow}>
            <View style={styles.contextPill}>
              <Text style={styles.contextLabel}>Stock en sistema</Text>
              <Text style={styles.contextValue}>{systemStock}</Text>
            </View>

            <View
              style={[
                styles.contextPill,
                stockDelta.tone === 'positive' && styles.contextPillPositive,
                stockDelta.tone === 'negative' && styles.contextPillNegative,
              ]}
            >
              <View style={styles.deltaRow}>
                {stockDelta.tone === 'positive' && <ArrowUpRight size={14} color={theme.colors.success} />}
                {stockDelta.tone === 'negative' && <ArrowDownRight size={14} color={theme.colors.danger} />}
                <Text
                  style={[
                    styles.contextValue,
                    stockDelta.tone === 'positive' && styles.deltaPositive,
                    stockDelta.tone === 'negative' && styles.deltaNegative,
                  ]}
                >
                  {stockDelta.label}
                </Text>
              </View>
              <Text style={styles.contextLabel}>Diferencia</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Info size={14} color="#8EA4CC" />
            <Text style={styles.infoText}>El stock se actualizara permanentemente al confirmar.</Text>
          </View>

          <Pressable style={styles.saveBtn} onPress={handleSave} disabled={flashAdjust.isPending}>
            <Save size={16} color="#F0F6FF" />
            <Text style={styles.saveBtnText}>{flashAdjust.isPending ? 'Guardando...' : 'Guardar Stock'}</Text>
          </Pressable>
        </View>

        <ProductSelectorModal
          visible={showSelector}
          selectedProductId={selectedProduct?._id}
          onClose={() => setShowSelector(false)}
          onSelect={(product) => {
            setSelectedProductId(product._id);
            setPhysicalStockInput(String(clampStock((product as any).stock ?? 0)));
          }}
        />
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  topBar: {
    height: 44,
    paddingHorizontal: 2,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.md,
    fontWeight: theme.weight.bold,
  },
  topBarSpacer: {
    width: 20,
  },
  workspaceCard: {
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },
  productTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
    textTransform: 'uppercase',
  },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  changeBtnText: {
    color: '#9FC0FF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 12,
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  productImageFallback: {
    width: 64,
    height: 64,
    borderRadius: 28,
    backgroundColor: '#0E264D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productMeta: {
    flex: 1,
  },
  productName: {
    color: theme.colors.textPrimary,
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
  },
  productSub: {
    color: theme.colors.textMuted,
    fontSize: theme.font.xs,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#16335E',
  },
  stockInput: {
    marginTop: 2,
    height: 94,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2A4A78',
    backgroundColor: '#132A4C',
    color: theme.colors.textPrimary,
    fontSize: 54,
    textAlign: 'center',
    fontWeight: theme.weight.bold,
  },
  quickActions: {
    marginTop: 2,
    flexDirection: 'row',
    gap: 8,
  },
  quickBtn: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  quickBtnText: {
    color: theme.colors.textPrimary,
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
  },
  quickBtnHint: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: theme.weight.medium,
  },
  contextRow: {
    marginTop: 2,
    flexDirection: 'row',
    gap: 8,
  },
  contextPill: {
    flex: 1,
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceSoft,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  contextPillPositive: {
    borderColor: theme.colors.success,
  },
  contextPillNegative: {
    borderColor: theme.colors.danger,
  },
  contextLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: theme.weight.medium,
  },
  contextValue: {
    marginTop: 2,
    color: theme.colors.textPrimary,
    fontSize: theme.font.md,
    fontWeight: theme.weight.bold,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deltaPositive: {
    color: theme.colors.success,
  },
  deltaNegative: {
    color: theme.colors.danger,
  },
  infoRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  saveBtn: {
    marginTop: 4,
    height: 50,
    borderRadius: 14,
    backgroundColor: theme.colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnText: {
    color: '#F0F6FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
  },
});
