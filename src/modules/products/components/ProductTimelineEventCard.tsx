import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArrowDownRight, ArrowUpRight, CalendarClock, Info, UserRound, ArrowRight } from 'lucide-react-native';

import { theme } from '@/theme';

export type ProductTimelineEvent = {
  id: string;
  type: string;
  title: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  createdAt: string;
  createdByName: string;
};

type ProductTimelineEventCardProps = {
  event: ProductTimelineEvent;
};

export function ProductTimelineEventCard({ event }: ProductTimelineEventCardProps) {
  const isIncrease = event.quantity > 0;
  const isDecrease = event.quantity < 0;
  const ArrowIcon = isIncrease ? ArrowUpRight : ArrowDownRight;
  const quantityColor = isIncrease ? '#4ADE80' : isDecrease ? '#F87171' : '#8EA4CC';
  const quantityBg = isIncrease ? '#0E2C23' : isDecrease ? '#321722' : '#0D2447';
  const quantityBorder = isIncrease ? '#1F6F59' : isDecrease ? '#7A2630' : '#1F3765';
  const quantityText = `${event.quantity > 0 ? '+' : ''}${event.quantity}`;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.title}>{event.title}</Text>

        <View style={[styles.deltaBadge, { backgroundColor: quantityBg, borderColor: quantityBorder }]}>
          <ArrowIcon size={12} color={quantityColor} />
          <Text style={[styles.deltaText, { color: quantityColor }]}>{quantityText}</Text>
        </View>
      </View>

      <Text style={styles.stockShift}>
        Stock {event.previousStock} <ArrowRight size={12} color="#8EA4CC" /> {event.newStock}
      </Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <CalendarClock size={12} color="#8EA4CC" />
          <Text style={styles.metaText} numberOfLines={1}>
            {new Date(event.createdAt).toLocaleString('es-CO')}
          </Text>
        </View>

        <View style={styles.metaItem}>
          <UserRound size={12} color="#8EA4CC" />
          <Text style={styles.metaText} numberOfLines={1}>
            {event.createdByName}
          </Text>
        </View>
      </View>

      {!!event.reason && (
        <View style={styles.reasonRow}>
          <Info size={12} color="#8EA4CC" />
          <Text style={styles.reasonText} numberOfLines={2}>
            {event.reason}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 6,
    gap: 5,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    color: '#D8E6FF',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
    letterSpacing: 0.1,
  },
  deltaBadge: {
    height: 22,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  deltaText: {
    fontSize: 11,
    fontWeight: theme.weight.bold,
  },
  stockShift: {
    color: '#EAF1FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  metaItem: {
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
  reasonRow: {
    marginTop: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
  },
  reasonText: {
    flex: 1,
    color: '#8EA4CC',
    fontSize: 11,
    lineHeight: 15,
  },
});
