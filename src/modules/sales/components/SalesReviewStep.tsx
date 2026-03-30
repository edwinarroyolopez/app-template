import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Pencil } from 'lucide-react-native';

import { theme } from '@/theme';
import type { SaleFlowType } from '../types/sale.type';
import type { SaleWizardItem } from '../hooks/useSaleWizard';
import { salePriorityConfig, saleTypeConfig } from '../utils/saleStatus';
import { SaleLineRow } from './SaleLineRow';

function formatAmount(value: number) {
  return `$${(value || 0).toLocaleString('es-CO')}`;
}

type Props = {
  flowType: SaleFlowType;
  paymentMethod: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  requiresSchedule: boolean;
  deliveryDate: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  initialPaymentInput: string;
  observations: string;
  paymentProofImageUri: string | null;
  saleEvidenceImageUri: string | null;
  total: number;
  orderedItems: Array<{ item: SaleWizardItem; index: number }>;
  onGoToContextStep: () => void;
  onGoToLinesStep: () => void;
  onEditLine: (index: number) => void;
  onRemoveLine: (index: number) => void;
};

export function SalesReviewStep({
  flowType,
  paymentMethod,
  clientName,
  clientPhone,
  clientAddress,
  requiresSchedule,
  deliveryDate,
  priority,
  initialPaymentInput,
  observations,
  paymentProofImageUri,
  saleEvidenceImageUri,
  total,
  orderedItems,
  onGoToContextStep,
  onGoToLinesStep,
  onEditLine,
  onRemoveLine,
}: Props) {
  const customerLabel = clientName.trim() || clientPhone.trim() || 'Sin definir';
  const linesCount = orderedItems.length;
  const requiresPaymentProof = paymentMethod !== 'EFECTIVO';

  return (
    <View style={styles.stepCard}>
      <Text style={styles.stepTitle}>Revision final</Text>
      <Text style={styles.stepHint}>Confirma esta operacion antes de guardarla como venta.</Text>

      <View style={styles.confirmationCard}>
        <View>
          <Text style={styles.confirmationLabel}>Listo para guardar</Text>
          <Text style={styles.confirmationMeta}>{linesCount} lineas incluidas</Text>
        </View>
        <Text style={styles.confirmationAmount}>{formatAmount(total)}</Text>
      </View>

      <View style={styles.metaGrid}>
        <View style={styles.metaCardWide}>
          <Text style={styles.metaLabel}>Cliente</Text>
          <Text style={styles.metaValue} numberOfLines={2}>
            {customerLabel}
          </Text>
          {!!clientAddress.trim() && (
            <Text style={styles.metaSubValue} numberOfLines={1}>
              {clientAddress.trim()}
            </Text>
          )}
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaCardCompact}>
            <Text style={styles.metaLabel}>Tipo</Text>
            <Text style={styles.metaValue} numberOfLines={1}>
              {saleTypeConfig[flowType].label}
            </Text>
          </View>
          <View style={styles.metaCardCompact}>
            <Text style={styles.metaLabel}>Pago</Text>
            <Text style={styles.metaValue} numberOfLines={1}>
              {paymentMethod}
            </Text>
          </View>
        </View>
      </View>

      {requiresSchedule && (
        <View style={styles.conditionsCard}>
          <Text style={styles.conditionsTitle}>Condiciones especiales</Text>
          <Text style={styles.conditionsText}>
            Entrega: {new Date(deliveryDate).toLocaleDateString('es-CO')} - {salePriorityConfig[priority].label}
          </Text>
          <Text style={styles.conditionsText}>Abono inicial: {initialPaymentInput || '$0'}</Text>
        </View>
      )}

      {!!observations.trim() && (
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Observaciones</Text>
          <Text style={styles.noteText}>{observations.trim()}</Text>
        </View>
      )}

      <View style={styles.evidenceCard}>
        <Text style={styles.evidenceTitle}>Comprobante de pago</Text>
        <Text style={styles.evidenceText}>
          {paymentProofImageUri
            ? 'Imagen adjunta'
            : requiresPaymentProof
              ? 'Pendiente (puedes adjuntarlo despues)'
              : 'No requerido para efectivo'}
        </Text>
      </View>

      <View style={styles.evidenceCard}>
        <Text style={styles.evidenceTitle}>Evidencia comercial</Text>
        <Text style={styles.evidenceText}>{saleEvidenceImageUri ? 'Imagen adjunta' : 'Sin evidencia adjunta'}</Text>
      </View>

      <View style={styles.linesHeader}>
        <Text style={styles.linesTitle}>Lineas confirmadas</Text>
        <Pressable style={styles.editLinesBtn} onPress={onGoToLinesStep}>
          <Pencil size={13} color="#9FC0FF" />
          <Text style={styles.editLinesText}>Editar</Text>
        </Pressable>
      </View>

      {orderedItems.map((line) => (
        <SaleLineRow
          key={`summary-${line.item.productId || line.item.productName}-${line.index}`}
          item={line.item}
          index={line.index}
          summary
          onEdit={(index) => {
            onEditLine(index);
            onGoToLinesStep();
          }}
          onRemove={onRemoveLine}
        />
      ))}

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total que se registrara</Text>
        <Text style={styles.totalValue}>{formatAmount(total)}</Text>
      </View>

      <Text style={styles.closureHint}>Al guardar, esta venta queda registrada con su detalle de lineas.</Text>

      <Pressable style={styles.editContextBtn} onPress={onGoToContextStep}>
        <Text style={styles.editContextText}>Ajustar contexto comercial</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  stepCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1A3D6C',
    backgroundColor: '#081D38',
    padding: 12,
  },
  stepTitle: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
    marginBottom: 4,
  },
  stepHint: {
    color: '#8EA4CC',
    fontSize: theme.font.xs,
    marginBottom: 8,
  },
  confirmationCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2D5689',
    backgroundColor: '#112340',
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  confirmationLabel: {
    color: '#C4D6F2',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.bold,
  },
  confirmationMeta: {
    marginTop: 2,
    color: '#89A9D8',
    fontSize: 11,
  },
  confirmationAmount: {
    color: '#F3F7FF',
    fontSize: theme.font.md,
    fontWeight: theme.weight.bold,
  },
  metaGrid: {
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metaCardWide: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#275080',
    backgroundColor: '#102947',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  metaCardCompact: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#275080',
    backgroundColor: '#102947',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  metaLabel: {
    color: '#89A4CE',
    fontSize: 11,
    marginBottom: 3,
  },
  metaValue: {
    color: '#EAF1FF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.bold,
    lineHeight: 16,
  },
  metaSubValue: {
    marginTop: 2,
    color: '#95A9CC',
    fontSize: 11,
  },
  conditionsCard: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#244974',
    backgroundColor: '#0D274A',
    padding: 8,
    gap: 2,
  },
  conditionsTitle: {
    color: '#BFD0EE',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.bold,
  },
  conditionsText: {
    color: '#95A9CC',
    fontSize: theme.font.xs,
  },
  noteCard: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#244974',
    backgroundColor: '#0D274A',
    padding: 8,
    gap: 4,
  },
  noteTitle: {
    color: '#BFD0EE',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.bold,
  },
  noteText: {
    color: '#95A9CC',
    fontSize: theme.font.xs,
    lineHeight: 16,
  },
  evidenceCard: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#244974',
    backgroundColor: '#0D274A',
    padding: 8,
  },
  evidenceTitle: {
    color: '#BFD0EE',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.bold,
    marginBottom: 2,
  },
  evidenceText: {
    color: '#95A9CC',
    fontSize: theme.font.xs,
  },
  linesHeader: {
    marginTop: 12,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linesTitle: {
    color: '#BFD0EE',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  editLinesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  editLinesText: {
    color: '#9FC0FF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  totalCard: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2D5689',
    backgroundColor: '#112340',
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    color: '#9FB4D9',
    fontSize: theme.font.xs,
  },
  totalValue: {
    color: '#F3F7FF',
    fontSize: theme.font.md,
    fontWeight: theme.weight.bold,
  },
  closureHint: {
    marginTop: 7,
    color: '#7E9CCA',
    fontSize: 11,
  },
  editContextBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  editContextText: {
    color: '#9FC0FF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
});
