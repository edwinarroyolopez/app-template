import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, CheckCircle2, Clock3, FileText, Pencil, Plus, Save, TriangleAlert } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { ActionLoader } from '@/components/ui/ActionLoader';
import ImageViewerModal from '@/components/ui/ImageViewerModal';
import type { AppStackParamList } from '@/navigation/AppNavigator';
import { theme } from '@/theme';
import { formatMoneyInput, parseMoneyInput } from '@/utils/money';
import { usePurchaseInvoiceDetail } from '../hooks/usePurchaseInvoiceDetail';
import { useAddPurchaseInvoicePayment } from '../hooks/useAddPurchaseInvoicePayment';
import { PurchasePaymentSummary } from '../components/PurchasePaymentSummary';
import { PurchasePaymentModal } from '../components/PurchasePaymentModal';
import { PurchaseInvoiceEventCard } from '../components/PurchaseInvoiceEventCard';
import type { PurchaseStatus } from '../types/purchase.type';
import { shortInvoiceId } from '../utils/purchaseInvoices';
import { useUpdatePurchaseSalePrice } from '../hooks/useUpdatePurchaseSalePrice';

type Params = RouteProp<AppStackParamList, 'PurchaseInvoiceDetail'>;

function formatAmount(value: number) {
  return `$${(value || 0).toLocaleString('es-CO')}`;
}

