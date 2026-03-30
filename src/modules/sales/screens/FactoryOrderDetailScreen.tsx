import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
  ChevronRight,
  CircleDot,
  Package,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { Input } from '@/components/ui/Input';
import { ActionLoader } from '@/components/ui/ActionLoader';
import ImageViewerModal from '@/components/ui/ImageViewerModal';
import { theme } from '@/theme';
import type { AppStackParamList } from '@/navigation/AppNavigator';
import {
  useAddManufacturingProcessEvent,
  useManufacturingProcessDetail,
  useUpdateManufacturingProcess,
} from '../hooks/useManufacturingProcess';
import { useEmployees } from '@/modules/employees/hooks/useEmployees';
import { useAuthStore } from '@/stores/auth.store';
import { SaleStatusSelectorModal } from '../components/SaleStatusSelectorModal';
import { ResponsibleSelectorModal } from '../components/ResponsibleSelectorModal';
import { SaleEventComposerModal } from '../components/SaleEventComposerModal';
import { FactoryOperationalSummaryCard } from '../components/FactoryOperationalSummaryCard';
import { FactoryTimelineSection } from '../components/FactoryTimelineSection';
import {
  normalizeSalePriority,
  normalizeSaleStatus,
  salePriorityConfig,
  saleStatusConfig,
  saleStatusOrder,
} from '../utils/saleStatus';
import { deriveDelayedInfo } from '../utils/delayedSales';
import type { Sale, SaleStatus } from '../types/sale.type';
import {
  DELIVERY_EVENT_TYPES,
  FACTORY_EVENT_TYPES,
  MATERIALS_BLOCKED_EVENT,
  MATERIALS_RESUMED_EVENT,
  modeCopy,
} from '../utils/factoryOrderDetail.constants';

type Params = RouteProp<AppStackParamList, 'FactoryOrderDetail'>;

