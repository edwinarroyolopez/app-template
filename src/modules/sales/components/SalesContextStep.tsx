import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ChevronDown, ChevronUp, Factory, Package, Truck } from 'lucide-react-native';

import { Input } from '@/components/ui/Input';
import { ImageAttachmentField, type AttachmentImage } from '@/components/ui/ImageAttachmentField';
import { PaymentMethodSelector } from '@/components/ui/PaymentMethodSelector';
import { theme } from '@/theme';
import type { PaymentMethod } from '@/types/payment-method';
import type { SaleFlowType } from '../types/sale.type';
import { salePriorityConfig, saleTypeConfig } from '../utils/saleStatus';
import { SaleCustomerSearchField } from './SaleCustomerSearchField';

type Props = {
  flowType: SaleFlowType;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (value: PaymentMethod) => void;
  onOpenSaleTypeSelector: () => void;

  clientId?: string;
  clientName: string;
  setClientName: (value: string) => void;
  clientPhone: string;
  setClientPhone: (value: string) => void;
  clientAddress: string;
  setClientAddress: (value: string) => void;

  onSearchCustomer: () => void;
  isSearchingCustomer: boolean;

  requiresSchedule: boolean;
  deliveryDate: string;
  setDeliveryDate: (value: string) => void;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  setPriority: (value: 'NORMAL' | 'HIGH' | 'URGENT') => void;
  initialPaymentInput: string;
  setInitialPaymentInput: (value: string) => void;

  observations: string;
  setObservations: (value: string) => void;
  paymentProofImages: AttachmentImage[];
  saleEvidenceImages: AttachmentImage[];
  onPaymentProofImagesChange: (images: AttachmentImage[]) => void;
  onSaleEvidenceImagesChange: (images: AttachmentImage[]) => void;
};

