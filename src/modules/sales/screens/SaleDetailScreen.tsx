import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft,
  CalendarClock,
  Hammer,
  ChevronRight,
  Clock3,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { Input } from '@/components/ui/Input';
import { ActionLoader } from '@/components/ui/ActionLoader';
import { ImageAttachmentField, type AttachmentImage } from '@/components/ui/ImageAttachmentField';
import ImageViewerModal from '@/components/ui/ImageViewerModal';
import { PaymentMethodSelector } from '@/components/ui/PaymentMethodSelector';
import { api } from '@/services/api';
import { theme } from '@/theme';
import { normalizePaymentMethod, type PaymentMethod } from '@/types/payment-method';
import type { AppStackParamList } from '@/navigation/AppNavigator';
import { useSaleDetail } from '../hooks/useSaleDetail';
import { useUpdateSale } from '../hooks/useUpdateSale';
import { useAddSaleEvent } from '../hooks/useAddSaleEvent';
import { useAddSalePayment } from '../hooks/useAddSalePayment';
import { useAttachSalePaymentProof } from '../hooks/useAttachSalePaymentProof';
import { useAttachSaleEvidence } from '../hooks/useAttachSaleEvidence';
import { useUpdateSaleLineOperationalStatus } from '../hooks/useUpdateSaleLineOperationalStatus';
import { useEmployees } from '@/modules/employees/hooks/useEmployees';
import { useImagePicker } from '@/hooks/useImagePicker';
import { SaleStatusSelectorModal } from '../components/SaleStatusSelectorModal';
import { ResponsibleSelectorModal } from '../components/ResponsibleSelectorModal';
import { SaleEventComposerModal } from '../components/SaleEventComposerModal';
import { SaleOverviewCard } from '../components/SaleOverviewCard';
import { SaleLineItemsCard } from '../components/SaleLineItemsCard';
import { SaleFinancialSummary } from '../components/SaleFinancialSummary';
import { SaleQuickActionsRow } from '../components/SaleQuickActionsRow';
import { SaleTimelineSection } from '../components/SaleTimelineSection';
import {
  allowedStatusesBySaleType,
  normalizePaymentStatus,
  normalizeSalePriority,
  normalizeSaleStatus,
  normalizeSaleType,
  salePaymentStatusConfig,
  salePriorityConfig,
  saleStatusConfig,
  saleStatusOrder,
  saleTypeConfig,
} from '../utils/saleStatus';
import type { SaleEvent, SaleItem, SaleStatus } from '../types/sale.type';
import { deriveDelayedInfo } from '../utils/delayedSales';

type Params = RouteProp<AppStackParamList, 'SaleDetail'>;

const MANUAL_EVENT_TYPES = [
  { value: 'CLIENT_CALLED', label: 'Cliente llamo' },
  { value: 'CALL_MADE', label: 'Se llamo al cliente' },
  { value: 'PRODUCT_CONDITION_CHANGED', label: 'Condiciones del producto' },
  { value: 'DELIVERY_DATE_CHANGED', label: 'Cambio fecha entrega' },
  { value: 'IMPORTANT_NOTE', label: 'Incidente general' },
  { value: 'MANUAL_NOTE', label: 'Nota con evidencia' },
] as const;

const PHOTO_EVENT_VALUES = new Set<string>(['MANUAL_NOTE']);

function money(value?: number) {
  return `$${Number(value || 0).toLocaleString('es-CO')}`;
}

function resolveEventSnapshotUI(event?: SaleEvent | null) {
  if (!event) return null;

  if (event.statusSnapshot) {
    const normalized = normalizeSaleStatus(event.statusSnapshot);
    return {
      label: event.statusLabel || saleStatusConfig[normalized].label,
      color: event.statusColor || saleStatusConfig[normalized].color,
      bg: `${event.statusColor || saleStatusConfig[normalized].color}22`,
    };
  }

  const metadataTo = typeof event.metadata?.to === 'string' ? event.metadata.to : undefined;
  if (metadataTo && metadataTo in saleStatusConfig) {
    const normalized = normalizeSaleStatus(metadataTo);
    return {
      label: saleStatusConfig[normalized].label,
      color: saleStatusConfig[normalized].color,
      bg: saleStatusConfig[normalized].bg,
    };
  }

  return null;
}

