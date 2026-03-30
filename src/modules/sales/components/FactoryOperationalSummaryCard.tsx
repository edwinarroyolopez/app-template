import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AlertTriangle, CalendarClock, Clock3, Hammer, Package, Truck, UserRound } from 'lucide-react-native';

import { theme } from '@/theme';
import type { Sale, SaleEvent } from '../types/sale.type';
import {
  formatCommitmentDate,
  formatDelayedLabel,
  resolveProductName,
  resolveResponsibleName,
} from '../utils/factoryOrderDetail.helpers';

type Props = {
  mode: 'FACTORY' | 'DELIVERY';
  roleLabel: string;
  panelTitle: string;
  sale: Sale;
  statusLabel: string;
  statusColor: string;
  statusBg: string;
  priorityLabel: string;
  priorityColor: string;
  priorityBg: string;
  isDelayed: boolean;
  delayedDays: number;
  isOperationalUser: boolean;
  isManufactureBlockedByMaterials: boolean;
  latestMaterialStateEvent: SaleEvent | null;
  onAssignResponsible: () => void;
  onToggleMaterialState: () => void;
};

export function FactoryOperationalSummaryCard({
  mode,
  roleLabel,
  panelTitle,
  sale,
  statusLabel,
  statusColor,
  statusBg,
  priorityLabel,
  priorityColor,
  priorityBg,
  isDelayed,
  delayedDays,
  isOperationalUser,
  isManufactureBlockedByMaterials,
  latestMaterialStateEvent,
  onAssignResponsible,
  onToggleMaterialState,
}: Props) {
  const commitment = formatCommitmentDate(sale.deliveryDate);
  const responsibleName = resolveResponsibleName(sale);
  const hasResponsible = responsibleName !== 'Sin asignar';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          {mode === 'DELIVERY' ? <Truck size={16} color="#60A5FA" /> : <Hammer size={16} color="#60A5FA" />}
          <Text style={styles.title}>{panelTitle}</Text>
        </View>

        <View style={[styles.contextChip, { borderColor: `${statusColor}44`, backgroundColor: `${statusColor}15` }]}> 
          <Text style={[styles.contextChipText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.primaryRow}>
        <Package size={14} color={theme.colors.textMuted} />
        <Text style={styles.primaryText} numberOfLines={1}>Producto: {resolveProductName(sale)}</Text>
      </View>

      {mode === 'FACTORY' && (
        <View
          style={[
            styles.materialStateCard,
            isManufactureBlockedByMaterials ? styles.materialStateBlocked : styles.materialStateResumed,
          ]}
        >
          <View style={styles.materialStateHead}>
            <AlertTriangle size={15} color={isManufactureBlockedByMaterials ? '#FCA5A5' : '#86EFAC'} />
            <Text
              style={[
                styles.materialStateTitle,
                isManufactureBlockedByMaterials ? styles.materialBlockedText : styles.materialResumedText,
              ]}
            >
              {isManufactureBlockedByMaterials ? 'Detenido por materiales' : 'Sin bloqueo de materiales'}
            </Text>
          </View>

          <Text style={styles.materialStateSubtitle}>
            {isManufactureBlockedByMaterials
              ? 'No puede avanzar hasta gestionar materiales.'
              : 'Puede seguir avanzando sin freno por materiales.'}
          </Text>

          {latestMaterialStateEvent ? (
            <Text style={styles.materialMeta}>
              Ultima actualizacion: {new Date(latestMaterialStateEvent.createdAt).toLocaleString('es-CO')}
            </Text>
          ) : null}

          <Pressable
            style={[styles.materialActionBtn, isManufactureBlockedByMaterials ? styles.materialResumeBtn : styles.materialPauseBtn]}
            onPress={onToggleMaterialState}
          >
            <Text style={styles.materialActionText}>
              {isManufactureBlockedByMaterials ? 'Marcar materiales gestionados' : 'Marcar bloqueo por materiales'}
            </Text>
          </Pressable>
        </View>
      )}

      {isDelayed && (
        <View style={styles.delayChip}>
          <Clock3 size={14} color="#FCA5A5" />
          <Text style={styles.delayText}>{formatDelayedLabel(delayedDays)}</Text>
        </View>
      )}

      <View style={styles.operationalInfoBlock}>
        <View style={styles.row}>
          <UserRound size={14} color="#F8C74A" />
          <Text style={styles.valueText} numberOfLines={1}>{roleLabel}: {responsibleName}</Text>
          {!isOperationalUser && (
            <Pressable style={styles.assignInlineBtn} onPress={onAssignResponsible}>
              <Text style={styles.assignInlineText}>{hasResponsible ? 'Cambiar' : 'Asignar'}</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.row}>
          <CalendarClock size={14} color={isDelayed ? '#FCA5A5' : '#FCD34D'} />
          <Text style={[styles.valueText, isDelayed && styles.valueTextDelayed]} numberOfLines={1}>
            Compromiso: {commitment}
          </Text>
        </View>
      </View>

      <View style={styles.metaChipsRow}>
        <View style={[styles.metaChip, { borderColor: `${priorityColor}66`, backgroundColor: priorityBg }]}> 
          <Text style={[styles.metaChipText, { color: priorityColor }]}>{priorityLabel}</Text>
        </View>
        <View style={[styles.metaChip, { borderColor: `${statusColor}55`, backgroundColor: statusBg }]}> 
          <Text style={[styles.metaChipText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      {(sale.product?.details || sale.product?.dimensions) && (
        <View style={styles.secondaryWrap}>
          {!!sale.product?.details && <Text style={styles.secondaryText}>Detalle: {sale.product.details}</Text>}
          {!!sale.product?.dimensions && <Text style={styles.secondaryText}>Dimensiones: {sale.product.dimensions}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 12,
    gap: 10,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  title: { color: '#60A5FA', fontWeight: theme.weight.bold, fontSize: theme.font.sm },
  contextChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  contextChipText: {
    fontSize: 10,
    fontWeight: theme.weight.semibold,
  },
  primaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  primaryText: { color: theme.colors.textPrimary, fontSize: theme.font.sm, fontWeight: theme.weight.semibold, flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  valueText: { color: theme.colors.textPrimary, fontSize: theme.font.sm, flex: 1 },
  valueTextDelayed: { color: '#FCA5A5' },
  assignInlineBtn: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#36527F',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  assignInlineText: {
    color: '#9FB0CF',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  delayChip: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#7A2630',
    backgroundColor: '#341720',
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  delayText: { color: '#FCA5A5', fontSize: theme.font.xs, fontWeight: theme.weight.semibold },
  operationalInfoBlock: {
    gap: 8,
  },
  metaChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  metaChipText: {
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  materialStateCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    gap: 7,
  },
  materialStateBlocked: {
    borderColor: '#7A2630',
    backgroundColor: '#341720',
  },
  materialStateResumed: {
    borderColor: '#2A5B3F',
    backgroundColor: '#112B21',
  },
  materialStateHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  materialStateTitle: {
    flex: 1,
    fontSize: theme.font.sm,
    fontWeight: theme.weight.bold,
  },
  materialStateSubtitle: {
    color: '#E2E8F0',
    fontSize: theme.font.xs,
  },
  materialBlockedText: { color: '#FCA5A5' },
  materialResumedText: { color: '#86EFAC' },
  materialMeta: {
    color: '#9FB0CF',
    fontSize: 11,
  },
  materialActionBtn: {
    height: 36,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  materialPauseBtn: {
    borderColor: '#FCA5A566',
    backgroundColor: '#4A1D23',
  },
  materialResumeBtn: {
    borderColor: '#86EFAC66',
    backgroundColor: '#1C3B2F',
  },
  materialActionText: {
    color: '#F8FAFC',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  secondaryWrap: {
    marginTop: 2,
    borderTopWidth: 1,
    borderColor: '#1A2D52',
    paddingTop: 8,
    gap: 4,
  },
  secondaryText: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
});
