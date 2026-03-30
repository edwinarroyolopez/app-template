export type HelpTutorial = {
  label: string;
  url: string;
  description?: string;
};

export type HelpContent = {
  title: string;
  body: string;
  tutorial?: HelpTutorial;
};

export const HELP_CONTENT = {
  sales_help: {
    title: 'Ventas',
    body: 'Aquí ves todas las ventas y puedes refrescar para sincronizar cambios recientes antes de registrar una nueva operación.',
  },
  sales_delayed_help: {
    title: 'Pedidos atrasados',
    body: 'Prioriza pedidos vencidos por días de retraso, asigna seguimiento y confirma avances para normalizar la operación.',
  },
  sales_factory_help: {
    title: 'Pedidos en fabrica',
    body: 'Revisa pedidos en fabricación activa, estado operativo, responsable y eventos clave para controlar cuello de botella.',
  },
  sales_delivery_help: {
    title: 'Pedidos listos para entregar',
    body: 'Gestiona salida, entrega y evidencia de transporte. Usa refrescar para confirmar cambios operativos del reparto.',
  },
  memberships_help: {
    title: 'Gestión de personal',
    body: 'Desde aquí administras los operadores activos en el workspace. Puedes editar roles, invitar nuevos y refrescar para sincronizar cambios.',
  },
  general_expenses_help: {
    title: 'Gastos generales',
    body: 'Aquí registras gastos de operación del negocio. Usa refrescar para sincronizar cambios de caja y evidencias.',
  },
  payables_help: {
    title: 'Cuentas por pagar',
    body: 'Consulta obligaciones por estado, refresca para sincronizar pagos y abre el detalle para registrar movimientos.',
  },
  ai_analysis_help: {
    title: 'Analítica con IA',
    body: 'Usa esta vista para revisar recomendaciones operativas y vuelve a refrescar cuando cambien los datos fuente.',
  },
  transactions_help: {
    title: 'Transacciones',
    body: 'Revisa entradas y salidas consolidadas del negocio. Refresca para alinear la vista con los últimos movimientos.',
  },
  cash_closing_help: {
    title: 'Cierre de caja',
    body: 'Registra el cierre diario, valida diferencia y deja trazabilidad del resultado operativo del turno.',
  },
  select_workspace_help: {
    title: 'Selección de workspace',
    body: 'Elige el workspace (contexto) con el que vas a operar. Puedes refrescar la lista para sincronizar cambios de membresía y configuración.',
  },
  general: {
    title: 'Ayuda',
    body: '¿Necesitas asistencia? Contacta a soporte técnico.',
  },
} as const satisfies Record<string, HelpContent>;

export type HelpContentKey = keyof typeof HELP_CONTENT;