function formatDate(value?: string) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleDateString('es-CO', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getStatusUI(status: PurchaseStatus) {
  if (status === 'PAGADA') return { label: 'PAGADA', color: '#22C55E', bg: '#0B2B25', icon: CheckCircle2 };
  if (status === 'VENCIDA') return { label: 'VENCIDA', color: '#EF4444', bg: '#35121B', icon: TriangleAlert };
  return { label: 'PENDIENTE', color: '#F8C74A', bg: '#2E2412', icon: Clock3 };
}

export default function PurchaseInvoiceDetailScreen() {
  const route = useRoute<Params>();
  const navigation = useNavigation<any>();
  const { invoiceKey } = route.params;

  const { invoice, isLoading, refetch } = usePurchaseInvoiceDetail(invoiceKey);
  const addPayment = useAddPurchaseInvoicePayment();
  const updateSalePrice = useUpdatePurchaseSalePrice();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentImages, setPaymentImages] = useState<Array<{ uri: string; name?: string; type?: string }>>([]);
  const [viewerImageUrl, setViewerImageUrl] = useState<string | undefined>(undefined);
  const [editingSalePriceByLine, setEditingSalePriceByLine] = useState<Record<string, boolean>>({});
  const [salePriceDraftByLine, setSalePriceDraftByLine] = useState<Record<string, string>>({});

  if (isLoading) {
    return (
      <MainLayout hideHeader hideBottomBar>
        <View style={styles.emptyWrap}>
          <ActivityIndicator color={theme.colors.accent} />
          <Text style={styles.emptyTitle}>Cargando factura...</Text>
        </View>
      </MainLayout>
    );
  }

  if (!invoice) {
    return (
      <MainLayout hideHeader hideBottomBar>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Factura no encontrada</Text>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Volver</Text>
          </Pressable>
        </View>
      </MainLayout>
    );
  }

  const statusUI = getStatusUI(invoice.status);
  const StatusIcon = statusUI.icon;
  const canRegisterPayment = invoice.status !== 'PAGADA' && invoice.paymentType !== 'CONTADO';

  async function handleSavePayment() {
    if (!invoice) return;
    const amountCop = parseMoneyInput(paymentAmount);
    if (!amountCop || addPayment.isPending) return;

    try {
      await addPayment.mutateAsync({
        invoiceGroupId: invoice.invoiceKey,
        provider: invoice.provider,
        invoiceDate: invoice.invoiceDate,
        amountCop,
        note: paymentNote.trim() || undefined,
        images: paymentImages,
      });

      Toast.show({ type: 'success', text1: 'Abono registrado' });
      setPaymentAmount('');
      setPaymentNote('');
      setPaymentImages([]);
      setShowPaymentModal(false);
      refetch();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo registrar el abono',
        text2: error?.response?.data?.message || undefined,
      });
    }
  }

  function resolveLineId(item: any, index: number) {
    return String(item?._id || item?.id || index);
  }

  function resolveLineSalePrice(item: any) {
    if (typeof item?.productId === 'object' && item?.productId) {
      return Number(item.productId.salePrice || 0);
    }

    return 0;
  }

  function startEditingSalePrice(lineId: string, currentSalePrice: number) {
    setEditingSalePriceByLine((prev) => ({ ...prev, [lineId]: true }));
    setSalePriceDraftByLine((prev) => ({
      ...prev,
      [lineId]: formatMoneyInput(String(Math.max(0, Math.round(currentSalePrice || 0)))),
    }));
  }

  async function saveSalePrice(item: any, lineId: string) {
    const nextSalePrice = parseMoneyInput(salePriceDraftByLine[lineId] || '0');
    const purchaseId = item?._id || item?.id;
    if (!purchaseId || Number.isNaN(nextSalePrice) || nextSalePrice < 0) return;

    try {
      await updateSalePrice.mutateAsync({
        purchaseId: String(purchaseId),
        salePrice: nextSalePrice,
      });
      Toast.show({ type: 'success', text1: 'Precio de venta actualizado' });
      setEditingSalePriceByLine((prev) => ({ ...prev, [lineId]: false }));
      refetch();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo actualizar precio de venta',
        text2: error?.response?.data?.message || undefined,
      });
    }
  }

  return (
    <MainLayout hideHeader hideBottomBar>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.headerBack}>
            <ArrowLeft size={18} color={theme.colors.textPrimary} />
          </Pressable>

          <View style={styles.headerMain}>
            <Text style={styles.headerTitle}>Detalle de factura</Text>
            <Text style={styles.headerSub}>#{shortInvoiceId(invoice.invoiceKey)}</Text>
          </View>

          <View style={[styles.statusChip, { backgroundColor: statusUI.bg, borderColor: `${statusUI.color}66` }]}>
            <Text style={[styles.statusChipText, { color: statusUI.color }]}>{statusUI.label}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.invoiceCard}>
            <View style={styles.invoiceTitleRow}>
              <View style={[styles.statusIconWrap, { backgroundColor: statusUI.bg }]}>
                <StatusIcon size={16} color={statusUI.color} />
              </View>

              <View style={styles.invoiceMain}>
                <Text style={styles.providerText}>{invoice.provider || 'Proveedor sin nombre'}</Text>
                <Text style={styles.metaText}>{formatDate(invoice.invoiceDate)}</Text>
                <Text style={styles.metaText}>
                  {invoice.paymentType === 'CONTADO' ? 'Compra de contado' : 'Compra a credito'}
                </Text>
              </View>
            </View>

            <View style={styles.amountRow}>
              <Text style={styles.amountText}>{formatAmount(invoice.totalAmount)}</Text>

              <View style={styles.assetActionsRow}>
                <Pressable
                  style={[styles.assetActionBtn, !invoice.invoiceImageUrl && styles.assetActionBtnDisabled]}
                  disabled={!invoice.invoiceImageUrl}
                  onPress={() => setViewerImageUrl(invoice.invoiceImageUrl)}
                >
                  <FileText size={16} color={invoice.invoiceImageUrl ? theme.colors.accent : '#5A6F95'} />
                </Pressable>
              </View>
            </View>

            <PurchasePaymentSummary
              totalAmount={invoice.totalAmount}
              paidAmount={invoice.paidAmountCop}
              remainingAmount={invoice.remainingAmountCop}
            />
          </View>

          {canRegisterPayment && (
            <Pressable style={styles.primaryActionBtn} onPress={() => setShowPaymentModal(true)}>
              <Plus size={16} color="#F0F6FF" />
              <Text style={styles.primaryActionText}>Registrar abono</Text>
            </Pressable>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Productos de la factura</Text>
          </View>

          <FlatList
            data={invoice.lines}
            keyExtractor={(item, index) => String(item._id || item.id || index)}
            scrollEnabled={false}
            contentContainerStyle={styles.linesList}
            renderItem={({ item, index }) => {
              const lineId = resolveLineId(item, index);
              const productName =
                typeof item.productId === 'string' ? item.productName || 'Producto' : item.productId?.name;
              const lineSalePrice = resolveLineSalePrice(item);
              const isEditingSalePrice = !!editingSalePriceByLine[lineId];
              const salePriceDraft = salePriceDraftByLine[lineId] ?? formatMoneyInput(String(lineSalePrice));

              return (
                <View style={styles.lineCard}>
                  <View style={styles.lineMain}>
                    <Text style={styles.lineName}>{productName || 'Producto'}</Text>
                    <Text style={styles.lineMeta}>
                      {item.quantity} x {formatAmount(item.unitPrice)}
                    </Text>
                    <View style={styles.salePriceEditRow}>
                      <Text style={styles.salePriceEditLabel}>Venta</Text>

                      {isEditingSalePrice ? (
                        <TextInput
                          value={salePriceDraft}
                          onChangeText={(value) =>
                            setSalePriceDraftByLine((prev) => ({
                              ...prev,
                              [lineId]: formatMoneyInput(value),
                            }))
                          }
                          keyboardType="numeric"
                          style={styles.salePriceInput}
                          placeholder="$0"
                          placeholderTextColor="#7E94BE"
                        />
                      ) : (
                        <Text style={styles.salePriceEditValue}>{formatAmount(lineSalePrice)}</Text>
                      )}

                      <Pressable
                        style={[styles.salePriceActionBtn, updateSalePrice.isPending && styles.salePriceActionBtnDisabled]}
                        onPress={() =>
                          isEditingSalePrice
                            ? saveSalePrice(item, lineId)
                            : startEditingSalePrice(lineId, lineSalePrice)
                        }
                        disabled={updateSalePrice.isPending}
                      >
                        {isEditingSalePrice ? (
                          <Save size={14} color="#9FC0FF" />
                        ) : (
                          <Pencil size={14} color="#9FC0FF" />
                        )}
                      </Pressable>
                    </View>
                  </View>
                  <Text style={styles.lineAmount}>{formatAmount(item.totalAmount)}</Text>
                </View>
              );
            }}
          />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Timeline de eventos</Text>
          </View>

          <View style={styles.timelineWrap}>
            {invoice.timeline.map((event, index) => (
              <PurchaseInvoiceEventCard
                key={`${event.type}-${event.createdAt}-${index}`}
                event={event}
                isLast={index === invoice.timeline.length - 1}
                onPhotoPress={(url) => setViewerImageUrl(url)}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      <PurchasePaymentModal
        visible={showPaymentModal}
        totalAmount={invoice.totalAmount}
        paidAmount={invoice.paidAmountCop}
        remainingAmount={invoice.remainingAmountCop}
        amountInput={paymentAmount}
        note={paymentNote}
        onAmountChange={(value) => setPaymentAmount(formatMoneyInput(value))}
        onNoteChange={setPaymentNote}
        onClose={() => setShowPaymentModal(false)}
        onSave={handleSavePayment}
        images={paymentImages}
        onImagesChange={setPaymentImages}
      />

      <ImageViewerModal
        visible={!!viewerImageUrl}
        imageUrl={viewerImageUrl}
        onClose={() => setViewerImageUrl(undefined)}
      />

      <ActionLoader
        visible={addPayment.isPending}
        steps={[
          'Validando abono...',
          'Registrando movimiento...',
          'Actualizando estado de la factura...',
          'Guardando evento...',
          'Finalizando abono...',
        ]}
      />
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#081226' },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#081226',
  },
  emptyTitle: { color: '#EAF1FF', fontSize: theme.font.md, fontWeight: theme.weight.bold },
  backBtn: {
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { color: '#9FC0FF', fontWeight: theme.weight.semibold },
  headerRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#16315E',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerBack: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0A1835',
    borderWidth: 1,
    borderColor: '#1F3765',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMain: { flex: 1 },
  headerTitle: { color: '#EAF1FF', fontWeight: theme.weight.bold, fontSize: theme.font.md },
  headerSub: { color: '#91A7CC', fontSize: theme.font.xs },
  statusChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusChipText: { fontSize: 11, fontWeight: theme.weight.bold },
  content: { padding: 16, paddingBottom: 24, gap: 10 },
  invoiceCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#16315E',
    backgroundColor: '#08182F',
    padding: 12,
    gap: 10,
  },
  invoiceTitleRow: { flexDirection: 'row', alignItems: 'center' },
  statusIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  invoiceMain: { flex: 1 },
  providerText: { color: '#EAF1FF', fontWeight: theme.weight.bold, fontSize: theme.font.md },
  metaText: { color: '#91A7CC', marginTop: 2, fontSize: theme.font.xs },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  amountText: {
    color: theme.colors.textPrimary,
    fontSize: 34,
    fontWeight: theme.weight.bold,
  },
  assetActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assetActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetActionBtnDisabled: {
    opacity: 0.5,
  },
  primaryActionBtn: {
    height: 42,
    borderRadius: 12,
    backgroundColor: '#2E6BFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  primaryActionText: {
    color: '#F0F6FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.sm,
  },
  sectionHeader: { marginTop: 4, marginBottom: 2 },
  sectionTitle: { color: '#EAF1FF', fontWeight: theme.weight.bold, fontSize: theme.font.md },
  linesList: { gap: 8 },
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
  salePriceEditRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  salePriceEditLabel: {
    color: '#8EA4CC',
    fontSize: 11,
    minWidth: 36,
  },
  salePriceEditValue: {
    color: '#DCE8FF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  salePriceInput: {
    minWidth: 92,
    borderWidth: 1,
    borderColor: '#1F3765',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: '#DCE8FF',
    backgroundColor: '#081632',
    fontSize: 12,
  },
  salePriceActionBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    alignItems: 'center',
    justifyContent: 'center',
  },
  salePriceActionBtnDisabled: {
    opacity: 0.5,
  },
  lineAmount: { color: '#9FC0FF', fontWeight: theme.weight.bold, fontSize: theme.font.sm },
  timelineWrap: { gap: 8 },
});
