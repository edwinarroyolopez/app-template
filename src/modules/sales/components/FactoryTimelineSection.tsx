import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme';
import type { SaleEvent } from '../types/sale.type';
import { SaleEventCard } from './SaleEventCard';

type Props = {
  timeline: SaleEvent[];
  onPhotoPress: (url: string) => void;
};

export function FactoryTimelineSection({ timeline, onPhotoPress }: Props) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Historial operativo</Text>
      <Text style={styles.sectionSubtitle}>Lo mas reciente primero, con foco en hitos y bloqueos.</Text>
      {timeline.length > 0 ? (
        timeline.map((event, idx) => (
          <SaleEventCard
            key={`${event.createdAt}-${idx}`}
            event={event}
            isLast={idx === timeline.length - 1}
            showPhotoPreviews
            showAmount={false}
            onPhotoPress={onPhotoPress}
          />
        ))
      ) : (
        <Text style={styles.emptyText}>Sin eventos registrados</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 12,
    gap: 10,
  },
  sectionTitle: { color: theme.colors.textPrimary, fontWeight: theme.weight.bold, fontSize: theme.font.sm },
  sectionSubtitle: { color: theme.colors.textMuted, fontSize: theme.font.xs },
  emptyText: { color: theme.colors.textMuted, textAlign: 'center' },
});
