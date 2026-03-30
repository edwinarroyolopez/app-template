import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Boxes, CheckCircle2, ChevronRight, ClipboardList, History, PlayCircle, Zap } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { theme } from '@/theme';
import { useInventoryHubSummary } from '../hooks/useInventoryHubSummary';

function formatDate(value?: string) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export default function InventoryHubScreen() {
  const navigation = useNavigation<any>();
  const { lastLiquidation, activeAudit } = useInventoryHubSummary();

  const activeCounted = Number(activeAudit?.countedProducts || 0);
  const activeTotal = Number(activeAudit?.totalProducts || 0);
  const activeProgress = activeTotal > 0 ? Math.min(100, Math.round((activeCounted / activeTotal) * 100)) : 0;
  const hasActiveAudit = !!activeAudit?._id;

  return (
    <MainLayout>
      <View style={styles.container}>
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Boxes size={20} color="#2E8CFF" />
            <Text style={styles.headerTitle}>Inventario</Text>
          </View>
          <Text style={styles.headerSubtitle}>Control rápido, auditoría completa e histórico.</Text>
        </View>

        <View style={[styles.statusCard, hasActiveAudit ? styles.statusCardWarn : styles.statusCardGood]}>
          <View style={styles.statusRow}>
            {hasActiveAudit ? <PlayCircle size={16} color="#F8C74A" /> : <CheckCircle2 size={16} color="#34D399" />}
            <Text style={styles.statusTitle}>
              {hasActiveAudit ? 'Liquidación en progreso' : 'Sin liquidación pendiente'}
            </Text>
          </View>
          <Text style={styles.statusText}>
            {hasActiveAudit
              ? `${activeCounted} de ${activeTotal} productos revisados (${activeProgress}%)`
              : 'Puedes iniciar una nueva liquidación cuando quieras.'}
          </Text>
          {hasActiveAudit && (
            <Pressable style={styles.statusActionBtn} onPress={() => navigation.navigate('InventoryLiquidation')}>
              <Text style={styles.statusActionText}>Continuar liquidación</Text>
            </Pressable>
          )}
        </View>

        <Pressable style={styles.navCard} onPress={() => navigation.navigate('InventoryFlash')}>
          <View style={styles.navLeft}>
            <Zap size={18} color="#2E8CFF" />
            <View>
              <Text style={styles.navTitle}>Inventario Flash</Text>
              <Text style={styles.navSub}>Ajuste rápido de stock por producto.</Text>
            </View>
          </View>
          <ChevronRight size={18} color="#8EA4CC" />
        </Pressable>

        <Pressable style={styles.navCard} onPress={() => navigation.navigate('InventoryLiquidation')}>
          <View style={styles.navLeft}>
            <ClipboardList size={18} color="#2E8CFF" />
            <View>
              <Text style={styles.navTitle}>Inventario de Liquidación</Text>
              <Text style={styles.navSub}>Conteo completo y cierre de auditoría.</Text>
            </View>
          </View>
          <ChevronRight size={18} color="#8EA4CC" />
        </Pressable>

        <Pressable style={styles.navCard} onPress={() => navigation.navigate('InventoryHistory')}>
          <View style={styles.navLeft}>
            <History size={18} color="#2E8CFF" />
            <View>
              <Text style={styles.navTitle}>Histórico de Inventario</Text>
              <Text style={styles.navSub}>Eventos de compras, ventas y ajustes.</Text>
            </View>
          </View>
          <ChevronRight size={18} color="#8EA4CC" />
        </Pressable>

        <Pressable
          style={styles.summaryCard}
          onPress={() => {
            if (!lastLiquidation?._id) return;
            navigation.navigate('InventoryLiquidationDetail', { auditId: lastLiquidation._id });
          }}
        >
          <Text style={styles.summaryTitle}>Última liquidación</Text>
          <Text style={styles.summaryText}>Fecha: {formatDate(lastLiquidation?.finalizedAt)}</Text>
          <Text style={styles.summaryText}>Usuario: {lastLiquidation?.createdByUserId || '--'}</Text>
          <Text style={styles.summaryText}>
            Productos auditados: {lastLiquidation?.countedProducts ?? 0}
          </Text>
          <Text style={styles.summaryLink}>
            {lastLiquidation?._id ? 'Ver conclusiones operativas' : 'Sin liquidación finalizada'}
          </Text>
        </Pressable>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071427',
    padding: 16,
    gap: 10,
  },
  headerCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#16335E',
    backgroundColor: '#0A1B35',
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.lg,
  },
  headerSubtitle: {
    marginTop: 4,
    color: '#91A7CC',
    fontSize: theme.font.sm,
  },
  navCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#16335E',
    backgroundColor: '#0A1B35',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  navTitle: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
  },
  navSub: {
    color: '#91A7CC',
    fontSize: theme.font.xs,
    marginTop: 1,
  },
  summaryCard: {
    marginTop: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#16335E',
    backgroundColor: '#0A1B35',
    padding: 12,
  },
  summaryTitle: {
    color: '#9FC0FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.bold,
    marginBottom: 5,
  },
  summaryText: {
    color: '#D5E4FF',
    fontSize: theme.font.xs,
    marginBottom: 2,
  },
  summaryLink: {
    marginTop: 8,
    color: '#2E8CFF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.bold,
  },
  statusCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  statusCardWarn: {
    borderColor: '#5A441A',
    backgroundColor: '#2D220F',
  },
  statusCardGood: {
    borderColor: '#1E5C4B',
    backgroundColor: '#0E2F24',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusTitle: {
    color: '#EAF1FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.bold,
  },
  statusText: {
    marginTop: 4,
    color: '#C8D7F1',
    fontSize: theme.font.xs,
  },
  statusActionBtn: {
    marginTop: 8,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#6B5220',
    backgroundColor: '#3E2E14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusActionText: {
    color: '#F8C74A',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.bold,
  },
});
