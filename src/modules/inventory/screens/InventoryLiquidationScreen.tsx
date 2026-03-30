import React, { useMemo, useRef, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowLeft, CheckCircle2, Circle, Info, Minus, Plus, Search } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { ActionLoader } from '@/components/ui/ActionLoader';
import { theme } from '@/theme';
import { useProducts } from '@/modules/products/hooks/useProducts';
import { useInventoryAuditDraft } from '../hooks/useInventoryAuditDraft';

function clampStock(value: number) {
  return Math.max(0, Math.round(value));
}

export default function InventoryLiquidationScreen() {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const [manualCountByProductId, setManualCountByProductId] = useState<Record<string, string>>({});
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const counterInputRefs = useRef<Record<string, TextInput | null>>({});
  const { data: products = [], isFetching, refetch } = useProducts();
  const { draft, countedProducts, progressPercent, setCount, finalize, isFinalizing } = useInventoryAuditDraft((products as any[]).length);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products as any[];

    return (products as any[]).filter((item) => {
      const name = (item.name || '').toLowerCase();
      const sku = (item.sku || '').toLowerCase();
      return name.includes(term) || sku.includes(term);
    });
  }, [products, search]);

  async function updateCount(productId: string, nextCount: number) {
    await setCount(productId, clampStock(nextCount));
  }

  function clearManualCount(productId: string) {
    setManualCountByProductId((prev) => {
      if (!(productId in prev)) return prev;
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  }

  function beginManualEdit(productId: string, current: number) {
    setManualCountByProductId((prev) => ({
      ...prev,
      [productId]: prev[productId] ?? String(current),
    }));
    setEditingProductId(productId);

    requestAnimationFrame(() => {
      counterInputRefs.current[productId]?.focus();
    });
  }

  function handleManualChange(productId: string, value: string) {
    const numericOnly = value.replace(/[^0-9]/g, '');
    setManualCountByProductId((prev) => ({ ...prev, [productId]: numericOnly }));
  }

  function resolveBaseCount(productId: string, fallbackCurrent: number) {
    const raw = manualCountByProductId[productId];
    if (raw === undefined || raw === '') return fallbackCurrent;

    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) return fallbackCurrent;
    return clampStock(parsed);
  }

  async function commitManualCount(productId: string, fallbackCurrent: number) {
    const raw = manualCountByProductId[productId];
    setEditingProductId((prev) => (prev === productId ? null : prev));

    if (raw === undefined) return;
    if (raw === '') {
      clearManualCount(productId);
      return;
    }

    const nextCount = clampStock(Number.parseInt(raw, 10));
    clearManualCount(productId);

    if (nextCount !== fallbackCurrent) {
      await updateCount(productId, nextCount);
    }
  }

  async function handleStepChange(productId: string, fallbackCurrent: number, delta: number) {
    const base = resolveBaseCount(productId, fallbackCurrent);
    const nextCount = clampStock(base + delta);

    setEditingProductId((prev) => (prev === productId ? null : prev));
    clearManualCount(productId);
    await updateCount(productId, nextCount);
  }

  async function handleFinalize() {
    try {
      const result = await finalize();
      if (result.queued) {
        Toast.show({ type: 'success', text1: 'Finalización en cola', text2: 'Se aplicará al reconectar.' });
        return;
      }

      if ((result as any)?.alreadyFinalized) {
        Toast.show({
          type: 'success',
          text1: 'Auditoría ya finalizada',
          text2: 'Los cambios de stock ya estaban aplicados.',
        });
        if (result?.auditId) {
          navigation.navigate('InventoryLiquidationDetail', { auditId: result.auditId });
        }
        refetch();
        return;
      }

      Toast.show({ type: 'success', text1: 'Auditoría finalizada' });
      if (result?.auditId) {
        navigation.navigate('InventoryLiquidationDetail', { auditId: result.auditId });
      }
      refetch();
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Revisa conexión y vuelve a intentar.';

      Toast.show({
        type: 'error',
        text1: 'No se pudo finalizar la auditoría',
        text2: String(backendMessage),
      });
    }
  }

  const statusText = useMemo(() => {
    return `${countedProducts} de ${(products as any[]).length} productos`;
  }, [countedProducts, products]);

  const pendingProducts = Math.max(0, (products as any[]).length - countedProducts);
  const canStartFreshAudit = pendingProducts === 0;
  const isFinalizeNearComplete = progressPercent >= 80;
  const isFinalizeAlmostReady = progressPercent >= 95;

  return (
    <MainLayout hideHeader hideBottomBar>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <ArrowLeft size={20} color={theme.colors.textPrimary} />
          </Pressable>
          <Text style={styles.topBarTitle}>Inventario de Liquidación</Text>
          <View style={styles.topBarSpacer} />
        </View>

        <View style={styles.progressBlock}>
          <Text style={styles.headerSubtitle}>Conteo físico completo</Text>

          <View style={styles.progressMetaRow}>
            <Text style={styles.progressText}>{statusText}</Text>
            <Text style={styles.progressPercentText}>{progressPercent}%</Text>
          </View>

          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        <View style={styles.infoBanner}>
          <Info size={14} color={theme.colors.textMuted} />
          <Text style={styles.infoText}>
            {canStartFreshAudit
              ? 'Conteo completo. Puedes iniciar una nueva auditoría cuando quieras.'
              : `Continuas una auditoría en curso: faltan ${pendingProducts} productos por contar.`}
          </Text>
        </View>

        <View style={styles.searchWrap}>
          <Search size={16} color={theme.colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por nombre o SKU"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.searchInput}
          />
        </View>

        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item._id}
          refreshing={isFetching}
          onRefresh={refetch}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const counted = draft?.countsByProductId?.[item._id];
            const hasCount = counted !== undefined;
            const current = hasCount ? counted : item.stock ?? 0;
            const manualValue = manualCountByProductId[item._id];
            const displayValue = manualValue !== undefined ? manualValue : String(current);

            return (
              <View style={styles.itemCard}>
                <View style={styles.itemMainRow}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.thumb} resizeMode="cover" />
                  ) : (
                    <View style={styles.thumbFallback}>
                      <Text style={styles.thumbFallbackText}>{(item.name || '?').slice(0, 1).toUpperCase()}</Text>
                    </View>
                  )}

                  <View style={styles.itemMeta}>
                    <Text numberOfLines={1} style={styles.itemName}>{item.name}</Text>
                    {!!item.sku && <Text style={styles.itemSub}>SKU {item.sku}</Text>}
                    {!!item.location && <Text style={styles.itemSub}>Ubicación {item.location}</Text>}
                  </View>

                  <View style={styles.itemStatusWrap}>
                    {hasCount ? (
                      <>
                        <CheckCircle2 size={14} color={theme.colors.success} />
                        <Text style={styles.itemStatusDone}>contado</Text>
                      </>
                    ) : (
                      <>
                        <Circle size={12} color={theme.colors.textMuted} />
                        <Text style={styles.itemStatusPending}>pendiente</Text>
                      </>
                    )}
                  </View>
                </View>

                <View style={styles.counterRow}>
                  <Pressable
                    style={styles.counterBtn}
                    onPress={() => {
                      handleStepChange(item._id, current, -1).catch(() => {});
                    }}
                  >
                    <Minus size={18} color={theme.colors.textPrimary} />
                  </Pressable>

                  <Pressable
                    style={[
                      styles.counterValueWrap,
                      editingProductId === item._id && styles.counterValueWrapFocused,
                    ]}
                    onPress={() => beginManualEdit(item._id, current)}
                  >
                    <TextInput
                      ref={(ref) => {
                        counterInputRefs.current[item._id] = ref;
                      }}
                      value={displayValue}
                      onFocus={() => setEditingProductId(item._id)}
                      onChangeText={(value) => handleManualChange(item._id, value)}
                      onBlur={() => {
                        commitManualCount(item._id, current).catch(() => {});
                      }}
                      onSubmitEditing={() => {
                        counterInputRefs.current[item._id]?.blur();
                      }}
                      keyboardType="number-pad"
                      returnKeyType="done"
                      maxLength={8}
                      selectTextOnFocus
                      placeholder="0"
                      placeholderTextColor={theme.colors.textMuted}
                      style={styles.counterValueInput}
                    />
                  </Pressable>

                  <Pressable
                    style={styles.counterBtn}
                    onPress={() => {
                      handleStepChange(item._id, current, 1).catch(() => {});
                    }}
                  >
                    <Plus size={18} color={theme.colors.textPrimary} />
                  </Pressable>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No hay productos para auditar</Text>
            </View>
          }
        />

        <Pressable
          style={[
            styles.finalizeBtn,
            isFinalizeNearComplete && styles.finalizeBtnNearComplete,
            isFinalizeAlmostReady && styles.finalizeBtnAlmostReady,
            isFinalizing && styles.finalizeBtnDisabled,
          ]}
          onPress={handleFinalize}
          disabled={isFinalizing}
        >
          <Text style={styles.finalizeBtnText}>Finalizar Auditoría</Text>
        </Pressable>
      </View>

      <ActionLoader
        visible={isFinalizing}
        steps={[
          'Validando conteo...',
          'Guardando cantidades fisicas...',
          'Aplicando ajustes al inventario...',
          'Registrando eventos del inventario...',
          'Cerrando auditoria...',
          'Finalizando proceso...',
        ]}
      />
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  topBar: {
    height: 40,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.md,
    fontWeight: theme.weight.bold,
  },
  topBarSpacer: {
    width: 20,
  },
  progressBlock: {
    paddingTop: 4,
    paddingBottom: 6,
    marginBottom: 2,
  },
  headerSubtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.font.sm,
    fontWeight: theme.weight.medium,
  },
  progressMetaRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    color: theme.colors.textSecondary,
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
  },
  progressPercentText: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.sm,
    fontWeight: theme.weight.bold,
  },
  progressBarTrack: {
    marginTop: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: theme.colors.border,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
  },
  infoBanner: {
    marginBottom: 6,
    paddingHorizontal: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  infoText: {
    flex: 1,
    color: theme.colors.textMuted,
    fontSize: theme.font.xs,
    lineHeight: 15,
  },
  searchWrap: {
    height: 42,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.font.sm,
  },
  listContent: {
    paddingTop: 6,
    paddingBottom: 90,
  },
  itemCard: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  itemMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  thumbFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbFallbackText: {
    color: theme.colors.textSecondary,
    fontWeight: theme.weight.bold,
    fontSize: theme.font.sm,
  },
  itemMeta: {
    flex: 1,
  },
  itemName: {
    color: theme.colors.textPrimary,
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
  },
  itemSub: {
    marginTop: 1,
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  itemStatusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  itemStatusPending: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: theme.weight.medium,
  },
  itemStatusDone: {
    color: theme.colors.success,
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  counterRow: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  counterBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValueWrap: {
    minWidth: 84,
    height: 42,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValueWrapFocused: {
    backgroundColor: theme.colors.surface,
  },
  counterValueInput: {
    minWidth: 52,
    textAlign: 'center',
    color: theme.colors.textPrimary,
    fontWeight: theme.weight.bold,
    fontSize: theme.font.xl,
    paddingVertical: 0,
  },
  emptyCard: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    padding: 14,
    marginTop: 20,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontWeight: theme.weight.bold,
    textAlign: 'center',
  },
  finalizeBtn: {
    position: 'absolute',
    left: theme.spacing.md,
    right: theme.spacing.md,
    bottom: theme.spacing.md,
    height: 52,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.88,
  },
  finalizeBtnNearComplete: {
    backgroundColor: theme.colors.accent,
    opacity: 0.96,
  },
  finalizeBtnAlmostReady: {
    opacity: 1,
  },
  finalizeBtnDisabled: {
    opacity: 0.7,
  },
  finalizeBtnText: {
    color: theme.colors.textPrimary,
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
  },
});
