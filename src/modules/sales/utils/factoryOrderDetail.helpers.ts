import type { Sale, SaleEvent } from '../types/sale.type';
import { normalizeSaleStatus, saleStatusConfig } from './saleStatus';
import { MATERIALS_BLOCKED_EVENT, MATERIALS_RESUMED_EVENT } from './factoryOrderDetail.constants';

const EVENT_TYPE_LABELS: Record<string, string> = {
  SALE_CREATED: 'Pedido creado',
  STATUS_CHANGED: 'Avance operativo actualizado',
  STATUS_ROLLBACK: 'Avance operativo revertido',
  PAYMENT_RECORDED: 'Pago registrado',
  DELIVERY_DATE_SET: 'Compromiso definido',
  DELIVERY_DATE_UPDATED: 'Compromiso actualizado',
  DELIVERY_DATE_CHANGED: 'Compromiso actualizado',
  NOTE_ADDED: 'Nota operativa',
  MANUAL_NOTE: 'Nota manual',
  IMPORTANT_NOTE: 'Observacion importante',
  CLIENT_CALLED: 'Cliente llamo',
  CALL_MADE: 'Llamada realizada',
  PRODUCT_CONDITION_CHANGED: 'Condicion del producto actualizada',
  FABRICATION_ISSUE: 'Inconveniente de fabricacion',
  DIMENSIONS_ADJUSTED: 'Ajuste de medidas',
  DIMENSIONS_CHANGED: 'Medidas actualizadas',
  MANUFACTURE_STARTED: 'Fabricacion iniciada',
  STRUCTURE_ASSEMBLED: 'Estructura armada',
  MATERIAL_DELAY: 'Retraso por materiales',
  ASSEMBLY_COMPLETED: 'Ensamblado completado',
  READY_FOR_DISPATCH: 'Listo para entrega',
  LOADED_FOR_DELIVERY: 'Pedido cargado para entrega',
  OUT_FOR_DELIVERY: 'Pedido en ruta',
  CUSTOMER_NOT_AVAILABLE: 'Cliente no disponible',
  DELIVERY_CONFIRMED: 'Entrega confirmada',
  DELIVERY_EVIDENCE: 'Evidencia de entrega registrada',
  RESPONSIBLE_ASSIGNED: 'Responsable actualizado',
  DELAY_REASON_UPDATED: 'Motivo de retraso actualizado',
  OBSERVATION_ADDED: 'Observacion agregada',
  PRODUCT_LINKED: 'Producto asociado',
  CUSTOMER_LINKED: 'Cliente asociado',
  SALE_TYPE_CHANGED: 'Tipo de venta actualizado',
  SYSTEM_DELAY_MARKED: 'Pedido en atraso',
  SALE_EVENT: 'Venta registrada',
  PURCHASE_EVENT: 'Compra registrada',
  FLASH_INVENTORY_EVENT: 'Inventario flash',
  LIQUIDATION_INVENTORY_EVENT: 'Inventario de liquidacion',
};

function labelFromStatus(status?: string) {
  if (!status) return null;
  if (!(status in saleStatusConfig)) return null;
  return saleStatusConfig[normalizeSaleStatus(status)].label;
}

function humanizeRawMessage(message?: string) {
  const raw = (message || '').trim();
  if (!raw) return '';

  const statusTokens = Object.keys(saleStatusConfig);
  const normalized = raw.replace(/\b[A-Z_]{4,}\b/g, (token) => {
    if (!statusTokens.includes(token)) return token;
    return saleStatusConfig[normalizeSaleStatus(token)].label;
  });

  if (/^Estado actual\b/i.test(normalized)) {
    return normalized.replace(/^Estado actual\s*/i, 'Estado reportado: ');
  }

  return normalized;
}

export function resolveProductName(sale: Sale) {
  const items = Array.isArray(sale.items) ? sale.items : [];
  if (items.length > 0) {
    const first = items[0]?.productName || sale.product?.name || 'Sin definir';
    if (items.length === 1) return first;
    return `${first} +${items.length - 1} lineas`;
  }
  return sale.product?.name || 'Sin definir';
}

export function resolveResponsibleName(sale: Sale) {
  if (!sale.responsibleEmployee) return 'Sin asignar';
  return `${sale.responsibleEmployee.name || ''} ${sale.responsibleEmployee.lastName || ''}`.trim();
}

export function formatCommitmentDate(deliveryDate?: string) {
  if (!deliveryDate) return 'Sin fecha definida';
  return new Date(deliveryDate).toLocaleDateString('es-CO');
}

export function formatDelayedLabel(delayedDays: number) {
  const unit = delayedDays === 1 ? 'dia' : 'dias';
  return `${delayedDays} ${unit} de retraso`;
}

export function getEventTitle(type: string) {
  if (type === MATERIALS_BLOCKED_EVENT) return 'Fabricacion detenida por materiales';
  if (type === MATERIALS_RESUMED_EVENT) return 'Fabricacion reanudada';
  if (EVENT_TYPE_LABELS[type]) return EVENT_TYPE_LABELS[type];
  return type.split('_').join(' ');
}

export function getEventMessage(event: SaleEvent) {
  if (event.type === MATERIALS_BLOCKED_EVENT) {
    return 'El pedido quedo detenido hasta gestionar materiales.';
  }

  if (event.type === MATERIALS_RESUMED_EVENT) {
    return 'Se gestionaron materiales y el pedido puede seguir avanzando.';
  }

  if (event.type === 'STATUS_CHANGED' || event.type === 'STATUS_ROLLBACK') {
    const from = typeof event.metadata?.from === 'string' ? labelFromStatus(event.metadata.from) : null;
    const to = typeof event.metadata?.to === 'string' ? labelFromStatus(event.metadata.to) : null;

    if (from && to && from !== to) {
      return event.type === 'STATUS_ROLLBACK' ? `Retroceso de ${from} a ${to}.` : `Avance de ${from} a ${to}.`;
    }

    if (to) {
      return event.type === 'STATUS_ROLLBACK' ? `Estado revertido a ${to}.` : `Estado actualizado a ${to}.`;
    }
  }

  if (event.type === 'RESPONSIBLE_ASSIGNED') {
    const responsibleName =
      typeof event.metadata?.responsibleName === 'string'
        ? event.metadata.responsibleName
        : typeof event.metadata?.toResponsibleName === 'string'
          ? event.metadata.toResponsibleName
          : '';

    if (responsibleName.trim()) {
      return `Ahora lo tiene ${responsibleName.trim()}.`;
    }
  }

  if (event.type === 'SYSTEM_DELAY_MARKED') {
    return 'El pedido quedo vencido frente al compromiso pactado.';
  }

  return humanizeRawMessage(event.message) || 'Sin detalle adicional.';
}
