import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { ActionLoader } from '@/components/ui/ActionLoader';
import type { AttachmentImage } from '@/components/ui/ImageAttachmentField';
import { OperationalModal } from '@/components/ui/OperationalModal';
import { formatMoneyInput, parseMoneyInput } from '@/utils/money';
import { theme } from '@/theme';
import { ProductSelectorModal } from './ProductSelectorModal';
import { SaleTypeSelectorModal } from './SaleTypeSelectorModal';
import { useSearchCustomerByPhone } from '../hooks/useSearchCustomerByPhone';
import { useSaleWizard } from '../hooks/useSaleWizard';
import { SalesWizardProgress } from './SalesWizardProgress';
import { SalesContextStep } from './SalesContextStep';
import { SalesLinesStep } from './SalesLinesStep';
import { SalesReviewStep } from './SalesReviewStep';

type Props = {
  visible: boolean;
  onClose: () => void;
};

function formatAmount(value: number) {
  return `$${(value || 0).toLocaleString('es-CO')}`;
}

export function RegisterSaleModal({ visible, onClose }: Props) {
  const wizard = useSaleWizard();
  const searchCustomerByPhone = useSearchCustomerByPhone();

  const [showTypeSelectorModal, setShowTypeSelectorModal] = useState(false);
  const [showProductSelectorModal, setShowProductSelectorModal] = useState(false);
  const [inlineFeedback, setInlineFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const orderedItems = useMemo(
    () => wizard.items.map((item, index) => ({ item, index })).slice().reverse(),
    [wizard.items],
  );

  const primaryLabel = useMemo(() => {
    if (wizard.step === 1) return 'Continuar a lineas';
    if (wizard.step === 2) return 'Continuar a confirmacion';
    return wizard.isSaving ? 'Guardando...' : 'Guardar venta';
  }, [wizard.isSaving, wizard.step]);

  function closeModal() {
    wizard.resetWizard();
    setShowTypeSelectorModal(false);
    setShowProductSelectorModal(false);
    setInlineFeedback(null);
    onClose();
  }

  const paymentProofImages: AttachmentImage[] = wizard.paymentProofImageUri
    ? [{ uri: wizard.paymentProofImageUri }]
    : [];
  const saleEvidenceImages: AttachmentImage[] = wizard.saleEvidenceImageUri
    ? [{ uri: wizard.saleEvidenceImageUri }]
    : [];

  async function handleSearchCustomer() {
    if (!wizard.clientPhone.trim()) {
      Toast.show({ type: 'error', text1: 'Falta telefono', text2: 'Ingresa un numero para buscar cliente.' });
      return;
    }

    try {
      const found = await searchCustomerByPhone.mutateAsync(wizard.clientPhone.trim());
      if (!found) {
        setInlineFeedback({ type: 'error', text: 'No hay cliente activo con ese telefono.' });
        return;
      }

      wizard.applyFoundCustomer(found);
      setInlineFeedback({ type: 'success', text: 'Cliente encontrado y aplicado.' });
    } catch {
      setInlineFeedback({ type: 'error', text: 'No se pudo buscar cliente. Intenta de nuevo.' });
    }
  }

  async function onPrimaryAction() {
    if (wizard.step < 3) {
      if (!wizard.canGoNext) {
        setInlineFeedback({ type: 'error', text: 'Completa este paso para continuar.' });
        return;
      }
      setInlineFeedback(null);
      wizard.nextStep();
      return;
    }

    try {
      const result = await wizard.submitSale();
      if (!result.ok) {
        setInlineFeedback({ type: 'error', text: result.message });
        return;
      }

      Toast.show({
        type: 'success',
        text1: 'Venta registrada',
        text2: `${wizard.items.length} lineas guardadas correctamente.`,
      });
      closeModal();
    } catch {
      setInlineFeedback({ type: 'error', text: 'No se pudo registrar la venta. Intenta de nuevo.' });
    }
  }

  return (
    <>
      <OperationalModal
        visible={visible}
        onClose={closeModal}
        title="Registrar venta"
        headerLeft={
          <Pressable onPress={closeModal} hitSlop={8}>
            <ArrowLeft size={20} color="#DCE8FF" />
          </Pressable>
        }
        headerRight={<View style={styles.headerSpacer} />}
        contentContainerStyle={styles.content}
        footer={
          <View style={styles.footer}>
            <View>
              <Text style={styles.footerLabel}>{wizard.step === 3 ? 'Total final' : 'Total en construccion'}</Text>
              <Text style={styles.footerTotal}>{formatAmount(wizard.total)}</Text>
            </View>

            <View style={styles.footerActions}>
              {wizard.step > 1 ? (
                <Pressable style={styles.backBtn} onPress={wizard.prevStep}>
                  <Text style={styles.backBtnText}>Atras</Text>
                </Pressable>
              ) : null}
              <Pressable style={styles.primaryBtn} onPress={onPrimaryAction}>
                <Text style={styles.primaryBtnText}>{primaryLabel}</Text>
              </Pressable>
            </View>
          </View>
        }
      >
        <SalesWizardProgress step={wizard.step} />

        {!!inlineFeedback && (
          <View style={[styles.feedbackBanner, inlineFeedback.type === 'success' ? styles.feedbackOk : styles.feedbackError]}>
            <Text style={styles.feedbackText}>{inlineFeedback.text}</Text>
          </View>
        )}

        {wizard.step === 1 && (
          <SalesContextStep
            flowType={wizard.flowType}
            paymentMethod={wizard.paymentMethod}
            setPaymentMethod={wizard.setPaymentMethod}
            onOpenSaleTypeSelector={() => setShowTypeSelectorModal(true)}
            clientId={wizard.clientId}
            clientName={wizard.clientName}
            setClientName={(value) => {
              wizard.setClientName(value);
              wizard.setClientId(undefined);
            }}
            clientPhone={wizard.clientPhone}
            setClientPhone={(value) => {
              wizard.setClientPhone(value);
              wizard.setClientId(undefined);
            }}
            clientAddress={wizard.clientAddress}
            setClientAddress={wizard.setClientAddress}
            onSearchCustomer={handleSearchCustomer}
            isSearchingCustomer={searchCustomerByPhone.isPending}
            requiresSchedule={wizard.requiresSchedule}
            deliveryDate={wizard.deliveryDate}
            setDeliveryDate={wizard.setDeliveryDate}
            priority={wizard.priority}
            setPriority={wizard.setPriority}
            initialPaymentInput={wizard.initialPaymentInput}
            setInitialPaymentInput={wizard.setInitialPaymentInput}
            observations={wizard.observations}
            setObservations={wizard.setObservations}
            paymentProofImages={paymentProofImages}
            saleEvidenceImages={saleEvidenceImages}
            onPaymentProofImagesChange={(images) =>
              wizard.setPaymentProofImageUri(images[0]?.uri || null)
            }
            onSaleEvidenceImagesChange={(images) =>
              wizard.setSaleEvidenceImageUri(images[0]?.uri || null)
            }
          />
        )}

        {wizard.step === 2 && (
          <SalesLinesStep
            selectedProductName={wizard.selectedProductName}
            quantityInput={wizard.quantityInput}
            setQuantityInput={wizard.setQuantityInput}
            unitPriceInput={wizard.unitPriceInput}
            setUnitPriceInput={wizard.setUnitPriceInput}
            lineRequiresManufacturing={wizard.lineRequiresManufacturing}
            setLineRequiresManufacturing={wizard.setLineRequiresManufacturing}
            editingIndex={wizard.editingIndex}
            items={wizard.items}
            orderedItems={orderedItems}
            onOpenProductSelector={() => setShowProductSelectorModal(true)}
            onAddOrUpdateLine={wizard.addOrUpdateItem}
            onEditLine={wizard.startEditItem}
            onRemoveLine={wizard.removeItem}
            onFeedback={(type, text) => setInlineFeedback({ type, text })}
          />
        )}

        {wizard.step === 3 && (
          <SalesReviewStep
            flowType={wizard.flowType}
            paymentMethod={wizard.paymentMethod}
            clientName={wizard.clientName}
            clientPhone={wizard.clientPhone}
            clientAddress={wizard.clientAddress}
            requiresSchedule={wizard.requiresSchedule}
            deliveryDate={wizard.deliveryDate}
            priority={wizard.priority}
            initialPaymentInput={wizard.initialPaymentInput}
            observations={wizard.observations}
            paymentProofImageUri={wizard.paymentProofImageUri}
            saleEvidenceImageUri={wizard.saleEvidenceImageUri}
            total={wizard.total}
            orderedItems={orderedItems}
            onGoToContextStep={() => wizard.goToStep(1)}
            onGoToLinesStep={() => wizard.goToStep(2)}
            onEditLine={wizard.startEditItem}
            onRemoveLine={wizard.removeItem}
          />
        )}
      </OperationalModal>

      <SaleTypeSelectorModal
        visible={showTypeSelectorModal}
        value={wizard.flowType}
        onClose={() => setShowTypeSelectorModal(false)}
        onChange={wizard.setFlowType}
      />

      <ProductSelectorModal
        visible={showProductSelectorModal}
        selectedProductId={wizard.selectedProductId || undefined}
        onClose={() => setShowProductSelectorModal(false)}
        onSelect={(product) => {
          wizard.setSelectedProductId(product._id);
          wizard.setSelectedProductName(product.name);

          if (parseMoneyInput(wizard.unitPriceInput) <= 0) {
            wizard.setUnitPriceInput(formatMoneyInput(String(Math.round(product.salePrice || 0))));
          }
        }}
      />

      <ActionLoader
        visible={wizard.isSaving}
        steps={['Validando venta...', 'Guardando lineas...', 'Sincronizando datos...', 'Finalizando...']}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerSpacer: {
    width: 20,
  },
  feedbackBanner: {
    marginBottom: 2,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  feedbackOk: {
    borderColor: '#2A5B3F',
    backgroundColor: '#112B21',
  },
  feedbackError: {
    borderColor: '#7A2630',
    backgroundColor: '#341720',
  },
  feedbackText: {
    color: '#EAF1FF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  content: {
    gap: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  footerLabel: {
    color: '#91A7CC',
    fontSize: theme.font.xs,
  },
  footerTotal: {
    color: '#EAF1FF',
    fontSize: theme.font.md,
    fontWeight: theme.weight.bold,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  backBtn: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#29466F',
    backgroundColor: '#243956',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  backBtnText: {
    color: '#DDE8FF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.bold,
  },
  primaryBtn: {
    height: 40,
    borderRadius: 10,
    backgroundColor: '#2E6BFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  primaryBtnText: {
    color: '#F0F6FF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.bold,
  },
});
