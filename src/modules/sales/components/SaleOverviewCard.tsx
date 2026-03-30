import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FileText, Image as ImageIcon, Phone, UserRound } from 'lucide-react-native';

import { theme } from '@/theme';

function money(value?: number) {
  return `$${Number(value || 0).toLocaleString('es-CO')}`;
}

type Props = {
  totalAmountCop: number;
  statusLabel: string;
  statusColor: string;
  statusBg: string;
  date: string;
  paymentMethod?: string;
  saleTypeLabel: string;
  priorityLabel: string;
  priorityColor: string;
  priorityBg: string;
  paymentStatusLabel: string;
  paymentStatusColor: string;
  paymentStatusBg: string;
  clientName?: string;
  clientPhone?: string;
  invoiceImageUrl?: string;
  productImageUrl?: string;
  onOpenInvoiceImage?: () => void;
  onOpenProductImage?: () => void;
};

export function SaleOverviewCard({
  totalAmountCop,
  statusLabel,
  statusColor,
  statusBg,
  date,
  paymentMethod,
  saleTypeLabel,
  priorityLabel,
  priorityColor,
  priorityBg,
  paymentStatusLabel,
  paymentStatusColor,
  paymentStatusBg,
  clientName,
  clientPhone,
  invoiceImageUrl,
  productImageUrl,
  onOpenInvoiceImage,
  onOpenProductImage,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.kicker}>Resumen de la venta</Text>
          <Text style={styles.amount}>{money(totalAmountCop)}</Text>
          <Text style={styles.metaText}>{new Date(date).toLocaleString('es-CO')} - {paymentMethod || 'Sin metodo'}</Text>
        </View>

        <View style={styles.assetActionsRow}>
          <Pressable
            style={[styles.assetActionBtn, !invoiceImageUrl && styles.assetActionBtnDisabled]}
            disabled={!invoiceImageUrl}
            onPress={onOpenInvoiceImage}
          >
            <FileText size={16} color={invoiceImageUrl ? theme.colors.accent : '#5A6F95'} />
          </Pressable>

          <Pressable
            style={[styles.assetActionBtn, !productImageUrl && styles.assetActionBtnDisabled]}
            disabled={!productImageUrl}
            onPress={onOpenProductImage}
          >
            <ImageIcon size={16} color={productImageUrl ? theme.colors.accent : '#5A6F95'} />
          </Pressable>
        </View>
      </View>

      <View style={[styles.statusChip, { backgroundColor: statusBg, borderColor: `${statusColor}66` }]}>
        <Text style={[styles.statusChipText, { color: statusColor }]}>{statusLabel}</Text>
      </View>

      <View style={styles.badgesRow}>
        <View style={styles.metaChip}>
          <Text style={styles.metaChipText}>{saleTypeLabel}</Text>
        </View>
        <View style={[styles.metaChip, { backgroundColor: priorityBg, borderColor: `${priorityColor}66` }]}>
          <Text style={[styles.metaChipText, { color: priorityColor }]}>{priorityLabel}</Text>
        </View>
        <View style={[styles.metaChip, { backgroundColor: paymentStatusBg, borderColor: `${paymentStatusColor}66` }]}>
          <Text style={[styles.metaChipText, { color: paymentStatusColor }]}>{paymentStatusLabel}</Text>
        </View>
      </View>

      <View style={styles.clientBlock}>
        <View style={styles.infoRow}>
          <UserRound size={15} color={theme.colors.textMuted} />
          <Text style={styles.infoLabel}>Cliente</Text>
          <Text style={styles.infoValue}>{clientName || 'No definido'}</Text>
        </View>

        {!!clientPhone && (
          <View style={styles.infoRow}>
            <Phone size={15} color={theme.colors.textMuted} />
            <Text style={styles.infoLabel}>Telefono</Text>
            <Text style={styles.infoValue}>{clientPhone}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  kicker: {
    color: '#89A9D8',
    fontSize: 11,
    marginBottom: 3,
  },
  amount: {
    color: theme.colors.textPrimary,
    fontSize: 32,
    fontWeight: theme.weight.bold,
  },
  metaText: {
    marginTop: 2,
    color: theme.colors.textMuted,
    fontSize: theme.font.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  assetActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assetActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetActionBtnDisabled: {
    opacity: 0.5,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusChip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: theme.weight.bold,
  },
  metaChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#0A1835',
  },
  metaChipText: {
    color: '#9FB0CF',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  clientBlock: {
    borderTopWidth: 1,
    borderColor: '#1A2D52',
    paddingTop: 8,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.font.sm,
  },
  infoValue: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
  },
});
