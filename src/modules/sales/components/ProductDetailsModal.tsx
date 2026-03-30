import React, { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ArrowLeft, CalendarClock, Camera, ChevronRight, ImagePlus, Package } from 'lucide-react-native';

import { Input } from '@/components/ui/Input';
import ImageViewerModal from '@/components/ui/ImageViewerModal';
import { useImagePicker } from '@/hooks/useImagePicker';
import { theme } from '@/theme';
import type { SaleDetails } from '../types/sale.type';
import { salePriorityConfig } from '../utils/saleStatus';
import { ProductSelectorModal } from './ProductSelectorModal';

type Props = {
  visible: boolean;
  initialValue: SaleDetails;
  onClose: () => void;
  onSave: (
    value: Pick<
      SaleDetails,
      'productId' | 'productName' | 'productDetails' | 'dimensions' | 'deliveryDate' | 'observations' | 'priority' | 'productImageUrl'
    >,
  ) => void;
};

export function ProductDetailsModal({ visible, initialValue, onClose, onSave }: Props) {
  const { takePhoto, pickFromGallery } = useImagePicker();
  const requiresSchedule = initialValue.flowType !== 'IMMEDIATE';

  const [productName, setProductName] = useState('');
  const [productId, setProductId] = useState<string | undefined>(undefined);
  const [productDetails, setProductDetails] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [observations, setObservations] = useState('');
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [showDeliveryPicker, setShowDeliveryPicker] = useState(false);
  const [showSelectorModal, setShowSelectorModal] = useState(false);
  const [productImageUrl, setProductImageUrl] = useState<string | undefined>(undefined);
  const [viewerImageUrl, setViewerImageUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!visible) return;

    setProductName(initialValue.productName || '');
    setProductId(initialValue.productId || undefined);
    setProductDetails(initialValue.productDetails || '');
    setDimensions(initialValue.dimensions || '');
    setObservations(initialValue.observations || '');
    setPriority(initialValue.priority || 'NORMAL');
    setProductImageUrl(initialValue.productImageUrl);

    if (initialValue.deliveryDate) {
      const parsed = new Date(initialValue.deliveryDate);
      if (!Number.isNaN(parsed.getTime())) {
        setDeliveryDate(parsed);
      }
    } else {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setDeliveryDate(nextWeek);
    }

    setShowDeliveryPicker(false);
    setViewerImageUrl(undefined);
  }, [visible, initialValue]);

  function normalizeImage(img: any) {
    if (!img?.uri) return undefined;
    return img.uri;
  }

  async function handleTakePhoto() {
    const img = await takePhoto();
    const uri = normalizeImage(img);
    if (uri) setProductImageUrl(uri);
  }

  async function handlePickGallery() {
    const img = await pickFromGallery();
    const uri = normalizeImage(img);
    if (uri) setProductImageUrl(uri);
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={8}>
              <ArrowLeft size={20} color={theme.colors.textPrimary} />
            </Pressable>
            <Text style={styles.headerTitle}>Datos del producto</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Producto vendido</Text>
              <Pressable style={styles.productSelectBtn} onPress={() => setShowSelectorModal(true)}>
                <View style={styles.productSelectLeft}>
                  <Package size={16} color={theme.colors.accent} />
                  <Text style={styles.productSelectText}>{productName || 'Seleccionar producto'}</Text>
                </View>
                <ChevronRight size={18} color="#8EA4CC" />
              </Pressable>

              <Text style={styles.catalogHint}>
                Usa el catalogo para normalizar nombres y evitar duplicados.
              </Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Detalles del producto</Text>
              <Input
                value={productDetails}
                onChangeText={setProductDetails}
                placeholder="Material, color, cantidad..."
                multiline
                numberOfLines={3}
                style={styles.textarea}
              />
            </View>

            {requiresSchedule && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Fecha de entrega</Text>
                <Pressable
                  style={styles.dateButton}
                  onPress={() => setShowDeliveryPicker((prev) => !prev)}
                >
                  <CalendarClock size={16} color={theme.colors.accent} />
                  <Text style={styles.dateButtonText}>
                    {deliveryDate.toLocaleDateString('es-CO', {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </Pressable>

                {showDeliveryPicker && (
                  <DateTimePicker
                    mode="date"
                    value={deliveryDate}
                    minimumDate={new Date()}
                    onChange={(_, value) => {
                      if (value) setDeliveryDate(value);
                      setShowDeliveryPicker(false);
                    }}
                  />
                )}
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Dimensiones</Text>
              <Input
                value={dimensions}
                onChangeText={setDimensions}
                placeholder="Ej: 220cm x 75cm x 60cm"
              />
            </View>

            {requiresSchedule && (
              <>
                <Text style={styles.sectionTitle}>PRIORIDAD</Text>
                <View style={styles.priorityRow}>
                  {(['NORMAL', 'HIGH', 'URGENT'] as const).map((item) => {
                    const cfg = salePriorityConfig[item];
                    const active = priority === item;

                    return (
                      <Pressable
                        key={item}
                        onPress={() => setPriority(item)}
                        style={[
                          styles.priorityChip,
                          active && { borderColor: cfg.color, backgroundColor: cfg.bg },
                        ]}
                      >
                        <Text style={[styles.priorityChipText, active && { color: cfg.color }]}>{cfg.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}

            {!requiresSchedule && (
              <>
                <Text style={styles.sectionTitle}>FOTO DEL PRODUCTO (OPCIONAL)</Text>
                <View style={styles.productImageCard}>
                  {productImageUrl ? (
                    <Pressable style={styles.productImagePress} onPress={() => setViewerImageUrl(productImageUrl)}>
                      <Image source={{ uri: productImageUrl }} style={styles.productImagePreview} />
                    </Pressable>
                  ) : (
                    <Text style={styles.productImageHint}>Sin foto del producto</Text>
                  )}
                </View>

                <View style={styles.imageActionsRow}>
                  <Pressable style={styles.imageActionBtn} onPress={handleTakePhoto}>
                    <Camera size={16} color="#2E6BFF" />
                    <Text style={styles.imageActionText}>Camara</Text>
                  </Pressable>
                  <Pressable style={styles.imageActionBtn} onPress={handlePickGallery}>
                    <ImagePlus size={16} color="#2E6BFF" />
                    <Text style={styles.imageActionText}>Galeria</Text>
                  </Pressable>
                </View>
              </>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Observaciones</Text>
              <Input
                value={observations}
                onChangeText={setObservations}
                placeholder="Notas adicionales de fabricacion o entrega"
                multiline
                numberOfLines={4}
                style={styles.textarea}
              />
            </View>

            <Pressable
              style={styles.saveButton}
              onPress={() => {
                onSave({
                  productId,
                  productName: productName.trim() || undefined,
                  productDetails: productDetails.trim() || undefined,
                  dimensions: dimensions.trim() || undefined,
                  deliveryDate: requiresSchedule ? deliveryDate.toISOString() : undefined,
                  observations: observations.trim() || undefined,
                  priority: requiresSchedule ? priority : 'NORMAL',
                  productImageUrl: requiresSchedule ? undefined : productImageUrl,
                });
              }}
            >
              <Text style={styles.saveButtonText}>Guardar producto</Text>
            </Pressable>
          </ScrollView>

          <ProductSelectorModal
            visible={showSelectorModal}
            selectedProductId={productId}
            onClose={() => setShowSelectorModal(false)}
            onSelect={(product) => {
              setProductId(product._id);
              setProductName(product.name);
            }}
          />

          <ImageViewerModal
            visible={!!viewerImageUrl}
            imageUrl={viewerImageUrl}
            onClose={() => setViewerImageUrl(undefined)}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#08142D',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: '#1F3765',
    maxHeight: '92%',
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
    paddingBottom: 24,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    color: '#B3C3E2',
    marginBottom: 6,
    fontSize: theme.font.sm,
    fontWeight: theme.weight.medium,
  },
  sectionTitle: {
    color: '#8EA4CC',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
    letterSpacing: 0.8,
    marginTop: 6,
    marginBottom: 10,
  },
  productSelectBtn: {
    height: 46,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productSelectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  productSelectText: {
    color: '#D6E4FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
  },
  catalogHint: {
    marginTop: 6,
    color: '#7E94BE',
    fontSize: theme.font.xs,
  },
  textarea: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  dateButton: {
    height: 46,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateButtonText: {
    color: '#D6E4FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
    textTransform: 'capitalize',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  priorityChip: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    paddingVertical: 8,
    alignItems: 'center',
  },
  priorityChipText: {
    color: '#9FB0CF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  productImageCard: {
    height: 160,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  productImagePreview: {
    width: '100%',
    height: '100%',
  },
  productImagePress: {
    width: '100%',
    height: '100%',
  },
  productImageHint: {
    color: '#8EA4CC',
    fontSize: theme.font.sm,
  },
  imageActionsRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  imageActionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  imageActionText: {
    color: '#2E6BFF',
    fontWeight: theme.weight.semibold,
    fontSize: theme.font.xs,
  },
  saveButton: {
    marginTop: 10,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2E6BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#F0F6FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
  },
});
