import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Banknote, Calendar, ChevronRight, HandCoins, Package, Pencil, Plus, Store, Trash2 } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { useProducts } from '@/modules/products/hooks/useProducts';
import { theme } from '@/theme';
import { ActionLoader } from '@/components/ui/ActionLoader';
import { ImageAttachmentField } from '@/components/ui/ImageAttachmentField';
import { OperationalModal } from '@/components/ui/OperationalModal';
import { usePurchaseInvoiceBuilder } from '../hooks/usePurchaseInvoiceBuilder';
import { usePurchaseProviders } from '../hooks/usePurchaseProviders';
import { PurchaseInvoiceProductSelectorModal } from './PurchaseInvoiceProductSelectorModal';
import { PurchaseWizardProgress } from './PurchaseWizardProgress';
import { PurchasePaymentTypeSelectorModal } from './PurchasePaymentTypeSelectorModal';
import { PurchaseProviderSelectorModal } from './PurchaseProviderSelectorModal';
import { CreatePurchaseProviderModal } from './CreatePurchaseProviderModal';

function formatAmount(value: number) {
  return `$${(value || 0).toLocaleString('es-CO')}`;
}

type Props = {
  visible: boolean;
  onClose: () => void;
  onSaved?: (createdLines: number) => void;
};

export function PurchaseInvoiceWizardModal({ visible, onClose, onSaved }: Props) {
  const invoice = usePurchaseInvoiceBuilder();
  const [showProviderSelectorModal, setShowProviderSelectorModal] = useState(false);
  const [showCreateProviderModal, setShowCreateProviderModal] = useState(false);
  const [providerSearch, setProviderSearch] = useState('');

  const [showProductsModal, setShowProductsModal] = useState(false);
  const [showPaymentTypeModal, setShowPaymentTypeModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [inlineFeedback, setInlineFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchQuery = productSearch.trim().length >= 2 ? productSearch.trim() : undefined;
  const { data: products = [] } = useProducts(searchQuery);
  const { providers } = usePurchaseProviders(providerSearch);

  const footerLabel = useMemo(() => {
    if (invoice.step === 1) return 'Siguiente: Productos';
    if (invoice.step === 2) return 'Siguiente: Resumen';
    return invoice.isSaving ? 'Guardando factura...' : 'Guardar factura';
  }, [invoice.step, invoice.isSaving]);

  const isStepOne = invoice.step === 1;
  const isStepTwo = invoice.step === 2;
  const isStepThree = invoice.step === 3;
  const hasStepTwoLines = invoice.items.length > 0;
  const orderedItems = useMemo(
    () => invoice.items.map((item, index) => ({ item, index })).slice().reverse(),
    [invoice.items],
  );

  function showInlineFeedback(type: 'success' | 'error', text: string) {
    setInlineFeedback({ type, text });
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => {
      setInlineFeedback(null);
    }, 1800);
  }

  useEffect(() => {
    if (visible) return;
    setInlineFeedback(null);
    setProviderSearch('');
    setShowProviderSelectorModal(false);
    setShowCreateProviderModal(false);
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, [visible]);

  useEffect(
    () => () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    },
    [],
  );

  async function onPrimaryAction() {
    if (invoice.step < 3) {
      if (!invoice.canGoNext) {
        showInlineFeedback('error', 'Completa este paso para continuar');
        return;
      }
      invoice.nextStep();
      return;
    }

    try {
      const result = await invoice.submitInvoice();
      if (!result.ok) {
        showInlineFeedback('error', result.message);
        return;
      }
      onSaved?.(result.createdLines);
      onClose();
      setTimeout(() => {
        Toast.show({
          type: 'success',
          text1: 'Factura registrada',
          text2: `${result.createdLines} productos guardados`,
        });
      }, 120);
    } catch (error: any) {
      showInlineFeedback('error', error?.response?.data?.message || 'No se pudo guardar');
    }
  }

  return (
    <>
      <OperationalModal
        visible={visible}
        onClose={onClose}
        title="Nueva factura de compra"
        headerRight={
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.closeText}>Cerrar</Text>
          </Pressable>
        }
        contentContainerStyle={styles.content}
        footer={
          <View style={[styles.footer, isStepOne && styles.footerStepOne, isStepTwo && styles.footerStepTwo, isStepThree && styles.footerStepThree]}>
            <View style={styles.footerTotalWrap}>
              <Text style={[styles.footerLabel, isStepOne && styles.footerLabelStepOne, isStepTwo && styles.footerLabelStepTwo, isStepThree && styles.footerLabelStepThree]}>Total factura</Text>
              <Text style={[styles.footerTotal, isStepOne && styles.footerTotalStepOne, isStepTwo && styles.footerTotalStepTwo, isStepThree && styles.footerTotalStepThree]}>{formatAmount(invoice.total)}</Text>
            </View>

            <View style={styles.footerActions}>
              {invoice.step > 1 && (
                <Pressable style={styles.backBtn} onPress={invoice.prevStep}>
                  <Text style={styles.backBtnText}>Atras</Text>
                </Pressable>
              )}
              <Pressable
                style={[
                  styles.primaryBtn,
                  isStepTwo && !hasStepTwoLines && styles.primaryBtnStepTwoEmpty,
                  isStepThree && styles.primaryBtnStepThree,
                ]}
                onPress={onPrimaryAction}
              >
                <Text style={styles.primaryBtnText}>{footerLabel}</Text>
              </Pressable>
            </View>
          </View>
        }
      >

        <PurchaseWizardProgress step={invoice.step} />

          {!!inlineFeedback && (
            <View
              style={[
                styles.feedbackBanner,
                inlineFeedback.type === 'success' ? styles.feedbackBannerSuccess : styles.feedbackBannerError,
              ]}
            >
              <Text style={styles.feedbackBannerText}>{inlineFeedback.text}</Text>
            </View>
          )}

        {invoice.step === 1 && (
              <View style={styles.stepSurfaceLight}>
                <Text style={styles.stepTitle}>Informacion basica</Text>

                <Text style={styles.label}>Proveedor</Text>
                <Pressable style={styles.selectorField} onPress={() => setShowProviderSelectorModal(true)}>
                  <View style={styles.selectorLeft}>
                    <Store size={16} color="#88A9DB" />
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={invoice.provider ? styles.inputText : styles.placeholderText}
                    >
                      {invoice.provider || 'Seleccionar proveedor'}
                    </Text>
                  </View>
                  <ChevronRight size={16} color="#88A9DB" />
                </Pressable>

                <Text style={styles.label}>Fecha de factura</Text>
                <View style={styles.dateInputWrap}>
                  <TextInput
                    value={invoice.invoiceDate}
                    onChangeText={invoice.setInvoiceDate}
                    placeholder="yyyy-mm-dd"
                    placeholderTextColor="#6F87B3"
                    style={styles.dateInput}
                  />
                  <Calendar size={15} color="#8EA4CC" />
                </View>

                <Text style={styles.label}>Tipo de compra</Text>
                <Pressable style={styles.selectorField} onPress={() => setShowPaymentTypeModal(true)}>
                  <View style={styles.selectorLeft}>
                    {invoice.paymentType === 'CONTADO' ? (
                      <Banknote size={16} color="#88A9DB" />
                    ) : (
                      <HandCoins size={16} color="#88A9DB" />
                    )}
                    <Text style={styles.selectorValueText}>
                      {invoice.paymentType === 'CONTADO' ? 'De contado' : 'A credito'}
                    </Text>
                  </View>
                  <ChevronRight size={16} color="#88A9DB" />
                </Pressable>

                <ImageAttachmentField
                  title="Comprobante (opcional)"
                  helperText="Adjunta soporte de la factura si aplica."
                  images={invoice.proofImageUri ? [{ uri: invoice.proofImageUri }] : []}
                  onChange={(next) => invoice.setProofImageUri(next[0]?.uri || null)}
                  maxImages={1}
                />
              </View>
            )}

        {invoice.step === 2 && (
              <View style={styles.stepSurfaceBuilder}>
                <Text style={styles.stepTitle}>Productos</Text>
                <Text style={styles.stepHint}>Selecciona producto, define la linea y agregala a la factura.</Text>

                <Text style={styles.label}>Producto</Text>
                <Pressable style={styles.selectorFieldPrimary} onPress={() => setShowProductsModal(true)}>
                  <View style={styles.selectorLeft}>
                    <Package size={16} color="#9FC0FF" />
                    <Text style={invoice.selectedProductName ? styles.inputText : styles.placeholderText}>
                      {invoice.selectedProductName || 'Seleccionar producto'}
                    </Text>
                  </View>
                  <ChevronRight size={16} color="#9FC0FF" />
                </Pressable>

                <View style={styles.lineInputsBlock}>
                  <View style={styles.doubleRow}>
                    <View style={styles.doubleCol}>
                      <Text style={styles.labelCompact}>Cantidad</Text>
                      <TextInput
                        value={invoice.quantityInput}
                        onChangeText={invoice.setQuantityInput}
                        keyboardType="numeric"
                        placeholder="1"
                        placeholderTextColor="#6F87B3"
                        style={styles.lineInput}
                      />
                    </View>
                    <View style={styles.doubleCol}>
                      <Text style={styles.labelCompact}>Precio compra</Text>
                      <TextInput
                        value={invoice.unitPriceInput}
                        onChangeText={invoice.setUnitPriceInput}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#6F87B3"
                        style={styles.lineInput}
                      />
                    </View>
                  </View>
                </View>

                <Pressable
                  style={[styles.addLineBtn, invoice.editingIndex !== null && styles.addLineBtnEditing]}
                  onPress={() => {
                    const result = invoice.addOrUpdateItem();
                    if (!result.ok) {
                      showInlineFeedback('error', result.message);
                      return;
                    }
                    showInlineFeedback('success', result.mode === 'updated' ? 'Producto actualizado' : 'Producto agregado');
                  }}
                >
                  {invoice.editingIndex !== null ? (
                    <Pencil size={14} color="#F0F6FF" />
                  ) : (
                    <Plus size={14} color="#F0F6FF" />
                  )}
                  <Text style={styles.addBtnText}>
                    {invoice.editingIndex !== null ? 'Actualizar linea' : 'Agregar linea a factura'}
                  </Text>
                </Pressable>

                <View style={styles.linesHeader}>
                  <Text style={styles.linesTitle}>Lineas agregadas</Text>
                  <Text style={styles.linesCount}>{invoice.items.length}</Text>
                </View>

                <FlatList
                  data={orderedItems}
                  keyExtractor={({ item, index }) => `${item.productId}-${index}`}
                  scrollEnabled={false}
                  contentContainerStyle={styles.linesList}
                  renderItem={({ item: line }) => (
                    <View style={styles.invoiceLineRow}>
                      <View style={styles.invoiceLineTop}>
                        <Text numberOfLines={1} style={styles.invoiceLineName}>{line.item.productName}</Text>
                        <Text style={styles.invoiceLineAmount}>{formatAmount(line.item.quantity * line.item.unitPrice)}</Text>
                      </View>

                      <View style={styles.invoiceLineBottom}>
                        <Text style={styles.invoiceLineMeta}>{line.item.quantity} x {formatAmount(line.item.unitPrice)}</Text>
                        <View style={styles.invoiceLineActions}>
                          <Pressable
                            style={styles.lineActionBtn}
                            onPress={() => invoice.startEditItem(line.index)}
                            hitSlop={8}
                          >
                            <Pencil size={14} color="#9FC0FF" />
                          </Pressable>
                          <Pressable
                            style={styles.lineActionBtn}
                            onPress={() => invoice.removeItem(line.index)}
                            hitSlop={8}
                          >
                            <Trash2 size={14} color="#F87171" />
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  )}
                  ListEmptyComponent={
                    <View style={styles.emptyStateCard}>
                      <Text style={styles.emptyStateTitle}>Todavia no hay lineas en la factura</Text>
                      <Text style={styles.emptyStateHint}>Selecciona un producto y agrega la primera linea para continuar.</Text>
                    </View>
                  }
                />
              </View>
            )}

        {invoice.step === 3 && (
              <View style={styles.stepSurfaceSummary}>
                <Text style={styles.stepTitle}>Revision final</Text>
                <Text style={styles.stepHint}>Verifica el contexto y confirma las lineas antes de guardar la factura.</Text>

                <View style={styles.summaryMetaWrap}>
                  <View style={[styles.summaryMetaCard, styles.summaryMetaCardProvider]}>
                    <Text style={styles.summaryMetaLabel}>Proveedor</Text>
                    <Text numberOfLines={2} ellipsizeMode="tail" style={styles.summaryMetaValue}>{invoice.provider || '--'}</Text>
                  </View>

                  <View style={styles.summaryMetaBottomRow}>
                    <View style={[styles.summaryMetaCard, styles.summaryMetaCardCompact]}>
                      <Text style={styles.summaryMetaLabel}>Fecha</Text>
                      <Text numberOfLines={1} style={styles.summaryMetaValue}>{invoice.invoiceDate || '--'}</Text>
                    </View>
                    <View style={[styles.summaryMetaCard, styles.summaryMetaCardCompact]}>
                      <Text style={styles.summaryMetaLabel}>Lineas</Text>
                      <Text numberOfLines={1} style={styles.summaryMetaValue}>{invoice.items.length}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.summaryLinesHeader}>
                  <Text style={styles.summaryLinesTitle}>Detalle de factura</Text>
                  <Text style={styles.summaryLinesCount}>{invoice.items.length}</Text>
                </View>

                <FlatList
                  data={orderedItems}
                  keyExtractor={({ item, index }) => `summary-${item.productId}-${index}`}
                  scrollEnabled={false}
                  contentContainerStyle={styles.summaryLinesList}
                  renderItem={({ item: line }) => (
                    <View style={styles.summaryLineRow}>
                      <View style={styles.summaryLineTop}>
                        <Text numberOfLines={1} style={styles.summaryLineName}>{line.item.productName}</Text>
                        <Text style={styles.summaryLineAmount}>{formatAmount(line.item.quantity * line.item.unitPrice)}</Text>
                      </View>

                      <View style={styles.summaryLineBottom}>
                        <Text style={styles.summaryLineMeta}>{line.item.quantity} x {formatAmount(line.item.unitPrice)}</Text>
                        <View style={styles.summaryLineActions}>
                          <Pressable
                            style={styles.summaryLineActionBtn}
                            onPress={() => { invoice.startEditItem(line.index); invoice.prevStep(); }}
                            hitSlop={8}
                          >
                            <Pencil size={14} color="#89AFEE" />
                          </Pressable>
                          <Pressable
                            style={styles.summaryLineActionBtn}
                            onPress={() => invoice.removeItem(line.index)}
                            hitSlop={8}
                          >
                            <Trash2 size={14} color="#F07F86" />
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  )}
                  ListEmptyComponent={
                    <View style={styles.summaryEmptyCard}>
                      <Text style={styles.summaryEmptyTitle}>No hay lineas para confirmar</Text>
                      <Text style={styles.summaryEmptyHint}>Vuelve al paso anterior para agregar o ajustar productos.</Text>
                    </View>
                  }
                />
              </View>
            )}
      </OperationalModal>

      <PurchaseInvoiceProductSelectorModal
        visible={showProductsModal}
        searchValue={productSearch}
        products={products as any[]}
        onSearchChange={setProductSearch}
        onClose={() => setShowProductsModal(false)}
        onSelect={(product) => {
          invoice.setSelectedProductId(product._id);
          invoice.setSelectedProductName(product.name);
          setShowProductsModal(false);
        }}
      />

      <PurchaseProviderSelectorModal
        visible={showProviderSelectorModal}
        searchValue={providerSearch}
        providers={providers}
        onSearchChange={setProviderSearch}
        onClose={() => setShowProviderSelectorModal(false)}
        onSelect={(provider) => {
          invoice.selectProvider({ id: provider._id || provider.id, name: provider.name });
          setProviderSearch(provider.name);
          setShowProviderSelectorModal(false);
        }}
        onCreateRequest={(nameSeed) => {
          setProviderSearch(nameSeed);
          setShowProviderSelectorModal(false);
          setShowCreateProviderModal(true);
        }}
      />

      <CreatePurchaseProviderModal
        visible={showCreateProviderModal}
        initialValue={providerSearch}
        onClose={() => setShowCreateProviderModal(false)}
        onCreated={(provider) => {
          invoice.selectProvider({ id: provider._id || provider.id, name: provider.name });
          setProviderSearch(provider.name);
          setShowCreateProviderModal(false);
        }}
      />

      <PurchasePaymentTypeSelectorModal
        visible={showPaymentTypeModal}
        value={invoice.paymentType}
        onClose={() => setShowPaymentTypeModal(false)}
        onChange={invoice.setPaymentType}
      />

      <ActionLoader
        visible={invoice.isSaving}
        steps={[
          'Validando factura...',
          'Guardando productos...',
          'Actualizando inventario...',
          'Finalizando compra...',
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  closeText: { color: '#9FC0FF', fontWeight: theme.weight.semibold, fontSize: theme.font.sm },
  feedbackBanner: {
    marginTop: 8,
    marginBottom: 2,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  feedbackBannerSuccess: {
    borderColor: '#2A5B3F',
    backgroundColor: '#112B21',
  },
  feedbackBannerError: {
    borderColor: '#7A2630',
    backgroundColor: '#341720',
  },
  feedbackBannerText: {
    color: '#EAF1FF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  content: { gap: 8 },
  stepSurfaceLight: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#132D56',
    backgroundColor: '#08172C',
    padding: 12,
  },
  stepSurfaceBuilder: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#17345F',
    backgroundColor: '#081A33',
    padding: 12,
  },
  stepSurfaceSummary: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1A3D6C',
    backgroundColor: '#081D38',
    padding: 12,
  },
  stepCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#16315E',
    backgroundColor: '#08182F',
    padding: 12,
  },
  stepTitle: { color: '#EAF1FF', fontWeight: theme.weight.bold, fontSize: theme.font.md, marginBottom: 10 },
  stepHint: {
    color: '#8EA4CC',
    fontSize: theme.font.xs,
    marginTop: -2,
    marginBottom: 8,
  },
  label: { color: '#9FB4D9', fontSize: theme.font.xs, marginBottom: 6, marginTop: 8, fontWeight: theme.weight.semibold },
  input: {
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#29466F',
    backgroundColor: '#243956',
    paddingHorizontal: 12,
    justifyContent: 'center',
    color: '#DDE8FF',
  },
  inputText: { color: '#DDE8FF' },
  placeholderText: { color: '#6F87B3' },
  selectorField: {
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
  selectorValueText: {
    color: '#DDE8FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
  },
  dateInputWrap: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#233F66',
    backgroundColor: '#0F223F',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInput: { flex: 1, color: '#DDE8FF', paddingRight: 10, paddingVertical: 0 },
  selectorFieldPrimary: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D5689',
    backgroundColor: '#132A4D',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lineInputsBlock: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3F6C',
    backgroundColor: '#0C213E',
    padding: 10,
  },
  doubleRow: { flexDirection: 'row', gap: 10 },
  doubleCol: { flex: 1 },
  labelCompact: {
    color: '#9FB4D9',
    fontSize: theme.font.xs,
    marginBottom: 6,
    fontWeight: theme.weight.semibold,
  },
  lineInput: {
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A4E7D',
    backgroundColor: '#132A4D',
    paddingHorizontal: 10,
    justifyContent: 'center',
    color: '#DDE8FF',
  },
  addLineBtn: {
    marginTop: 12,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#2E6BFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  addLineBtnEditing: {
    backgroundColor: '#2A5FD9',
  },
  addBtnText: { color: '#F0F6FF', fontWeight: theme.weight.bold },
  linesHeader: {
    marginTop: 14,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linesTitle: {
    color: '#BFD0EE',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  linesCount: {
    minWidth: 22,
    textAlign: 'center',
    color: '#9FC0FF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.bold,
  },
  linesList: { marginTop: 4, gap: 8 },
  invoiceLineRow: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E406E',
    backgroundColor: '#0A2243',
    padding: 10,
    gap: 8,
  },
  invoiceLineTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  invoiceLineName: {
    flex: 1,
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.sm,
  },
  invoiceLineAmount: {
    color: '#9FC0FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.sm,
  },
  invoiceLineBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  invoiceLineMeta: {
    color: '#95A9CC',
    fontSize: theme.font.xs,
  },
  invoiceLineActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lineActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A4E7D',
    backgroundColor: '#122C4F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3F6C',
    backgroundColor: '#0B1F3B',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  emptyStateTitle: {
    color: '#BFD0EE',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
    textAlign: 'center',
  },
  emptyStateHint: {
    marginTop: 4,
    color: '#8397BA',
    fontSize: theme.font.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
  summaryMetaWrap: {
    marginTop: 2,
    marginBottom: 10,
    gap: 8,
  },
  summaryMetaBottomRow: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryMetaCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#275080',
    backgroundColor: '#102947',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  summaryMetaCardProvider: {
    width: '100%',
  },
  summaryMetaCardCompact: {
    flex: 1,
  },
  summaryMetaLabel: {
    color: '#89A4CE',
    fontSize: 11,
    marginBottom: 3,
  },
  summaryMetaValue: {
    color: '#EAF1FF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.bold,
    lineHeight: 16,
  },
  summaryLinesHeader: {
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLinesTitle: {
    color: '#BFD0EE',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  summaryLinesCount: {
    color: '#9FC0FF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.bold,
  },
  summaryLinesList: {
    marginTop: 2,
    gap: 8,
  },
  summaryLineRow: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#244974',
    backgroundColor: '#0D274A',
    padding: 10,
    gap: 7,
  },
  summaryLineTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  summaryLineName: {
    flex: 1,
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.sm,
  },
  summaryLineAmount: {
    color: '#9FC0FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.sm,
  },
  summaryLineBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  summaryLineMeta: {
    color: '#95A9CC',
    fontSize: theme.font.xs,
  },
  summaryLineActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryLineActionBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#29517E',
    backgroundColor: '#153053',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryEmptyCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#254977',
    backgroundColor: '#0F2746',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  summaryEmptyTitle: {
    color: '#BFD0EE',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
    textAlign: 'center',
  },
  summaryEmptyHint: {
    marginTop: 4,
    color: '#8FA5C9',
    fontSize: theme.font.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
  lineCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A3A66',
    backgroundColor: '#0B2345',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lineMain: { flex: 1 },
  lineName: { color: '#EAF1FF', fontWeight: theme.weight.bold, fontSize: theme.font.sm },
  lineMeta: { color: '#9FB0CF', fontSize: theme.font.xs, marginTop: 1 },
  lineAmount: { color: '#9FC0FF', fontWeight: theme.weight.bold, fontSize: theme.font.sm },
  lineActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  emptyText: { color: '#8397BA', textAlign: 'center', paddingVertical: 8 },
  summaryMeta: { color: '#AFC3E6', fontSize: theme.font.sm, marginBottom: 3 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  footerStepOne: {
    backgroundColor: '#081226',
    borderColor: '#102A52',
  },
  footerStepTwo: {
    backgroundColor: '#08182F',
    borderColor: '#173A66',
  },
  footerStepThree: {
    backgroundColor: '#081D38',
    borderColor: '#1B456F',
  },
  footerTotalWrap: {
    minWidth: 92,
  },
  footerLabel: { color: '#91A7CC', fontSize: theme.font.xs },
  footerTotal: { color: '#EAF1FF', fontSize: theme.font.md, fontWeight: theme.weight.bold },
  footerLabelStepOne: { color: '#6F87B3' },
  footerTotalStepOne: { color: '#AFC3E6', fontSize: theme.font.sm },
  footerLabelStepTwo: { color: '#9FB4D9' },
  footerTotalStepTwo: { color: '#EAF1FF', fontSize: theme.font.md },
  footerLabelStepThree: { color: '#BFD0EE' },
  footerTotalStepThree: { color: '#F3F7FF', fontSize: theme.font.md },
  footerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  backBtn: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#29466F',
    backgroundColor: '#243956',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  backBtnText: { color: '#DDE8FF', fontSize: theme.font.xs, fontWeight: theme.weight.bold },
  primaryBtn: {
    height: 40,
    borderRadius: 10,
    backgroundColor: '#2E6BFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  primaryBtnStepTwoEmpty: {
    backgroundColor: '#2A5FD9',
  },
  primaryBtnStepThree: {
    backgroundColor: '#2D67EF',
  },
  primaryBtnText: { color: '#F0F6FF', fontSize: theme.font.xs, fontWeight: theme.weight.bold },
});
