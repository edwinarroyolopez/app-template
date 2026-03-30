import React, { useMemo } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Package } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import type { AppStackParamList } from '@/navigation/AppNavigator';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { theme } from '@/theme';
import { inventoryApi } from '@/modules/inventory/services/inventory.api';
import { useProductCategories } from '../hooks/useProductCategories';
import { useProductDetail } from '../hooks/useProductDetail';
import { ProductStockHealthBadge } from '../components/ProductStockHealthBadge';
import { ProductTimelineEventCard, type ProductTimelineEvent } from '../components/ProductTimelineEventCard';
import { getStockStatus } from '../utils/stockStatus';

type Params = RouteProp<AppStackParamList, 'ProductDetail'>;

function money(value?: number) {
  return `$${Number(value || 0).toLocaleString('es-CO')}`;
}

function resolveProductIdRef(value: any): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value._id || value.id;
  return undefined;
}

function resolveUserLabel(event: any): string | undefined {
  const raw = event?.createdByName || event?.createdByUserId;
  if (!raw) return undefined;
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object') {
    const fullName = `${raw.name || ''} ${raw.lastName || ''}`.trim();
    return fullName || raw.email || raw._id;
  }
  return undefined;
}

function resolveEventTitle(type?: string) {
  if (type === 'PURCHASE_EVENT') return 'COMPRA DEL PRODUCTO';
  if (type === 'SALE_EVENT') return 'VENTA DEL PRODUCTO';
  if (type === 'PRICE_UPDATE_EVENT') return 'PRECIO DE VENTA ACTUALIZADO';
  if (type === 'LIQUIDATION_INVENTORY_EVENT') return 'INVENTARIO DE LIQUIDACION';
  if (type === 'FLASH_INVENTORY_EVENT') return 'INVENTARIO FLASH';
  return 'MOVIMIENTO DE INVENTARIO';
}

function toTimelineEvent(event: any, index: number): ProductTimelineEvent {
  const previousStock = Number(event?.previousStock ?? 0);
  const newStock = Number(event?.newStock ?? 0);
  const quantityRaw = Number(event?.quantityAffected ?? newStock - previousStock);
  const quantity = Number.isNaN(quantityRaw) ? 0 : quantityRaw;
  const reason = typeof event?.reason === 'string' ? event.reason.trim() : '';

  return {
    id: String(event?._id || `${event?.createdAt || Date.now()}-${index}`),
    type: event?.eventType || 'EVENT',
    title: resolveEventTitle(event?.eventType),
    quantity,
    previousStock,
    newStock,
    reason: reason || undefined,
    createdAt: event?.createdAt || new Date().toISOString(),
    createdByName: resolveUserLabel(event) || 'Usuario del negocio',
  };
}

