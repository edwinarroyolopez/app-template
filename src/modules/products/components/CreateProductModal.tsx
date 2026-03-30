import React, { useState } from 'react';
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
import Toast from 'react-native-toast-message';
import { ArrowLeft, Camera, ImagePlus } from 'lucide-react-native';

import { ActionLoader } from '@/components/ui/ActionLoader';
import { Input } from '@/components/ui/Input';
import { theme } from '@/theme';
import { useCreateProduct } from '../hooks/useCreateProduct';
import { useImagePicker } from '@/hooks/useImagePicker';
import { formatMoneyInput, parseMoneyInput } from '@/utils/money';
import { useProductCategories } from '../hooks/useProductCategories';
import type { ProductCategory } from '../types/product-category.type';
import { ProductCategorySelectorModal } from './ProductCategorySelectorModal';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function CreateProductModal({ visible, onClose }: Props) {
  const createProduct = useCreateProduct();
  const { takePhoto, pickFromGallery } = useImagePicker();

  const [name, setName] = useState('');
  const [image, setImage] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [purchasePrice, setPurchasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState('');
  const [minStock, setMinStock] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | undefined>(undefined);
  const [variant, setVariant] = useState('');
  const [location, setLocation] = useState('');

  const categoryQuery = categorySearch.trim().length >= 2 ? categorySearch.trim() : undefined;
  const { data: categories = [] } = useProductCategories(categoryQuery);

  const skuPreview = buildSkuPreview(selectedCategory?.code, name, variant);

  function normalizeImage(img: any) {
    if (!img?.uri) return null;
    return {
      uri: img.uri,
      name: img.fileName || 'product-image.jpg',
      type: img.type || 'image/jpeg',
    };
  }

  async function handleTakePhoto() {
    const img = await takePhoto();
    const normalized = normalizeImage(img);
    if (normalized) setImage(normalized);
  }

  async function handlePickGallery() {
    const img = await pickFromGallery();
    const normalized = normalizeImage(img);
    if (normalized) setImage(normalized);
  }

  async function handleSave() {
    if (!name.trim() || createProduct.isPending) {
      Toast.show({ type: 'error', text1: 'El nombre es obligatorio' });
      return;
    }

    if (!selectedCategory?._id) {
      Toast.show({ type: 'error', text1: 'Selecciona una categoria' });
      return;
    }

    try {
      await createProduct.mutateAsync({
        name: name.trim(),
        image: image?.uri,
        categoryId: selectedCategory?._id,
        variant: variant.trim() || undefined,
        location: location.trim() || undefined,
        purchasePrice: parseMoneyInput(purchasePrice),
        salePrice: parseMoneyInput(salePrice),
        stock: parseMoneyInput(stock),
        minStock: parseMoneyInput(minStock),
      });

      Toast.show({ type: 'success', text1: 'Producto creado' });
      setName('');
      setImage(null);
      setPurchasePrice('');
      setSalePrice('');
      setStock('');
      setMinStock('');
      setVariant('');
      setLocation('');
      setCategorySearch('');
      setSelectedCategory(undefined);
      onClose();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo crear',
        text2: error?.response?.data?.message || undefined,
      });
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={8}>
              <ArrowLeft size={20} color={theme.colors.textPrimary} />
            </Pressable>
            <Text style={styles.headerTitle}>Nuevo producto</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.fieldLabel}>Nombre del producto</Text>
            <Input value={name} onChangeText={setName} placeholder="Ej: Sony WH-1000XM4" />

            <Text style={styles.fieldLabel}>Imagen del producto (opcional)</Text>
            <View style={styles.evidenceCard}>
              {image ? (
                <Image source={{ uri: image.uri }} style={styles.evidencePreview} />
              ) : (
                <>
                  <Camera size={34} color="#8EA4CC" />
                  <Text style={styles.evidenceText}>Subir foto del producto</Text>
                </>
              )}
            </View>

            <View style={styles.evidenceActions}>
              <Pressable style={styles.evidenceActionBtn} onPress={handleTakePhoto}>
                <Camera size={16} color="#2E6BFF" />
                <Text style={styles.evidenceActionText}>Camara</Text>
              </Pressable>
              <Pressable style={styles.evidenceActionBtn} onPress={handlePickGallery}>
                <ImagePlus size={16} color="#2E6BFF" />
                <Text style={styles.evidenceActionText}>Galeria</Text>
              </Pressable>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Categoria</Text>
                <Pressable style={styles.selectorBtn} onPress={() => setShowCategoryModal(true)}>
                  <Text style={styles.selectorText}>{selectedCategory?.name || 'Seleccionar categoria'}</Text>
                </Pressable>
              </View>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Variante</Text>
                <Input value={variant} onChangeText={setVariant} placeholder="Ej: 500ml" />
              </View>
            </View>

            <Text style={styles.skuPreview}>SKU estimado: {skuPreview || 'Selecciona categoria y nombre'}</Text>

            <Text style={styles.fieldLabel}>Ubicacion</Text>
            <Input value={location} onChangeText={setLocation} placeholder="Ej: Estante A-2" />

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Precio compra</Text>
                <Input
                  value={purchasePrice}
                  onChangeText={(value) => setPurchasePrice(formatMoneyInput(value))}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Precio venta</Text>
                <Input
                  value={salePrice}
                  onChangeText={(value) => setSalePrice(formatMoneyInput(value))}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Stock inicial</Text>
                <Input value={stock} onChangeText={setStock} keyboardType="numeric" placeholder="0" />
              </View>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Stock minimo</Text>
                <Input value={minStock} onChangeText={setMinStock} keyboardType="numeric" placeholder="0" />
              </View>
            </View>

            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Guardar producto</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <ProductCategorySelectorModal
        visible={showCategoryModal}
        searchValue={categorySearch}
        categories={categories as ProductCategory[]}
        selectedCategoryId={selectedCategory?._id}
        onClose={() => setShowCategoryModal(false)}
        onSearchChange={setCategorySearch}
        onSelect={setSelectedCategory}
      />

      <ActionLoader
        visible={createProduct.isPending}
        steps={[
          'Validando producto...',
          'Generando SKU...',
          'Guardando producto...',
          'Finalizando creacion...',
        ]}
      />
    </Modal>
  );
}

