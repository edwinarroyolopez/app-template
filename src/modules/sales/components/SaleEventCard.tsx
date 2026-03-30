import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CircleDot } from 'lucide-react-native';

import { theme } from '@/theme';
import type { SaleEvent } from '../types/sale.type';
import { normalizeSaleStatus, saleStatusConfig } from '../utils/saleStatus';
import { MATERIALS_BLOCKED_EVENT, MATERIALS_RESUMED_EVENT } from '../utils/factoryOrderDetail.constants';
import { getEventMessage, getEventTitle } from '../utils/factoryOrderDetail.helpers';
import { SaleEventPhotoStrip } from './SaleEventPhotoStrip';

type Props = {
  event: SaleEvent;
  isLast: boolean;
  onPress?: () => void;
  showAmount?: boolean;
  showPhotoPreviews?: boolean;
  onPhotoPress?: (url: string) => void;
};

function resolveSnapshot(event: SaleEvent) {
  if (event.statusSnapshot) {
    const normalized = normalizeSaleStatus(event.statusSnapshot);
    return {
      label: event.statusLabel || saleStatusConfig[normalized].label,
      color: event.statusColor || saleStatusConfig[normalized].color,
      bg: `${event.statusColor || saleStatusConfig[normalized].color}22`,
    };
  }

  const metadataTo = typeof event.metadata?.to === 'string' ? event.metadata.to : undefined;
  if (metadataTo && metadataTo in saleStatusConfig) {
    const normalized = normalizeSaleStatus(metadataTo);
    return {
      label: saleStatusConfig[normalized].label,
      color: saleStatusConfig[normalized].color,
      bg: saleStatusConfig[normalized].bg,
    };
  }

  return null;
}

function money(value?: number) {
  return `$${Number(value || 0).toLocaleString('es-CO')}`;
}

export function SaleEventCard({
  event,
  isLast,
  onPress,
  showAmount = true,
  showPhotoPreviews = false,
  onPhotoPress,
}: Props) {
  const snapshot = resolveSnapshot(event);
  const isMaterialsBlocked = event.type === MATERIALS_BLOCKED_EVENT;
  const isMaterialsResumed = event.type === MATERIALS_RESUMED_EVENT;
  const title = getEventTitle(event.type);
  const message = getEventMessage(event);
  const actor = event.createdByName || event.createdBy || 'Sistema';

  return (
    <View style={styles.eventRow}>
      <View style={styles.eventLineCol}>
        <CircleDot size={14} color={theme.colors.accent} />
        {!isLast && <View style={styles.eventLine} />}
      </View>

      <Pressable
        style={[
          styles.eventCard,
          isMaterialsBlocked && styles.materialBlockedCard,
          isMaterialsResumed && styles.materialResumedCard,
        ]}
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={styles.headerRow}>
          <Text
            style={[
              styles.eventType,
              isMaterialsBlocked && styles.materialBlockedType,
              isMaterialsResumed && styles.materialResumedType,
            ]}
          >
            {title}
          </Text>
          {snapshot && (
            <View style={[styles.statusTag, { borderColor: `${snapshot.color}66`, backgroundColor: snapshot.bg }]}>
              <Text style={[styles.statusTagText, { color: snapshot.color }]}>{snapshot.label}</Text>
            </View>
          )}
        </View>

        <Text style={styles.eventMessage}>{message}</Text>
        {!!event.metadata?.reason && <Text style={styles.eventReason}>Motivo: {event.metadata.reason}</Text>}
        {!!(showAmount && event.metadata?.amountCop) && (
          <Text style={styles.eventReason}>Monto: {money(Number(event.metadata.amountCop))}</Text>
        )}
        <Text style={styles.eventUser}>Registro: {actor}</Text>
        {!!(showPhotoPreviews && event.photos?.length) && (
          <SaleEventPhotoStrip photos={event.photos} onPhotoPress={onPhotoPress} />
        )}
        <Text style={styles.eventDate}>{new Date(event.createdAt).toLocaleString('es-CO')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  eventLineCol: {
    alignItems: 'center',
    width: 18,
  },
  eventLine: {
    width: 1,
    flex: 1,
    backgroundColor: '#2E4C7E',
    marginTop: 2,
  },
  eventCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingVertical: 9,
    paddingHorizontal: 10,
  },
  materialBlockedCard: {
    borderColor: '#7A2630',
    backgroundColor: '#341720',
  },
  materialResumedCard: {
    borderColor: '#2A5B3F',
    backgroundColor: '#112B21',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  eventType: {
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: theme.weight.bold,
    flex: 1,
  },
  materialBlockedType: {
    color: '#FCA5A5',
  },
  materialResumedType: {
    color: '#86EFAC',
  },
  statusTag: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: theme.weight.bold,
  },
  eventMessage: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.sm,
    lineHeight: 17,
  },
  eventReason: {
    marginTop: 4,
    color: '#BFD0EE',
    fontSize: theme.font.xs,
  },
  eventUser: {
    marginTop: 4,
    color: '#91A8D4',
    fontSize: 11,
  },
  eventDate: {
    marginTop: 5,
    color: theme.colors.textMuted,
    fontSize: 11,
  },
});
