import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Plus, Shirt } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { OperationalModal } from '@/components/ui/OperationalModal';
import { api } from '@/services/api';
import { theme } from '@/theme';
import {
  useCreateGarmentLot,
  useGarmentLots,
  useGarmentWorkshopSummary,
  useGarments,
} from '../hooks/useGarmentWorkshop';
import { useProviders } from '@/modules/purchases/hooks/useProviders';
import { PurchaseProviderSelectorModal } from '@/modules/purchases/components/PurchaseProviderSelectorModal';
import { CreatePurchaseProviderModal } from '@/modules/purchases/components/CreatePurchaseProviderModal';
import type { Provider } from '@/modules/purchases/types/provider.type';
import { GarmentSelectorModal } from '../components/GarmentSelectorModal';
import { ImageAttachmentField, type AttachmentImage } from '@/components/ui/ImageAttachmentField';

export default function GarmentWorkshopLotsScreen() {
  const navigation = useNavigation<any>();
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'PENDIENTE' | 'EN_PROCESO' | 'LISTO_PARA_ENTREGAR' | 'ENTREGADO'
  >('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const lotsQuery = useGarmentLots(statusFilter === 'ALL' ? undefined : statusFilter);
  const summaryQuery = useGarmentWorkshopSummary();

  const lots = (lotsQuery.data || []) as any[];
  const summary = summaryQuery.data;

  return (
    <MainLayout>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Lotes de confección</Text>
            <Text style={styles.subtitle}>Panel operativo por lote, proveedor y avance real.</Text>
          </View>

          <Pressable style={styles.createBtn} onPress={() => setShowCreateModal(true)}>
            <Plus size={16} color="#041427" />
          </Pressable>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryBox label="Pendientes" value={summary?.lots?.pending || 0} />
          <SummaryBox label="En proceso" value={summary?.lots?.inProcess || 0} />
          <SummaryBox label="Listos" value={summary?.lots?.readyToDeliver || 0} />
          <SummaryBox label="Entregados" value={summary?.lots?.delivered || 0} />
        </View>

        <View style={styles.filterRow}>
          {[
            { value: 'ALL', label: 'Todos' },
            { value: 'PENDIENTE', label: 'Pendientes' },
            { value: 'EN_PROCESO', label: 'Proceso' },
            { value: 'LISTO_PARA_ENTREGAR', label: 'Listos' },
            { value: 'ENTREGADO', label: 'Entregados' },
          ].map((item) => {
            const active = statusFilter === item.value;
            return (
              <Pressable
                key={item.value}
                onPress={() => setStatusFilter(item.value as any)}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <FlatList
          data={lots}
          refreshing={lotsQuery.isFetching}
          onRefresh={lotsQuery.refetch}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Shirt size={20} color="#8EA4CC" />
              <Text style={styles.emptyTitle}>No hay lotes registrados</Text>
              <Text style={styles.emptySubtitle}>Crea el primer lote para iniciar la producción operativa.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.lotCard}
              onPress={() => navigation.navigate('GarmentWorkshopLotDetail', { lotId: item._id })}
            >
              <View style={styles.lotTopRow}>
                <Text style={styles.lotTitle}>{item.garmentName}</Text>
                <StatusBadge status={item.status} />
              </View>

              <Text style={styles.lotSubtitle}>{item.providerName}</Text>
              <Text style={styles.lotMeta}>
                Color: {item.color || 'N/A'} • Unidades: {item.totalUnits}
              </Text>
              <Text style={styles.lotMeta}>
                Recepción: {item.receivedDate ? String(item.receivedDate).slice(0, 10) : 'Sin fecha'}
              </Text>
              <Text style={styles.lotMeta}>Compromiso: {item.commitmentDate ? item.commitmentDate.slice(0, 10) : 'Sin fecha'}</Text>
              {item.externalReference ? <Text style={styles.lotMeta}>Ref: {item.externalReference}</Text> : null}

              <View style={styles.progressWrap}>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.max(3, Math.min(100, Number(item?.progress?.percent || 0)))}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{Number(item?.progress?.percent || 0).toFixed(1)}%</Text>
              </View>
              <Text style={styles.lotMeta}>
                Avance real: {Number(item?.progress?.totalCompleted || 0)} / {Number(item?.progress?.totalExpected || 0)}
              </Text>
            </Pressable>
          )}
        />

        <CreateLotModal visible={showCreateModal} onClose={() => setShowCreateModal(false)} />
      </View>
    </MainLayout>
  );
}

function CreateLotModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [providerSearch, setProviderSearch] = useState('');
  const providersQuery = useProviders(providerSearch);
  const garmentsQuery = useGarments();
  const createLot = useCreateGarmentLot();

  const [providerId, setProviderId] = useState('');
  const [providerLabel, setProviderLabel] = useState('');
  const [showProviderSelector, setShowProviderSelector] = useState(false);
  const [showCreateProvider, setShowCreateProvider] = useState(false);
  const [providerSeed, setProviderSeed] = useState('');

  const [garmentId, setGarmentId] = useState('');
  const [garmentLabel, setGarmentLabel] = useState('');
  const [showGarmentSelector, setShowGarmentSelector] = useState(false);

  const [lineColor, setLineColor] = useState('');
  const [lineS, setLineS] = useState('0');
  const [lineM, setLineM] = useState('0');
  const [lineL, setLineL] = useState('0');
  const [lineXL, setLineXL] = useState('0');
  const [editingColorLineIndex, setEditingColorLineIndex] = useState<number | null>(null);
  const [colorLines, setColorLines] = useState<
    Array<{
      color: string;
      sizeDistribution: Array<{ size: string; quantity: number }>;
      totalUnits: number;
    }>
  >([]);

  const [unitAgreedPriceCop, setUnitAgreedPriceCop] = useState('');
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().slice(0, 10));
  const [commitmentDate, setCommitmentDate] = useState('');
  const [showReceivedPicker, setShowReceivedPicker] = useState(false);
  const [showCommitmentPicker, setShowCommitmentPicker] = useState(false);
  const [externalReference, setExternalReference] = useState('');
  const [baseDocumentImages, setBaseDocumentImages] = useState<AttachmentImage[]>([]);
  const [technicalSheetImages, setTechnicalSheetImages] = useState<AttachmentImage[]>([]);
  const [observations, setObservations] = useState('');

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

  const total = useMemo(() => {
    return colorLines.reduce((sum, line) => sum + Number(line.totalUnits || 0), 0);
  }, [colorLines]);

  const currentLineTotal = useMemo(() => {
    return [lineS, lineM, lineL, lineXL].reduce(
      (sum, value) => sum + (Number(value || 0) || 0),
      0,
    );
  }, [lineS, lineM, lineL, lineXL]);

  function addOrUpdateColorLine() {
    if (!lineColor.trim() || currentLineTotal <= 0) {
      Toast.show({ type: 'error', text1: 'Completa color y cantidades por talla' });
      return;
    }

    const sizeDistribution = [
      { size: 'S', quantity: Number(lineS || 0) },
      { size: 'M', quantity: Number(lineM || 0) },
      { size: 'L', quantity: Number(lineL || 0) },
      { size: 'XL', quantity: Number(lineXL || 0) },
    ].filter((item) => item.quantity > 0);

    const nextLine = {
      color: lineColor.trim().toUpperCase(),
      sizeDistribution,
      totalUnits: sizeDistribution.reduce((sum, item) => sum + item.quantity, 0),
    };

    if (editingColorLineIndex !== null) {
      setColorLines((prev) =>
        prev.map((item, index) => (index === editingColorLineIndex ? nextLine : item)),
      );
    } else {
      setColorLines((prev) => [...prev, nextLine]);
    }

    setLineColor('');
    setLineS('0');
    setLineM('0');
    setLineL('0');
    setLineXL('0');
    setEditingColorLineIndex(null);
  }

  function editColorLine(index: number) {
    const line = colorLines[index];
    if (!line) return;

    const bySize = new Map((line.sizeDistribution || []).map((item) => [item.size, item.quantity]));
    setLineColor(line.color);
    setLineS(String(bySize.get('S') || 0));
    setLineM(String(bySize.get('M') || 0));
    setLineL(String(bySize.get('L') || 0));
    setLineXL(String(bySize.get('XL') || 0));
    setEditingColorLineIndex(index);
  }

  function removeColorLine(index: number) {
    setColorLines((prev) => prev.filter((_, current) => current !== index));
    if (editingColorLineIndex === index) {
      setEditingColorLineIndex(null);
    }
  }

  async function save() {
    if (!providerId || !garmentId || total <= 0) {
      Toast.show({ type: 'error', text1: 'Completa proveedor, prenda y cantidades por talla' });
      return;
    }

    const consolidatedBySize = new Map<string, number>();
    colorLines.forEach((line) => {
      line.sizeDistribution.forEach((size) => {
        consolidatedBySize.set(
          size.size,
          Number(consolidatedBySize.get(size.size) || 0) + Number(size.quantity || 0),
        );
      });
    });

    const sizeDistribution = Array.from(consolidatedBySize.entries()).map(([size, quantity]) => ({
      size,
      quantity,
    }));

    try {
      const [baseDocumentUploaded, technicalSheetUploaded] = await Promise.all([
        baseDocumentImages[0]?.uri
          ? uploadImageAsset(baseDocumentImages[0].uri, 'garment-lot-base-doc')
          : Promise.resolve(undefined),
        technicalSheetImages[0]?.uri
          ? uploadImageAsset(technicalSheetImages[0].uri, 'garment-lot-tech-sheet')
          : Promise.resolve(undefined),
      ]);

      await createLot.mutateAsync({
        providerId: providerId || undefined,
        garmentId,
        color: colorLines[0]?.color || undefined,
        colorLines: colorLines.map((line) => ({
          color: line.color,
          sizeDistribution: line.sizeDistribution,
        })),
        totalUnits: total,
        sizeDistribution,
        unitAgreedPriceCop: unitAgreedPriceCop.trim() ? Number(unitAgreedPriceCop) : undefined,
        receivedDate: receivedDate.trim() || undefined,
        commitmentDate: commitmentDate.trim() || undefined,
        externalReference: externalReference.trim() || undefined,
        baseDocumentEvidenceUrl: baseDocumentUploaded,
        technicalSheetEvidenceUrl: technicalSheetUploaded,
        observations: observations.trim() || undefined,
      });

      Toast.show({ type: 'success', text1: 'Lote creado' });
      onClose();
      setProviderId('');
      setProviderLabel('');
      setProviderSearch('');
      setGarmentId('');
      setGarmentLabel('');
      setLineColor('');
      setLineS('0');
      setLineM('0');
      setLineL('0');
      setLineXL('0');
      setColorLines([]);
      setEditingColorLineIndex(null);
      setUnitAgreedPriceCop('');
      setReceivedDate(new Date().toISOString().slice(0, 10));
      setCommitmentDate('');
      setExternalReference('');
      setBaseDocumentImages([]);
      setTechnicalSheetImages([]);
      setObservations('');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo crear el lote',
        text2: error?.response?.data?.message || undefined,
      });
    }
  }

  const providers = (providersQuery.data || []) as any[];
  const garments = (garmentsQuery.data || []) as any[];

  function selectProvider(provider: Provider) {
    const id = String(provider._id || provider.id || '');
    if (!id) return;
    setProviderId(id);
    setProviderLabel(provider.name);
    setShowProviderSelector(false);
  }

  function handleProviderCreated(provider: Provider) {
    const id = String(provider._id || provider.id || '');
    if (!id) return;
    setProviderId(id);
    setProviderLabel(provider.name);
    setShowCreateProvider(false);
    setShowProviderSelector(false);
  }

  function selectGarment(garment: any) {
    setGarmentId(garment._id);
    setGarmentLabel(garment.name);
    setShowGarmentSelector(false);
  }

  return (
    <>
      <OperationalModal
        visible={visible}
        onClose={onClose}
        title="Crear lote"
        contentContainerStyle={styles.modalContent}
        footer={
          <Pressable
            style={[styles.modalSaveBtn, createLot.isPending && { opacity: 0.6 }]}
            onPress={save}
            disabled={createLot.isPending}
          >
            <Text style={styles.modalSaveText}>{createLot.isPending ? 'Guardando...' : 'Guardar lote'}</Text>
          </Pressable>
        }
      >

          <Text style={styles.modalLabel}>Proveedor</Text>
          <Pressable style={styles.providerSelectorBtn} onPress={() => setShowProviderSelector(true)}>
            <Text style={styles.providerSelectorLabel}>
              {providerLabel || 'Seleccionar o crear proveedor'}
            </Text>
          </Pressable>

          <Text style={styles.modalLabel}>Prenda</Text>
          <Pressable style={styles.providerSelectorBtn} onPress={() => setShowGarmentSelector(true)}>
            <Text style={styles.providerSelectorLabel}>{garmentLabel || 'Seleccionar prenda'}</Text>
          </Pressable>

          <Text style={styles.modalLabel}>Líneas de color y tallas</Text>
          <View style={styles.builderCard}>
            <TextInput
              placeholder="Color"
              placeholderTextColor="#8EA4CC"
              value={lineColor}
              onChangeText={setLineColor}
              style={styles.input}
            />

            <View style={styles.sizesRow}>
              <SizeInput label="S" value={lineS} onChange={setLineS} />
              <SizeInput label="M" value={lineM} onChange={setLineM} />
              <SizeInput label="L" value={lineL} onChange={setLineL} />
              <SizeInput label="XL" value={lineXL} onChange={setLineXL} />
            </View>

            <Text style={styles.totalText}>Subtotal línea: {currentLineTotal}</Text>
            <Pressable style={styles.lineBtn} onPress={addOrUpdateColorLine}>
              <Text style={styles.lineBtnText}>
                {editingColorLineIndex !== null ? 'Actualizar línea' : 'Agregar línea de color'}
              </Text>
            </Pressable>
          </View>

          {(colorLines || []).map((line, index) => (
            <View key={`${line.color}-${index}`} style={styles.lineCard}>
              <View style={styles.rowLine}>
                <Text style={styles.lineTitle}>{line.color}</Text>
                <Text style={styles.lineTotal}>{line.totalUnits} und</Text>
              </View>
              <Text style={styles.lineMeta}>
                {(line.sizeDistribution || [])
                  .map((item) => `${item.size}:${item.quantity}`)
                  .join(' • ')}
              </Text>
              <View style={styles.lineActions}>
                <Pressable style={styles.lineActionBtn} onPress={() => editColorLine(index)}>
                  <Text style={styles.lineActionText}>Editar</Text>
                </Pressable>
                <Pressable style={styles.lineActionBtn} onPress={() => removeColorLine(index)}>
                  <Text style={styles.lineActionTextDanger}>Quitar</Text>
                </Pressable>
              </View>
            </View>
          ))}

          <Text style={styles.totalText}>Cantidad total: {total}</Text>

          <TextInput
            placeholder="Valor pactado por unidad"
            placeholderTextColor="#8EA4CC"
            value={unitAgreedPriceCop}
            onChangeText={setUnitAgreedPriceCop}
            keyboardType="numeric"
            style={styles.input}
          />

          <Pressable style={styles.providerSelectorBtn} onPress={() => setShowReceivedPicker(true)}>
            <Text style={styles.providerSelectorLabel}>Recepción: {receivedDate || 'Seleccionar fecha'}</Text>
          </Pressable>
          <Pressable style={styles.providerSelectorBtn} onPress={() => setShowCommitmentPicker(true)}>
            <Text style={styles.providerSelectorLabel}>Compromiso: {commitmentDate || 'Seleccionar fecha'}</Text>
          </Pressable>
          <TextInput
            placeholder="Referencia externa"
            placeholderTextColor="#8EA4CC"
            value={externalReference}
            onChangeText={setExternalReference}
            style={styles.input}
          />
          <Text style={styles.modalSectionLabel}>Evidencias del lote</Text>

          <ImageAttachmentField
            title="Remisión / documento base"
            helperText="Adjunta evidencia del documento base del lote."
            images={baseDocumentImages}
            onChange={setBaseDocumentImages}
            maxImages={1}
          />

          <ImageAttachmentField
            title="Ficha técnica"
            helperText="Adjunta imagen de la ficha técnica del lote."
            images={technicalSheetImages}
            onChange={setTechnicalSheetImages}
            maxImages={1}
          />

          <TextInput
            placeholder="Observaciones"
            placeholderTextColor="#8EA4CC"
            value={observations}
            onChangeText={setObservations}
            style={[styles.input, { height: 70 }]}
            multiline
          />

      </OperationalModal>

      <PurchaseProviderSelectorModal
        visible={showProviderSelector}
        searchValue={providerSearch}
        providers={providers as Provider[]}
        onSearchChange={setProviderSearch}
        onClose={() => setShowProviderSelector(false)}
        onSelect={selectProvider}
        onCreateRequest={(nameSeed) => {
          setProviderSeed(nameSeed);
          setShowCreateProvider(true);
        }}
      />

      <CreatePurchaseProviderModal
        visible={showCreateProvider}
        initialValue={providerSeed}
        onClose={() => setShowCreateProvider(false)}
        onCreated={handleProviderCreated}
      />

      <GarmentSelectorModal
        visible={showGarmentSelector}
        garments={garments as any[]}
        selectedGarmentId={garmentId || undefined}
        onClose={() => setShowGarmentSelector(false)}
        onSelect={selectGarment}
      />

      {showReceivedPicker && (
        <DateTimePicker
          mode="date"
          value={receivedDate ? new Date(receivedDate) : new Date()}
          onChange={(_, date) => {
            if (date) setReceivedDate(date.toISOString().slice(0, 10));
            setShowReceivedPicker(false);
          }}
        />
      )}

      {showCommitmentPicker && (
        <DateTimePicker
          mode="date"
          value={commitmentDate ? new Date(commitmentDate) : new Date()}
          onChange={(_, date) => {
            if (date) setCommitmentDate(date.toISOString().slice(0, 10));
            setShowCommitmentPicker(false);
          }}
        />
      )}
    </>
  );
}

function SizeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.sizeInputWrap}>
      <Text style={styles.sizeLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        style={styles.sizeInput}
      />
    </View>
  );
}

function SummaryBox({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryBox}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    PENDIENTE: { bg: '#2A2B32', fg: '#CBD5E1', label: 'Pendiente' },
    EN_PROCESO: { bg: '#3F2A12', fg: '#F9D48D', label: 'En proceso' },
    LISTO_PARA_ENTREGAR: { bg: '#15392D', fg: '#86EFAC', label: 'Listo' },
    ENTREGADO: { bg: '#0D2C4D', fg: '#93C5FD', label: 'Entregado' },
  };

  const ui = map[status] || map.PENDIENTE;

  return (
    <View style={[styles.statusBadge, { backgroundColor: ui.bg }]}> 
      <Text style={[styles.statusText, { color: ui.fg }]}>{ui.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.xl,
    fontWeight: theme.weight.bold,
  },
  subtitle: {
    marginTop: 2,
    color: '#8EA4CC',
    fontSize: 12,
  },
  createBtn: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryBox: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    padding: 10,
  },
  summaryLabel: {
    color: '#8EA4CC',
    fontSize: 11,
  },
  summaryValue: {
    marginTop: 3,
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.lg,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 10,
    marginBottom: 10,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  filterChipActive: {
    borderColor: '#2E6BFF',
    backgroundColor: '#0D224A',
  },
  filterChipText: {
    color: '#8EA4CC',
    fontSize: 11,
  },
  filterChipTextActive: {
    color: '#EAF1FF',
  },
  listContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  lotCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    padding: 12,
    marginBottom: 8,
  },
  lotTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  lotTitle: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
    flex: 1,
    marginRight: 8,
  },
  lotSubtitle: {
    color: '#BFD0EE',
    marginTop: 3,
    fontSize: 12,
  },
  lotMeta: {
    marginTop: 2,
    color: '#8EA4CC',
    fontSize: 11,
  },
  progressWrap: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    width: 42,
    textAlign: 'right',
    color: '#DCE8FF',
    fontSize: 11,
  },
  emptyCard: {
    marginTop: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
  },
  emptySubtitle: {
    color: '#8EA4CC',
    fontSize: 12,
    textAlign: 'center',
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: theme.weight.semibold,
  },
  modalContent: {
    gap: 8,
  },
  modalLabel: {
    marginTop: 3,
    color: '#8EA4CC',
    fontSize: 11,
  },
  modalSectionLabel: {
    marginTop: 8,
    color: '#DCE8FF',
    fontSize: 12,
    fontWeight: theme.weight.semibold,
  },
  optionsRowWrap: {
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
  optionChipText: {
    color: '#8EA4CC',
    fontSize: 11,
  },
  optionChipTextActive: {
    color: '#EAF1FF',
  },
  input: {
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    color: '#EAF1FF',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  builderCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    padding: 10,
    gap: 8,
  },
  lineBtn: {
    minHeight: 38,
    borderRadius: 10,
    backgroundColor: '#1A3F7A',
    borderWidth: 1,
    borderColor: '#3569CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineBtnText: {
    color: '#DDE8FF',
    fontSize: 12,
    fontWeight: theme.weight.bold,
  },
  lineCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    padding: 10,
    gap: 6,
  },
  lineTitle: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: 12,
  },
  lineTotal: {
    color: '#9FC0FF',
    fontSize: 12,
    fontWeight: theme.weight.semibold,
  },
  lineMeta: {
    color: '#8EA4CC',
    fontSize: 11,
  },
  lineActions: {
    flexDirection: 'row',
    gap: 8,
  },
  lineActionBtn: {
    minHeight: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A4E7D',
    backgroundColor: '#122C4F',
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineActionText: {
    color: '#9FC0FF',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  lineActionTextDanger: {
    color: '#FCA5A5',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  providerSelectorBtn: {
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#315A92',
    backgroundColor: '#10284D',
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  providerSelectorLabel: {
    color: '#DCE8FF',
    fontSize: 12,
    fontWeight: theme.weight.semibold,
  },
  sizesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  sizeInputWrap: {
    flex: 1,
  },
  sizeLabel: {
    marginBottom: 3,
    color: '#8EA4CC',
    fontSize: 10,
    textAlign: 'center',
  },
  sizeInput: {
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    color: '#EAF1FF',
    textAlign: 'center',
  },
  totalText: {
    color: '#DCE8FF',
    fontWeight: theme.weight.semibold,
    textAlign: 'right',
  },
  modalSaveBtn: {
    marginTop: 4,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveText: {
    color: '#041427',
    fontWeight: theme.weight.bold,
  },
});
