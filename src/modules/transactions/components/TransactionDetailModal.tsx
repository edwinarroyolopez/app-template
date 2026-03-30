import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme';
import type { TransactionItem } from '../types/transaction.type';

function money(value: number) {
  return `$${Number(value || 0).toLocaleString('es-CO')}`;
}

function originLabel(item: TransactionItem) {
  if (item.origin?.label) return item.origin.label;
  if (item.origin?.type === 'MANUAL') return 'Movimiento manual';
  return item.origin?.type?.replace(/_/g, ' ') || 'Origen';
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export function TransactionDetailModal({
  visible,
  item,
  onClose,
  onViewProof,
  onOpenOrigin,
}: {
  visible: boolean;
  item: TransactionItem | null;
  onClose: () => void;
  onViewProof?: () => void;
  onOpenOrigin?: () => void;
}) {
  if (!item) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Detalle del movimiento</Text>
          <ScrollView style={styles.content}>
            <DetailRow
              label="Tipo"
              value={item.kind === 'INCOME' ? 'Ingreso' : 'Egreso'}
            />
            <DetailRow
              label="Monto"
              value={`${item.kind === 'INCOME' ? '+' : '-'}${money(item.amountCop)}`}
            />
            <DetailRow label="Titulo" value={item.title || 'Sin titulo'} />
            <DetailRow label="Categoria" value={item.category || 'Sin categoria'} />
            <DetailRow label="Notas" value={item.notes || 'Sin notas'} />
            <DetailRow label="Origen" value={originLabel(item)} />
            <DetailRow
              label="Fecha"
              value={new Date(item.date).toLocaleString('es-CO')}
            />
            <DetailRow
              label="Creador"
              value={
                item.createdBy?.name ||
                item.createdBy?.id ||
                item.createdByUserId ||
                'Sin dato'
              }
            />
            <DetailRow
              label="Comprobante"
              value={item.manualProof?.url ? 'Adjunto' : 'No adjunto'}
            />
          </ScrollView>

          <View style={styles.actionsRow}>
            {item.manualProof?.url && onViewProof ? (
              <Pressable style={styles.secondaryBtn} onPress={onViewProof}>
                <Text style={styles.secondaryText}>Ver comprobante</Text>
              </Pressable>
            ) : null}
            {onOpenOrigin ? (
              <Pressable style={styles.secondaryBtn} onPress={onOpenOrigin}>
                <Text style={styles.secondaryText}>Ver origen</Text>
              </Pressable>
            ) : null}
          </View>

          <Pressable style={styles.primaryBtn} onPress={onClose}>
            <Text style={styles.primaryText}>Cerrar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#08142D',
    padding: 12,
    maxHeight: '82%',
    gap: 10,
  },
  title: {
    color: '#EAF1FF',
    fontSize: theme.font.md,
    fontWeight: theme.weight.bold,
  },
  content: {
    maxHeight: 360,
  },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: '#1A3158',
    paddingVertical: 8,
    gap: 3,
  },
  label: {
    color: '#8EA4CC',
    fontSize: 11,
  },
  value: {
    color: '#DDE8FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  secondaryBtn: {
    minHeight: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A4E7D',
    backgroundColor: '#0F2748',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  secondaryText: {
    color: '#9FC0FF',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  primaryBtn: {
    minHeight: 38,
    borderRadius: 10,
    backgroundColor: '#2E6BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryText: {
    color: '#F0F6FF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.bold,
  },
});
