export const FACTORY_EVENT_TYPES = [
  { value: 'MANUFACTURE_STARTED', label: 'Fabricacion iniciada' },
  { value: 'STRUCTURE_ASSEMBLED', label: 'Estructura armada' },
  { value: 'DIMENSIONS_ADJUSTED', label: 'Ajuste de medidas' },
  { value: 'MATERIAL_DELAY', label: 'Inconveniente de material' },
  { value: 'ASSEMBLY_COMPLETED', label: 'Pieza terminada' },
  { value: 'READY_FOR_DISPATCH', label: 'Listo para entrega' },
] as const;

export const DELIVERY_EVENT_TYPES = [
  { value: 'LOADED_FOR_DELIVERY', label: 'Cargado al vehiculo' },
  { value: 'OUT_FOR_DELIVERY', label: 'Salio a entrega' },
  { value: 'CUSTOMER_NOT_AVAILABLE', label: 'Cliente no disponible' },
  { value: 'DELIVERY_CONFIRMED', label: 'Entrega realizada' },
  { value: 'DELIVERY_EVIDENCE', label: 'Evidencia de entrega' },
] as const;

export const MATERIALS_BLOCKED_EVENT = 'MATERIALS_UNMANAGED_BLOCK';
export const MATERIALS_RESUMED_EVENT = 'MATERIALS_MANAGED_RESUME';

export function modeCopy(mode: 'FACTORY' | 'DELIVERY') {
  if (mode === 'DELIVERY') {
    return {
      headerTitle: 'Pedido listo para entregar',
      headerSubtitle: 'Vista logistica para salida y entrega',
      headerContext: 'Flujo de entrega',
      roleLabel: 'Transportador',
      panelTitle: 'Panel de entrega',
      progressControlTitle: 'Control de entrega',
      progressControlHint: 'Actualiza este control cuando cambie el avance real de entrega.',
      nextActionHint: 'Registra lo ultimo que paso para mantener trazabilidad del reparto.',
    };
  }

  return {
    headerTitle: 'Detalle del pedido a fabricar',
    headerSubtitle: 'Vista de fabrica para seguimiento y evidencias',
    headerContext: 'Flujo de fabricacion',
    roleLabel: 'Fabricante',
    panelTitle: 'Panel de fabrica',
    progressControlTitle: 'Control de avance en fabrica',
    progressControlHint: 'Actualiza este control solo cuando cambie el avance real del pedido.',
    nextActionHint: 'Registra el ultimo avance para mantener claro el estado operativo.',
  };
}
