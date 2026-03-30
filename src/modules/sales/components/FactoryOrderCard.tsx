import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CalendarClock, ChevronRight, Clock3, Hammer, UserRound } from 'lucide-react-native';

import { theme } from '@/theme';
import type { ManufacturingProcess } from '../types/sale.type';
import { deriveDelayedInfo } from '../utils/delayedSales';
import { normalizeSalePriority, salePriorityConfig, normalizeSaleStatus, saleStatusConfig } from '../utils/saleStatus';

type Props = {
  process: ManufacturingProcess;
  onPress: () => void;
  isTopPriority?: boolean;
};

function productionLabel(process: ManufacturingProcess) {
  return process.productName || 'Linea sin producto';
}

function commitmentText(date?: string) {
  if (!date) return 'Compromiso sin fecha';
  return `Compromiso ${new Date(date).toLocaleDateString('es-CO')}`;
}

export function FactoryOrderCard({ process, onPress, isTopPriority = false }: Props) {
  const derived = deriveDelayedInfo(process);
  const delayedDays = Number(process.delayedDays ?? derived.delayedDays ?? 0);
  const isDelayed = Boolean(process.isDelayed ?? derived.isDelayed);

  const priority = normalizeSalePriority(process.priority);
  const priorityUI = salePriorityConfig[priority];
  const status = normalizeSaleStatus(process.operationalStatus);
  const statusUI = saleStatusConfig[status];

  const manufacturer = process.responsibleEmployee
    ? `${process.responsibleEmployee.name || ''} ${process.responsibleEmployee.lastName || ''}`.trim()
    : 'Sin fabricante asignado';

  return (
    <Pressable style={[styles.card, isDelayed && styles.cardDelayed, isTopPriority && styles.cardTopPriority]} onPress={onPress}>
      <View style={styles.topRow}>
        <Text style={styles.productName} numberOfLines={1}>{productionLabel(process)}</Text>
        <View style={[styles.statusChip, { borderColor: `${statusUI.color}55`, backgroundColor: statusUI.bg }]}>
          <Text style={[styles.statusChipText, { color: statusUI.color }]}>{statusUI.label}</Text>
        </View>
      </View>

      <View style={styles.manufacturerRow}>
        <UserRound size={14} color="#F8C74A" />
        <Text style={styles.manufacturerText} numberOfLines={1}>{manufacturer}</Text>
      </View>

      <View style={styles.commitmentRow}>
        <CalendarClock size={13} color={isDelayed ? '#FCA5A5' : '#FCD34D'} />
          <Text style={[styles.commitmentText, isDelayed && styles.commitmentDelayed]} numberOfLines={1}>
          {commitmentText(process.commitmentDate)}
          </Text>
        </View>

        <Text style={styles.saleRef}>Venta #{process.saleCode}</Text>

      <View style={styles.contextRow}>
        {isDelayed && delayedDays > 0 ? (
          <View style={styles.delayedChip}>
            <Clock3 size={12} color="#FCA5A5" />
            <Text style={styles.delayedChipText}>{delayedDays} dias tarde</Text>
          </View>
        ) : (
          <View style={styles.onTimeChip}>
            <Hammer size={12} color="#93C5FD" />
            <Text style={styles.onTimeChipText}>En ritmo</Text>
          </View>
        )}

        <View style={[styles.priorityChip, { borderColor: `${priorityUI.color}66`, backgroundColor: priorityUI.bg }]}>
          <Text style={[styles.priorityText, { color: priorityUI.color }]}>{priorityUI.label}</Text>
        </View>

        <View style={styles.ctaWrap}>
          <Text style={styles.ctaText}>Resolver</Text>
          <ChevronRight size={13} color="#9EC2FF" />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    padding: 12,
    marginBottom: 9,
    gap: 8,
  },
  cardDelayed: {
    borderColor: '#6B2B35',
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
  productName: {
    flex: 1,
    color: '#EAF1FF',
    fontSize: theme.font.md,
    fontWeight: theme.weight.bold,
  },
  statusChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: theme.weight.semibold,
  },
  manufacturerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  manufacturerText: {
    flex: 1,
    color: '#F8C74A',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
  },
  commitmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commitmentText: {
    flex: 1,
    color: '#D8C58A',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  commitmentDelayed: {
    color: '#FCA5A5',
  },
  saleRef: {
    color: '#8EA4CC',
    fontSize: 11,
  },
  contextRow: {
    marginTop: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  delayedChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#7A2630',
    backgroundColor: '#341720',
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  delayedChipText: {
    color: '#FCA5A5',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  onTimeChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0E2647',
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  onTimeChipText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  priorityChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  ctaWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ctaText: {
    color: '#9EC2FF',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
});