function buildSkuPreview(categoryCode?: string, productName?: string, variant?: string) {
  const normalize = (value?: string) =>
    (value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');

  const categorySegment = normalize(categoryCode).slice(0, 3);

  const words = (productName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => normalize(word));

  const productSegment = `${words[0]?.slice(0, 2) || ''}${words[1]?.slice(0, 1) || ''}`;
  const variantSegment = normalize(variant);

  if (!categorySegment || !productSegment) {
    return '';
  }

  return `${categorySegment}${productSegment}${variantSegment}`;
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
    maxHeight: '85%',
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
    paddingBottom: 30,
  },
  fieldLabel: {
    color: '#B3C3E2',
    marginBottom: 6,
    marginTop: 10,
    fontSize: theme.font.sm,
    fontWeight: theme.weight.medium,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  col: {
    flex: 1,
  },
  selectorBtn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  selectorText: {
    color: '#DCE8FF',
    fontSize: theme.font.sm,
  },
  skuPreview: {
    marginTop: 8,
    color: '#8EA4CC',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.medium,
  },
  saveButton: {
    marginTop: 18,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2E6BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#F0F6FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
  },
  evidenceCard: {
    marginTop: 4,
    height: 170,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#29497A',
    backgroundColor: '#081632',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    gap: 8,
  },
  evidencePreview: {
    width: '100%',
    height: '100%',
  },
  evidenceText: {
    color: '#8EA4CC',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
  },
  evidenceActions: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
  },
  evidenceActionBtn: {
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
  evidenceActionText: {
    color: '#2E6BFF',
    fontWeight: theme.weight.semibold,
    fontSize: theme.font.xs,
  },
});
