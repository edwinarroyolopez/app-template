import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AlertTriangle, CalendarClock, CircleDollarSign, Package, UserRound, ChevronRight } from 'lucide-react-native';

import { theme } from '@/theme';
import type { Sale } from '../types/sale.type';
import { deriveDelayedInfo } from '../utils/delayedSales';
import { normalizeSaleStatus, saleStatusConfig } from '../utils/saleStatus';

type DelayedSaleCardProps = {
  sale: Sale & { id: string };
  onViewDetail: () => void;
  isTopPriority?: boolean;
};

function money(value?: number) {
  return `$${Number(value || 0).toLocaleString('es-CO')}`;
}

function delayedSeverity(days: number) {
  if (days >= 5) {
    return {
      label: `${days} dias retrasada`,
      textColor: '#FECACA',
      borderColor: '#7A2630',
      bgColor: '#341720',
    };
  }
  if (days >= 3) {
    return {
      label: `${days} dias retrasada`,
      textColor: '#FCD34D',
      borderColor: '#6E5321',
      bgColor: '#2A2110',
    };
  }
  return {
    label: `${days} dias retrasada`,
    textColor: '#FCA5A5',
    borderColor: '#6B2B35',
    bgColor: '#281822',
  };
}

export function DelayedSaleCard({ sale, onViewDetail, isTopPriority = false }: DelayedSaleCardProps) {
  const derived = deriveDelayedInfo(sale);
  const delayedDays = Number(sale.delayedDays ?? derived.delayedDays ?? 0);
  const status = normalizeSaleStatus(sale.status);
  const statusUI = saleStatusConfig[status];
  const severity = delayedSeverity(Math.max(1, delayedDays));

  const responsible = sale.responsibleEmployee
    ? `${sale.responsibleEmployee.name || ''} ${sale.responsibleEmployee.lastName || ''}`.trim()
    : 'Sin responsable asignado';

  const client = sale.client?.name || 'Cliente pendiente';
  const product = sale.product?.name || 'Producto sin definir';
  const commitment = sale.deliveryDate
    ? `Compromiso ${new Date(sale.deliveryDate).toLocaleDateString('es-CO')}`
    : 'Compromiso sin fecha registrada';

  return (
    <Pressable style={[styles.card, isTopPriority && styles.cardTopPriority]} onPress={onViewDetail}>
      <View style={styles.topRow}>
        <View style={[styles.delayBadge, { borderColor: severity.borderColor, backgroundColor: severity.bgColor }]}> 
          <AlertTriangle size={13} color={severity.textColor} />
          <Text style={[styles.delayBadgeText, { color: severity.textColor }]}>{severity.label}</Text>
        </View>

        {isTopPriority ? <Text style={styles.priorityText}>prioridad 1</Text> : null}
      </View>

      <View style={styles.responsibleRow}>
        <UserRound size={14} color="#AFC1E0" />
        <Text style={styles.responsibleText} numberOfLines={1}>
          {responsible}
        </Text>
      </View>

      <View style={styles.commitmentRow}>
        <CalendarClock size={13} color="#FCD34D" />
        <Text style={styles.commitmentText} numberOfLines={1}>{commitment}</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText} numberOfLines={1}>{client}</Text>
        <View style={styles.metaDivider} />
        <View style={styles.productWrap}>
          <Package size={12} color="#8EA4CC" />
          <Text style={styles.metaText} numberOfLines={1}>{product}</Text>
        </View>
      </View>

      <View style={styles.contextRow}>
        <View style={[styles.statusChip, { borderColor: `${statusUI.color}44`, backgroundColor: statusUI.bg }]}> 
          <Text style={[styles.statusChipText, { color: statusUI.color }]}>{statusUI.label}</Text>
        </View>

        <View style={styles.amountWrap}>
          <CircleDollarSign size={12} color="#7E94BE" />
          <Text style={styles.amountText} numberOfLines={1}>{money(sale.amountCop)}</Text>
        </View>

        <View style={styles.detailCtaWrap}>
          <Text style={styles.detailCta}>Resolver</Text>
          <ChevronRight size={13} color="#9EC2FF" />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#1F3765',
    borderRadius: 14,
    backgroundColor: '#0A1835',
    padding: 12,
    marginBottom: 9,
    gap: 7,
  },
  cardTopPriority: {
    borderColor: '#7A2630',
    backgroundColor: '#111D39',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  delayBadge: {
    minHeight: 24,
    borderWidth: 1,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
  },
  delayBadgeText: {
    fontSize: 11,
    fontWeight: theme.weight.bold,
  },
  priorityText: {
    color: '#FCA5A5',
    fontSize: 10,
    fontWeight: theme.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statusChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: theme.weight.semibold,
    textTransform: 'uppercase',
  },
  responsibleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  responsibleText: {
    flex: 1,
    color: '#EAF1FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
  },
  amountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amountText: {
    color: '#7E94BE',
    fontSize: 11,
    fontWeight: theme.weight.medium,
  },
  commitmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commitmentText: {
    flex: 1,
    color: '#FCD34D',
    fontSize: 12,
    fontWeight: theme.weight.semibold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  metaDivider: {
    width: 1,
    height: 10,
    backgroundColor: '#2A4470',
  },
  productWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    flex: 1,
    color: '#8EA4CC',
    fontSize: 11,
  },
  detailCta: {
    color: '#9EC2FF',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  contextRow: {
    marginTop: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  detailCtaWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
