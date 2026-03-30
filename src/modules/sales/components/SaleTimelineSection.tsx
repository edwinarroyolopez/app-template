import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme';
import type { SaleEvent } from '../types/sale.type';
import { SaleEventCard } from './SaleEventCard';

type Props = {
  timeline: SaleEvent[];
  onPhotoPress: (url: string) => void;
  onOpenEventDetail: (event: SaleEvent) => void;
};

function isRichEvent(event: SaleEvent) {
  return (
    !!event.createdByName ||
    !!event.photos?.length ||
    !!Object.keys(event.metadata || {}).length ||
    !!event.statusSnapshot
  );
}

export function SaleTimelineSection({ timeline, onPhotoPress, onOpenEventDetail }: Props) {
  return (
    <View style={styles.wrap}>
      {timeline.length > 0 ? (
        timeline.map((event, idx) => (
          <SaleEventCard
            key={`${event.createdAt}-${idx}`}
            event={event}
            isLast={idx === timeline.length - 1}
            showPhotoPreviews
            onPhotoPress={onPhotoPress}
            onPress={isRichEvent(event) ? () => onOpenEventDetail(event) : undefined}
          />
        ))
      ) : (
        <View style={styles.emptyEvents}>
          <Text style={styles.emptyEventsText}>No hay eventos registrados.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 2,
  },
  emptyEvents: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 12,
  },
  emptyEventsText: {
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
