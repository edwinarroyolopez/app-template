import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CalendarClock, Package, TriangleAlert } from 'lucide-react-native';
import { theme } from '@/theme';

export function InventoryOperationalAlertsCard({ alerts }: { alerts: any }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Alertas operativas</Text>

      <View style={styles.alertBlock}>
        <View style={styles.alertHeader}><TriangleAlert size={14} color="#F8C74A" /><Text style={styles.blockTitle}>Bajo stock</Text></View>
        {(alerts?.lowStock || []).slice(0, 5).map((item: any) => (
          <View key={item.productId} style={styles.alertRow}>
            <Package size={13} color="#F8C74A" />
            <Text numberOfLines={1} style={styles.alertName}>{item.name}</Text>
            <View style={styles.alertBadge}><Text style={styles.alertBadgeText}>{item.stock} un</Text></View>
          </View>
        ))}
        {!alerts?.lowStock?.length && <Text style={styles.dimText}>Sin alertas de stock crítico.</Text>}
      </View>

      <View style={styles.alertBlock}>
        <View style={styles.alertHeader}><CalendarClock size={14} color="#9FC0FF" /><Text style={styles.blockTitle}>Próximos a vencer</Text></View>
        {alerts?.hasExpirationData ? (
          (alerts?.expiringProducts || []).slice(0, 5).map((item: any) => (
            <View key={item.productId} style={styles.alertRow}>
              <Package size={13} color="#9FC0FF" />
              <Text numberOfLines={1} style={styles.alertName}>{item.name}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.dimText}>No hay datos de vencimiento en productos para este negocio.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: { borderRadius: 16, borderWidth: 1, borderColor: '#16335E', backgroundColor: '#0A1B35', padding: 12 },
  sectionTitle: { color: '#EAF1FF', fontSize: theme.font.md, fontWeight: theme.weight.bold, marginBottom: 6 },
  alertBlock: { marginTop: 6 },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  blockTitle: { color: '#9FC0FF', fontSize: theme.font.xs, fontWeight: theme.weight.bold },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  alertName: { flex: 1, color: '#D5E4FF', fontSize: theme.font.sm },
  alertBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: '#3B2B12' },
  alertBadgeText: { color: '#F8C74A', fontSize: 11, fontWeight: theme.weight.bold },
  dimText: { color: '#8EA4CC', fontSize: theme.font.xs },
});
