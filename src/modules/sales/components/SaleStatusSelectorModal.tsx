import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react-native';

import { theme } from '@/theme';
import type { SaleStatus } from '../types/sale.type';
import { saleStatusConfig } from '../utils/saleStatus';

type Props = {
  visible: boolean;
  currentStatus: SaleStatus;
  options: SaleStatus[];
  onClose: () => void;
  onSelect: (status: SaleStatus) => void;
};

export function SaleStatusSelectorModal({ visible, currentStatus, options, onClose, onSelect }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={8}>
              <ArrowLeft size={20} color={theme.colors.textPrimary} />
            </Pressable>
            <Text style={styles.headerTitle}>Cambiar estado</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.content}>
            {options.map((status) => {
              const cfg = saleStatusConfig[status];
              const active = currentStatus === status;

              return (
                <Pressable
                  key={status}
                  style={[styles.optionCard, active && { borderColor: cfg.color, backgroundColor: `${cfg.color}22` }]}
                  onPress={() => {
                    onSelect(status);
                    onClose();
                  }}
                >
                  <View style={styles.optionLeft}>
                    <View style={[styles.colorDot, { backgroundColor: cfg.color }]} />
                    <Text style={[styles.optionLabel, active && { color: cfg.color }]}>{cfg.label}</Text>
                  </View>

                  {active ? (
                    <CheckCircle2 size={18} color={cfg.color} />
                  ) : (
                    <Circle size={18} color={theme.colors.textMuted} />
                  )}
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
  headerSpacer: { width: 20 },
  content: {
    padding: 16,
    gap: 10,
    paddingBottom: 24,
  },
  optionCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionLabel: {
    color: '#C8D7F4',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
  },
});
