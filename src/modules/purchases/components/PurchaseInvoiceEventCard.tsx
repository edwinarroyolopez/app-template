import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme';
import type { PurchaseInvoiceTimelineEvent } from '../hooks/usePurchaseInvoiceDetail';
import { SaleEventPhotoStrip } from '@/modules/sales/components/SaleEventPhotoStrip';

function eventLabel(type: string) {
  if (type === 'INVOICE_CREATED') return 'Factura creada';
  if (type === 'PAYMENT_RECORDED') return 'Abono registrado';
  if (type === 'INVOICE_PAID') return 'Factura pagada';
  return type.split('_').join(' ');
}

function formatAmount(value?: number) {
  return `$${Number(value || 0).toLocaleString('es-CO')}`;
}

export function PurchaseInvoiceEventCard({
  event,
  isLast,
  onPhotoPress,
}: {
  event: PurchaseInvoiceTimelineEvent;
  isLast: boolean;
  onPhotoPress?: (url: string) => void;
}) {
  const amountCop = Number(event.metadata?.amountCop || 0);

  return (
    <View style={styles.row}>
      <View style={styles.lineCol}>
        <View style={styles.dot} />
        {!isLast && <View style={styles.line} />}
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>{eventLabel(event.type)}</Text>
        {!!event.message && <Text style={styles.message}>{event.message}</Text>}
        {amountCop > 0 && <Text style={styles.meta}>Monto: {formatAmount(amountCop)}</Text>}
        {!!event.createdByName && <Text style={styles.meta}>Usuario: {event.createdByName}</Text>}
        {!event.createdByName && !!event.createdBy && <Text style={styles.meta}>Usuario: {event.createdBy}</Text>}
        {!!event.photos?.length && (
          <SaleEventPhotoStrip photos={event.photos} onPhotoPress={onPhotoPress} />
        )}
        <Text style={styles.date}>{new Date(event.createdAt).toLocaleString('es-CO')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  lineCol: {
    width: 18,
    alignItems: 'center',
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    marginTop: 5,
    backgroundColor: '#2E8CFF',
  },
  line: {
    width: 1,
    flex: 1,
    marginTop: 4,
    backgroundColor: '#214272',
  },
  card: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    padding: 10,
  },
  title: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.sm,
    textTransform: 'uppercase',
  },
  message: {
    marginTop: 4,
    color: '#BFD0EE',
    fontSize: theme.font.sm,
    lineHeight: 18,
  },
  meta: {
    marginTop: 4,
    color: '#9FB0CF',
    fontSize: theme.font.xs,
  },
  date: {
    marginTop: 6,
    color: '#8EA4CC',
    fontSize: 11,
  },
});
