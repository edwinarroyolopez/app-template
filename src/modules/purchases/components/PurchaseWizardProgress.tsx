import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';

export function PurchaseWizardProgress({ step }: { step: 1 | 2 | 3 }) {
  const progress = step === 1 ? 34 : step === 2 ? 67 : 100;
  const stepLabel = step === 1 ? 'Informacion basica' : step === 2 ? 'Productos' : 'Resumen';

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.stepLabel}>Paso {step} de 3</Text>
        <Text style={styles.title}>{stepLabel}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    color: '#AFC3E6',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  stepLabel: {
    color: '#9FC0FF',
    fontSize: theme.font.xs,
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
