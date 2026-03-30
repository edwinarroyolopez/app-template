import React, { useState } from 'react';
import { Alert, FlatList, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Pencil, Plus, Scissors, Trash2, X } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { theme } from '@/theme';
import { api } from '@/services/api';
import { ImageAttachmentField, type AttachmentImage } from '@/components/ui/ImageAttachmentField';
import ImageViewerModal from '@/components/ui/ImageViewerModal';
import {
  useCreateGarment,
  useDeleteGarment,
  useGarmentOperations,
  useGarments,
  useUpdateGarment,
} from '../hooks/useGarmentWorkshop';

function money(value: number) {
  return `$${Number(value || 0).toLocaleString('es-CO')}`;
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

async function resolveGarmentImageUrls(images: AttachmentImage[]) {
  const result: string[] = [];
  for (const image of images.slice(0, 3)) {
    const uri = String(image?.uri || '').trim();
    if (!uri) continue;
    if (/^https?:\/\//i.test(uri)) {
      result.push(uri);
      continue;
    }
    const uploaded = await uploadImageAsset(uri, 'garment-reference');
    if (uploaded) result.push(uploaded);
  }
  return Array.from(new Set(result)).slice(0, 3);
}

export default function GarmentWorkshopGarmentsScreen() {
  const garmentsQuery = useGarments();
  const deleteGarment = useDeleteGarment();
  const [showModal, setShowModal] = useState(false);
  const [editingGarment, setEditingGarment] = useState<any | null>(null);
  const [viewerImageUrl, setViewerImageUrl] = useState<string | undefined>(undefined);
  const garments = (garmentsQuery.data || []) as any[];

  function removeGarment(garment: any) {
    Alert.alert(
      'Eliminar prenda',
      `¿Seguro que quieres eliminar "${garment.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGarment.mutateAsync(garment._id);
              Toast.show({ type: 'success', text1: 'Prenda eliminada' });
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'No se pudo eliminar',
                text2: error?.response?.data?.message || undefined,
              });
            }
          },
        },
      ],
    );
  }

  return (
    <MainLayout>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Catálogo de prendas</Text>
            <Text style={styles.subtitle}>Cada prenda define operaciones requeridas para sus lotes.</Text>
          </View>

          <Pressable style={styles.addBtn} onPress={() => setShowModal(true)}>
            <Plus size={16} color="#041427" />
          </Pressable>
        </View>

        <FlatList
          data={garments}
          keyExtractor={(item) => item._id}
          refreshing={garmentsQuery.isFetching}
          onRefresh={garmentsQuery.refetch}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Scissors size={20} color="#8EA4CC" />
              <Text style={styles.emptyTitle}>No hay prendas</Text>
              <Text style={styles.emptySubtitle}>Crea prendas con operaciones para habilitar lotes.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              {(() => {
                const unitCost = (item.operations || []).reduce(
                  (sum: number, op: any) => sum + Number(op.unitPriceCop || 0),
                  0,
                );

                return (
                  <Text style={styles.unitCostTag}>Costo unitario: {money(unitCost)}</Text>
                );
              })()}
              <View style={styles.rowLine}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <View style={styles.actionsWrap}>
                  <Pressable style={styles.iconBtn} onPress={() => setEditingGarment(item)}>
                    <Pencil size={13} color="#A5B8DC" />
                  </Pressable>
                  <Pressable style={styles.iconBtn} onPress={() => removeGarment(item)}>
                    <Trash2 size={13} color="#FCA5A5" />
                  </Pressable>
                </View>
              </View>
              <Text style={styles.meta}>Color base: {item.defaultColor || 'No definido'}</Text>
              <Text style={styles.meta}>Operaciones: {(item.operations || []).length}</Text>

              {(item.imageUrls || []).length > 0 ? (
                <View style={styles.thumbRow}>
                  {(item.imageUrls || []).slice(0, 3).map((imageUrl: string, index: number) => (
                    <Pressable key={`${item._id}-img-${index}`} onPress={() => setViewerImageUrl(imageUrl)}>
                      <Image source={{ uri: imageUrl }} style={styles.thumbImage} />
                    </Pressable>
                  ))}
                </View>
              ) : null}

              <View style={styles.opsWrap}>
                {(item.operations || []).map((operation: any) => (
                  <View key={`${item._id}-${operation.operationId}`} style={styles.opChip}>
                    <Text style={styles.opChipText}>
                      {operation.name}
                      {operation.machineName ? ` (${operation.machineName})` : ''} · {money(operation.unitPriceCop)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        />

        <CreateGarmentModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          onPreviewImage={(url) => setViewerImageUrl(url)}
        />
        <EditGarmentModal
          visible={!!editingGarment}
          garment={editingGarment}
          onClose={() => setEditingGarment(null)}
          onPreviewImage={(url) => setViewerImageUrl(url)}
        />
        <ImageViewerModal
          visible={!!viewerImageUrl}
          imageUrl={viewerImageUrl}
          onClose={() => setViewerImageUrl(undefined)}
        />
      </View>
    </MainLayout>
  );
}

function EditGarmentModal({
  visible,
  garment,
  onClose,
  onPreviewImage,
}: {
  visible: boolean;
  garment: any | null;
  onClose: () => void;
  onPreviewImage: (url: string) => void;
}) {
  const operationsQuery = useGarmentOperations();
  const updateGarment = useUpdateGarment();
  const [name, setName] = useState('');
  const [defaultColor, setDefaultColor] = useState('');
  const [selectedOperationIds, setSelectedOperationIds] = useState<string[]>([]);
  const [garmentImages, setGarmentImages] = useState<AttachmentImage[]>([]);

  React.useEffect(() => {
    if (!garment) return;
    setName(garment.name || '');
    setDefaultColor(garment.defaultColor || '');
    setSelectedOperationIds((garment.operations || []).map((op: any) => String(op.operationId)));
    setGarmentImages(
      Array.isArray(garment.imageUrls)
        ? garment.imageUrls.map((uri: string) => ({ uri }))
        : [],
    );
  }, [garment]);

  function toggleOperation(operationId: string) {
    setSelectedOperationIds((prev) =>
      prev.includes(operationId)
        ? prev.filter((item) => item !== operationId)
        : [...prev, operationId],
    );
  }

  async function save() {
    if (!garment || !name.trim() || selectedOperationIds.length === 0) {
      Toast.show({ type: 'error', text1: 'Completa nombre y al menos una operación' });
      return;
    }

    try {
      const imageUrls = await resolveGarmentImageUrls(garmentImages);
      await updateGarment.mutateAsync({
        garmentId: garment._id,
        name: name.trim(),
        defaultColor: defaultColor.trim() || undefined,
        operationIds: selectedOperationIds,
        imageUrls,
      });
      Toast.show({ type: 'success', text1: 'Prenda actualizada' });
      onClose();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo actualizar',
        text2: error?.response?.data?.message || undefined,
      });
    }
  }

  const operations = (operationsQuery.data || []) as any[];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Editar prenda</Text>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <X size={16} color="#8EA4CC" />
            </Pressable>
          </View>

          <TextInput
            placeholder="Nombre de la prenda"
            placeholderTextColor="#8EA4CC"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            placeholder="Color base (opcional)"
            placeholderTextColor="#8EA4CC"
            value={defaultColor}
            onChangeText={setDefaultColor}
            style={styles.input}
          />

          <Text style={styles.modalLabel}>Operaciones requeridas</Text>
          <View style={styles.optionsWrap}>
            {operations.map((operation) => {
              const active = selectedOperationIds.includes(operation._id);
              return (
                <Pressable
                  key={operation._id}
                  style={[styles.optionChip, active && styles.optionChipActive]}
                  onPress={() => toggleOperation(operation._id)}
                >
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>
                    {operation.name} · {money(operation.unitPriceCop)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <ImageAttachmentField
            title="Imagenes de referencia"
            helperText="Adjunta hasta 3 imagenes de la prenda para identificarla rapido."
            images={garmentImages}
            onChange={setGarmentImages}
            maxImages={3}
            loading={updateGarment.isPending}
          />
          {(garmentImages || []).length > 0 ? (
            <Pressable
              style={styles.previewLinkBtn}
              onPress={() => onPreviewImage(String(garmentImages[0]?.uri || ''))}
            >
              <Text style={styles.previewLinkText}>Ver primera imagen</Text>
            </Pressable>
          ) : null}

          <Pressable style={styles.saveBtn} onPress={save} disabled={updateGarment.isPending}>
            <Text style={styles.saveText}>{updateGarment.isPending ? 'Guardando...' : 'Guardar cambios'}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function CreateGarmentModal({
  visible,
  onClose,
  onPreviewImage,
}: {
  visible: boolean;
  onClose: () => void;
  onPreviewImage: (url: string) => void;
}) {
  const operationsQuery = useGarmentOperations();
  const createGarment = useCreateGarment();

  const [name, setName] = useState('');
  const [defaultColor, setDefaultColor] = useState('');
  const [selectedOperationIds, setSelectedOperationIds] = useState<string[]>([]);
  const [garmentImages, setGarmentImages] = useState<AttachmentImage[]>([]);

  const operations = (operationsQuery.data || []) as any[];

  function toggleOperation(operationId: string) {
    setSelectedOperationIds((prev) =>
      prev.includes(operationId)
        ? prev.filter((item) => item !== operationId)
        : [...prev, operationId],
    );
  }

  async function save() {
    if (!name.trim() || selectedOperationIds.length === 0) {
      Toast.show({ type: 'error', text1: 'Completa nombre y al menos una operación' });
      return;
    }

    try {
      const imageUrls = await resolveGarmentImageUrls(garmentImages);
      await createGarment.mutateAsync({
        name: name.trim(),
        defaultColor: defaultColor.trim() || undefined,
        operationIds: selectedOperationIds,
        imageUrls,
      });
      Toast.show({ type: 'success', text1: 'Prenda creada' });
      setName('');
      setDefaultColor('');
      setSelectedOperationIds([]);
      setGarmentImages([]);
      onClose();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo crear la prenda',
        text2: error?.response?.data?.message || undefined,
      });
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nueva prenda</Text>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <X size={16} color="#8EA4CC" />
            </Pressable>
          </View>

          <TextInput
            placeholder="Nombre de la prenda"
            placeholderTextColor="#8EA4CC"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            placeholder="Color base (opcional)"
            placeholderTextColor="#8EA4CC"
            value={defaultColor}
            onChangeText={setDefaultColor}
            style={styles.input}
          />

          <Text style={styles.modalLabel}>Operaciones requeridas</Text>
          <View style={styles.optionsWrap}>
            {operations.map((operation) => {
              const active = selectedOperationIds.includes(operation._id);
              return (
                <Pressable
                  key={operation._id}
                  style={[styles.optionChip, active && styles.optionChipActive]}
                  onPress={() => toggleOperation(operation._id)}
                >
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>
                    {operation.name} · {money(operation.unitPriceCop)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <ImageAttachmentField
            title="Imagenes de referencia"
            helperText="Puedes adjuntar de 1 a 3 imagenes para reconocer la prenda en catalogo y lotes."
            images={garmentImages}
            onChange={setGarmentImages}
            maxImages={3}
            loading={createGarment.isPending}
          />
          {(garmentImages || []).length > 0 ? (
            <Pressable
              style={styles.previewLinkBtn}
              onPress={() => onPreviewImage(String(garmentImages[0]?.uri || ''))}
            >
              <Text style={styles.previewLinkText}>Ver primera imagen</Text>
            </Pressable>
          ) : null}

          <Pressable style={styles.saveBtn} onPress={save} disabled={createGarment.isPending}>
            <Text style={styles.saveText}>{createGarment.isPending ? 'Guardando...' : 'Guardar prenda'}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
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
    color: '#EAF1FF',
    fontSize: theme.font.xl,
    fontWeight: theme.weight.bold,
  },
  subtitle: {
    marginTop: 2,
    color: '#8EA4CC',
    fontSize: 12,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    padding: 12,
    marginBottom: 8,
    gap: 4,
  },
  cardTitle: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
  },
  rowLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionsWrap: {
    flexDirection: 'row',
    gap: 6,
  },
  iconBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitCostTag: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1F6C4D',
    backgroundColor: '#103226',
    color: '#86EFAC',
    fontSize: 10,
    fontWeight: theme.weight.semibold,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  meta: {
    color: '#8EA4CC',
    fontSize: 11,
  },
  thumbRow: {
    marginTop: 4,
    flexDirection: 'row',
    gap: 8,
  },
  thumbImage: {
    width: 42,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F3765',
  },
  opsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 3,
  },
  opChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2A3F67',
    backgroundColor: '#10284D',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  opChipText: {
    color: '#BFD0EE',
    fontSize: 10,
  },
  emptyCard: {
    marginTop: 60,
    borderRadius: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#08142D',
    padding: 12,
    gap: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F3765',
    alignItems: 'center',
    justifyContent: 'center',
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
  previewLinkBtn: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  previewLinkText: {
    color: '#9FC0FF',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  saveBtn: {
    marginTop: 2,
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
