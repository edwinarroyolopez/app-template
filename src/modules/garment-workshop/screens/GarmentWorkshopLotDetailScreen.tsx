import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Edit3, Pencil, Plus, Trash2 } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { OperationalModal } from '@/components/ui/OperationalModal';
import { PaymentMethodSelector } from '@/components/ui/PaymentMethodSelector';
import type { AppStackParamList } from '@/navigation/AppNavigator';
import { theme } from '@/theme';
import {
  useAddGarmentLaborPayment,
  useAddGarmentLotCost,
  useAddGarmentLotIncome,
  useCreateGarmentOperationLog,
  useDeliverGarmentLot,
  useGarmentLotDetail,
  useUpdateGarmentLot,
} from '../hooks/useGarmentWorkshop';
import { useEmployees } from '@/modules/employees/hooks/useEmployees';
import { GarmentWorkerSelectorModal } from '../components/GarmentWorkerSelectorModal';
import { CreateEmployeeModal } from '@/modules/employees/components/CreateEmployeeModal';
import type { Employee } from '@/modules/employees/types/employee.type';
import { api } from '@/services/api';
import { ImageAttachmentField, type AttachmentImage } from '@/components/ui/ImageAttachmentField';
import ImageViewerModal from '@/components/ui/ImageViewerModal';
import type { PaymentMethod } from '@/types/payment-method';

type Params = RouteProp<AppStackParamList, 'GarmentWorkshopLotDetail'>;

function money(value?: number) {
  return `$${Number(value || 0).toLocaleString('es-CO')}`;
}

function isImageUrl(url?: string) {
  if (!url) return false;
  return /\.(png|jpe?g|webp|heic|gif)(\?.*)?$/i.test(url);
}

