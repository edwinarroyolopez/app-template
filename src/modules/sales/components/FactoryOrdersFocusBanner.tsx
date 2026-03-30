import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Clock3, Hammer } from 'lucide-react-native';

import { theme } from '@/theme';

type Props = {
  totalOrders: number;
  delayedOrders: number;
  maxDelayedDays: number;
};

export function FactoryOrdersFocusBanner({ totalOrders, delayedOrders, maxDelayedDays }: Props) {
  const isCompromised = delayedOrders > 0;

  return (
    <View style={[styles.wrap, isCompromised ? styles.wrapCompromised : styles.wrapOnTrack]}>
      <View style={[styles.badge, isCompromised ? styles.badgeCompromised : styles.badgeOnTrack]}>
        {isCompromised ? <Clock3 size={13} color="#FCA5A5" /> : <Hammer size={13} color="#93C5FD" />}
        <Text style={[styles.badgeText, isCompromised ? styles.badgeTextCompromised : styles.badgeTextOnTrack]}>
          {totalOrders}
        </Text>
      </View>

      <Text style={[styles.text, isCompromised ? styles.textCompromised : styles.textOnTrack]} numberOfLines={1}>
        {isCompromised
          ? `${delayedOrders} comprometidos. Atiende primero ${maxDelayedDays} dias tarde.`
          : 'Produccion al dia. Sin compromisos vencidos.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 6,
    minHeight: 34,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wrapCompromised: {
    borderColor: '#5A2430',
    backgroundColor: '#231420',
  },
  wrapOnTrack: {
    borderColor: '#264867',
    backgroundColor: '#102237',
  },
  badge: {
    minWidth: 32,
    height: 20,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 6,
  },
  badgeCompromised: {
    borderColor: '#7A2630',
    backgroundColor: '#341720',
  },
  badgeOnTrack: {
    borderColor: '#1F3765',
    backgroundColor: '#0E2647',
  },
  badgeText: {
    fontWeight: theme.weight.semibold,
    fontSize: 11,
  },
  badgeTextCompromised: {
    color: '#FCA5A5',
  },
  badgeTextOnTrack: {
    color: '#93C5FD',
  },
  text: {
    flex: 1,
    fontSize: 11,
    fontWeight: theme.weight.medium,
  },
  textCompromised: {
    color: '#FECACA',
  },
  textOnTrack: {
    color: '#BFD7FF',
  },
});
