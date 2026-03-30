import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Banknote, HandCoins } from 'lucide-react-native';

import { theme } from '@/theme';
import type { PurchasePaymentType } from '../types/purchase.type';

type Props = {
  visible: boolean;
  value: PurchasePaymentType;
  onClose: () => void;
  onChange: (value: PurchasePaymentType) => void;
};

const OPTIONS: Array<{
  value: PurchasePaymentType;
  label: string;
  icon: React.ComponentType<any>;
}> = [
  { value: 'CONTADO', label: 'De contado', icon: Banknote },
  { value: 'CREDITO', label: 'A credito', icon: HandCoins },
];

export function PurchasePaymentTypeSelectorModal({ visible, value, onClose, onChange }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={8}>
              <ArrowLeft size={20} color={theme.colors.textPrimary} />
            </Pressable>
            <Text style={styles.headerTitle}>Tipo de compra</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.content}>
            {OPTIONS.map((option) => {
              const Icon = option.icon;
              const active = value === option.value;

              return (
                <Pressable
                  key={option.value}
                  style={[styles.flowCard, active && styles.flowCardActive]}
                  onPress={() => {
                    onChange(option.value);
                    onClose();
                  }}
                >
                  <Icon size={20} color={active ? theme.colors.accent : theme.colors.textMuted} />
                  <Text style={[styles.flowLabel, active && styles.flowLabelActive]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
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
    gap: 10,
    paddingBottom: 24,
  },
  flowCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  flowCardActive: {
    borderColor: '#2E6BFF',
    backgroundColor: '#0D224A',
  },
  flowLabel: {
    color: '#8EA4CC',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
  },
  flowLabelActive: {
    color: '#2E6BFF',
  },
});