export default function SaleDetailScreen() {
  const route = useRoute<Params>();
  const navigation = useNavigation<any>();
  const { saleId } = route.params;

  const { data: sale, isLoading, refetch } = useSaleDetail(saleId);
  const updateSale = useUpdateSale();
  const addSaleEvent = useAddSaleEvent();
  const addSalePayment = useAddSalePayment();
  const attachPaymentProof = useAttachSalePaymentProof();
  const attachSaleEvidence = useAttachSaleEvidence();
  const updateSaleLineOperationalStatus = useUpdateSaleLineOperationalStatus();

  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<SaleStatus | null>(null);
  const [rollbackReason, setRollbackReason] = useState('');

  const [showEventModal, setShowEventModal] = useState(false);
  const [eventType, setEventType] = useState<(typeof MANUAL_EVENT_TYPES)[number]['value']>('MANUAL_NOTE');
  const [eventMessage, setEventMessage] = useState('');
  const [eventImages, setEventImages] = useState<Array<{ uri: string; name?: string; type?: string }>>([]);
  const { takePhoto, pickFromGallery } = useImagePicker();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAttachPaymentProofModal, setShowAttachPaymentProofModal] = useState(false);
  const [showAttachSaleEvidenceModal, setShowAttachSaleEvidenceModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentMethodForAbono, setPaymentMethodForAbono] = useState<PaymentMethod>('EFECTIVO');
  const [paymentEvidenceImages, setPaymentEvidenceImages] = useState<AttachmentImage[]>([]);

  const [showDelayManagementModal, setShowDelayManagementModal] = useState(false);
  const [showManufacturerModal, setShowManufacturerModal] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [manufacturerSearch, setManufacturerSearch] = useState('');
  const [delayReasonInput, setDelayReasonInput] = useState('');
  const [selectedResponsibleEmployeeId, setSelectedResponsibleEmployeeId] = useState<string | undefined>(undefined);
  const [selectedManufacturerEmployeeId, setSelectedManufacturerEmployeeId] = useState<string | undefined>(undefined);
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SaleEvent | null>(null);
  const [viewerImageUrl, setViewerImageUrl] = useState<string | undefined>(undefined);

  const employeesQuery = employeeSearch.trim().length >= 2 ? employeeSearch.trim() : undefined;
  const { data: employees = [] } = useEmployees(employeesQuery);
  const manufacturerQuery = manufacturerSearch.trim().length >= 2 ? manufacturerSearch.trim() : undefined;
  const { data: manufacturers = [] } = useEmployees(manufacturerQuery, 'MANUFACTURER');

  const timeline = [...(sale?.events || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  useEffect(() => {
    setDelayReasonInput(sale?.delayReason || '');
    setSelectedResponsibleEmployeeId(sale?.responsibleEmployeeId || undefined);
    setSelectedManufacturerEmployeeId(sale?.responsibleEmployeeId || undefined);
  }, [sale?.delayReason, sale?.responsibleEmployeeId]);

  if (isLoading) {
    return (
      <MainLayout>
        <View style={styles.centeredState}>
          <ActivityIndicator color={theme.colors.accent} />
          <Text style={styles.stateText}>Cargando venta...</Text>
        </View>
      </MainLayout>
    );
  }

  if (!sale) {
    return (
      <MainLayout>
        <View style={styles.centeredState}>
          <Text style={styles.stateText}>No encontramos la venta</Text>
          <Pressable onPress={() => navigation.goBack()} style={styles.stateBtn}>
            <Text style={styles.stateBtnText}>Volver</Text>
          </Pressable>
        </View>
      </MainLayout>
    );
  }

  const saleType = normalizeSaleType(sale.saleType, sale.deliveryType);
  const normalizedStatus = normalizeSaleStatus(sale.status);
  const normalizedPaymentStatus = normalizePaymentStatus(sale.paymentStatus);
  const normalizedPriority = normalizeSalePriority(sale.priority);
  const statusUI = saleStatusConfig[normalizedStatus];
  const paymentUI = salePaymentStatusConfig[normalizedPaymentStatus];
  const priorityUI = salePriorityConfig[normalizedPriority];

  const allowedStatuses = allowedStatusesBySaleType[saleType];
  const delayed = deriveDelayedInfo(sale as any);
  const isDelayed = sale.isDelayed ?? delayed.isDelayed;
  const delayedDays = sale.delayedDays ?? delayed.delayedDays;
  const totalAmountCop = Number(sale.amountCop || 0);
  const paidAmountCop = Number(sale.paidAmountCop || 0);
  const pendingAmountCop = Math.max(
    Number(sale.remainingAmountCop ?? totalAmountCop - paidAmountCop) || 0,
    0,
  );
  const rawItems: SaleItem[] = Array.isArray(sale.items) ? sale.items : [];
  const saleLineItems = rawItems.length
    ? rawItems.map((item) => {
        const quantity = Math.max(1, Number(item.quantity || 0));
        const unitPrice = Math.max(0, Number(item.unitPrice || 0));
        const subtotalCop = Number(item.subtotalCop ?? quantity * unitPrice);

        return {
          itemId: item.itemId,
          productName: item.productName || sale.product?.name || 'Producto sin nombre',
          quantity,
          unitPrice,
          subtotalCop,
          requiresManufacturing: Boolean(item.requiresManufacturing),
          operationalStatus: item.operationalStatus,
        };
      })
    : sale.product?.name
      ? [
          {
            itemId: 'legacy-line',
            productName: sale.product.name,
            quantity: 1,
            unitPrice: totalAmountCop,
            subtotalCop: totalAmountCop,
            requiresManufacturing: saleType === 'MANUFACTURE',
            operationalStatus: sale.status,
          },
        ]
      : [];
  const manufacturingProcesses = Array.isArray(sale.manufacturingItems)
    ? sale.manufacturingItems
    : [];
  const hasLongDetails = Boolean(sale.product?.details || sale.product?.dimensions || sale.observations || sale.client?.address);
  const enteredPaymentCop = Number(paymentAmount.replace(/\D/g, '')) || 0;
  const pendingAfterPaymentCop = Math.max(pendingAmountCop - enteredPaymentCop, 0);
  const selectedEventSnapshot = resolveEventSnapshotUI(selectedEvent);
  const normalizedPaymentMethod = String(sale.paymentMethod || '').toUpperCase();
  const paymentProofRequired =
    normalizedPaymentMethod === 'TRANSFERENCIA' || normalizedPaymentMethod === 'TARJETA';
  const paymentProofStatus = sale.paymentProofStatus || (paymentProofRequired
    ? sale.paymentProof?.receiptImageUrl
      ? 'ATTACHED'
      : 'PENDING'
    : 'NOT_REQUIRED');
  const isActionLoading =
    updateSale.isPending ||
    addSaleEvent.isPending ||
    addSalePayment.isPending ||
    attachPaymentProof.isPending ||
    attachSaleEvidence.isPending ||
    updateSaleLineOperationalStatus.isPending;

  useEffect(() => {
    if (!showPaymentModal) return;
    setPaymentMethodForAbono(normalizePaymentMethod(sale.paymentMethod));
    setPaymentEvidenceImages([]);
  }, [showPaymentModal, sale.paymentMethod]);

  async function performStatusChange(nextStatus: SaleStatus, reason?: string) {
    try {
      await updateSale.mutateAsync({
        saleId,
        payload: {
          status: nextStatus,
          eventMessage: `Cambio manual de estado a ${saleStatusConfig[nextStatus].label}`,
          rollbackReason: reason,
        },
      });

      Toast.show({ type: 'success', text1: 'Estado actualizado' });
      setRollbackReason('');
      setPendingStatus(null);
      setShowRollbackModal(false);
      refetch();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo actualizar',
        text2: error?.response?.data?.message || undefined,
      });
    }
  }

  async function handleChangeStatus(nextStatus: SaleStatus) {
    if (nextStatus === normalizedStatus || updateSale.isPending) return;

    const isRollback =
      (saleStatusOrder[nextStatus] || 0) < (saleStatusOrder[normalizedStatus] || 0);

    if (isRollback) {
      setPendingStatus(nextStatus);
      setShowRollbackModal(true);
      return;
    }

    await performStatusChange(nextStatus);
  }

  async function handleSaveManualEvent() {
    if (!eventMessage.trim() || addSaleEvent.isPending) return;

    try {
      await addSaleEvent.mutateAsync({
        saleId,
        payload: {
          type: eventType,
          message: eventMessage.trim(),
          images: eventImages,
        },
      });

      Toast.show({ type: 'success', text1: 'Evento agregado' });
      setEventMessage('');
      setEventType('MANUAL_NOTE');
      setEventImages([]);
      setShowEventModal(false);
      refetch();
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudo agregar el evento' });
    }
  }

  async function handleSavePaymentEvent() {
    const amountCop = Number(paymentAmount.replace(/\D/g, '')) || 0;
    if (!amountCop || addSalePayment.isPending) return;

    try {
      let evidence:
        | {
            imageUrl: string;
            publicId?: string;
            label?: string;
          }
        | undefined;

      const firstEvidence = paymentEvidenceImages[0];
      if (firstEvidence?.uri) {
        const uploaded = await uploadImageAsset(firstEvidence.uri, 'sale-payment-evidence');
        if (uploaded.url) {
          evidence = {
            imageUrl: uploaded.url,
            publicId: uploaded.publicId,
            label: 'Evidencia de abono',
          };
        }
      }

      await addSalePayment.mutateAsync({
        saleId,
        payload: {
          amountCop,
          note: paymentNote.trim() || undefined,
          paymentMethod: paymentMethodForAbono,
          evidence,
        },
      });

      Toast.show({ type: 'success', text1: 'Abono registrado' });
      setPaymentAmount('');
      setPaymentNote('');
      setPaymentEvidenceImages([]);
      setShowPaymentModal(false);
      refetch();
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudo registrar el abono' });
    }
  }

  async function uploadImageAsset(uri: string, filePrefix: string) {
    const extMatch = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    const ext = extMatch?.[1]?.toLowerCase() || 'jpg';
    const mimeByExt: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      heic: 'image/heic',
    };

    const form = new FormData();
    form.append('file', {
      uri,
      name: `${filePrefix}-${Date.now()}.${ext}`,
      type: mimeByExt[ext] || 'image/jpeg',
    } as any);

    const { data } = await api.post('/uploads', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return {
      url: String(data?.original || ''),
      publicId: data?.id ? String(data.id) : undefined,
    };
  }

  async function handleAttachPaymentProof(from: 'camera' | 'gallery') {
    try {
      const image =
        from === 'camera' ? await takePhoto() : await pickFromGallery();
      if (!image?.uri) return;

      const uploaded = await uploadImageAsset(image.uri, 'sale-payment-proof');
      if (!uploaded.url) throw new Error('UPLOAD_FAILED');

      await attachPaymentProof.mutateAsync({
        saleId,
        payload: {
          paymentMethod: sale.paymentMethod,
          receiptImageUrl: uploaded.url,
          receiptPublicId: uploaded.publicId,
        },
      });

      Toast.show({ type: 'success', text1: 'Comprobante adjuntado' });
      setShowAttachPaymentProofModal(false);
      refetch();
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudo adjuntar comprobante' });
    }
  }

  async function handleAttachSaleEvidence(from: 'camera' | 'gallery') {
    try {
      const image =
        from === 'camera' ? await takePhoto() : await pickFromGallery();
      if (!image?.uri) return;

      const uploaded = await uploadImageAsset(image.uri, 'sale-evidence');
      if (!uploaded.url) throw new Error('UPLOAD_FAILED');

      await attachSaleEvidence.mutateAsync({
        saleId,
        payload: {
          imageUrl: uploaded.url,
          publicId: uploaded.publicId,
          label: 'Evidencia comercial',
        },
      });

      Toast.show({ type: 'success', text1: 'Evidencia comercial adjuntada' });
      setShowAttachSaleEvidenceModal(false);
      refetch();
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudo adjuntar evidencia' });
    }
  }

  async function handleUpdateLineStatus(
    saleItemId: string,
    operationalStatus: 'LISTO_PARA_ENTREGAR' | 'ENTREGADA',
  ) {
    try {
      await updateSaleLineOperationalStatus.mutateAsync({
        saleId,
        saleItemId,
        payload: { operationalStatus },
      });
      Toast.show({ type: 'success', text1: 'Linea actualizada' });
      refetch();
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudo actualizar la linea' });
    }
  }

  async function handleSaveDelayManagement() {
    if (updateSale.isPending) return;

    try {
      await updateSale.mutateAsync({
        saleId,
        payload: {
          responsibleEmployeeId: selectedResponsibleEmployeeId || '',
          delayReason: delayReasonInput.trim(),
        },
      });

      Toast.show({ type: 'success', text1: 'Retraso actualizado' });
      setShowDelayManagementModal(false);
      refetch();
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudo actualizar retraso' });
    }
  }

  async function handleAssignManufacturer() {
    if (updateSale.isPending) return;

    try {
      await updateSale.mutateAsync({
        saleId,
        payload: {
          responsibleEmployeeId: selectedManufacturerEmployeeId || '',
        },
      });

      Toast.show({ type: 'success', text1: 'Fabricante actualizado' });
      setShowManufacturerModal(false);
      refetch();
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudo actualizar fabricante' });
    }
  }

  return (
    <MainLayout>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={20} color={theme.colors.textPrimary} />
          </Pressable>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Detalle de venta</Text>
            <Text style={styles.headerCode}>#{String(sale._id || sale.id || '').slice(-8)}</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {isDelayed && (
            <View style={[styles.delayedCard, styles.delayedCardTop]}>
              <View style={styles.delayedHeader}>
                <Clock3 size={18} color="#F87171" />
                <Text style={styles.delayedTitle}>Venta retrasada</Text>
                <Text style={styles.delayedDays}>{delayedDays} dias</Text>
              </View>

              <Text style={styles.delayedReasonText}>
                Motivo: {sale.delayReason || 'Entrega vencida y venta aun abierta'}
              </Text>

              <Text style={styles.delayedResponsibleText}>
                Responsable:{' '}
                {sale.responsibleEmployee
                  ? `${sale.responsibleEmployee.name || ''} ${sale.responsibleEmployee.lastName || ''}`.trim()
                  : 'Sin asignar'}
              </Text>

              <Pressable style={styles.responsibleBtn} onPress={() => setShowDelayManagementModal(true)}>
                <Text style={styles.responsibleBtnText}>Gestionar retraso</Text>
              </Pressable>
            </View>
          )}

          {saleType === 'MANUFACTURE' && (
            <View style={styles.manufactureCardTop}>
              <View style={styles.manufactureHeaderRow}>
                <Clock3 size={16} color="#60A5FA" />
                <Text style={styles.manufactureTitle}>Pedido en fabrica</Text>
              </View>

              <Text style={styles.manufactureResponsibleText}>
                Fabricante:{' '}
                {sale.responsibleEmployee
                  ? `${sale.responsibleEmployee.name || ''} ${sale.responsibleEmployee.lastName || ''}`.trim()
                  : 'Sin asignar'}
              </Text>

              <Pressable style={styles.manufactureAssignBtn} onPress={() => setShowManufacturerModal(true)}>
                <Text style={styles.manufactureAssignBtnText}>Asignar fabricante</Text>
              </Pressable>
            </View>
          )}

          <SaleOverviewCard
            totalAmountCop={totalAmountCop}
            statusLabel={statusUI.label}
            statusColor={statusUI.color}
            statusBg={statusUI.bg}
            date={sale.date}
            paymentMethod={sale.paymentMethod}
            saleTypeLabel={saleTypeConfig[saleType].label}
            priorityLabel={priorityUI.label}
            priorityColor={priorityUI.color}
            priorityBg={priorityUI.bg}
            paymentStatusLabel={paymentUI.label}
            paymentStatusColor={paymentUI.color}
            paymentStatusBg={paymentUI.bg}
            clientName={sale.client?.name}
            clientPhone={sale.client?.phone}
            invoiceImageUrl={sale.invoiceImageUrl}
            productImageUrl={sale.product?.imageUrl}
            onOpenInvoiceImage={() => setViewerImageUrl(sale.invoiceImageUrl)}
            onOpenProductImage={() => setViewerImageUrl(sale.product?.imageUrl)}
          />

          <View style={styles.attachmentsCard}>
            {paymentProofRequired ? (
              <>
                <View style={styles.attachmentRow}>
                  <View style={styles.attachmentMain}>
                    <Text style={styles.attachmentTitle}>Comprobante de pago</Text>
                    <Text style={styles.attachmentHint}>
                      {paymentProofStatus === 'ATTACHED'
                        ? 'Adjunto'
                        : 'Pendiente de adjuntar'}
                    </Text>
                  </View>
                  {paymentProofStatus === 'ATTACHED' && sale.paymentProof?.receiptImageUrl ? (
                    <Pressable
                      style={styles.attachmentViewBtn}
                      onPress={() => setViewerImageUrl(sale.paymentProof?.receiptImageUrl)}
                    >
                      <Text style={styles.attachmentViewBtnText}>Ver</Text>
                    </Pressable>
                  ) : null}
                </View>

                {paymentProofStatus !== 'ATTACHED' && (
                  <Pressable
                    style={styles.attachmentPrimaryBtn}
                    onPress={() => setShowAttachPaymentProofModal(true)}
                  >
                    <Text style={styles.attachmentPrimaryBtnText}>Adjuntar comprobante</Text>
                  </Pressable>
                )}
              </>
            ) : null}

            <View
              style={[
                styles.attachmentRow,
                paymentProofRequired && styles.attachmentSeparator,
              ]}
            >
              <View style={styles.attachmentMain}>
                <Text style={styles.attachmentTitle}>Evidencia comercial</Text>
                <Text style={styles.attachmentHint}>
                  {sale.saleEvidence?.imageUrl ? 'Adjunta' : 'Opcional'}
                </Text>
              </View>
              {sale.saleEvidence?.imageUrl ? (
                <Pressable
                  style={styles.attachmentViewBtn}
                  onPress={() => setViewerImageUrl(sale.saleEvidence?.imageUrl)}
                >
                  <Text style={styles.attachmentViewBtnText}>Ver</Text>
                </Pressable>
              ) : null}
            </View>

            <Pressable
              style={styles.attachmentSecondaryBtn}
              onPress={() => setShowAttachSaleEvidenceModal(true)}
            >
              <Text style={styles.attachmentSecondaryBtnText}>
                {sale.saleEvidence?.imageUrl ? 'Actualizar evidencia' : 'Adjuntar evidencia'}
              </Text>
            </Pressable>
          </View>

          <SaleLineItemsCard
            items={saleLineItems}
            totalAmountCop={totalAmountCop}
            onMarkReadyForDelivery={(itemId) =>
              handleUpdateLineStatus(itemId, 'LISTO_PARA_ENTREGAR')
            }
            onMarkDelivered={(itemId) => handleUpdateLineStatus(itemId, 'ENTREGADA')}
            actionsDisabled={updateSaleLineOperationalStatus.isPending}
          />

          {manufacturingProcesses.length > 0 && (
            <View style={styles.manufacturingProcessesCard}>
              <View style={styles.manufacturingProcessesHead}>
                <Hammer size={16} color="#60A5FA" />
                <Text style={styles.manufacturingProcessesTitle}>Procesos de fabricacion</Text>
                <Text style={styles.manufacturingProcessesCount}>{manufacturingProcesses.length}</Text>
              </View>
              <Text style={styles.manufacturingProcessesSubtitle}>Cada linea fabricable se gestiona de forma independiente.</Text>

              {manufacturingProcesses.map((item: any) => (
                <Pressable
                  key={item.manufacturingItemId}
                  style={styles.manufacturingProcessRow}
                  onPress={() =>
                    navigation.navigate('FactoryOrderDetail', {
                      processId: item.manufacturingItemId,
                      saleId,
                      mode: item.operationalStatus === 'LISTO_PARA_ENTREGAR' ? 'DELIVERY' : 'FACTORY',
                    })
                  }
                >
                  <View style={styles.manufacturingProcessMain}>
                    <Text style={styles.manufacturingProcessName} numberOfLines={1}>{item.productName}</Text>
                    <Text style={styles.manufacturingProcessMeta}>Cant. {item.quantity} - {item.operationalStatus}</Text>
                  </View>
                  <ChevronRight size={16} color="#8EA4CC" />
                </Pressable>
              ))}
            </View>
          )}

          <SaleFinancialSummary
            totalAmountCop={totalAmountCop}
            paidAmountCop={paidAmountCop}
            pendingAmountCop={pendingAmountCop}
          />

          {hasLongDetails && (
            <View style={styles.secondaryDetailsCard}>
              <Text style={styles.secondaryDetailsTitle}>Detalle complementario</Text>
              {!!sale.client?.address && <Text style={styles.longText}>Direccion: {sale.client.address}</Text>}
              {!!sale.product?.details && <Text style={styles.longText}>Detalle: {sale.product.details}</Text>}
              {!!sale.product?.dimensions && <Text style={styles.longText}>Dimensiones: {sale.product.dimensions}</Text>}
              {!!sale.observations && <Text style={styles.longText}>Observaciones: {sale.observations}</Text>}
            </View>
          )}

          {saleType !== 'IMMEDIATE' && (
            <View style={styles.deliveryCard}>
              <CalendarClock size={18} color={theme.colors.warning} />
              <View style={styles.deliveryTextWrap}>
                <Text style={styles.deliveryTitle}>Fecha de entrega</Text>
                <Text style={styles.deliveryValue}>
                  {sale.deliveryDate
                    ? new Date(sale.deliveryDate).toLocaleDateString('es-CO', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'Pendiente por definir'}
                </Text>
              </View>
            </View>
          )}

          <SaleQuickActionsRow
            pendingAmountCop={pendingAmountCop}
            onAddEvent={() => setShowEventModal(true)}
            onAddPayment={() => setShowPaymentModal(true)}
          />

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Estado operativo</Text>
            <Text style={styles.sectionSubtitle}>
              {isDelayed ? 'Venta retrasada: actualiza estado y responsable.' : 'Estado actual y siguiente paso de la venta.'}
            </Text>
          </View>

          <Pressable style={styles.statusSelectorBtn} onPress={() => setShowStatusModal(true)}>
            <View style={styles.statusSelectorLeft}>
              <View
                style={[
                  styles.statusSelectorChip,
                  { borderColor: `${statusUI.color}66`, backgroundColor: statusUI.bg },
                ]}
              >
                <Text style={[styles.statusSelectorChipText, { color: statusUI.color }]}>{statusUI.label}</Text>
              </View>
              <Text style={styles.statusSelectorHint}>Estado actual y siguiente paso operativo</Text>
            </View>
            <ChevronRight size={18} color={theme.colors.textMuted} />
          </Pressable>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Historial reciente</Text>
            <Text style={styles.sectionSubtitle}>Trazabilidad completa de cambios y eventos.</Text>
          </View>

          <SaleTimelineSection
            timeline={timeline}
            onPhotoPress={(url) => setViewerImageUrl(url)}
            onOpenEventDetail={(event) => {
              setSelectedEvent(event);
              setShowEventDetailModal(true);
            }}
          />
        </ScrollView>
      </View>

      <Modal
        visible={showDelayManagementModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDelayManagementModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Gestionar retraso</Text>
            <Text style={styles.modalSubtitle}>Actualiza motivo y responsable en un solo paso.</Text>

            <Input
              value={delayReasonInput}
              onChangeText={setDelayReasonInput}
              placeholder="Motivo operativo del retraso"
              multiline
              numberOfLines={3}
              style={styles.modalInput}
            />

            <Input
              value={employeeSearch}
              onChangeText={setEmployeeSearch}
              placeholder="Buscar empleado"
              style={styles.modalInputSpacing}
            />

            <ScrollView style={styles.responsibleList}>
              <Pressable
                style={[
                  styles.responsibleOption,
                  !selectedResponsibleEmployeeId && styles.responsibleOptionActive,
                ]}
                onPress={() => setSelectedResponsibleEmployeeId(undefined)}
              >
                <Text
                  style={[
                    styles.responsibleOptionText,
                    !selectedResponsibleEmployeeId && styles.responsibleOptionTextActive,
                  ]}
                >
                  Sin asignar
                </Text>
              </Pressable>

              {(employees as any[]).map((employee) => {
                const fullName = `${employee.name || ''} ${employee.lastName || ''}`.trim();
                const active = selectedResponsibleEmployeeId === employee._id;

                return (
                  <Pressable
                    key={employee._id}
                    style={[styles.responsibleOption, active && styles.responsibleOptionActive]}
                    onPress={() => setSelectedResponsibleEmployeeId(employee._id)}
                  >
                    <Text style={[styles.responsibleOptionText, active && styles.responsibleOptionTextActive]}>
                      {fullName}
                    </Text>
                    <Text style={styles.responsibleOptionPhone}>{employee.phone}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.modalActionsRow}>
              <Pressable style={styles.modalGhostBtn} onPress={() => setShowDelayManagementModal(false)}>
                <Text style={styles.modalGhostText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.modalPrimaryBtn} onPress={handleSaveDelayManagement}>
                <Text style={styles.modalPrimaryText}>Guardar cambios</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ResponsibleSelectorModal
        visible={showManufacturerModal}
        title="Asignar fabricante"
        subtitle="Solo empleados con rol fabricante."
        searchValue={manufacturerSearch}
        searchPlaceholder="Buscar fabricante"
        options={manufacturers as any[]}
        selectedId={selectedManufacturerEmployeeId}
        onClose={() => setShowManufacturerModal(false)}
        onSearchChange={setManufacturerSearch}
        onSelect={setSelectedManufacturerEmployeeId}
        onSave={handleAssignManufacturer}
      />

      <Modal
        visible={showEventDetailModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEventDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Detalle del evento</Text>
            <Text style={styles.modalSubtitle}>{selectedEvent?.type?.split('_').join(' ')}</Text>

            {selectedEventSnapshot && (
              <View
                style={[
                  styles.eventStatusSnapshotTag,
                  {
                    borderColor: `${selectedEventSnapshot.color}66`,
                    backgroundColor: selectedEventSnapshot.bg,
                  },
                ]}
              >
                <Text style={[styles.eventStatusSnapshotText, { color: selectedEventSnapshot.color }]}>
                  Estado al momento: {selectedEventSnapshot.label}
                </Text>
              </View>
            )}

            <Text style={styles.eventDetailText}>{selectedEvent?.message}</Text>
            <Text style={styles.eventDetailMeta}>
              Usuario: {selectedEvent?.createdByName || selectedEvent?.createdBy || 'Sistema'}
            </Text>
            <Text style={styles.eventDetailMeta}>
              Fecha: {selectedEvent?.createdAt ? new Date(selectedEvent.createdAt).toLocaleString('es-CO') : 'N/A'}
            </Text>

            {!!selectedEvent?.photos?.length && (
              <View style={styles.eventDetailPhotosWrap}>
                {selectedEvent.photos.map((photo: any, idx: number) => (
                  <Pressable key={`${photo.url}-${idx}`} onPress={() => setViewerImageUrl(photo.url)}>
                    <Image source={{ uri: photo.url }} style={styles.eventDetailPhoto} />
                  </Pressable>
                ))}
              </View>
            )}

            <View style={styles.modalActionsRow}>
              <Pressable style={styles.modalGhostBtn} onPress={() => setShowEventDetailModal(false)}>
                <Text style={styles.modalGhostText}>Cerrar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showRollbackModal} transparent animationType="fade" onRequestClose={() => setShowRollbackModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Justificacion requerida</Text>
            <Text style={styles.modalSubtitle}>
              Este cambio es un rollback de estado. Debes registrar el motivo.
            </Text>

            <Input
              value={rollbackReason}
              onChangeText={setRollbackReason}
              placeholder="Explica por que la venta retrocede de estado"
              multiline
              numberOfLines={4}
              style={styles.modalInput}
            />

            <View style={styles.modalActionsRow}>
              <Pressable style={styles.modalGhostBtn} onPress={() => setShowRollbackModal(false)}>
                <Text style={styles.modalGhostText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={styles.modalPrimaryBtn}
                onPress={() => {
                  if (!rollbackReason.trim() || !pendingStatus) return;
                  performStatusChange(pendingStatus, rollbackReason.trim());
                }}
              >
                <Text style={styles.modalPrimaryText}>Confirmar rollback</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <SaleStatusSelectorModal
        visible={showStatusModal}
        currentStatus={normalizedStatus}
        options={allowedStatuses}
        onClose={() => setShowStatusModal(false)}
        onSelect={handleChangeStatus}
      />

      <SaleEventComposerModal
        visible={showEventModal}
        title="Agregar evento"
        typeModalTitle="Tipo de evento manual"
        typeLabel="Tipo de evento manual"
        eventTypes={MANUAL_EVENT_TYPES as unknown as Array<{ value: string; label: string }>}
        selectedType={eventType}
        message={eventMessage}
        messagePlaceholder="Describe el acontecimiento"
        submitLabel="Guardar evento"
        canAttachImages={PHOTO_EVENT_VALUES.has(eventType)}
        images={eventImages}
        onClose={() => {
          setShowEventModal(false);
          setEventImages([]);
        }}
        onSelectType={(value) => setEventType(value as (typeof MANUAL_EVENT_TYPES)[number]['value'])}
        onMessageChange={setEventMessage}
        onImagesChange={setEventImages}
        onSubmit={handleSaveManualEvent}
      />

      <Modal visible={showPaymentModal} transparent animationType="fade" onRequestClose={() => setShowPaymentModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Registrar abono</Text>
            <Text style={styles.modalSubtitle}>Este abono actualiza el estado de pago y deja evento.</Text>

            <View style={styles.paymentSummaryRow}>
              <View style={styles.paymentSummaryCard}>
                <Text style={styles.paymentSummaryLabel}>Total</Text>
                <Text style={styles.paymentSummaryValue}>{money(totalAmountCop)}</Text>
              </View>

              <View style={[styles.paymentSummaryCard, styles.paymentSummaryPaidCard]}>
                <Text style={styles.paymentSummaryLabel}>Pagado</Text>
                <Text style={[styles.paymentSummaryValue, styles.paymentSummaryPaidValue]}>{money(paidAmountCop)}</Text>
              </View>

              <View style={[styles.paymentSummaryCard, styles.paymentSummaryPendingCard]}>
                <Text style={styles.paymentSummaryLabel}>Pendiente</Text>
                <Text style={[styles.paymentSummaryValue, styles.paymentSummaryPendingValue]}>{money(pendingAmountCop)}</Text>
              </View>
            </View>

            {!!enteredPaymentCop && (
              <Text style={styles.paymentProjectionText}>
                Saldo proyectado despues de este abono: {money(pendingAfterPaymentCop)}
              </Text>
            )}

            <Input
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              placeholder="Monto del abono"
              keyboardType="numeric"
            />

            <Input
              value={paymentNote}
              onChangeText={setPaymentNote}
              placeholder="Observacion opcional"
              style={styles.modalInputSpacing}
            />

            <PaymentMethodSelector
              label="Metodo de pago"
              value={paymentMethodForAbono}
              onChange={setPaymentMethodForAbono}
            />

            <ImageAttachmentField
              title="Evidencia del abono (opcional)"
              helperText="Adjunta recibo o soporte del pago realizado."
              images={paymentEvidenceImages}
              onChange={setPaymentEvidenceImages}
              maxImages={1}
            />

            <View style={styles.modalActionsRow}>
              <Pressable
                style={styles.modalGhostBtn}
                onPress={() => {
                  setShowPaymentModal(false);
                  setPaymentEvidenceImages([]);
                }}
              >
                <Text style={styles.modalGhostText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.modalPrimaryBtn} onPress={handleSavePaymentEvent}>
                <Text style={styles.modalPrimaryText}>Guardar abono</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAttachPaymentProofModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAttachPaymentProofModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Adjuntar comprobante</Text>
            <Text style={styles.modalSubtitle}>Soporte de pago para transferencia o tarjeta.</Text>
            <View style={styles.modalActionsRow}>
              <Pressable style={styles.modalGhostBtn} onPress={() => handleAttachPaymentProof('camera')}>
                <Text style={styles.modalGhostText}>Camara</Text>
              </Pressable>
              <Pressable style={styles.modalPrimaryBtn} onPress={() => handleAttachPaymentProof('gallery')}>
                <Text style={styles.modalPrimaryText}>Galeria</Text>
              </Pressable>
            </View>
            <Pressable style={styles.modalLinkBtn} onPress={() => setShowAttachPaymentProofModal(false)}>
              <Text style={styles.modalLinkText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAttachSaleEvidenceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAttachSaleEvidenceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Adjuntar evidencia comercial</Text>
            <Text style={styles.modalSubtitle}>Factura, remision o soporte comercial de la venta.</Text>
            <View style={styles.modalActionsRow}>
              <Pressable style={styles.modalGhostBtn} onPress={() => handleAttachSaleEvidence('camera')}>
                <Text style={styles.modalGhostText}>Camara</Text>
              </Pressable>
              <Pressable style={styles.modalPrimaryBtn} onPress={() => handleAttachSaleEvidence('gallery')}>
                <Text style={styles.modalPrimaryText}>Galeria</Text>
              </Pressable>
            </View>
            <Pressable style={styles.modalLinkBtn} onPress={() => setShowAttachSaleEvidenceModal(false)}>
              <Text style={styles.modalLinkText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ImageViewerModal
        visible={!!viewerImageUrl}
        imageUrl={viewerImageUrl}
        onClose={() => setViewerImageUrl(undefined)}
      />

      <ActionLoader visible={isActionLoading} steps={['Guardando cambios...', 'Sincronizando venta...', 'Finalizando...']} />
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  stateText: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.md,
  },
  stateBtn: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stateBtnText: {
    color: theme.colors.textPrimary,
    fontWeight: theme.weight.semibold,
  },
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
  },
  headerCode: {
    color: theme.colors.textMuted,
    fontSize: theme.font.xs,
  },
  statusChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: theme.weight.bold,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  amountText: {
    color: theme.colors.textPrimary,
    fontSize: 34,
    fontWeight: theme.weight.bold,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
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
  metaText: {
    color: theme.colors.textMuted,
    fontSize: theme.font.xs,
    marginBottom: 4,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  metaChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#0A1835',
  },
  metaChipText: {
    color: '#9FB0CF',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.font.sm,
  },
  infoValue: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
  },
  longText: {
    color: '#BFD0EE',
    fontSize: theme.font.sm,
    lineHeight: 20,
  },
  secondaryDetailsCard: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 12,
    gap: 6,
  },
  secondaryDetailsTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.sm,
    fontWeight: theme.weight.bold,
  },
  attachmentsCard: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    padding: 12,
    gap: 8,
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  attachmentSeparator: {
    marginTop: 2,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1A3158',
  },
  attachmentMain: {
    flex: 1,
  },
  attachmentTitle: {
    color: '#EAF1FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
  },
  attachmentHint: {
    marginTop: 2,
    color: '#8EA4CC',
    fontSize: theme.font.xs,
  },
  attachmentViewBtn: {
    minHeight: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A4E7D',
    backgroundColor: '#0F2748',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  attachmentViewBtnText: {
    color: '#9FC0FF',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  attachmentPrimaryBtn: {
    marginTop: 2,
    minHeight: 36,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#2E6BFF66',
    backgroundColor: '#0D224A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  attachmentPrimaryBtnText: {
    color: '#9FC0FF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  attachmentSecondaryBtn: {
    marginTop: 2,
    minHeight: 34,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0F2748',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  attachmentSecondaryBtnText: {
    color: '#BFD0EE',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  manufacturingProcessesCard: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    padding: 12,
    gap: 8,
  },
  manufacturingProcessesHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  manufacturingProcessesTitle: {
    flex: 1,
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.sm,
  },
  manufacturingProcessesCount: {
    color: '#9FC0FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.sm,
  },
  manufacturingProcessesSubtitle: {
    color: '#8EA4CC',
    fontSize: theme.font.xs,
  },
  manufacturingProcessRow: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1A3158',
    backgroundColor: '#081632',
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  manufacturingProcessMain: {
    flex: 1,
  },
  manufacturingProcessName: {
    color: '#EAF1FF',
    fontWeight: theme.weight.semibold,
    fontSize: theme.font.sm,
  },
  manufacturingProcessMeta: {
    marginTop: 2,
    color: '#8EA4CC',
    fontSize: theme.font.xs,
  },
  deliveryCard: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#6D5B2B',
    backgroundColor: '#2B2413',
    padding: 12,
    flexDirection: 'row',
    gap: 10,
  },
  deliveryTextWrap: {
    flex: 1,
  },
  deliveryTitle: {
    color: '#F8C74A',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.sm,
  },
  deliveryValue: {
    color: '#EED9A0',
    marginTop: 2,
    textTransform: 'capitalize',
    fontSize: theme.font.xs,
  },
  delayedCard: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#7A2630',
    backgroundColor: '#341720',
    padding: 12,
  },
  delayedCardTop: {
    marginTop: 0,
    marginBottom: 10,
  },
  manufactureCardTop: {
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    padding: 12,
  },
  manufactureHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  manufactureTitle: {
    color: '#93C5FD',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.sm,
  },
  manufactureResponsibleText: {
    marginTop: 6,
    color: '#BFD0EE',
    fontSize: theme.font.xs,
  },
  manufactureAssignBtn: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2E6BFF66',
    backgroundColor: '#0D224A',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manufactureAssignBtnText: {
    color: '#93C5FD',
    fontWeight: theme.weight.semibold,
    fontSize: theme.font.xs,
  },
  delayedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  delayedTitle: {
    flex: 1,
    color: '#FCA5A5',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.sm,
  },
  delayedDays: {
    color: '#FECACA',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.xs,
  },
  delayedReasonText: {
    marginTop: 8,
    color: '#FECACA',
    fontSize: theme.font.xs,
  },
  delayedResponsibleText: {
    marginTop: 6,
    color: '#F8C74A',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  responsibleBtn: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F8C74A66',
    backgroundColor: '#2E2412',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  responsibleBtnText: {
    color: '#F8C74A',
    fontWeight: theme.weight.semibold,
    fontSize: theme.font.xs,
  },
  quickActionsRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  quickActionBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#0A1835',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  quickActionText: {
    color: theme.colors.accent,
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  sectionHeaderRow: {
    marginTop: 16,
    marginBottom: 8,
    gap: 2,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.md,
    fontWeight: theme.weight.bold,
  },
  sectionSubtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.font.xs,
  },
  statusSelectorBtn: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  statusSelectorLeft: {
    flex: 1,
    gap: 6,
  },
  statusSelectorChip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusSelectorChipText: {
    fontSize: 11,
    fontWeight: theme.weight.bold,
  },
  statusSelectorHint: {
    color: theme.colors.textMuted,
    fontSize: theme.font.xs,
  },
  statusList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#0A1835',
  },
  statusOptionText: {
    color: '#9FB0CF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  eventLineCol: {
    alignItems: 'center',
    width: 18,
  },
  eventLine: {
    width: 1,
    flex: 1,
    backgroundColor: '#2E4C7E',
    marginTop: 2,
  },
  eventCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 10,
  },
  eventType: {
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: theme.weight.bold,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  eventMessage: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.sm,
    lineHeight: 18,
  },
  eventReason: {
    marginTop: 4,
    color: '#BFD0EE',
    fontSize: theme.font.xs,
  },
  eventUser: {
    marginTop: 4,
    color: '#91A8D4',
    fontSize: 11,
  },
  eventHint: {
    marginTop: 4,
    color: '#F8C74A',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  eventDate: {
    marginTop: 6,
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  emptyEvents: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 12,
  },
  emptyEventsText: {
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
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
    backgroundColor: '#08142D',
    padding: 14,
  },
  modalTitle: {
    color: '#EAF1FF',
    fontSize: theme.font.md,
    fontWeight: theme.weight.bold,
  },
  modalSubtitle: {
    marginTop: 4,
    color: '#8EA4CC',
    fontSize: theme.font.sm,
  },
  paymentSummaryRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  paymentSummaryCard: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 62,
  },
  paymentSummaryPaidCard: {
    borderColor: '#1F6F59',
    backgroundColor: '#0B2B25',
  },
  paymentSummaryPendingCard: {
    borderColor: '#7A2630',
    backgroundColor: '#341720',
  },
  paymentSummaryLabel: {
    color: '#8EA4CC',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
    textTransform: 'uppercase',
  },
  paymentSummaryValue: {
    marginTop: 4,
    color: '#EAF1FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.bold,
  },
  paymentSummaryPaidValue: {
    color: '#34D399',
  },
  paymentSummaryPendingValue: {
    color: '#FCA5A5',
  },
  paymentProjectionText: {
    marginTop: 8,
    color: '#9FC0FF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  modalInput: {
    marginTop: 12,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  modalInputSpacing: {
    marginTop: 8,
  },
  evidenceBlock: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    padding: 10,
  },
  evidenceTitle: {
    color: '#BFD0EE',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  evidenceActionsRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
  },
  evidenceActionBtn: {
    flex: 1,
    height: 36,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#2E6BFF66',
    backgroundColor: '#0D224A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidenceActionText: {
    color: '#9FC0FF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  evidencePreviewRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
  },
  evidencePreviewImage: {
    width: 54,
    height: 54,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2E6BFF44',
  },
  evidenceHint: {
    marginTop: 6,
    color: '#8EA4CC',
    fontSize: 11,
  },
  responsibleList: {
    marginTop: 10,
    maxHeight: 220,
  },
  responsibleOption: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#0A1835',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  responsibleOptionActive: {
    borderColor: '#F8C74A',
    backgroundColor: '#2E2412',
  },
  responsibleOptionText: {
    color: theme.colors.textPrimary,
    fontWeight: theme.weight.semibold,
    fontSize: theme.font.sm,
  },
  responsibleOptionTextActive: {
    color: '#F8C74A',
  },
  responsibleOptionPhone: {
    marginTop: 2,
    color: theme.colors.textMuted,
    fontSize: theme.font.xs,
  },
  modalActionsRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  modalGhostBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#0A1835',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalGhostText: {
    color: '#8EA4CC',
    fontWeight: theme.weight.semibold,
  },
  modalPrimaryBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#2E6BFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryText: {
    color: '#F0F6FF',
    fontWeight: theme.weight.bold,
  },
  modalLinkBtn: {
    marginTop: 8,
    alignSelf: 'center',
  },
  modalLinkText: {
    color: '#8EA4CC',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  eventDetailText: {
    marginTop: 10,
    color: '#EAF1FF',
    fontSize: theme.font.sm,
    lineHeight: 20,
  },
  eventDetailMeta: {
    marginTop: 6,
    color: '#9FB0CF',
    fontSize: theme.font.xs,
  },
  eventStatusSnapshotTag: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 999,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  eventStatusSnapshotText: {
    fontSize: 11,
    fontWeight: theme.weight.bold,
  },
  eventDetailPhotosWrap: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  eventDetailPhoto: {
    width: 84,
    height: 84,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F3765',
  },
  eventTypeLabel: {
    marginTop: 10,
    color: '#9FB0CF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  eventTypeSelectorBtn: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    minHeight: 40,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  eventTypeSelectorText: {
    color: '#EAF1FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
  },
  selectorOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  selectorSheet: {
    backgroundColor: '#08142D',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: '#1F3765',
  },
  selectorHeader: {
    height: 56,
    borderBottomWidth: 1,
    borderColor: '#1A2D52',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  selectorTitle: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
  },
  selectorHeaderSpacer: {
    width: 20,
  },
  selectorContent: {
    padding: 16,
    gap: 10,
    paddingBottom: 24,
  },
  selectorOption: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectorOptionActive: {
    borderColor: '#F8C74A',
    backgroundColor: '#0D224A',
  },
  selectorOptionText: {
    color: '#9FB0CF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
  },
  selectorOptionTextActive: {
    color: '#F8C74A',
  },
});