export default function FactoryOrderDetailScreen() {
  const route = useRoute<Params>();
  const navigation = useNavigation<any>();
  const saleId = route.params?.saleId;
  const processId = route.params?.processId;
  const activeProcessId = processId || '';
  const mode = route.params?.mode || 'FACTORY';

  const { data: detail, isLoading, refetch } = useManufacturingProcessDetail(activeProcessId);
  const process = detail?.process;
  const saleContext = detail?.sale;
  const sale = useMemo<Sale | null>(() => {
    if (!process) return null;
    return {
      _id: process.saleId,
      workspaceId: '',
      amountCop: Number(saleContext?.amountCop || 0),
      date: String(process.saleDate || saleContext?.date || ''),
      paymentMethod: 'EFECTIVO',
      saleType: 'MANUFACTURE',
      status: process.operationalStatus,
      priority: process.priority,
      deliveryDate: process.commitmentDate,
      isDelayed: process.isDelayed,
      delayedDays: process.delayedDays,
      responsibleEmployeeId: process.responsibleEmployeeId,
      responsibleEmployee: process.responsibleEmployee,
      product: { id: process.productId, name: process.productName },
      items: [
        {
          itemId: process.saleItemId,
          productId: process.productId,
          productName: process.productName,
          quantity: process.quantity,
          unitPrice: 0,
          subtotalCop: 0,
          requiresManufacturing: true,
        },
      ],
      events: process.eventHistory || [],
      paymentStatus: saleContext?.paymentStatus || 'PENDING',
      paidAmountCop: Number(saleContext?.paidAmountCop || 0),
      remainingAmountCop: Number(saleContext?.remainingAmountCop || 0),
      createdByUserId: '',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    };
  }, [process, saleContext]);
  const user = useAuthStore((s) => s.user);
  const updateProcess = useUpdateManufacturingProcess();
  const addProcessEvent = useAddManufacturingProcessEvent();

  const { data: manufacturers = [] } = useEmployees(undefined, 'MANUFACTURER');
  const { data: transporters = [] } = useEmployees(undefined, 'TRANSPORTER');

  const [showEventModal, setShowEventModal] = useState(false);
  const [showAssigneeModal, setShowAssigneeModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [eventType, setEventType] = useState<string>(
    mode === 'DELIVERY' ? 'LOADED_FOR_DELIVERY' : 'MANUFACTURE_STARTED',
  );
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<SaleStatus | null>(null);
  const [rollbackReason, setRollbackReason] = useState('');
  const [eventMessage, setEventMessage] = useState('');
  const [eventImages, setEventImages] = useState<Array<{ uri: string; name?: string; type?: string }>>([]);
  const [viewerImageUrl, setViewerImageUrl] = useState<string | undefined>(undefined);
  const [selectedResponsibleEmployeeId, setSelectedResponsibleEmployeeId] = useState<string | undefined>(undefined);

  const delayed = deriveDelayedInfo((sale || {}) as any);
  const isDelayed = sale?.isDelayed ?? delayed.isDelayed;
  const delayedDays = sale?.delayedDays ?? delayed.delayedDays;
  const status = normalizeSaleStatus(process?.operationalStatus);
  const priority = normalizeSalePriority(process?.priority);
  const statusUI = saleStatusConfig[status];
  const priorityUI = salePriorityConfig[priority];
  const eventTypes = mode === 'DELIVERY' ? DELIVERY_EVENT_TYPES : FACTORY_EVENT_TYPES;
  const copy = modeCopy(mode === 'DELIVERY' ? 'DELIVERY' : 'FACTORY');
  const assigneeOptions = mode === 'DELIVERY' ? transporters : manufacturers;
  const isFactoryMode = mode !== 'DELIVERY';
  const baseStatuses: SaleStatus[] = mode === 'DELIVERY'
    ? ['LISTO_PARA_ENTREGAR', 'ENTREGADA']
    : ['EN_FABRICACION', 'LISTO_PARA_ENTREGAR'];
  const statusOptions = Array.from(new Set<SaleStatus>([status, ...baseStatuses]));
  const isActionLoading = updateProcess.isPending || addProcessEvent.isPending;
  const isOperationalUser =
    user?.role === 'OPERATOR' &&
    (user?.employeeRole === 'MANUFACTURER' || user?.employeeRole === 'TRANSPORTER');

  const timeline = useMemo(
    () => [...(sale?.events || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [sale?.events],
  );

  const latestMaterialStateEvent = useMemo(
    () =>
      timeline.find(
        (event) => event.type === MATERIALS_BLOCKED_EVENT || event.type === MATERIALS_RESUMED_EVENT,
      ),
    [timeline],
  );

  const isManufactureBlockedByMaterials = latestMaterialStateEvent?.type === MATERIALS_BLOCKED_EVENT;
  const progressControlHint =
    isFactoryMode && isManufactureBlockedByMaterials
      ? 'El pedido esta detenido por materiales. Reanuda materiales antes de mover el estado.'
      : copy.progressControlHint;
  const nextActionTitle = mode === 'DELIVERY'
    ? 'Registrar novedad de entrega'
    : isManufactureBlockedByMaterials
      ? 'Registrar gestion de materiales'
      : 'Registrar avance';
  const nextActionSubtitle = mode === 'DELIVERY'
    ? 'Anota hitos y evidencia de entrega'
    : isManufactureBlockedByMaterials
      ? 'Deja registro de faltantes o gestion de insumos'
      : 'Anota progreso y evidencia';

  const filteredAssignees = (assigneeOptions as any[]).filter((employee) => {
    const q = assigneeSearch.trim().toLowerCase();
    if (!q) return true;
    const fullName = `${employee.name || ''} ${employee.lastName || ''}`.trim().toLowerCase();
    return fullName.includes(q) || String(employee.phone || '').toLowerCase().includes(q);
  });

  useEffect(() => {
    setSelectedResponsibleEmployeeId(sale?.responsibleEmployeeId || undefined);
  }, [sale?.responsibleEmployeeId]);

  if (!processId) {
    return (
      <MainLayout>
        <View style={styles.centeredState}>
          <Text style={styles.stateText}>No hay pedido seleccionado</Text>
          <Pressable onPress={() => navigation.goBack()} style={styles.stateBtn}>
            <Text style={styles.stateBtnText}>Volver</Text>
          </Pressable>
        </View>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <View style={styles.centeredState}>
          <ActivityIndicator color={theme.colors.accent} />
          <Text style={styles.stateText}>Cargando pedido...</Text>
        </View>
      </MainLayout>
    );
  }

  if (!sale) {
    return (
      <MainLayout>
        <View style={styles.centeredState}>
          <Text style={styles.stateText}>No encontramos el pedido</Text>
          <Pressable onPress={() => navigation.goBack()} style={styles.stateBtn}>
            <Text style={styles.stateBtnText}>Volver</Text>
          </Pressable>
        </View>
      </MainLayout>
    );
  }

  async function performStatusChange(nextStatus: SaleStatus, reason?: string) {
    try {
      await updateProcess.mutateAsync({
        processId: activeProcessId,
        payload: {
          operationalStatus: nextStatus,
          eventMessage: `Cambio operativo de estado a ${saleStatusConfig[nextStatus].label}`,
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
    if (nextStatus === status || updateProcess.isPending) return;
    const isRollback = (saleStatusOrder[nextStatus] || 0) < (saleStatusOrder[status] || 0);

    if (isRollback) {
      setPendingStatus(nextStatus);
      setShowRollbackModal(true);
      return;
    }

    await performStatusChange(nextStatus);
  }

  async function handleAssignResponsible() {
    try {
      await updateProcess.mutateAsync({
        processId: activeProcessId,
        payload: { responsibleEmployeeId: selectedResponsibleEmployeeId || '' },
      });
      Toast.show({ type: 'success', text1: mode === 'DELIVERY' ? 'Transportador actualizado' : 'Fabricante actualizado' });
      setShowAssigneeModal(false);
      refetch();
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudo actualizar el responsable' });
    }
  }

  async function handleSaveEvent() {
    if (!eventMessage.trim() || addProcessEvent.isPending) return;

    try {
      await addProcessEvent.mutateAsync({
        processId: activeProcessId,
        payload: {
          type: eventType as any,
          message: eventMessage.trim(),
          images: eventImages,
          metadata: {
            operationalView: mode,
          },
        },
      });
      Toast.show({ type: 'success', text1: 'Evento agregado' });
      setEventMessage('');
      setEventImages([]);
      setShowEventModal(false);
      refetch();
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudo agregar el evento' });
    }
  }

  async function handleRegisterMaterialState(blocked: boolean) {
    if (addProcessEvent.isPending) return;

    try {
      await addProcessEvent.mutateAsync({
        processId: activeProcessId,
        payload: {
          type: blocked ? MATERIALS_BLOCKED_EVENT : MATERIALS_RESUMED_EVENT,
          message: blocked
            ? 'Fabricacion pausada: materiales sin gestionar.'
            : 'Fabricacion reanudada: materiales gestionados.',
          metadata: {
            materialFlowState: blocked ? 'BLOCKED' : 'RESUMED',
            operationalImpact: blocked ? 'MANUFACTURE_PAUSED' : 'MANUFACTURE_RESUMED',
            operationalView: mode,
          },
        },
      });

      Toast.show({
        type: 'success',
        text1: blocked ? 'Fabricacion pausada' : 'Fabricacion reanudada',
      });
      refetch();
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudo registrar el estado de materiales' });
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
              <Text style={styles.headerTitle}>{copy.headerTitle}</Text>
              <Text style={styles.headerSubtitle}>{copy.headerSubtitle}</Text>
              <Text style={styles.headerCode}>Proceso #{String(process?.manufacturingItemId || '').slice(-8)}</Text>
              <Text style={styles.headerContext}>{copy.headerContext}</Text>
              <Text style={styles.headerContext}>Venta #{process?.saleCode || String(process?.saleId || '').slice(-8)}</Text>
            </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FactoryOperationalSummaryCard
            mode={mode === 'DELIVERY' ? 'DELIVERY' : 'FACTORY'}
            roleLabel={copy.roleLabel}
            panelTitle={copy.panelTitle}
            sale={sale}
            statusLabel={statusUI.label}
            statusColor={statusUI.color}
            statusBg={statusUI.bg}
            priorityLabel={priorityUI.label}
            priorityColor={priorityUI.color}
            priorityBg={priorityUI.bg}
            isDelayed={isDelayed}
            delayedDays={delayedDays}
            isOperationalUser={isOperationalUser}
            isManufactureBlockedByMaterials={isManufactureBlockedByMaterials}
            latestMaterialStateEvent={latestMaterialStateEvent || null}
            onAssignResponsible={() => setShowAssigneeModal(true)}
            onToggleMaterialState={() => handleRegisterMaterialState(!isManufactureBlockedByMaterials)}
          />

          <View style={styles.sectionCard}>
            {!isOperationalUser && (
              <>
                <Text style={styles.sectionTitle}>{copy.progressControlTitle}</Text>
                <Text style={styles.sectionHint}>{progressControlHint}</Text>

                <Pressable style={styles.statusSelectorBtn} onPress={() => setShowStatusModal(true)}>
                  <View style={styles.statusSelectorLeft}>
                    <Text style={styles.statusSelectorEyebrow}>Estado actual</Text>
                    <View style={styles.statusSelectorValueRow}>
                      <View style={[styles.statusSelectorDot, { backgroundColor: statusUI.color }]} />
                      <Text style={styles.statusSelectorValue}>{statusUI.label}</Text>
                    </View>
                    <Text style={styles.statusSelectorHint}>Toca para actualizar el avance real</Text>
                  </View>
                  <ChevronRight size={18} color={theme.colors.textMuted} />
                </Pressable>

                <View style={styles.sectionDivider} />
              </>
            )}

            <Text style={styles.sectionTitle}>Siguiente accion</Text>
            <Text style={styles.sectionHint}>{copy.nextActionHint}</Text>

            <ActionButton
              icon={<CircleDot size={16} color="#60A5FA" />}
              title={nextActionTitle}
              subtitle={nextActionSubtitle}
              variant="primary"
              onPress={() => setShowEventModal(true)}
            />

            {!isOperationalUser && (
              <ActionButton
                icon={<Package size={16} color="#60A5FA" />}
                title="Ver venta"
                subtitle="Abrir detalle comercial"
                variant="secondary"
                onPress={() => navigation.navigate('SaleDetail', { saleId: process?.saleId || saleId || '' })}
              />
            )}
          </View>

          <FactoryTimelineSection timeline={timeline} onPhotoPress={(url) => setViewerImageUrl(url)} />
        </ScrollView>
      </View>

      <SaleEventComposerModal
        visible={showEventModal}
        title="Evento operativo"
        typeModalTitle="Tipo de evento operativo"
        typeLabel="Tipo de evento"
        eventTypes={eventTypes as unknown as Array<{ value: string; label: string }>}
        selectedType={eventType}
        message={eventMessage}
        messagePlaceholder="Detalle del evento"
        submitLabel="Guardar evento"
        canAttachImages
        images={eventImages}
        onClose={() => {
          setShowEventModal(false);
          setEventImages([]);
        }}
        onSelectType={(value) => setEventType(value as (typeof eventTypes)[number]['value'])}
        onMessageChange={setEventMessage}
        onImagesChange={setEventImages}
        onSubmit={handleSaveEvent}
      />

      {!isOperationalUser && (
        <ResponsibleSelectorModal
          visible={showAssigneeModal}
          title={mode === 'DELIVERY' ? 'Asignar transportador' : 'Asignar fabricante'}
          subtitle="Selecciona responsable operativo para este pedido."
          searchValue={assigneeSearch}
          searchPlaceholder={mode === 'DELIVERY' ? 'Buscar transportador' : 'Buscar fabricante'}
          options={filteredAssignees as any[]}
          selectedId={selectedResponsibleEmployeeId}
          onClose={() => setShowAssigneeModal(false)}
          onSearchChange={setAssigneeSearch}
          onSelect={setSelectedResponsibleEmployeeId}
          onSave={handleAssignResponsible}
        />
      )}

      <Modal visible={showRollbackModal} transparent animationType="fade" onRequestClose={() => setShowRollbackModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Justificación requerida</Text>
            <Text style={styles.modalSubtitle}>Este cambio es un rollback de estado. Debes registrar el motivo.</Text>

            <Input
              value={rollbackReason}
              onChangeText={setRollbackReason}
              placeholder="Explica por qué el pedido retrocede de estado"
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

      {!isOperationalUser && (
        <SaleStatusSelectorModal
          visible={showStatusModal}
          currentStatus={status}
          options={statusOptions}
          onClose={() => setShowStatusModal(false)}
          onSelect={handleChangeStatus}
        />
      )}

      <ImageViewerModal visible={!!viewerImageUrl} imageUrl={viewerImageUrl} onClose={() => setViewerImageUrl(undefined)} />
      <ActionLoader visible={isActionLoading} steps={['Guardando cambios...', 'Sincronizando pedido...', 'Finalizando...']} />
    </MainLayout>
  );
}

function ActionButton({
  icon,
  title,
  subtitle,
  variant,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  variant: 'primary' | 'secondary';
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.actionButton, variant === 'primary' ? styles.actionButtonPrimary : styles.actionButtonSecondary]} onPress={onPress}>
      <View style={styles.actionButtonLeft}>
        <View style={[styles.actionButtonIcon, variant === 'primary' ? styles.actionButtonIconPrimary : styles.actionButtonIconSecondary]}>{icon}</View>
        <View style={styles.actionButtonTextWrap}>
          <Text style={[styles.actionButtonTitle, variant === 'secondary' && styles.actionButtonTitleSecondary]}>{title}</Text>
          <Text style={styles.actionButtonSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <ChevronRight size={16} color={variant === 'primary' ? theme.colors.accent : '#8EA4CC'} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centeredState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  stateText: { color: theme.colors.textPrimary, fontSize: theme.font.md },
  stateBtn: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stateBtnText: { color: theme.colors.textPrimary, fontWeight: theme.weight.semibold },
  headerRow: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 12,
    paddingBottom: 12,
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
  headerTitleWrap: { flex: 1 },
  headerTitle: { color: theme.colors.textPrimary, fontWeight: theme.weight.bold, fontSize: theme.font.lg },
  headerSubtitle: { marginTop: 2, color: theme.colors.textMuted, fontSize: theme.font.xs },
  headerCode: { marginTop: 2, color: '#8EA4CC', fontSize: theme.font.xs },
  headerContext: { marginTop: 2, color: '#6E84AD', fontSize: 10 },
  content: { paddingHorizontal: theme.spacing.lg, paddingBottom: 24, gap: 10 },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 12,
    gap: 10,
  },
  sectionTitle: { color: theme.colors.textPrimary, fontWeight: theme.weight.bold, fontSize: theme.font.sm },
  sectionHint: { color: theme.colors.textMuted, fontSize: theme.font.xs },
  sectionDivider: { borderTopWidth: 1, borderTopColor: '#1A2D52', marginVertical: 2 },
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
    gap: 5,
  },
  statusSelectorEyebrow: {
    color: '#8EA4CC',
    fontSize: 11,
  },
  statusSelectorValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  statusSelectorDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
  },
  statusSelectorValue: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
  },
  statusSelectorHint: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  actionButton: {
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButtonPrimary: {
    borderColor: '#1F3765',
    backgroundColor: '#071B3E',
  },
  actionButtonSecondary: {
    borderColor: '#223B64',
    backgroundColor: '#081733',
  },
  actionButtonLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionButtonIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonIconPrimary: {
    borderWidth: 1,
    borderColor: '#2E6BFF66',
    backgroundColor: '#0A224F',
  },
  actionButtonIconSecondary: {
    borderWidth: 1,
    borderColor: '#2A3D5B',
    backgroundColor: '#0B1D3F',
  },
  actionButtonTextWrap: {
    flex: 1,
    gap: 2,
  },
  actionButtonTitle: {
    color: '#9FC0FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
  },
  actionButtonTitleSecondary: {
    color: '#C2D4F4',
  },
  actionButtonSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 11,
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
    backgroundColor: theme.colors.surface,
    padding: 14,
  },
  modalTitle: { color: theme.colors.textPrimary, fontSize: theme.font.md, fontWeight: theme.weight.bold },
  modalSubtitle: {
    marginTop: 4,
    color: '#8EA4CC',
    fontSize: theme.font.sm,
  },
  modalInput: { marginTop: 12, minHeight: 90, textAlignVertical: 'top' },
  modalActionsRow: { marginTop: 12, flexDirection: 'row', gap: 8 },
  modalGhostBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalGhostText: { color: theme.colors.textSecondary, fontWeight: theme.weight.semibold },
  modalPrimaryBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryText: { color: '#041427', fontWeight: theme.weight.bold },
});
