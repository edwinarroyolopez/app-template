import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Clock3, PackageCheck } from 'lucide-react-native';

import { theme } from '@/theme';

type Props = {
  totalOrders: number;
  delayedOrders: number;
  maxDelayedDays: number;
};

export function ReadyForDeliveryFocusBanner({ totalOrders, delayedOrders, maxDelayedDays }: Props) {
  const hasRisk = delayedOrders > 0;

  return (
    <View style={[styles.wrap, hasRisk ? styles.wrapRisk : styles.wrapOk]}>
      <View style={[styles.badge, hasRisk ? styles.badgeRisk : styles.badgeOk]}>
        {hasRisk ? <Clock3 size={13} color="#FCA5A5" /> : <PackageCheck size={13} color="#86EFAC" />}
        <Text style={[styles.badgeText, hasRisk ? styles.badgeTextRisk : styles.badgeTextOk]}>{totalOrders}</Text>
      </View>

      <Text style={[styles.text, hasRisk ? styles.textRisk : styles.textOk]} numberOfLines={1}>
        {hasRisk
          ? `${delayedOrders} comprometidos. Prioriza ${maxDelayedDays} dias tarde.`
          : 'Pedidos listos al dia. Salida estable.'}
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
  wrapRisk: {
    borderColor: '#5A2430',
    backgroundColor: '#231420',
  },
  wrapOk: {
    borderColor: '#24543F',
    backgroundColor: '#12291F',
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
  badgeRisk: {
    borderColor: '#7A2630',
    backgroundColor: '#341720',
  },
  badgeOk: {
    borderColor: '#1F6F59',
    backgroundColor: '#0B2B25',
  },
  badgeText: {
    fontWeight: theme.weight.semibold,
    fontSize: 11,
  },
  badgeTextRisk: {
    color: '#FCA5A5',
  },
  badgeTextOk: {
    color: '#86EFAC',
  },
  text: {
    flex: 1,
    fontSize: 11,
    fontWeight: theme.weight.medium,
  },
  textRisk: {
    color: '#FECACA',
  },
  textOk: {
    color: '#BBF7D0',
  },
});