function formatDateOnly(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateLabel(value: string) {
  if (!value) return 'Seleccionar fecha';
  const [year, month, day] = value.split('-').map((item) => Number(item));
  if (!year || !month || !day) return value;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('es-CO', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const LABOR_PAYMENT_METHODS: PaymentMethod[] = ['EFECTIVO', 'TRANSFERENCIA'];
type LaborPaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA';

export default function GarmentWorkshopLotDetailScreen() {
  const route = useRoute<Params>();
  const navigation = useNavigation<any>();
  const lotId = route.params?.lotId;

  const detailQuery = useGarmentLotDetail(lotId);
  const createLog = useCreateGarmentOperationLog(lotId);
  const deliverLot = useDeliverGarmentLot(lotId);
  const updateLot = useUpdateGarmentLot(lotId);
  const addLaborPayment = useAddGarmentLaborPayment(lotId);
  const addIncome = useAddGarmentLotIncome(lotId);
  const addCost = useAddGarmentLotCost(lotId);
  const [workerSearch, setWorkerSearch] = useState('');
  const workersQuery = useEmployees(workerSearch, 'MANUFACTURER');

  const [showLogModal, setShowLogModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLaborPaymentModal, setShowLaborPaymentModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);
  const [operationId, setOperationId] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [quantity, setQuantity] = useState('');
  const [workerEmployeeId, setWorkerEmployeeId] = useState('');
  const [workerLabel, setWorkerLabel] = useState('');
  const [showWorkerSelector, setShowWorkerSelector] = useState(false);
  const [showCreateWorker, setShowCreateWorker] = useState(false);
  const [workedAt, setWorkedAt] = useState(formatDateOnly(new Date()));
  const [showWorkedAtPicker, setShowWorkedAtPicker] = useState(false);
  const [note, setNote] = useState('');

  const [editReceivedDate, setEditReceivedDate] = useState('');
  const [editCommitmentDate, setEditCommitmentDate] = useState('');
  const [showReceivedPicker, setShowReceivedPicker] = useState(false);
  const [showCommitmentPicker, setShowCommitmentPicker] = useState(false);
  const [editUnitAgreedPrice, setEditUnitAgreedPrice] = useState('');
  const [editExternalReference, setEditExternalReference] = useState('');
  const [editBaseDocumentImages, setEditBaseDocumentImages] = useState<AttachmentImage[]>([]);
  const [editTechnicalSheetImages, setEditTechnicalSheetImages] = useState<AttachmentImage[]>([]);
  const [editObservations, setEditObservations] = useState('');

  const [paymentEmployeeId, setPaymentEmployeeId] = useState('');
  const [paymentEmployeeLabel, setPaymentEmployeeLabel] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<LaborPaymentMethod>('EFECTIVO');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentDate, setPaymentDate] = useState(formatDateOnly(new Date()));
  const [showPaymentDatePicker, setShowPaymentDatePicker] = useState(false);
  const [paymentEvidenceImages, setPaymentEvidenceImages] = useState<AttachmentImage[]>([]);

  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeMethod, setIncomeMethod] = useState<PaymentMethod>('EFECTIVO');
  const [incomeNote, setIncomeNote] = useState('');
  const [incomeDate, setIncomeDate] = useState(formatDateOnly(new Date()));
  const [showIncomeDatePicker, setShowIncomeDatePicker] = useState(false);
  const [incomeEvidenceImages, setIncomeEvidenceImages] = useState<AttachmentImage[]>([]);

  const [costType, setCostType] = useState<'TRANSPORT' | 'SUPPLY' | 'OTHER'>('TRANSPORT');
  const [costSupplySubtype, setCostSupplySubtype] = useState<'GENERAL' | 'HILO' | 'NYLON'>('GENERAL');
  const [showCostDatePicker, setShowCostDatePicker] = useState(false);
  const [costAmount, setCostAmount] = useState('');
  const [costNote, setCostNote] = useState('');
  const [costDate, setCostDate] = useState(formatDateOnly(new Date()));
  const [costEvidenceImages, setCostEvidenceImages] = useState<AttachmentImage[]>([]);
  const [costLines, setCostLines] = useState<
    Array<{
      id: string;
      itemType: string;
      detail: string;
      quantity: string;
      totalPaidCop: string;
    }>
  >([]);
  const [costLineItemType, setCostLineItemType] = useState('');
  const [costLineDetail, setCostLineDetail] = useState('');
  const [costLineQuantity, setCostLineQuantity] = useState('');
  const [costLineTotalPaid, setCostLineTotalPaid] = useState('');
  const [editingCostLineId, setEditingCostLineId] = useState<string | null>(null);
  const [selectedTimelineEvent, setSelectedTimelineEvent] = useState<any | null>(null);
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [viewerImageUrl, setViewerImageUrl] = useState<string | undefined>(undefined);

  const lot = detailQuery.data as any;
  const totalAccumulatedValue = Number(
    (lot?.participants || []).reduce((sum: number, item: any) => sum + Number(item.valueCop || 0), 0),
  );
  const timeline = Array.isArray(lot?.timeline)
    ? lot.timeline
    : Array.isArray(lot?.history)
      ? [...lot.history]
          .map((event: any, index: number) => ({
            id: `${event.type || 'EVENT'}:${event.createdAt || ''}:${index}`,
            ...event,
            evidenceUrls: event?.metadata?.evidenceUrl
              ? [event.metadata.evidenceUrl]
              : event?.metadata?.evidenceUrls || [],
          }))
          .sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
      : [];

  const availableColors = Array.isArray(lot?.registrationContext?.colors)
    ? lot.registrationContext.colors
    : Array.isArray(lot?.colorLines) && lot.colorLines.length > 0
      ? lot.colorLines.map((line: any) => String(line.color || '').toUpperCase())
      : ['UNICO'];
  const availableSizes = Array.isArray(lot?.registrationContext?.sizes)
    ? lot.registrationContext.sizes
    : Array.isArray(lot?.sizeDistribution)
      ? lot.sizeDistribution.map((item: any) => String(item.size || '').toUpperCase())
      : [];

  const selectedOperationProgressRows = (lot?.operationCombinationProgress || []).filter(
    (row: any) => String(row.operationId) === String(operationId),
  );

  const garmentImageUrls = Array.isArray(lot?.garmentImageUrls)
    ? lot.garmentImageUrls
    : Array.isArray(lot?.garmentSummary?.imageUrls)
      ? lot.garmentSummary.imageUrls
      : [];

  const selectionProgressRows = selectedOperationProgressRows.filter((row: any) => {
    const color = String(row.color || 'UNICO').toUpperCase();
    const sizeValue = String(row.size || '').toUpperCase();
    const colorOk = availableColors.length <= 1 ? true : selectedColors.includes(color);
    const sizeOk = selectedSizes.includes(sizeValue);
    return colorOk && sizeOk;
  });

  const maxRegistrableUnits = selectionProgressRows.reduce(
    (sum: number, row: any) => sum + Number(row.pendingUnits || 0),
    0,
  );

  const parsedQuantity = Number(quantity || 0);
  const isQuantityAboveMax = parsedQuantity > 0 && parsedQuantity > maxRegistrableUnits;

  React.useEffect(() => {
    if (!lot) return;
    setEditReceivedDate(lot.receivedDate ? String(lot.receivedDate).slice(0, 10) : '');
    setEditCommitmentDate(lot.commitmentDate ? String(lot.commitmentDate).slice(0, 10) : '');
    setEditUnitAgreedPrice(lot.unitAgreedPriceCop ? String(lot.unitAgreedPriceCop) : '');
    setEditExternalReference(lot.externalReference || '');
    setEditBaseDocumentImages([]);
    setEditTechnicalSheetImages([]);
    setEditObservations(lot.observations || '');
  }, [lot]);

  React.useEffect(() => {
    if (!showLogModal || !lot) return;
    if (!operationId && Array.isArray(lot.operations) && lot.operations.length > 0) {
      setOperationId(String(lot.operations[0].operationId));
    }
    if (!selectedSizes.length) {
      setSelectedSizes(availableSizes);
    }
    if (availableColors.length > 1 && !selectedColors.length) {
      setSelectedColors(availableColors);
    }
  }, [
    showLogModal,
    lot,
    operationId,
    selectedSizes.length,
    selectedColors.length,
    availableSizes,
    availableColors,
  ]);

  if (detailQuery.isLoading) {
    return (
      <MainLayout>
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.accent} />
          <Text style={styles.stateText}>Cargando lote...</Text>
        </View>
      </MainLayout>
    );
  }

  if (!lot) {
    return (
      <MainLayout>
        <View style={styles.centered}>
          <Text style={styles.stateText}>No encontramos el lote</Text>
        </View>
      </MainLayout>
    );
  }

  function toggleSizeSelection(sizeValue: string) {
    setSelectedSizes((current) =>
      current.includes(sizeValue)
        ? current.filter((item) => item !== sizeValue)
        : [...current, sizeValue],
    );
  }

  function toggleColorSelection(colorValue: string) {
    setSelectedColors((current) =>
      current.includes(colorValue)
        ? current.filter((item) => item !== colorValue)
        : [...current, colorValue],
    );
  }

  async function saveLog() {
    const requiresColor = availableColors.length > 1;
    if (!operationId || !quantity || !workerEmployeeId || !workedAt || selectedSizes.length === 0 || (requiresColor && selectedColors.length === 0)) {
      Toast.show({ type: 'error', text1: 'Completa operación, color/talla, cantidad, confeccionista y fecha' });
      return;
    }

    if (parsedQuantity > maxRegistrableUnits) {
      Toast.show({
        type: 'error',
        text1: `Cantidad supera máximo disponible (${maxRegistrableUnits})`,
      });
      return;
    }

    try {
      await createLog.mutateAsync({
        operationId,
        sizes: selectedSizes,
        colors: requiresColor ? selectedColors : undefined,
        quantity: parsedQuantity,
        workerEmployeeId,
        workedAt,
        note: note.trim() || undefined,
      });

      Toast.show({ type: 'success', text1: 'Registro guardado' });
      setShowLogModal(false);
      setOperationId('');
      setSelectedColors([]);
      setSelectedSizes([]);
      setQuantity('');
      setWorkerEmployeeId('');
      setWorkerLabel('');
      setWorkerSearch('');
      setWorkedAt(formatDateOnly(new Date()));
      setNote('');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo registrar la operación',
        text2: error?.response?.data?.message || undefined,
      });
    }
  }

  async function confirmDeliver() {
    try {
      await deliverLot.mutateAsync();
      Toast.show({ type: 'success', text1: 'Lote entregado' });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo entregar',
        text2: error?.response?.data?.message || undefined,
      });
    }
  }

  async function saveLotEdit() {
    try {
      const nextBaseDocumentUrl = editBaseDocumentImages[0]?.uri
        ? await uploadImageAsset(editBaseDocumentImages[0].uri, 'garment-lot-base-document')
        : lot.baseDocumentUrl || undefined;
      const nextTechnicalSheetUrl = editTechnicalSheetImages[0]?.uri
        ? await uploadImageAsset(editTechnicalSheetImages[0].uri, 'garment-lot-technical-sheet')
        : lot.technicalSheetUrl || undefined;

      await updateLot.mutateAsync({
        receivedDate: editReceivedDate || undefined,
        commitmentDate: editCommitmentDate || undefined,
        unitAgreedPriceCop: editUnitAgreedPrice ? Number(editUnitAgreedPrice) : undefined,
        externalReference: editExternalReference.trim() || undefined,
        baseDocumentUrl: nextBaseDocumentUrl,
        technicalSheetUrl: nextTechnicalSheetUrl,
        observations: editObservations.trim() || undefined,
      });
      Toast.show({ type: 'success', text1: 'Lote actualizado' });
      setShowEditModal(false);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo actualizar el lote',
        text2: error?.response?.data?.message || undefined,
      });
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

    return data?.original ? String(data.original) : undefined;
  }

  async function openAttachment(url?: string) {
    if (!url) return;
    if (isImageUrl(url)) {
      setViewerImageUrl(url);
      return;
    }

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return;
    }

    Toast.show({ type: 'error', text1: 'No se pudo abrir el adjunto' });
  }

  const usesSupplyLines = costType === 'SUPPLY' && costSupplySubtype !== 'GENERAL';
  const costLinesTotal = costLines.reduce(
    (sum, line) => sum + Number(line.totalPaidCop || 0),
    0,
  );

  function resetCostLineBuilder() {
    setCostLineItemType('');
    setCostLineDetail('');
    setCostLineQuantity('');
    setCostLineTotalPaid('');
    setEditingCostLineId(null);
  }

  function addOrUpdateCostLine() {
    if (!costLineItemType.trim() || Number(costLineTotalPaid || 0) <= 0) {
      Toast.show({
        type: 'error',
        text1: 'La línea requiere ítem y total pagado mayor a cero',
      });
      return;
    }

    const linePayload = {
      id: editingCostLineId || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      itemType: costLineItemType.trim(),
      detail: costLineDetail.trim(),
      quantity: costLineQuantity.trim(),
      totalPaidCop: String(Math.max(1, Math.round(Number(costLineTotalPaid || 0)))),
    };

    if (editingCostLineId) {
      setCostLines((current) =>
        current.map((line) => (line.id === editingCostLineId ? linePayload : line)),
      );
      Toast.show({ type: 'success', text1: 'Línea actualizada' });
      resetCostLineBuilder();
      return;
    }

    setCostLines((current) => [...current, linePayload]);
    Toast.show({ type: 'success', text1: 'Línea agregada' });
    resetCostLineBuilder();
  }

  function editCostLine(lineId: string) {
    const line = costLines.find((item) => item.id === lineId);
    if (!line) return;
    setEditingCostLineId(line.id);
    setCostLineItemType(line.itemType);
    setCostLineDetail(line.detail || '');
    setCostLineQuantity(line.quantity || '');
    setCostLineTotalPaid(line.totalPaidCop || '');
  }

  function removeCostLine(lineId: string) {
    setCostLines((current) => current.filter((line) => line.id !== lineId));
    if (editingCostLineId === lineId) {
      resetCostLineBuilder();
    }
  }

  async function saveLaborPayment() {
    const amountCop = Math.round(Number(paymentAmount || 0));

    if (!paymentEmployeeId || !paymentAmount.trim() || !paymentDate) {
      Toast.show({ type: 'error', text1: 'Selecciona empleado, monto y fecha' });
      return;
    }

    if (!Number.isFinite(amountCop) || amountCop <= 0) {
      Toast.show({ type: 'error', text1: 'El monto debe ser mayor a cero' });
      return;
    }

    if (!LABOR_PAYMENT_METHODS.includes(paymentMethod)) {
      Toast.show({ type: 'error', text1: 'Metodo de pago no valido' });
      return;
    }

    try {
      const evidenceUrl = paymentEvidenceImages[0]?.uri
        ? await uploadImageAsset(paymentEvidenceImages[0].uri, 'garment-labor-payment')
        : undefined;

      await addLaborPayment.mutateAsync({
        employeeId: paymentEmployeeId,
        amountCop,
        paidAt: paymentDate,
        paymentMethod,
        note: paymentNote.trim() || undefined,
        evidenceUrl,
      });
      Toast.show({ type: 'success', text1: 'Pago de mano de obra registrado' });
      setShowLaborPaymentModal(false);
      setPaymentAmount('');
      setPaymentMethod('EFECTIVO');
      setPaymentDate(formatDateOnly(new Date()));
      setPaymentNote('');
      setPaymentEvidenceImages([]);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo registrar pago',
        text2: error?.response?.data?.message || undefined,
      });
    }
  }

  async function saveIncome() {
    const amountCop = Math.round(Number(incomeAmount || 0));

    if (!incomeAmount.trim() || !incomeDate || !incomeMethod) {
      Toast.show({ type: 'error', text1: 'Ingresa monto, metodo y fecha de cobro' });
      return;
    }

    if (!Number.isFinite(amountCop) || amountCop <= 0) {
      Toast.show({ type: 'error', text1: 'El monto debe ser mayor a cero' });
      return;
    }

    try {
      const evidenceUrl = incomeEvidenceImages[0]?.uri
        ? await uploadImageAsset(incomeEvidenceImages[0].uri, 'garment-lot-income')
        : undefined;
      await addIncome.mutateAsync({
        amountCop,
        receivedAt: incomeDate,
        paymentMethod: incomeMethod,
        note: incomeNote.trim() || undefined,
        evidenceUrl,
      });
      Toast.show({ type: 'success', text1: 'Ingreso del lote registrado' });
      setShowIncomeModal(false);
      setIncomeAmount('');
      setIncomeMethod('EFECTIVO');
      setIncomeDate(formatDateOnly(new Date()));
      setIncomeNote('');
      setIncomeEvidenceImages([]);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo registrar ingreso',
        text2: error?.response?.data?.message || undefined,
      });
    }
  }

  async function saveCost() {
    if (usesSupplyLines) {
      if (!costLines.length) {
        Toast.show({ type: 'error', text1: 'Agrega al menos una línea de insumo' });
        return;
      }

      const invalidLine = costLines.find(
        (line) => !line.itemType.trim() || Number(line.totalPaidCop || 0) <= 0,
      );
      if (invalidLine) {
        Toast.show({
          type: 'error',
          text1: 'Cada línea debe tener ítem y total pagado mayor a cero',
        });
        return;
      }
    } else if (!costAmount.trim()) {
      Toast.show({ type: 'error', text1: 'Ingresa el costo total' });
      return;
    }

    try {
      const evidenceUrl = costEvidenceImages[0]?.uri
        ? await uploadImageAsset(costEvidenceImages[0].uri, 'garment-lot-cost')
        : undefined;

      await addCost.mutateAsync({
        type: costType,
        supplySubtype: costType === 'SUPPLY' ? costSupplySubtype : undefined,
        amountCop: usesSupplyLines ? undefined : Number(costAmount),
        lines: usesSupplyLines
          ? costLines.map((line) => ({
              itemType: line.itemType.trim(),
              detail: line.detail.trim() || undefined,
              quantity: line.quantity.trim() ? Number(line.quantity) : undefined,
              totalPaidCop: Number(line.totalPaidCop),
            }))
          : undefined,
        occurredAt: costDate,
        note: costNote.trim() || undefined,
        evidenceUrl,
      });
      Toast.show({ type: 'success', text1: 'Costo registrado' });
      setShowCostModal(false);
      setCostType('TRANSPORT');
      setCostSupplySubtype('GENERAL');
      setCostAmount('');
      setCostNote('');
      setCostDate(formatDateOnly(new Date()));
      setCostLines([]);
      resetCostLineBuilder();
      setCostEvidenceImages([]);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo registrar costo',
        text2: error?.response?.data?.message || undefined,
      });
    }
  }

  return (
    <MainLayout>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={18} color={theme.colors.textPrimary} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Detalle de lote</Text>
            <Text style={styles.subtitle}>#{String(lot._id || '').slice(-8)}</Text>
          </View>
          <Pressable style={styles.iconActionBtn} onPress={() => setShowEditModal(true)}>
            <Edit3 size={15} color="#DCE8FF" />
          </Pressable>
          <Pressable
            style={styles.addBtn}
            onPress={() => {
              setOperationId(String(lot.operations?.[0]?.operationId || ''));
              setSelectedSizes(availableSizes);
              setSelectedColors(availableColors.length > 1 ? availableColors : []);
              setShowLogModal(true);
            }}
          >
            <Plus size={16} color="#041427" />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{lot.garmentName}</Text>
            <Text style={styles.cardSub}>{lot.providerName}</Text>
            <View style={styles.rowLine}>
              <Text style={styles.lineLabel}>Costo confección por unidad</Text>
              <Text style={styles.lineValue}>{money(lot.garmentSummary?.unitCostCop || lot.garmentUnitCostCop || 0)}</Text>
            </View>
            <View style={styles.rowLine}>
              <Text style={styles.lineLabel}>Operaciones de la prenda</Text>
              <Text style={styles.lineValue}>{Number(lot.garmentSummary?.operationsCount || lot.garmentOperationsCount || (lot.operations || []).length)}</Text>
            </View>
            <Text style={styles.meta}>Color: {lot.color || 'N/A'} • Total: {lot.totalUnits}</Text>
            {garmentImageUrls.length > 0 ? (
              <>
                <Text style={styles.meta}>Referencia visual de la prenda</Text>
                <View style={styles.eventPreviewRow}>
                  {garmentImageUrls.slice(0, 3).map((url: string, index: number) => (
                    <Pressable key={`${url}-${index}`} style={styles.eventPreviewThumbWrap} onPress={() => setViewerImageUrl(url)}>
                      <Image source={{ uri: url }} style={styles.eventPreviewThumb} />
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}
            {lot.unitAgreedPriceCop ? (
              <Text style={styles.meta}>Valor pactado unidad: {money(lot.unitAgreedPriceCop)}</Text>
            ) : null}
            <Text style={styles.meta}>Recepción: {lot.receivedDate ? String(lot.receivedDate).slice(0, 10) : 'Sin fecha'}</Text>
            <Text style={styles.meta}>Compromiso: {lot.commitmentDate ? String(lot.commitmentDate).slice(0, 10) : 'Sin fecha'}</Text>
            {lot.externalReference ? <Text style={styles.meta}>Referencia: {lot.externalReference}</Text> : null}

            {lot.baseDocumentUrl || lot.technicalSheetUrl ? (
              <>
                <View style={styles.quickActionsRow}>
                  {lot.baseDocumentUrl ? (
                    <Pressable style={styles.quickActionBtn} onPress={() => openAttachment(lot.baseDocumentUrl)}>
                      <Text style={styles.quickActionText}>Abrir documento base</Text>
                    </Pressable>
                  ) : null}
                  {lot.technicalSheetUrl ? (
                    <Pressable style={styles.quickActionBtn} onPress={() => openAttachment(lot.technicalSheetUrl)}>
                      <Text style={styles.quickActionText}>Abrir ficha técnica</Text>
                    </Pressable>
                  ) : null}
                </View>
                <View style={styles.eventPreviewRow}>
                  {lot.baseDocumentUrl && isImageUrl(lot.baseDocumentUrl) ? (
                    <Pressable style={styles.eventPreviewThumbWrap} onPress={() => openAttachment(lot.baseDocumentUrl)}>
                      <Image source={{ uri: lot.baseDocumentUrl }} style={styles.eventPreviewThumb} />
                    </Pressable>
                  ) : null}
                  {lot.technicalSheetUrl && isImageUrl(lot.technicalSheetUrl) ? (
                    <Pressable style={styles.eventPreviewThumbWrap} onPress={() => openAttachment(lot.technicalSheetUrl)}>
                      <Image source={{ uri: lot.technicalSheetUrl }} style={styles.eventPreviewThumb} />
                    </Pressable>
                  ) : null}
                </View>
              </>
            ) : null}

            <Text style={styles.meta}>Estado: {lot.status}</Text>

            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.max(3, Math.min(100, Number(lot?.progress?.percent || 0)))}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{Number(lot?.progress?.percent || 0).toFixed(1)}%</Text>
            </View>
            <Text style={styles.metaSmall}>
              Avance real: {Number(lot?.progress?.totalCompleted || 0)} / {Number(lot?.progress?.totalExpected || 0)} unidades-operación
            </Text>
            <Text style={styles.metaSmall}>Valor acumulado: {money(totalAccumulatedValue)}</Text>

            <View style={styles.quickActionsRow}>
              <Pressable style={styles.quickActionBtn} onPress={() => setShowLaborPaymentModal(true)}>
                <Text style={styles.quickActionText}>Pagar empleado</Text>
              </Pressable>
              <Pressable style={styles.quickActionBtn} onPress={() => setShowIncomeModal(true)}>
                <Text style={styles.quickActionText}>Registrar cobro</Text>
              </Pressable>
              <Pressable style={styles.quickActionBtn} onPress={() => setShowCostModal(true)}>
                <Text style={styles.quickActionText}>Registrar costo</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Distribución por color y talla</Text>
            {(lot.colorLines || []).length > 0 ? (
              (lot.colorLines || []).map((line: any, index: number) => (
                <View key={`${line.color}-${index}`} style={styles.operationBlock}>
                  <View style={styles.rowLine}>
                    <Text style={styles.lineLabel}>{line.color}</Text>
                    <Text style={styles.lineValue}>{line.totalUnits}</Text>
                  </View>
                  <Text style={styles.metaSmall}>
                    {(line.sizeDistribution || [])
                      .map((item: any) => `${item.size}:${item.quantity}`)
                      .join(' • ')}
                  </Text>
                </View>
              ))
            ) : (
              (lot.sizeDistribution || []).map((item: any) => (
                <View key={item.size} style={styles.rowLine}>
                  <Text style={styles.lineLabel}>{item.size}</Text>
                  <Text style={styles.lineValue}>{item.quantity}</Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Insumos</Text>
            {(() => {
              const legacySupplies = Array.isArray(lot.supplies) ? lot.supplies : [];
              const unifiedSupplyCosts = Array.isArray(lot.additionalCosts)
                ? lot.additionalCosts.filter((item: any) => item.type === 'SUPPLY')
                : [];
              const merged = [
                ...legacySupplies.map((item: any) => ({
                  source: 'legacy',
                  label: item.productName || 'Insumo',
                  quantity: item.quantity,
                  amountCop: item.totalCostCop || 0,
                  evidenceUrl: item.evidenceUrl,
                  lines: [],
                })),
                ...unifiedSupplyCosts.map((item: any) => ({
                  source: 'unified',
                  label:
                    item.supplySubtype === 'HILO'
                      ? 'Insumo (Hilo)'
                      : item.supplySubtype === 'NYLON'
                        ? 'Insumo (Nylon)'
                        : 'Insumo',
                  quantity: undefined,
                  amountCop: item.amountCop || 0,
                  evidenceUrl: item.evidenceUrl,
                  lines: item.lines || [],
                })),
              ];

              if (merged.length === 0) {
                return <Text style={styles.meta}>Aún no hay insumos registrados</Text>;
              }

              return merged.map((item: any, index: number) => (
                <View key={`${item.source}-${index}`} style={styles.operationBlock}>
                  <View style={styles.rowLine}>
                    <Text style={styles.lineLabel}>
                      {item.label}
                      {item.quantity ? ` x${item.quantity}` : ''}
                    </Text>
                    <Text style={styles.lineValue}>{money(item.amountCop || 0)}</Text>
                  </View>
                  {Array.isArray(item.lines) && item.lines.length > 0 ? (
                    <Text style={styles.metaSmall}>
                      {item.lines
                        .map(
                          (line: any) =>
                            `${line.itemType}${line.detail ? ` ${line.detail}` : ''}${line.quantity ? ` x${line.quantity}` : ''} ${money(line.totalPaidCop || 0)}`,
                        )
                        .join(' • ')}
                    </Text>
                  ) : null}
                  {item.evidenceUrl ? (
                    <Pressable onPress={() => openAttachment(item.evidenceUrl)}>
                      <Text style={styles.metaSmall}>Ver evidencia</Text>
                    </Pressable>
                  ) : null}
                </View>
              ));
            })()}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Avance por operación</Text>
            {(lot.operations || []).map((operation: any) => {
              const pct = operation.expectedUnits > 0
                ? (Number(operation.completedUnits || 0) / Number(operation.expectedUnits || 1)) * 100
                : 0;
              const pendingUnits = Math.max(
                0,
                Number(operation.pendingUnits ?? Number(operation.expectedUnits || 0) - Number(operation.completedUnits || 0)),
              );
              return (
                <View key={operation.operationId} style={styles.operationBlock}>
                  <View style={styles.rowLine}>
                    <Text style={styles.lineLabel}>{operation.name}</Text>
                    <Text style={styles.lineValue}>
                      {operation.completedUnits}/{operation.expectedUnits}
                    </Text>
                  </View>
                  <Text style={styles.metaSmall}>{money(operation.unitPriceCop)} por unidad</Text>
                  <Text style={styles.metaSmall}>Pendiente: {pendingUnits} unidades</Text>
                  {operation.machineName ? <Text style={styles.metaSmall}>Máquina: {operation.machineName}</Text> : null}
                  <View style={styles.progressTrackSmall}>
                    <View style={[styles.progressFillSmall, { width: `${Math.max(3, Math.min(100, pct))}%` }]} />
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Confeccionistas participantes</Text>
            {(lot.participants || []).length === 0 ? (
              <Text style={styles.meta}>Aún no hay registros</Text>
            ) : (
              (lot.participants || []).map((worker: any) => (
                <View key={worker.workerEmployeeId} style={styles.rowLine}>
                  <Text style={styles.lineLabel}>{worker.workerName}</Text>
                  <Text style={styles.lineValue}>{money(worker.valueCop)}</Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Resumen financiero del lote</Text>
            <Text style={styles.meta}>Lectura operativa: esperado vs realizado</Text>
            <View style={styles.rowLine}>
              <Text style={styles.lineLabel}>Ingreso esperado</Text>
              <Text style={styles.lineValue}>{money(lot.finance?.expectedIncome || 0)}</Text>
            </View>
            <View style={styles.rowLine}>
              <Text style={styles.lineLabel}>Ingreso cobrado</Text>
              <Text style={styles.lineValue}>{money(lot.finance?.incomeReceived || 0)}</Text>
            </View>
            <View style={styles.rowLine}>
              <Text style={styles.lineLabel}>Mano de obra acumulada</Text>
              <Text style={styles.lineValue}>{money(lot.finance?.laborAccrued || 0)}</Text>
            </View>
            <View style={styles.rowLine}>
              <Text style={styles.lineLabel}>Mano de obra pagada</Text>
              <Text style={styles.lineValue}>{money(lot.finance?.laborPaid || 0)}</Text>
            </View>
            <View style={styles.rowLine}>
              <Text style={styles.lineLabel}>Pendiente empleados</Text>
              <Text style={styles.lineValue}>{money(lot.finance?.laborPending || 0)}</Text>
            </View>
            <View style={styles.rowLine}>
              <Text style={styles.lineLabel}>Insumos</Text>
              <Text style={styles.lineValue}>{money(lot.finance?.suppliesCost || 0)}</Text>
            </View>
            <View style={styles.rowLine}>
              <Text style={styles.lineLabel}>Transporte</Text>
              <Text style={styles.lineValue}>{money(lot.finance?.transportCost || 0)}</Text>
            </View>
            <View style={styles.rowLine}>
              <Text style={styles.lineLabel}>Otros costos</Text>
              <Text style={styles.lineValue}>{money(lot.finance?.otherCosts || 0)}</Text>
            </View>
            <View style={styles.rowLine}>
              <Text style={styles.lineLabel}>Costo total</Text>
              <Text style={styles.lineValue}>{money(lot.finance?.totalCost || 0)}</Text>
            </View>
            <View style={styles.rowLine}>
              <Text style={styles.lineLabel}>Resultado esperado</Text>
              <Text style={styles.lineValue}>{money(lot.finance?.resultExpected || 0)}</Text>
            </View>
            <View style={styles.rowLine}>
              <Text style={styles.lineLabel}>Resultado actual</Text>
              <Text style={styles.lineValue}>{money(lot.finance?.resultCurrent || 0)}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Cuentas por pagar por empleado</Text>
            {(lot.employeePayables || []).length === 0 ? (
              <Text style={styles.meta}>Sin acumulados aún</Text>
            ) : (
              (lot.employeePayables || []).map((item: any) => (
                <View key={item.employeeId} style={styles.operationBlock}>
                  <Text style={styles.lineLabel}>{item.employeeName}</Text>
                  <View style={styles.rowLine}>
                    <Text style={styles.metaSmall}>Acumulado</Text>
                    <Text style={styles.lineValue}>{money(item.accruedCop)}</Text>
                  </View>
                  <View style={styles.rowLine}>
                    <Text style={styles.metaSmall}>Pagado</Text>
                    <Text style={styles.lineValue}>{money(item.paidCop)}</Text>
                  </View>
                  <View style={styles.rowLine}>
                    <Text style={styles.metaSmall}>Pendiente</Text>
                    <Text style={styles.lineValue}>{money(item.pendingCop)}</Text>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Historial operativo</Text>
            {timeline.length === 0 ? (
              <Text style={styles.meta}>Sin eventos registrados</Text>
            ) : (
              timeline.map((event: any) => (
                <Pressable
                  key={event.id}
                  style={styles.historyItem}
                  onPress={() => {
                    setSelectedTimelineEvent(event);
                    setShowEventDetailModal(true);
                  }}
                >
                  <Text style={styles.historyTitle}>{event.message}</Text>
                  <Text style={styles.historyMeta}>
                    {String(event.createdAt).slice(0, 19).replace('T', ' ')}
                  </Text>

                  {(event.evidenceUrls || []).length > 0 ? (
                    <View style={styles.eventPreviewRow}>
                      {(event.evidenceUrls || []).slice(0, 3).map((url: string, index: number) => (
                        <Pressable
                          key={`${url}-${index}`}
                          onPress={() => openAttachment(url)}
                          style={styles.eventPreviewThumbWrap}
                        >
                          {isImageUrl(url) ? (
                            <Image source={{ uri: url }} style={styles.eventPreviewThumb} />
                          ) : (
                            <View style={styles.eventPreviewDocPill}>
                              <Text style={styles.eventPreviewDocText}>Abrir</Text>
                            </View>
                          )}
                        </Pressable>
                      ))}
                    </View>
                  ) : null}
                </Pressable>
              ))
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Registros de trabajo</Text>
            {(lot.logs || []).length === 0 ? (
              <Text style={styles.meta}>Aún no hay registros</Text>
            ) : (
              (lot.logs || []).slice(0, 20).map((log: any, index: number) => {
                const valueCop = Number(log.quantity || 0) * Number(log.unitPriceCop || 0);
                return (
                  <View key={`${log._id || index}`} style={styles.historyItem}>
                    <Text style={styles.historyTitle}>
                      {log.operationName} • {log.size} x{log.quantity}
                    </Text>
                    <Text style={styles.historyMeta}>
                      {log.workerName} • {money(valueCop)} • {String(log.workedAt).slice(0, 10)}
                    </Text>
                  </View>
                );
              })
            )}
          </View>

          {lot.status === 'LISTO_PARA_ENTREGAR' && (
            <Pressable
              style={[styles.deliverBtn, deliverLot.isPending && { opacity: 0.6 }]}
              onPress={confirmDeliver}
              disabled={deliverLot.isPending}
            >
              <Text style={styles.deliverText}>{deliverLot.isPending ? 'Entregando...' : 'Marcar como entregado'}</Text>
            </Pressable>
          )}
        </ScrollView>

        <OperationalModal
          visible={showLogModal}
          onClose={() => setShowLogModal(false)}
          title="Registrar operación"
          presentation="center"
          animationType="fade"
          contentContainerStyle={styles.modalContent}
        >

              <Text style={styles.modalLabel}>Operación</Text>
              <View style={styles.optionsWrap}>
                {(lot.operations || []).map((operation: any) => {
                  const active = operationId === operation.operationId;
                  return (
                    <Pressable
                      key={operation.operationId}
                      style={[styles.optionChip, active && styles.optionChipActive]}
                      onPress={() => setOperationId(operation.operationId)}
                    >
                      <Text style={[styles.optionText, active && styles.optionTextActive]}>{operation.name}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.modalLabel}>Talla</Text>
              <View style={styles.optionsWrap}>
                <Pressable
                  style={[
                    styles.optionChip,
                    selectedSizes.length === availableSizes.length && availableSizes.length > 0
                      ? styles.optionChipActive
                      : null,
                  ]}
                  onPress={() => setSelectedSizes(selectedSizes.length === availableSizes.length ? [] : availableSizes)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedSizes.length === availableSizes.length && availableSizes.length > 0
                        ? styles.optionTextActive
                        : null,
                    ]}
                  >
                    Todas
                  </Text>
                </Pressable>
                {availableSizes.map((sizeValue: string) => {
                  const active = selectedSizes.includes(sizeValue);
                  return (
                    <Pressable
                      key={sizeValue}
                      style={[styles.optionChip, active && styles.optionChipActive]}
                      onPress={() => toggleSizeSelection(sizeValue)}
                    >
                      <Text style={[styles.optionText, active && styles.optionTextActive]}>{sizeValue}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {availableColors.length > 1 ? (
                <>
                  <Text style={styles.modalLabel}>Color</Text>
                  <View style={styles.optionsWrap}>
                    <Pressable
                      style={[
                        styles.optionChip,
                        selectedColors.length === availableColors.length && availableColors.length > 0
                          ? styles.optionChipActive
                          : null,
                      ]}
                      onPress={() => setSelectedColors(selectedColors.length === availableColors.length ? [] : availableColors)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selectedColors.length === availableColors.length && availableColors.length > 0
                            ? styles.optionTextActive
                            : null,
                        ]}
                      >
                        Todos
                      </Text>
                    </Pressable>
                    {availableColors.map((colorValue: string) => {
                      const active = selectedColors.includes(colorValue);
                      return (
                        <Pressable
                          key={colorValue}
                          style={[styles.optionChip, active && styles.optionChipActive]}
                          onPress={() => toggleColorSelection(colorValue)}
                        >
                          <Text style={[styles.optionText, active && styles.optionTextActive]}>
                            {colorValue}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              ) : null}

              <Text style={styles.metaSmall}>
                Disponible para registrar: {maxRegistrableUnits} unidades
              </Text>
              <Text style={styles.metaSmall}>
                Selección: {selectedSizes.length || 0} talla(s)
                {availableColors.length > 1 ? ` • ${selectedColors.length || 0} color(es)` : ''}
              </Text>

              <Text style={styles.modalLabel}>Confeccionista</Text>
              <Pressable style={styles.selectorBtn} onPress={() => setShowWorkerSelector(true)}>
                <Text style={styles.selectorText}>
                  {workerLabel || 'Seleccionar o crear confeccionista'}
                </Text>
              </Pressable>

              <TextInput
                placeholder="Cantidad"
                placeholderTextColor="#8EA4CC"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                style={styles.input}
              />
              {isQuantityAboveMax ? (
                <Text style={styles.validationText}>
                  La cantidad supera el maximo disponible para esta seleccion.
                </Text>
              ) : null}

              <Text style={styles.modalLabel}>Fecha de operación</Text>
              <Pressable style={styles.selectorBtn} onPress={() => setShowWorkedAtPicker(true)}>
                <Text style={styles.selectorText}>{formatDateLabel(workedAt)}</Text>
              </Pressable>

              {showWorkedAtPicker && (
                <DateTimePicker
                  mode="date"
                  value={workedAt ? new Date(`${workedAt}T12:00:00`) : new Date()}
                  onChange={(_, date) => {
                    setShowWorkedAtPicker(false);
                    if (date) setWorkedAt(formatDateOnly(date));
                  }}
                />
              )}

              <TextInput
                placeholder="Nota"
                placeholderTextColor="#8EA4CC"
                value={note}
                onChangeText={setNote}
                style={[styles.input, { height: 70 }]}
                multiline
              />

              <Pressable
                style={[
                  styles.saveBtn,
                  (createLog.isPending || maxRegistrableUnits <= 0 || isQuantityAboveMax) && {
                    opacity: 0.6,
                  },
                ]}
                onPress={saveLog}
                disabled={createLog.isPending || maxRegistrableUnits <= 0 || isQuantityAboveMax}
              >
                <Text style={styles.saveText}>{createLog.isPending ? 'Guardando...' : 'Guardar registro'}</Text>
              </Pressable>
        </OperationalModal>

        <OperationalModal
          visible={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Editar lote"
          presentation="center"
          animationType="fade"
          contentContainerStyle={styles.modalContent}
        >

              <Pressable style={styles.selectorBtn} onPress={() => setShowReceivedPicker(true)}>
                <Text style={styles.selectorText}>Recepción: {editReceivedDate || 'Seleccionar fecha'}</Text>
              </Pressable>

              <Pressable style={styles.selectorBtn} onPress={() => setShowCommitmentPicker(true)}>
                <Text style={styles.selectorText}>Compromiso: {editCommitmentDate || 'Seleccionar fecha'}</Text>
              </Pressable>

              <TextInput
                placeholder="Valor pactado por unidad"
                placeholderTextColor="#8EA4CC"
                value={editUnitAgreedPrice}
                onChangeText={setEditUnitAgreedPrice}
                keyboardType="numeric"
                style={styles.input}
              />
              <TextInput
                placeholder="Referencia externa"
                placeholderTextColor="#8EA4CC"
                value={editExternalReference}
                onChangeText={setEditExternalReference}
                style={styles.input}
              />
              <ImageAttachmentField
                title="Remisión / documento base"
                helperText={
                  lot.baseDocumentUrl
                    ? 'Ya hay una evidencia guardada. Adjunta otra imagen para reemplazarla.'
                    : 'Adjunta evidencia del documento base del lote.'
                }
                images={editBaseDocumentImages}
                onChange={setEditBaseDocumentImages}
                maxImages={1}
              />
              <ImageAttachmentField
                title="Ficha técnica"
                helperText={
                  lot.technicalSheetUrl
                    ? 'Ya hay una evidencia guardada. Adjunta otra imagen para reemplazarla.'
                    : 'Adjunta evidencia de la ficha técnica del lote.'
                }
                images={editTechnicalSheetImages}
                onChange={setEditTechnicalSheetImages}
                maxImages={1}
              />
              <TextInput
                placeholder="Observaciones"
                placeholderTextColor="#8EA4CC"
                value={editObservations}
                onChangeText={setEditObservations}
                multiline
                style={[styles.input, { minHeight: 74 }]}
              />

              <Pressable
                style={[styles.saveBtn, updateLot.isPending && { opacity: 0.6 }]}
                onPress={saveLotEdit}
                disabled={updateLot.isPending}
              >
                <Text style={styles.saveText}>{updateLot.isPending ? 'Guardando...' : 'Guardar cambios'}</Text>
              </Pressable>
        </OperationalModal>

        <OperationalModal
          visible={showLaborPaymentModal}
          onClose={() => setShowLaborPaymentModal(false)}
          title="Pagar trabajo empleado"
          presentation="center"
          animationType="fade"
          contentContainerStyle={styles.modalContent}
        >

              <Pressable style={styles.selectorBtn} onPress={() => setShowWorkerSelector(true)}>
                <Text style={styles.selectorText}>{paymentEmployeeLabel || 'Seleccionar empleado'}</Text>
              </Pressable>

              <TextInput
                placeholder="Monto a pagar"
                placeholderTextColor="#8EA4CC"
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                keyboardType="numeric"
                style={styles.input}
              />
              <PaymentMethodSelector
                label="Metodo de pago"
                value={paymentMethod}
                onChange={(next) => setPaymentMethod(next as LaborPaymentMethod)}
                methods={LABOR_PAYMENT_METHODS}
              />

              <Text style={styles.modalLabel}>Fecha de pago</Text>
              <Pressable style={styles.selectorBtn} onPress={() => setShowPaymentDatePicker(true)}>
                <Text style={styles.selectorText}>{formatDateLabel(paymentDate)}</Text>
              </Pressable>

              {showPaymentDatePicker && (
                <DateTimePicker
                  mode="date"
                  value={paymentDate ? new Date(`${paymentDate}T12:00:00`) : new Date()}
                  onChange={(_, date) => {
                    setShowPaymentDatePicker(false);
                    if (date) setPaymentDate(formatDateOnly(date));
                  }}
                />
              )}
              <TextInput
                placeholder="Nota"
                placeholderTextColor="#8EA4CC"
                value={paymentNote}
                onChangeText={setPaymentNote}
                style={[styles.input, { minHeight: 64 }]}
                multiline
              />
              <ImageAttachmentField
                title="Comprobante de pago"
                helperText="Adjunta evidencia del pago al empleado."
                images={paymentEvidenceImages}
                onChange={setPaymentEvidenceImages}
                maxImages={1}
              />

              <Pressable style={styles.saveBtn} onPress={saveLaborPayment}>
                <Text style={styles.saveText}>Registrar pago</Text>
              </Pressable>
        </OperationalModal>

        <OperationalModal
          visible={showIncomeModal}
          onClose={() => setShowIncomeModal(false)}
          title="Registrar cobro lote"
          presentation="center"
          animationType="fade"
          contentContainerStyle={styles.modalContent}
        >

              <TextInput
                placeholder="Monto cobrado"
                placeholderTextColor="#8EA4CC"
                value={incomeAmount}
                onChangeText={setIncomeAmount}
                keyboardType="numeric"
                style={styles.input}
              />
              <PaymentMethodSelector
                label="Metodo de pago"
                value={incomeMethod}
                onChange={setIncomeMethod}
              />

              <Text style={styles.modalLabel}>Fecha de cobro</Text>
              <Pressable style={styles.selectorBtn} onPress={() => setShowIncomeDatePicker(true)}>
                <Text style={styles.selectorText}>{formatDateLabel(incomeDate)}</Text>
              </Pressable>

              {showIncomeDatePicker && (
                <DateTimePicker
                  mode="date"
                  value={incomeDate ? new Date(`${incomeDate}T12:00:00`) : new Date()}
                  onChange={(_, date) => {
                    setShowIncomeDatePicker(false);
                    if (date) setIncomeDate(formatDateOnly(date));
                  }}
                />
              )}
              <TextInput
                placeholder="Nota"
                placeholderTextColor="#8EA4CC"
                value={incomeNote}
                onChangeText={setIncomeNote}
                style={[styles.input, { minHeight: 64 }]}
                multiline
              />
              <ImageAttachmentField
                title="Comprobante de cobro"
                helperText="Adjunta soporte del ingreso del lote."
                images={incomeEvidenceImages}
                onChange={setIncomeEvidenceImages}
                maxImages={1}
              />

              <Pressable style={styles.saveBtn} onPress={saveIncome}>
                <Text style={styles.saveText}>Registrar cobro</Text>
              </Pressable>
        </OperationalModal>

        <OperationalModal
          visible={showCostModal}
          onClose={() => setShowCostModal(false)}
          title="Registrar costo del lote"
          presentation="center"
          animationType="fade"
          contentContainerStyle={styles.modalContent}
        >

              <View style={styles.optionsWrap}>
                {(['TRANSPORT', 'SUPPLY', 'OTHER'] as const).map((item) => {
                  const active = costType === item;
                  return (
                    <Pressable
                      key={item}
                      style={[styles.optionChip, active && styles.optionChipActive]}
                        onPress={() => {
                          setCostType(item);
                          if (item !== 'SUPPLY') {
                            setCostSupplySubtype('GENERAL');
                            setCostLines([]);
                            resetCostLineBuilder();
                          }
                        }}
                    >
                      <Text style={[styles.optionText, active && styles.optionTextActive]}>
                        {item === 'TRANSPORT' ? 'Transporte' : item === 'SUPPLY' ? 'Insumo' : 'Otro costo'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {costType === 'SUPPLY' ? (
                <View style={styles.optionsWrap}>
                  {(['GENERAL', 'HILO', 'NYLON'] as const).map((item) => {
                    const active = costSupplySubtype === item;
                    return (
                      <Pressable
                        key={item}
                        style={[styles.optionChip, active && styles.optionChipActive]}
                        onPress={() => {
                          setCostSupplySubtype(item);
                          setCostLines([]);
                          resetCostLineBuilder();
                          if (item !== 'GENERAL') {
                            setCostAmount('');
                          }
                        }}
                      >
                        <Text style={[styles.optionText, active && styles.optionTextActive]}>
                          {item === 'GENERAL' ? 'Simple' : item === 'HILO' ? 'Hilo' : 'Nylon'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}

              {!usesSupplyLines ? (
                <TextInput
                  placeholder={costType === 'SUPPLY' ? 'Monto total del insumo' : 'Monto'}
                  placeholderTextColor="#8EA4CC"
                  value={costAmount}
                  onChangeText={setCostAmount}
                  keyboardType="numeric"
                  style={styles.input}
                />
              ) : (
                <View style={styles.operationBlock}>
                  <Text style={styles.sectionTitle}>Constructor de líneas ({costSupplySubtype === 'HILO' ? 'Hilo' : 'Nylon'})</Text>
                  <Text style={styles.metaSmall}>Captura la línea actual y luego agrégala al costo.</Text>

                  <View style={styles.costBuilderCard}>
                    <Text style={styles.modalLabel}>Línea actual</Text>
                    <TextInput
                      placeholder="Ítem"
                      placeholderTextColor="#8EA4CC"
                      value={costLineItemType}
                      onChangeText={setCostLineItemType}
                      style={styles.input}
                    />
                    <TextInput
                      placeholder="Detalle (opcional)"
                      placeholderTextColor="#8EA4CC"
                      value={costLineDetail}
                      onChangeText={setCostLineDetail}
                      style={styles.input}
                    />
                    <TextInput
                      placeholder="Cantidad (opcional)"
                      placeholderTextColor="#8EA4CC"
                      value={costLineQuantity}
                      onChangeText={setCostLineQuantity}
                      keyboardType="numeric"
                      style={styles.input}
                    />
                    <TextInput
                      placeholder="Total pagado por línea"
                      placeholderTextColor="#8EA4CC"
                      value={costLineTotalPaid}
                      onChangeText={setCostLineTotalPaid}
                      keyboardType="numeric"
                      style={styles.input}
                    />
                    <Pressable style={styles.lineBuilderBtn} onPress={addOrUpdateCostLine}>
                      <Text style={styles.lineBuilderBtnText}>
                        {editingCostLineId ? 'Actualizar línea actual' : 'Agregar línea al costo'}
                      </Text>
                    </Pressable>
                  </View>

                  <View style={styles.rowLine}>
                    <Text style={styles.modalLabel}>Líneas agregadas</Text>
                    <Text style={styles.metaSmall}>{costLines.length} línea(s)</Text>
                  </View>

                  {costLines.length === 0 ? (
                    <Text style={styles.metaSmall}>Aún no hay líneas. Agrega la primera para continuar.</Text>
                  ) : null}

                  {costLines.map((line, index) => (
                    <View key={line.id} style={styles.costLineCard}>
                      <View style={styles.rowLine}>
                        <Text style={styles.lineLabel}>Línea {index + 1}: {line.itemType}</Text>
                        <Text style={styles.lineValue}>{money(Number(line.totalPaidCop || 0))}</Text>
                      </View>
                      {line.detail ? <Text style={styles.metaSmall}>Detalle: {line.detail}</Text> : null}
                      {line.quantity ? <Text style={styles.metaSmall}>Cantidad: {line.quantity}</Text> : null}
                      <View style={styles.lineActionsRow}>
                        <Pressable style={styles.lineActionBtn} onPress={() => editCostLine(line.id)}>
                          <Pencil size={14} color="#9FC0FF" />
                          <Text style={styles.quickActionText}>Editar</Text>
                        </Pressable>
                        <Pressable style={styles.lineActionBtn} onPress={() => removeCostLine(line.id)}>
                          <Trash2 size={14} color="#FCA5A5" />
                          <Text style={styles.quickActionText}>Eliminar</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                  <Text style={styles.metaSmall}>Total por líneas: {money(costLinesTotal)}</Text>
                </View>
              )}

              <Pressable style={styles.selectorBtn} onPress={() => setShowCostDatePicker(true)}>
                <Text style={styles.selectorText}>Fecha: {costDate || 'Seleccionar fecha'}</Text>
              </Pressable>
              <TextInput
                placeholder="Nota general"
                placeholderTextColor="#8EA4CC"
                value={costNote}
                onChangeText={setCostNote}
                style={[styles.input, { minHeight: 64 }]}
                multiline
              />
              <ImageAttachmentField
                title="Evidencia del costo"
                helperText="Adjunta soporte de transporte o costo relacionado."
                images={costEvidenceImages}
                onChange={setCostEvidenceImages}
                maxImages={1}
              />

              <Pressable style={styles.saveBtn} onPress={saveCost}>
                <Text style={styles.saveText}>Registrar costo</Text>
              </Pressable>
        </OperationalModal>

        <OperationalModal
          visible={showEventDetailModal}
          onClose={() => setShowEventDetailModal(false)}
          title="Detalle del evento"
          presentation="center"
          animationType="fade"
          contentContainerStyle={styles.modalContent}
        >

              {selectedTimelineEvent ? (
                <>
                  <Text style={styles.meta}>{selectedTimelineEvent.type}</Text>
                  <Text style={styles.historyTitle}>{selectedTimelineEvent.message}</Text>
                  <Text style={styles.historyMeta}>
                    {String(selectedTimelineEvent.createdAt).slice(0, 19).replace('T', ' ')}
                  </Text>

                  {selectedTimelineEvent.type === 'OPERATION_LOGGED' ? (
                    <View style={styles.operationBlock}>
                      <Text style={styles.metaSmall}>Empleado: {selectedTimelineEvent.metadata?.workerName || 'N/A'}</Text>
                      <Text style={styles.metaSmall}>Operación: {selectedTimelineEvent.metadata?.operationName || selectedTimelineEvent.metadata?.operationId || 'N/A'}</Text>
                      <Text style={styles.metaSmall}>
                        Colores: {(selectedTimelineEvent.metadata?.colors || [selectedTimelineEvent.metadata?.color || 'UNICO']).join(', ')}
                      </Text>
                      <Text style={styles.metaSmall}>
                        Tallas: {(selectedTimelineEvent.metadata?.sizes || [selectedTimelineEvent.metadata?.size || 'N/A']).join(', ')}
                      </Text>
                      <Text style={styles.metaSmall}>Cantidad: {selectedTimelineEvent.metadata?.quantity || 0}</Text>
                      <Text style={styles.metaSmall}>Valor generado: {money(selectedTimelineEvent.metadata?.valueCop || 0)}</Text>
                      <Text style={styles.metaSmall}>Llevaba: {selectedTimelineEvent.metadata?.previousCompletedUnits || 0}</Text>
                      <Text style={styles.metaSmall}>Registró: {selectedTimelineEvent.metadata?.quantity || 0}</Text>
                      <Text style={styles.metaSmall}>Ahora lleva: {selectedTimelineEvent.metadata?.currentCompletedUnits || 0}</Text>
                      <Text style={styles.metaSmall}>Faltan: {selectedTimelineEvent.metadata?.pendingUnits || 0}</Text>
                      {Array.isArray(selectedTimelineEvent.metadata?.allocations) ? (
                        <Text style={styles.metaSmall}>
                          Distribución: {selectedTimelineEvent.metadata.allocations
                            .map((item: any) => `${item.color || 'UNICO'}-${item.size} x${item.quantity}`)
                            .join(' • ')}
                        </Text>
                      ) : null}
                    </View>
                  ) : null}

                  {selectedTimelineEvent.type === 'LOT_COST_REGISTERED' || selectedTimelineEvent.type === 'SUPPLY_ADDED' ? (
                    <View style={styles.operationBlock}>
                      <Text style={styles.metaSmall}>Tipo gasto: {selectedTimelineEvent.metadata?.expenseType || selectedTimelineEvent.metadata?.type || 'N/A'}</Text>
                      {selectedTimelineEvent.metadata?.supplySubtype ? (
                        <Text style={styles.metaSmall}>Subtipo insumo: {selectedTimelineEvent.metadata?.supplySubtype}</Text>
                      ) : null}
                      <Text style={styles.metaSmall}>Monto: {money(selectedTimelineEvent.metadata?.amountCop || selectedTimelineEvent.metadata?.totalCostCop || 0)}</Text>
                      {selectedTimelineEvent.metadata?.note ? (
                        <Text style={styles.metaSmall}>Nota: {selectedTimelineEvent.metadata?.note}</Text>
                      ) : null}
                      {Array.isArray(selectedTimelineEvent.metadata?.lines) && selectedTimelineEvent.metadata.lines.length > 0 ? (
                        <View style={styles.costEventLinesBlock}>
                          <Text style={styles.metaSmall}>Líneas registradas</Text>
                          {selectedTimelineEvent.metadata.lines.map((line: any, index: number) => (
                            <View key={`${line.itemType || 'LINE'}-${index}`} style={styles.costEventLineRow}>
                              <Text style={styles.metaSmall}>- {line.itemType || 'Ítem'}</Text>
                              <Text style={styles.metaSmall}>{line.detail || '-'}</Text>
                              <Text style={styles.metaSmall}>{line.quantity ?? '-'}</Text>
                              <Text style={styles.metaSmall}>{money(line.totalPaidCop || 0)}</Text>
                            </View>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  ) : null}

                  {selectedTimelineEvent.type === 'LOT_STATUS_CHANGED' ? (
                    <View style={styles.operationBlock}>
                      <Text style={styles.metaSmall}>Estado anterior: {selectedTimelineEvent.metadata?.fromStatus || 'N/A'}</Text>
                      <Text style={styles.metaSmall}>Estado nuevo: {selectedTimelineEvent.metadata?.toStatus || 'N/A'}</Text>
                      <Text style={styles.metaSmall}>Usuario: {selectedTimelineEvent.createdBy || 'Sistema'}</Text>
                    </View>
                  ) : null}

                  {selectedTimelineEvent.type === 'LOT_DOCUMENT_ATTACHED' ? (
                    <View style={styles.operationBlock}>
                      <Text style={styles.metaSmall}>Documento: {selectedTimelineEvent.metadata?.documentType || 'Adjunto'}</Text>
                    </View>
                  ) : null}

                  {(selectedTimelineEvent.evidenceUrls || []).length > 0 ? (
                    <View style={styles.eventPreviewRow}>
                      {(selectedTimelineEvent.evidenceUrls || []).map((url: string, index: number) => (
                        <Pressable
                          key={`${url}-${index}`}
                          onPress={() => openAttachment(url)}
                          style={styles.eventPreviewThumbWrap}
                        >
                          {isImageUrl(url) ? (
                            <Image source={{ uri: url }} style={styles.eventPreviewThumb} />
                          ) : (
                            <View style={styles.eventPreviewDocPill}>
                              <Text style={styles.eventPreviewDocText}>Abrir adjunto</Text>
                            </View>
                          )}
                        </Pressable>
                      ))}
                    </View>
                  ) : null}
                </>
              ) : null}
        </OperationalModal>

        <GarmentWorkerSelectorModal
          visible={showWorkerSelector}
          searchValue={workerSearch}
          workers={(workersQuery.data || []) as Employee[]}
          onSearchChange={setWorkerSearch}
          onClose={() => setShowWorkerSelector(false)}
          onSelect={(worker) => {
            setWorkerEmployeeId(worker._id);
            setWorkerLabel(`${worker.name} ${worker.lastName}`.trim());
            setPaymentEmployeeId(worker._id);
            setPaymentEmployeeLabel(`${worker.name} ${worker.lastName}`.trim());
            setShowWorkerSelector(false);
          }}
          onCreateRequest={() => setShowCreateWorker(true)}
        />

        <CreateEmployeeModal
          visible={showCreateWorker}
          initialRole="MANUFACTURER"
          onClose={() => setShowCreateWorker(false)}
          onCreated={(employee) => {
            const created = employee as Employee;
            setWorkerEmployeeId(created._id);
            setWorkerLabel(`${created.name} ${created.lastName}`.trim());
            setPaymentEmployeeId(created._id);
            setPaymentEmployeeLabel(`${created.name} ${created.lastName}`.trim());
            setShowWorkerSelector(false);
          }}
        />

        {showReceivedPicker && (
          <DateTimePicker
            mode="date"
            value={editReceivedDate ? new Date(editReceivedDate) : new Date()}
            onChange={(_, date) => {
              if (date) setEditReceivedDate(formatDateOnly(date));
              setShowReceivedPicker(false);
            }}
          />
        )}

        {showCommitmentPicker && (
          <DateTimePicker
            mode="date"
            value={editCommitmentDate ? new Date(editCommitmentDate) : new Date()}
            onChange={(_, date) => {
              if (date) setEditCommitmentDate(formatDateOnly(date));
              setShowCommitmentPicker(false);
            }}
          />
        )}

        {showCostDatePicker && (
          <DateTimePicker
            mode="date"
            value={costDate ? new Date(costDate) : new Date()}
            onChange={(_, date) => {
              if (date) setCostDate(formatDateOnly(date));
              setShowCostDatePicker(false);
            }}
          />
        )}

        <ImageViewerModal
          visible={!!viewerImageUrl}
          imageUrl={viewerImageUrl}
          onClose={() => setViewerImageUrl(undefined)}
        />
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  stateText: {
    color: theme.colors.textPrimary,
  },
  headerRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#EAF1FF',
    fontSize: theme.font.md,
    fontWeight: theme.weight.bold,
  },
  subtitle: {
    color: '#8EA4CC',
    fontSize: 11,
    marginTop: 1,
  },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 24,
    gap: 10,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    padding: 12,
    gap: 6,
  },
  cardTitle: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
  },
  cardSub: {
    color: '#BFD0EE',
    fontSize: 12,
  },
  meta: {
    color: '#8EA4CC',
    fontSize: 11,
  },
  metaSmall: {
    color: '#7EA0D8',
    fontSize: 10,
  },
  sectionTitle: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    marginBottom: 2,
  },
  rowLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  lineLabel: {
    color: '#C8D7F1',
    fontSize: 12,
    flex: 1,
  },
  lineValue: {
    color: '#EAF1FF',
    fontWeight: theme.weight.semibold,
    fontSize: 12,
  },
  progressRow: {
    marginTop: 6,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#132A55',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#2E6BFF',
  },
  progressText: {
    width: 44,
    textAlign: 'right',
    color: '#DCE8FF',
    fontSize: 11,
  },
  quickActionsRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  quickActionBtn: {
    minHeight: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A4E7D',
    backgroundColor: '#122C4F',
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    color: '#9FC0FF',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  operationBlock: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1A2D52',
    backgroundColor: '#081731',
    padding: 8,
    gap: 3,
  },
  costLineCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    padding: 8,
    gap: 6,
    marginTop: 6,
  },
  costBuilderCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    padding: 8,
    gap: 6,
  },
  lineBuilderBtn: {
    minHeight: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3569CC',
    backgroundColor: '#1A3F7A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  lineBuilderBtnText: {
    color: '#DDE8FF',
    fontSize: 11,
    fontWeight: theme.weight.bold,
  },
  lineActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  lineActionBtn: {
    minHeight: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A4E7D',
    backgroundColor: '#122C4F',
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  costEventLinesBlock: {
    marginTop: 6,
    gap: 4,
  },
  costEventLineRow: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1A2D52',
    backgroundColor: '#081731',
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 2,
  },
  progressTrackSmall: {
    marginTop: 4,
    height: 7,
    borderRadius: 999,
    backgroundColor: '#122747',
    overflow: 'hidden',
  },
  progressFillSmall: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#60A5FA',
  },
  historyItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#1A2D52',
    paddingBottom: 6,
    marginBottom: 6,
  },
  historyTitle: {
    color: '#C8D7F1',
    fontSize: 12,
  },
  historyMeta: {
    marginTop: 2,
    color: '#7E94BE',
    fontSize: 10,
  },
  eventPreviewRow: {
    marginTop: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  eventPreviewThumbWrap: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  eventPreviewThumb: {
    width: 54,
    height: 54,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F3765',
  },
  eventPreviewDocPill: {
    minHeight: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A4E7D',
    backgroundColor: '#10284D',
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventPreviewDocText: {
    color: '#9FC0FF',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  deliverBtn: {
    height: 46,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliverText: {
    color: '#052E16',
    fontWeight: theme.weight.bold,
  },
  modalContent: {
    gap: 7,
  },
  modalLabel: {
    color: '#8EA4CC',
    fontSize: 11,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  optionChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  optionChipActive: {
    borderColor: '#2E6BFF',
    backgroundColor: '#0D224A',
  },
  optionText: {
    color: '#8EA4CC',
    fontSize: 11,
  },
  optionTextActive: {
    color: '#EAF1FF',
  },
  input: {
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    color: '#EAF1FF',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  selectorBtn: {
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#315A92',
    backgroundColor: '#10284D',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  selectorText: {
    color: '#DCE8FF',
    fontSize: 12,
    fontWeight: theme.weight.semibold,
  },
  validationText: {
    color: '#FDBA74',
    fontSize: 10,
    marginTop: -2,
  },
  saveBtn: {
    marginTop: 4,
    height: 42,
    borderRadius: 10,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#041427',
    fontWeight: theme.weight.bold,
  },
});
