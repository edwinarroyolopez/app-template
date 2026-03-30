import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CalendarClock, Clock3, Eye, Package, UserRound, Workflow } from 'lucide-react-native';

import { theme } from '@/theme';
import type { Sale } from '../types/sale.type';
import {
  normalizePaymentStatus,
  normalizeSalePriority,
  normalizeSaleStatus,
  normalizeSaleType,
  salePaymentStatusConfig,
  salePriorityConfig,
  saleStatusConfig,
  saleTypeConfig,
} from '../utils/saleStatus';
import { deriveDelayedInfo } from '../utils/delayedSales';

type Props = {
  sale: Sale & { id: string };
  onViewDetail: () => void;
};

function money(value?: number) {
  return `$${Number(value || 0).toLocaleString('es-CO')}`;
}

export function SaleCard({ sale, onViewDetail }: Props) {
  const saleType = normalizeSaleType(sale.saleType, sale.deliveryType);
  const status = normalizeSaleStatus(sale.status);
  const paymentStatus = normalizePaymentStatus(sale.paymentStatus);
  const priority = normalizeSalePriority(sale.priority);

  const statusUI = saleStatusConfig[status];
  const paymentUI = salePaymentStatusConfig[paymentStatus];
  const priorityUI = salePriorityConfig[priority];

  const hasEvents = (sale.events?.length || 0) > 0;
  const clientSummary = sale.client?.name || 'Cliente pendiente';
  const saleLines = Array.isArray(sale.items) ? sale.items : [];
  const primaryLine = saleLines[0];
  const lineCount = saleLines.length;
  const extraLines = Math.max(lineCount - 1, 0);
  const productSummary =
    primaryLine?.productName || sale.product?.name || 'Producto sin definir';
  const showDeliveryDate = saleType !== 'IMMEDIATE';
  const delayed = deriveDelayedInfo(sale);
  const isDelayed = sale.isDelayed ?? delayed.isDelayed;
  const delayedDays = sale.delayedDays ?? delayed.delayedDays;
  const showPriorityChip = priority !== 'NORMAL';
  const responsible = sale.responsibleEmployee
    ? `${sale.responsibleEmployee.name || ''} ${sale.responsibleEmployee.lastName || ''}`.trim()
    : undefined;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.amountText} numberOfLines={1}>{money(sale.amountCop)}</Text>

        <View style={[styles.statusChip, { backgroundColor: statusUI.bg, borderColor: `${statusUI.color}55` }]}> 
          <Text style={[styles.statusChipText, { color: statusUI.color }]}>{statusUI.label}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaLeft}>
          <Text style={styles.methodText} numberOfLines={1}>{sale.paymentMethod}</Text>
          <Text style={styles.dateText} numberOfLines={1}>
            {new Date(sale.date).toLocaleDateString('es-CO')} {'•'}{' '}
            {new Date(sale.date).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        <View style={[styles.statusChip, styles.statusChipSecondary, { backgroundColor: paymentUI.bg, borderColor: `${paymentUI.color}44` }]}> 
          <Text style={[styles.statusChipText, { color: paymentUI.color }]}>{paymentUI.label}</Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <UserRound size={14} color={theme.colors.textMuted} />
          <Text style={styles.summaryText} numberOfLines={1}>{clientSummary}</Text>
        </View>

        <View style={styles.summaryItem}>
          <Package size={14} color={theme.colors.textMuted} />
          <Text style={styles.summaryText} numberOfLines={1}>
            {productSummary}
            {extraLines > 0 ? ` +${extraLines}` : ''}
          </Text>
        </View>
      </View>

      {lineCount > 1 ? (
        <Text style={styles.linesHint} numberOfLines={1}>
          {lineCount} lineas en esta venta
        </Text>
      ) : null}

      <View style={styles.deliveryRow}>
        {isDelayed && delayedDays > 0 && (
          <View style={[styles.deliveryChip, styles.delayedChip]}>
            <Clock3 size={12} color="#F87171" />
            <Text style={[styles.deliveryText, styles.delayedText]}>{delayedDays} dias retrasada</Text>
          </View>
        )}

        {showDeliveryDate && (
          <View style={styles.deliveryChip}>
            <CalendarClock size={12} color={theme.colors.warning} />
            <Text style={styles.deliveryText}>
              {sale.deliveryDate
                ? `Entrega ${new Date(sale.deliveryDate).toLocaleDateString('es-CO')}`
                : 'Entrega pendiente'}
            </Text>
          </View>
        )}

        <View style={styles.deliveryChip}>
          <Workflow size={12} color={theme.colors.accent} />
          <Text style={styles.deliveryText}>{saleTypeConfig[saleType].label}</Text>
        </View>

        {showPriorityChip && (
          <View style={[styles.deliveryChip, { borderColor: `${priorityUI.color}66`, backgroundColor: priorityUI.bg }]}> 
            <Text style={[styles.deliveryText, { color: priorityUI.color }]}>{priorityUI.label}</Text>
          </View>
        )}
      </View>

      {isDelayed && (
        <Text style={styles.responsibleText} numberOfLines={1}>
          Responsable: {responsible || 'Sin asignar'}
        </Text>
      )}

      <View style={styles.actionsRow}>
        <View style={styles.eventIndicator}>
          <View style={[styles.eventDot, hasEvents && styles.eventDotActive]} />
          <Text style={styles.eventText}>{hasEvents ? `${sale.events?.length} eventos` : 'Sin eventos'}</Text>
        </View>

        <Pressable style={styles.eyeButton} onPress={onViewDetail}>
          <Eye size={16} color={theme.colors.accent} />
          <Text style={styles.eyeButtonText}>Ver detalle</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    padding: 13,
    marginBottom: 10,
    gap: 7,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  metaLeft: {
    flex: 1,
    minWidth: 0,
  },
  methodText: {
    color: '#9FB0CF',
    fontSize: 11,
    fontWeight: theme.weight.medium,
  },
  dateText: {
    marginTop: 1,
    color: theme.colors.textMuted,
    fontSize: 10,
  },
  statusChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  statusChipSecondary: {
    opacity: 0.88,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: theme.weight.semibold,
    textTransform: 'uppercase',
  },
  amountText: {
    color: theme.colors.textPrimary,
    fontWeight: theme.weight.bold,
    fontSize: 28,
    lineHeight: 32,
    flex: 1,
  },
  summaryRow: {
    gap: 6,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryText: {
    flex: 1,
    color: '#CBD8F2',
    fontSize: theme.font.sm,
  },
  linesHint: {
    marginTop: -1,
    color: '#8EA4CC',
    fontSize: 11,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  deliveryChip: {
    borderWidth: 1,
    borderColor: '#1A3466',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0A1835',
  },
  deliveryText: {
    color: '#9FB0CF',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  actionsRow: {
    marginTop: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#445A84',
  },
  eventDotActive: {
    backgroundColor: theme.colors.accent,
  },
  eventText: {
    color: theme.colors.textMuted,
    fontSize: theme.font.xs,
  },
  eyeButton: {
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
  },
  eyeButtonText: {
    color: theme.colors.accent,
    fontWeight: theme.weight.semibold,
    fontSize: theme.font.xs,
  },
  delayedChip: {
    borderColor: '#7A2630',
    backgroundColor: '#341720',
  },
  delayedText: {
    color: '#FCA5A5',
  },
  responsibleText: {
    marginTop: 2,
    color: '#F8C74A',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
});
