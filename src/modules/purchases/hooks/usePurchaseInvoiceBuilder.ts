import { useMemo, useState } from 'react';
import { useCreatePurchase } from './useCreatePurchase';
import type { PurchasePaymentType } from '../types/purchase.type';
import { formatMoneyInput, parseMoneyInput } from '@/utils/money';
import { generateObjectId } from '@/utils/generateId';

export type PurchaseInvoiceItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function usePurchaseInvoiceBuilder() {
  const createPurchase = useCreatePurchase();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [provider, setProvider] = useState('');
  const [providerId, setProviderId] = useState<string | undefined>(undefined);
  const [invoiceDate, setInvoiceDate] = useState(todayISO());
  const [proofImageUri, setProofImageUri] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<PurchasePaymentType>('CREDITO');

  const [items, setItems] = useState<PurchaseInvoiceItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProductName, setSelectedProductName] = useState('');
  const [quantityInput, setQuantityInput] = useState('1');
  const [unitPriceInput, setUnitPriceInput] = useState('0');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false);

  const total = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0),
    [items],
  );

  const canGoNext = useMemo(() => {
    if (step === 1) return provider.trim().length > 0 && invoiceDate.trim().length > 0;
    if (step === 2) return items.length > 0;
    return true;
  }, [step, provider, invoiceDate, items.length]);

  function nextStep() {
    setStep((prev) => (prev === 3 ? 3 : ((prev + 1) as 1 | 2 | 3)));
  }

  function prevStep() {
    setStep((prev) => (prev === 1 ? 1 : ((prev - 1) as 1 | 2 | 3)));
  }

  function selectProvider(input: { id?: string; name: string }) {
    setProvider(input.name);
    setProviderId(input.id);
  }

  function resetLineEditor() {
    setSelectedProductId(null);
    setSelectedProductName('');
    setQuantityInput('1');
    setUnitPriceInput('0');
    setEditingIndex(null);
  }

  function startEditItem(index: number) {
    const item = items[index];
    if (!item) return;
    setEditingIndex(index);
    setSelectedProductId(item.productId);
    setSelectedProductName(item.productName);
    setQuantityInput(String(item.quantity));
    setUnitPriceInput(formatMoneyInput(String(item.unitPrice)) || '0');
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) resetLineEditor();
  }

  function addOrUpdateItem() {
    const quantity = Math.max(1, Math.round(Number(quantityInput) || 0));
    const unitPrice = Math.max(0, Math.round(parseMoneyInput(unitPriceInput)));

    if (!selectedProductId || !selectedProductName || !quantity || !unitPrice) {
      return { ok: false as const, message: 'Selecciona producto, cantidad y precio válidos.' };
    }

    const nextItem: PurchaseInvoiceItem = {
      productId: selectedProductId,
      productName: selectedProductName,
      quantity,
      unitPrice,
    };

    if (editingIndex !== null) {
      setItems((prev) => prev.map((item, idx) => (idx === editingIndex ? nextItem : item)));
      resetLineEditor();
      return { ok: true as const, mode: 'updated' as const };
    }

    setItems((prev) => [...prev, nextItem]);
    resetLineEditor();
    return { ok: true as const, mode: 'added' as const };
  }

  async function submitInvoice() {
    if (!provider.trim() || !invoiceDate || items.length === 0) {
      return { ok: false as const, message: 'Completa proveedor, fecha y al menos un producto.' };
    }

    setIsSubmittingInvoice(true);

    try {
      const invoiceGroupId = generateObjectId();

      for (const item of items) {
        await createPurchase.mutateAsync({
          provider: provider.trim(),
          providerId,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          invoiceDate,
          invoiceGroupId,
          invoiceImageUrl: proofImageUri || undefined,
          paymentType,
          status: paymentType === 'CONTADO' ? 'PAGADA' : 'PENDIENTE',
        });
      }

      setStep(1);
      setProvider('');
      setProviderId(undefined);
      setInvoiceDate(todayISO());
      setProofImageUri(null);
      setPaymentType('CREDITO');
      setItems([]);
      resetLineEditor();

      return { ok: true as const, createdLines: items.length };
    } finally {
      setIsSubmittingInvoice(false);
    }
  }

  return {
    step,
    provider,
    setProvider: (value: string) => {
      setProvider(value);
      setProviderId(undefined);
    },
    providerId,
    setProviderId,
    selectProvider,
    invoiceDate,
    setInvoiceDate,
    proofImageUri,
    setProofImageUri,
    paymentType,
    setPaymentType,

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
    editingIndex,

    canGoNext,
    nextStep,
    prevStep,
    addOrUpdateItem,
    startEditItem,
    removeItem,
    submitInvoice,
    isSaving: isSubmittingInvoice || createPurchase.isPending,
  };
}
