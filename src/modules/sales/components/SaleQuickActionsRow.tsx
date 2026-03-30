import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Plus } from 'lucide-react-native';

import { theme } from '@/theme';

type Props = {
  onAddEvent: () => void;
  onAddPayment: () => void;
  pendingAmountCop: number;
};

export function SaleQuickActionsRow({ onAddEvent, onAddPayment, pendingAmountCop }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.hint}>
        {pendingAmountCop > 0
          ? 'Aun hay saldo pendiente en esta venta.'
          : 'Venta al dia. Registra evento solo si hay novedad.'}
      </Text>

      <View style={styles.row}>
        <Pressable style={styles.eventBtn} onPress={onAddEvent}>
          <Plus size={16} color={theme.colors.accent} />
          <Text style={styles.eventBtnText}>Agregar evento</Text>
        </Pressable>

        <Pressable style={[styles.paymentBtn, pendingAmountCop <= 0 && styles.paymentBtnDisabled]} onPress={onAddPayment}>
          <Plus size={16} color={pendingAmountCop > 0 ? '#F0F6FF' : '#9FB0CF'} />
          <Text style={[styles.paymentBtnText, pendingAmountCop <= 0 && styles.paymentBtnTextDisabled]}>Registrar abono</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
  },
  hint: {
    color: '#7E98C2',
    fontSize: 11,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  eventBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#0A1835',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  eventBtnText: {
    color: theme.colors.accent,
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  paymentBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2E6BFF66',
    backgroundColor: '#2E6BFF',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  paymentBtnDisabled: {
    backgroundColor: '#263550',
    borderColor: '#3A4C69',
  },
  paymentBtnText: {
    color: '#F0F6FF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.bold,
  },
  paymentBtnTextDisabled: {
    color: '#9FB0CF',
  },
});