export default function ProductDetailScreen() {
  const route = useRoute<Params>();
  const navigation = useNavigation<any>();
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const { productId } = route.params;

  const { data: product, isLoading: isLoadingProduct } = useProductDetail(productId);
  const { data: categories = [] } = useProductCategories();

  const {
    data: allEvents = [],
    isLoading: isLoadingEvents,
  } = useQuery({
    queryKey: ['product-events', workspaceId, productId],
    enabled: !!workspaceId && !!productId,
    queryFn: async () => {
      if (!workspaceId) return [];
      return inventoryApi.listEvents(workspaceId, 240);
    },
  });

  const categoryName = useMemo(() => {
    if (!product) return undefined;
    const fromList = (categories as any[]).find((category) => category._id === product.categoryId);
    const fallback = (product as any).category?.name;
    return fromList?.name || (typeof fallback === 'string' ? fallback : undefined);
  }, [categories, product]);

  const stock = Number(product?.stock ?? 0);
  const minStock = Number(product?.minStock ?? 0);
  const stockStatus = getStockStatus(stock, minStock);
  const stockValueColor = stockStatus === 'critical' ? '#FCA5A5' : stockStatus === 'low' ? '#FCD34D' : '#EAF1FF';

  const timeline = useMemo(() => {
    const productEvents = (allEvents as any[])
      .filter((event) => resolveProductIdRef(event?.productId) === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return productEvents.map((event, index) => toTimelineEvent(event, index));
  }, [allEvents, productId]);

  if (isLoadingProduct) {
    return (
      <MainLayout>
        <View style={styles.centeredState}>
          <ActivityIndicator color={theme.colors.accent} />
          <Text style={styles.stateText}>Cargando producto...</Text>
        </View>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <View style={styles.centeredState}>
          <Text style={styles.stateText}>No encontramos el producto</Text>
          <Pressable onPress={() => navigation.goBack()} style={styles.stateBtn}>
            <Text style={styles.stateBtnText}>Volver</Text>
          </Pressable>
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={20} color={theme.colors.textPrimary} />
          </Pressable>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Detalle de producto</Text>
            <Text style={styles.headerCode}>#{String(product._id || '').slice(-8)}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionCard}>
            <View style={styles.productTopRow}>
              {product.image ? (
                <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="cover" />
              ) : (
                <View style={styles.productImageFallback}>
                  <Package size={26} color="#8EA4CC" />
                </View>
              )}

              <View style={styles.productTopText}>
                <Text numberOfLines={2} style={styles.productName}>{product.name || 'Producto sin nombre'}</Text>
                <Text numberOfLines={1} style={styles.productSku}>SKU {product.sku || 'sin asignar'}</Text>
              </View>
            </View>

            <View style={styles.stockHero}>
              <View style={styles.stockHeroValueCol}>
                <Text style={styles.stockHeroLabel}>Stock actual</Text>
                <Text style={[styles.stockHeroValue, { color: stockValueColor }]}>{stock}</Text>
                <Text style={styles.stockHeroMin}>Minimo esperado {minStock}</Text>
              </View>

              <ProductStockHealthBadge stock={stock} minStock={minStock} />
            </View>

            <View style={styles.priceRow}>
              <View style={styles.salePriceCard}>
                <Text style={styles.salePriceLabel}>Precio venta</Text>
                <Text style={styles.salePriceValue}>{money(product.salePrice)}</Text>
              </View>

              <View style={styles.purchasePriceCard}>
                <Text style={styles.purchasePriceLabel}>Compra</Text>
                <Text style={styles.purchasePriceValue}>{money(product.purchasePrice)}</Text>
              </View>
            </View>

            {categoryName ? (
              <View style={styles.categoryRow}>
                <Text style={styles.categoryLabel}>Categoria</Text>
                <Text numberOfLines={1} style={styles.categoryValue}>{categoryName}</Text>
              </View>
            ) : null}

            <View style={styles.stockGuidanceRow}>
              <Text style={styles.stockGuidanceLabel}>Referencial</Text>
              <Text style={styles.stockGuidanceValue}>
                {stock >= minStock ? 'Por encima del minimo' : 'Por debajo del minimo'}
              </Text>
            </View>
          </View>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Timeline del producto</Text>
          </View>

          {isLoadingEvents ? (
            <View style={styles.centeredInlineState}>
              <ActivityIndicator color={theme.colors.accent} />
              <Text style={styles.loadingEventsText}>Cargando eventos...</Text>
            </View>
          ) : timeline.length > 0 ? (
            timeline.map((event, idx) => {
              return (
                <View key={event.id} style={styles.timelineRow}>
                  <View style={styles.timelineLineCol}>
                    <View style={styles.timelineDot} />
                    {idx !== timeline.length - 1 && <View style={styles.timelineLine} />}
                  </View>

                  <ProductTimelineEventCard event={event} />
                </View>
              );
            })
          ) : (
            <View style={styles.emptyEvents}>
              <Text style={styles.emptyEventsText}>No hay eventos para este producto.</Text>
            </View>
          )}
        </ScrollView>
      </View>
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
    gap: 10,
  },
  productTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
  },
  productImageFallback: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productTopText: {
    flex: 1,
  },
  productName: {
    color: theme.colors.textPrimary,
    fontWeight: theme.weight.bold,
    fontSize: theme.font.lg,
    lineHeight: 22,
  },
  productSku: {
    marginTop: 4,
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  stockHero: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    paddingTop: 10,
  },
  stockHeroValueCol: {
    flex: 1,
    minWidth: 0,
  },
  stockHeroLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  stockHeroValue: {
    marginTop: 1,
    fontSize: 30,
    fontWeight: theme.weight.semibold,
    lineHeight: 34,
  },
  stockHeroMin: {
    marginTop: 1,
    color: '#8EA4CC',
    fontSize: 11,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
  },
  salePriceCard: {
    flex: 1.15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2458B3',
    backgroundColor: '#102849',
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  salePriceLabel: {
    color: '#9DB7E2',
    fontSize: 11,
  },
  salePriceValue: {
    marginTop: 2,
    color: '#EAF1FF',
    fontSize: theme.font.lg,
    fontWeight: theme.weight.bold,
  },
  purchasePriceCard: {
    flex: 0.85,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0C1D3D',
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  purchasePriceLabel: {
    color: '#8EA4CC',
    fontSize: 11,
  },
  purchasePriceValue: {
    marginTop: 2,
    color: '#C8D7F1',
    fontSize: theme.font.md,
    fontWeight: theme.weight.semibold,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  categoryLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  categoryValue: {
    flex: 1,
    textAlign: 'right',
    color: '#AFC1E0',
    fontSize: 11,
  },
  stockGuidanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#17345D',
  },
  stockGuidanceLabel: {
    color: '#7E94BE',
    fontSize: 11,
  },
  stockGuidanceValue: {
    color: '#C8D7F1',
    fontSize: 11,
    fontWeight: theme.weight.medium,
  },
  sectionHeaderRow: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.md,
    fontWeight: theme.weight.bold,
  },
  centeredInlineState: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    minHeight: 66,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  loadingEventsText: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  emptyEvents: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  emptyEventsText: {
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  timelineLineCol: {
    width: 16,
    alignItems: 'center',
  },
  timelineDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    marginTop: 7,
    borderWidth: 1.5,
    borderColor: '#2E6BFF',
    backgroundColor: '#081226',
  },
  timelineLine: {
    width: 1,
    flex: 1,
    marginTop: 5,
    backgroundColor: '#1F3765',
  },
});