export function SalesContextStep({
  flowType,
  paymentMethod,
  setPaymentMethod,
  onOpenSaleTypeSelector,
  clientId,
  clientName,
  setClientName,
  clientPhone,
  setClientPhone,
  clientAddress,
  setClientAddress,
  onSearchCustomer,
  isSearchingCustomer,
  requiresSchedule,
  deliveryDate,
  setDeliveryDate,
  priority,
  setPriority,
  initialPaymentInput,
  setInitialPaymentInput,
  observations,
  setObservations,
  paymentProofImages,
  saleEvidenceImages,
  onPaymentProofImagesChange,
  onSaleEvidenceImagesChange,
}: Props) {
  const [showDeliveryPicker, setShowDeliveryPicker] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const requiresPaymentProof = paymentMethod !== 'EFECTIVO';

  const linkedCustomerLabel = useMemo(() => {
    if (!clientId) return undefined;
    return clientName.trim() || clientPhone.trim() || 'Cliente vinculado';
  }, [clientId, clientName, clientPhone]);

  return (
    <View style={styles.stepCard}>
      <Text style={styles.stepTitle}>Contexto comercial</Text>
      <Text style={styles.stepHint}>Define tipo, cliente y condiciones para construir la venta.</Text>

      <Text style={styles.label}>Tipo de venta</Text>
      <Pressable style={styles.selectorBtn} onPress={onOpenSaleTypeSelector}>
        <View style={styles.selectorLeft}>
          {flowType === 'IMMEDIATE' && <Package size={16} color="#9FC0FF" />}
          {flowType === 'MANUFACTURE' && <Factory size={16} color="#9FC0FF" />}
          {flowType === 'SPECIAL_ORDER' && <Truck size={16} color="#9FC0FF" />}
          <Text style={styles.selectorText}>{saleTypeConfig[flowType].label}</Text>
        </View>
        <Text style={styles.selectorAction}>Cambiar</Text>
      </Pressable>

      <Text style={styles.label}>Metodo de pago</Text>
      <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />

      <View style={styles.customerBlock}>
        <View style={styles.customerHeader}>
          <Text style={styles.customerTitle}>Cliente</Text>
          <Text style={styles.customerState}>{linkedCustomerLabel ? 'Vinculado' : 'Por resolver'}</Text>
        </View>

        <Input
          value={clientName}
          onChangeText={(value) => setClientName(value)}
          placeholder="Nombre del cliente"
        />

        <SaleCustomerSearchField
          phone={clientPhone}
          onChangePhone={(value) => setClientPhone(value)}
          onSearch={onSearchCustomer}
          isSearching={isSearchingCustomer}
          linkedCustomerLabel={linkedCustomerLabel}
        />

        <Input value={clientAddress} onChangeText={setClientAddress} placeholder="Direccion (opcional)" />
      </View>

      {requiresSchedule && (
        <View style={styles.scheduleBlock}>
          <Text style={styles.sectionTitle}>Condiciones de entrega</Text>

          <Text style={styles.label}>Fecha de entrega</Text>
          <Pressable style={styles.selectorBtn} onPress={() => setShowDeliveryPicker((prev) => !prev)}>
            <View style={styles.selectorLeft}>
              <Text style={styles.selectorText}>
                {new Date(deliveryDate).toLocaleDateString('es-CO', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <Text style={styles.selectorAction}>Editar</Text>
          </Pressable>

          {showDeliveryPicker && (
            <DateTimePicker
              mode="date"
              value={new Date(deliveryDate)}
              minimumDate={new Date()}
              onChange={(_, date) => {
                if (date) setDeliveryDate(date.toISOString());
                setShowDeliveryPicker(false);
              }}
            />
          )}

          <Text style={styles.label}>Prioridad</Text>
          <View style={styles.priorityRow}>
            {(['NORMAL', 'HIGH', 'URGENT'] as const).map((item) => {
              const cfg = salePriorityConfig[item];
              const active = priority === item;
              const activeChipStyle =
                item === 'HIGH'
                  ? styles.priorityChipHigh
                  : item === 'URGENT'
                    ? styles.priorityChipUrgent
                    : styles.priorityChipNormal;
              const activeTextStyle =
                item === 'HIGH'
                  ? styles.priorityChipTextHigh
                  : item === 'URGENT'
                    ? styles.priorityChipTextUrgent
                    : styles.priorityChipTextNormal;

              return (
                <Pressable
                  key={item}
                  style={[styles.priorityChip, active && activeChipStyle]}
                  onPress={() => setPriority(item)}
                >
                  <Text style={[styles.priorityChipText, active && activeTextStyle]}>{cfg.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Abono inicial</Text>
          <TextInput
            value={initialPaymentInput}
            onChangeText={setInitialPaymentInput}
            keyboardType="numeric"
            placeholder="Ej: 250.000"
            placeholderTextColor="#6F87B3"
            style={styles.inlineInput}
          />
        </View>
      )}

      <Pressable style={styles.optionalHeader} onPress={() => setShowOptional((prev) => !prev)}>
        <Text style={styles.optionalTitle}>Notas y evidencia</Text>
        {showOptional ? <ChevronUp size={16} color="#89A9D8" /> : <ChevronDown size={16} color="#89A9D8" />}
      </Pressable>

      {showOptional && (
        <View style={styles.optionalContent}>
          <Input
            value={observations}
            onChangeText={setObservations}
            placeholder="Observaciones de la venta (opcional)"
            multiline
            numberOfLines={3}
            style={styles.textarea}
          />

          <ImageAttachmentField
            title={`Comprobante de pago (${String(paymentMethod).toLowerCase()})`}
            helperText={requiresPaymentProof
              ? 'Puedes adjuntarlo ahora o despues desde el detalle de venta.'
              : 'No aplica para efectivo.'}
            emptyHint={requiresPaymentProof
              ? 'Comprobante pendiente por adjuntar.'
              : 'Sin comprobante (efectivo).'}
            images={paymentProofImages}
            onChange={onPaymentProofImagesChange}
            maxImages={1}
          />

          <ImageAttachmentField
            title="Evidencia comercial (opcional)"
            helperText="Adjunta factura, remision u otro soporte comercial."
            images={saleEvidenceImages}
            onChange={onSaleEvidenceImagesChange}
            maxImages={1}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stepCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#17345F',
    backgroundColor: '#081A33',
    padding: 12,
  },
  stepTitle: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
    marginBottom: 4,
  },
  stepHint: {
    color: '#8EA4CC',
    fontSize: theme.font.xs,
    marginBottom: 8,
  },
  label: {
    color: '#9FB4D9',
    fontSize: theme.font.xs,
    marginTop: 8,
    marginBottom: 6,
    fontWeight: theme.weight.semibold,
  },
  selectorBtn: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#274A7A',
    backgroundColor: '#112340',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingRight: 8,
  },
  selectorText: {
    color: '#DDE8FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
  },
  selectorAction: {
    color: '#9FC0FF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  customerBlock: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1D3D67',
    backgroundColor: '#0B2141',
    gap: 8,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customerTitle: {
    color: '#BFD0EE',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.bold,
  },
  customerState: {
    color: '#89A9D8',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  scheduleBlock: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#1A3762',
  },
  sectionTitle: {
    color: '#BFD0EE',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.bold,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
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
  priorityChipNormal: {
    borderColor: '#7E94BE',
    backgroundColor: '#7E94BE22',
  },
  priorityChipTextNormal: {
    color: '#7E94BE',
  },
  priorityChipHigh: {
    borderColor: '#F59E0B',
    backgroundColor: '#F59E0B22',
  },
  priorityChipTextHigh: {
    color: '#F59E0B',
  },
  priorityChipUrgent: {
    borderColor: '#F87171',
    backgroundColor: '#F8717122',
  },
  priorityChipTextUrgent: {
    color: '#F87171',
  },
  inlineInput: {
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A4E7D',
    backgroundColor: '#132A4D',
    paddingHorizontal: 10,
    color: '#DDE8FF',
  },
  optionalHeader: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E3F69',
    backgroundColor: '#0B1E3A',
    paddingHorizontal: 10,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionalTitle: {
    color: '#9FB4D9',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  optionalContent: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1A3762',
    backgroundColor: '#0B2040',
    padding: 10,
  },
  textarea: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
});
