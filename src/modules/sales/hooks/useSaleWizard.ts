import { useMemo, useState } from 'react';

import { formatMoneyInput, parseMoneyInput } from '@/utils/money';
import { useCreateSale } from './useCreateSale';
import type { SaleFlowType, SalePriority } from '../types/sale.type';

export type SaleWizardItem = {
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  requiresManufacturing: boolean;
};

function nextWeekIsoDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString();
}

export function useSaleWizard() {
  const createSale = useCreateSale();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [flowType, setFlowType] = useState<SaleFlowType>('IMMEDIATE');
  const [paymentMethod, setPaymentMethod] = useState<'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA'>('EFECTIVO');

  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  const [deliveryDate, setDeliveryDate] = useState<string>(nextWeekIsoDate());
  const [priority, setPriority] = useState<SalePriority>('NORMAL');
  const [initialPaymentInput, setInitialPaymentInput] = useState('');
  const [observations, setObservations] = useState('');
  const [paymentProofImageUri, setPaymentProofImageUri] = useState<string | null>(null);
  const [saleEvidenceImageUri, setSaleEvidenceImageUri] = useState<string | null>(null);

  const [items, setItems] = useState<SaleWizardItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProductName, setSelectedProductName] = useState('');
  const [quantityInput, setQuantityInput] = useState('1');
  const [unitPriceInput, setUnitPriceInput] = useState('0');
  const [lineRequiresManufacturing, setLineRequiresManufacturing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const total = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0),
    [items],
  );

  const requiresSchedule = flowType !== 'IMMEDIATE';

  const canGoNext = useMemo(() => {
    if (step === 1) {
      const hasClient = Boolean(clientId || clientName.trim() || clientPhone.trim());
      if (!hasClient) return false;
      if (!requiresSchedule) return true;
      const initial = parseMoneyInput(initialPaymentInput);
      return !!deliveryDate && initial > 0;
    }

    if (step === 2) return items.length > 0;
    return true;
  }, [
    step,
    clientId,
    clientName,
    clientPhone,
    paymentMethod,
    requiresSchedule,
    initialPaymentInput,
    deliveryDate,
    items.length,
  ]);

  function resetLineEditor() {
    setSelectedProductId(null);
    setSelectedProductName('');
    setQuantityInput('1');
    setUnitPriceInput('0');
    setLineRequiresManufacturing(flowType === 'MANUFACTURE');
    setEditingIndex(null);
  }

  function startEditItem(index: number) {
    const item = items[index];
    if (!item) return;

    setEditingIndex(index);
    setSelectedProductId(item.productId || null);
    setSelectedProductName(item.productName);
    setQuantityInput(String(item.quantity));
    setUnitPriceInput(formatMoneyInput(String(item.unitPrice)) || '0');
    setLineRequiresManufacturing(!!item.requiresManufacturing);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) resetLineEditor();
  }

  function addOrUpdateItem() {
    const quantity = Math.max(1, Math.round(Number(quantityInput) || 0));
    const unitPrice = Math.max(0, Math.round(parseMoneyInput(unitPriceInput)));

    if (!selectedProductName.trim() || !quantity || !unitPrice) {
      return { ok: false as const, message: 'Selecciona producto, cantidad y precio validos.' };
    }

    const item: SaleWizardItem = {
      productId: selectedProductId || undefined,
      productName: selectedProductName.trim(),
      quantity,
      unitPrice,
      requiresManufacturing: lineRequiresManufacturing,
    };

    if (editingIndex !== null) {
      setItems((prev) => prev.map((line, idx) => (idx === editingIndex ? item : line)));
      resetLineEditor();
      return { ok: true as const, mode: 'updated' as const };
    }

    setItems((prev) => [...prev, item]);
    resetLineEditor();
    return { ok: true as const, mode: 'added' as const };
  }

  function nextStep() {
    setStep((prev) => (prev === 3 ? 3 : ((prev + 1) as 1 | 2 | 3)));
  }

  function prevStep() {
    setStep((prev) => (prev === 1 ? 1 : ((prev - 1) as 1 | 2 | 3)));
  }

  function goToStep(targetStep: 1 | 2 | 3) {
    setStep(targetStep);
  }

  function setSaleFlowType(next: SaleFlowType) {
    setFlowType(next);
    setLineRequiresManufacturing(next === 'MANUFACTURE');
    if (next === 'IMMEDIATE') {
      setPriority('NORMAL');
      setInitialPaymentInput('');
    }
  }

  function applyFoundCustomer(customer: { _id: string; name?: string; phone: string; address?: string }) {
    setClientId(customer._id);
    setClientName(customer.name || '');
    setClientPhone(customer.phone || '');
    setClientAddress(customer.address || '');
  }

  function resetWizard() {
    setStep(1);
    setFlowType('IMMEDIATE');
    setPaymentMethod('EFECTIVO');
    setClientId(undefined);
    setClientName('');
    setClientPhone('');
    setClientAddress('');
    setDeliveryDate(nextWeekIsoDate());
    setPriority('NORMAL');
    setInitialPaymentInput('');
    setObservations('');
    setPaymentProofImageUri(null);
    setSaleEvidenceImageUri(null);
    setItems([]);
    setLineRequiresManufacturing(false);
    resetLineEditor();
  }

  async function submitSale() {
    const hasClient = Boolean(clientId || clientName.trim() || clientPhone.trim());
    if (!hasClient) {
      return { ok: false as const, message: 'Completa los datos del cliente para continuar.' };
    }
    if (!items.length) {
      return { ok: false as const, message: 'Agrega al menos una linea de producto.' };
    }
    if (requiresSchedule) {
      if (!deliveryDate) {
        return { ok: false as const, message: 'Define la fecha de entrega para continuar.' };
      }

      const initialPaidAmountCop = parseMoneyInput(initialPaymentInput);
      if (initialPaidAmountCop <= 0) {
        return { ok: false as const, message: 'Registra un abono inicial para este tipo de venta.' };
      }
    }

    const firstItem = items[0];
    await createSale.mutateAsync({
      amountCop: total,
      date: new Date().toISOString(),
      paymentMethod,
      description: observations.trim() || undefined,
      saleType: flowType,
      status: 'PENDIENTE',
      priority: requiresSchedule ? priority : 'NORMAL',
      deliveryType: flowType === 'MANUFACTURE' ? 'MANUFACTURE' : 'IMMEDIATE',
      deliveryDate: requiresSchedule ? deliveryDate : undefined,
      initialPaidAmountCop: requiresSchedule ? parseMoneyInput(initialPaymentInput) || undefined : undefined,
      clientId,
      productId: firstItem?.productId,
      client: {
        id: clientId,
        name: clientName.trim() || undefined,
        phone: clientPhone.trim() || undefined,
        address: clientAddress.trim() || undefined,
      },
      product: {
        id: firstItem?.productId,
        name: firstItem?.productName,
      },
      observations: observations.trim() || undefined,
      paymentProof:
        paymentMethod !== 'EFECTIVO' && paymentProofImageUri
          ? {
              paymentMethod,
              receiptImageUrl: paymentProofImageUri,
            }
          : undefined,
      saleEvidence: saleEvidenceImageUri
        ? {
            imageUrl: saleEvidenceImageUri,
            label: 'Evidencia comercial',
          }
        : undefined,
      items: items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        requiresManufacturing: item.requiresManufacturing,
      })),
    });

    return { ok: true as const };
  }

  return {
    step,
    nextStep,
    prevStep,
    goToStep,
    canGoNext,

    flowType,
    setFlowType: setSaleFlowType,
    paymentMethod,
    setPaymentMethod,

    clientId,
    setClientId,
    clientName,
    setClientName,
    clientPhone,
    setClientPhone,
    clientAddress,
    setClientAddress,
    applyFoundCustomer,

    requiresSchedule,
    deliveryDate,
    setDeliveryDate,
    priority,
    setPriority,
    initialPaymentInput,
    setInitialPaymentInput: (value: string) => setInitialPaymentInput(formatMoneyInput(value)),

    observations,
    setObservations,
    paymentProofImageUri,
    setPaymentProofImageUri,
    saleEvidenceImageUri,
    setSaleEvidenceImageUri,

    items,
    total,
    selectedProductId,
    selectedProductName,
    setSelectedProductId,
    setSelectedProductName,
    quantityInput,
    setQuantityInput,
    unitPriceInput,
    setUnitPriceInput: (value: string) => setUnitPriceInput(formatMoneyInput(value)),
    lineRequiresManufacturing,
    setLineRequiresManufacturing,
    editingIndex,
    addOrUpdateItem,
    startEditItem,
    removeItem,

    submitSale,
    resetWizard,
    isSaving: createSale.isPending,
  };
}
