import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Banknote, CreditCard, Landmark } from 'lucide-react-native';

import { theme } from '@/theme';
import type { PaymentMethod } from '@/types/payment-method';

const METHOD_CONFIG: Record<PaymentMethod, { label: string; icon: React.ComponentType<any> }> = {
  EFECTIVO: { label: 'Efectivo', icon: Banknote },
  TRANSFERENCIA: { label: 'Transferencia', icon: Landmark },
  TARJETA: { label: 'Tarjeta', icon: CreditCard },
};

export function PaymentMethodSelector({
  value,
  onChange,
  label,
  disabled,
  methods,
}: {
  value: PaymentMethod;
  onChange: (next: PaymentMethod) => void;
  label?: string;
  disabled?: boolean;
  methods?: PaymentMethod[];
}) {
  const availableMethods = methods?.length ? methods : (Object.keys(METHOD_CONFIG) as PaymentMethod[]);

  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        {availableMethods.map((method) => {
          const active = value === method;
          const Icon = METHOD_CONFIG[method].icon;

          return (
            <Pressable
              key={method}
              style={[styles.chip, active && styles.chipActive, disabled && styles.chipDisabled]}
              onPress={() => onChange(method)}
              disabled={disabled}
            >
              <Icon size={14} color={active ? '#DDE8FF' : '#8EA4CC'} />
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{METHOD_CONFIG[method].label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: '#9FB4D9',
    fontSize: theme.font.xs,
    marginBottom: 6,
    fontWeight: theme.weight.semibold,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipActive: {
    borderColor: '#2E6BFF',
    backgroundColor: '#0D224A',
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipText: {
    color: '#8EA4CC',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  chipTextActive: {
    color: '#DDE8FF',
  },
});
