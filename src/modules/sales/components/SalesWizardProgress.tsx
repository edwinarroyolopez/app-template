import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme';

type Props = {
  step: 1 | 2 | 3;
};

export function SalesWizardProgress({ step }: Props) {
  const progress = step === 1 ? 34 : step === 2 ? 67 : 100;
  const stepLabel = step === 1 ? 'Contexto comercial' : step === 2 ? 'Lineas de venta' : 'Confirmacion';

  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>Constructor de venta</Text>
      <View style={styles.row}>
        <Text style={styles.titleText}>{stepLabel}</Text>
        <Text style={styles.stepText}>Paso {step} de 3</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 10,
  },
  kicker: {
    color: '#7E9CCA',
    fontSize: 11,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  stepText: {
    color: '#8BA6D3',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  titleText: {
    color: '#DDE8FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.bold,
  },
  track: {
    height: 5,
    borderRadius: 999,
    backgroundColor: '#173660',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#2E6BFF',
  },
});
