import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Input } from '@/components/ui/Input';
import { ImageAttachmentField } from '@/components/ui/ImageAttachmentField';
import { OperationalModal } from '@/components/ui/OperationalModal';
import { theme } from '@/theme';
import { parseMoneyInput } from '@/utils/money';
import { PurchasePaymentSummary } from './PurchasePaymentSummary';

function formatAmount(value: number) {
  return `$${(value || 0).toLocaleString('es-CO')}`;
}

export function PurchasePaymentModal({
  visible,
  totalAmount,
  paidAmount,
  remainingAmount,
  amountInput,
  note,
  onAmountChange,
  onNoteChange,
  onClose,
  onSave,
  images,
  onImagesChange,
}: {
  visible: boolean;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  amountInput: string;
  note: string;
  onAmountChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  images: Array<{ uri: string; name?: string; type?: string }>;
  onImagesChange: (next: Array<{ uri: string; name?: string; type?: string }>) => void;
}) {
  const enteredAmount = parseMoneyInput(amountInput);
  const projectedBalance = Math.max(remainingAmount - enteredAmount, 0);

  return (
    <OperationalModal
      visible={visible}
      onClose={onClose}
      title="Registrar abono"
      subtitle="Actualiza saldo, estado y timeline en un solo paso."
      presentation="center"
      animationType="fade"
      maxHeightPercent={0.9}
      contentContainerStyle={styles.content}
      footer={
        <View style={styles.actionsRow}>
          <Pressable style={styles.ghostBtn} onPress={onClose}>
            <Text style={styles.ghostText}>Cancelar</Text>
          </Pressable>
          <Pressable style={styles.primaryBtn} onPress={onSave}>
            <Text style={styles.primaryText}>Guardar abono</Text>
          </Pressable>
        </View>
      }
    >
      <View style={styles.summaryWrap}>
        <PurchasePaymentSummary
          totalAmount={totalAmount}
          paidAmount={paidAmount}
          remainingAmount={remainingAmount}
        />
      </View>

      {enteredAmount > 0 && (
        <Text style={styles.projectionText}>
          Saldo despues del abono: {formatAmount(projectedBalance)}
        </Text>
      )}

      <Input
        value={amountInput}
        onChangeText={onAmountChange}
        placeholder="Monto del abono"
        keyboardType="numeric"
      />

      <Input
        value={note}
        onChangeText={onNoteChange}
        placeholder="Observacion opcional"
        style={styles.noteInput}
      />

      <ImageAttachmentField
        title="Evidencia opcional"
        helperText="Adjunta soporte del pago si lo tienes."
        images={images}
        onChange={onImagesChange}
        maxImages={1}
      />
    </OperationalModal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 8,
  },
  summaryWrap: {
    marginTop: 10,
    marginBottom: 5,
  },
  projectionText: {
    marginTop: 8,
    color: '#9FC0FF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  noteInput: {
    marginTop: 8,
  },
  actionsRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  ghostBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#0A1835',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    color: '#8EA4CC',
    fontWeight: theme.weight.semibold,
  },
  primaryBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#2E6BFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#F0F6FF',
    fontWeight: theme.weight.bold,
  },
});
