import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme';
import type { WorkspaceDashboardSummary } from '../types/dashboard.types';
import type { DashboardWidgetKey } from '../registry/dashboard.registry';

function money(value?: number) {
  return `$${Number(value || 0).toLocaleString('es-CO')}`;
}

function CompactBar({ value, max, tone = 'default' }: { value: number; max: number; tone?: 'default' | 'warning' }) {
  const width = `${Math.max((Math.abs(value) / Math.max(max, 1)) * 100, 4)}%` as `${number}%`;
  return (
    <View style={styles.track}>
      <View style={[styles.fill, tone === 'warning' && styles.fillWarning, { width }]} />
    </View>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function EmptyBlockWidget({ title, hint }: { title: string; hint: string }) {
  return (
    <SectionCard title={title}>
      <Text style={styles.emptyText}>{hint}</Text>
    </SectionCard>
  );
}

function SalesSummaryWidget({ data }: { data: NonNullable<WorkspaceDashboardSummary['blocks']['salesSummary']> }) {
  const deltaPositive = data.revenueDeltaPercent >= 0;
  return (
    <SectionCard title="Vista comercial">
      <View style={styles.kpiRow}>
        <Text style={styles.kpiLabel}>Ingreso hoy</Text>
        <Text style={styles.kpiValue}>{money(data.todayRevenueCop)}</Text>
      </View>
      <View style={styles.kpiRow}>
        <Text style={styles.kpiLabel}>Cambio vs ayer</Text>
        <Text style={[styles.kpiValue, deltaPositive ? styles.successText : styles.dangerText]}>
          {deltaPositive ? '+' : ''}
          {data.revenueDeltaPercent}%
        </Text>
      </View>
      <View style={styles.grid}>
        <Metric label="Pedidos hoy" value={String(data.todayOrders)} />
        <Metric label="Abiertos" value={String(data.openOrders)} />
        <Metric label="Atrasados" value={String(data.delayedOrders)} tone={data.delayedOrders > 0 ? 'warning' : 'calm'} />
        <Metric label="Pagado hoy" value={money(data.paidTodayCop)} />
      </View>
      <Text style={styles.hint}>Pendiente por cobrar: {money(data.pendingReceivableCop)}</Text>
    </SectionCard>
  );
}

function SalesTrendWidget({ data }: { data: NonNullable<WorkspaceDashboardSummary['blocks']['salesTrend']> }) {
  const max = useMemo(
    () => Math.max(1, ...data.weekSeries.map((item) => Number(item.revenueCop || 0))),
    [data.weekSeries],
  );

  return (
    <SectionCard title="Tendencia de ventas (7 dias)">
      {data.weekSeries.map((item) => (
        <View key={item.key} style={styles.weekRow}>
          <Text style={styles.weekDay}>{item.dayLabel}</Text>
          <CompactBar value={Number(item.revenueCop || 0)} max={max} />
          <Text style={styles.weekValue}>{money(item.revenueCop)}</Text>
        </View>
      ))}
      {data.weekSeries.length === 0 ? (
        <Text style={styles.emptyText}>Sin ventas para mostrar tendencia semanal.</Text>
      ) : null}
    </SectionCard>
  );
}

function CashSummaryWidget({ data }: { data: NonNullable<WorkspaceDashboardSummary['blocks']['cashSummary']> }) {
  const isClosed = Boolean(data.closingStatus?.isClosed);
  return (
    <SectionCard title="Caja del dia">
      <View style={styles.grid}>
        <Metric label="Ingresos" value={money(data.incomeCop)} />
        <Metric label="Egresos" value={money(data.expenseCop)} tone={data.expenseCop > 0 ? 'warning' : 'calm'} />
        <Metric label="Neto" value={money(data.netCop)} tone={data.netCop >= 0 ? 'calm' : 'warning'} />
        <Metric label="Movimientos" value={String(data.movementCount)} />
      </View>
      <Text style={styles.hint}>
        Cierre: {isClosed ? 'cerrado' : 'pendiente'}
        {isClosed
          ? ` (${money(data.closingStatus?.reportedAmountCop)} reportado / ${money(data.closingStatus?.expectedNetCop)} esperado)`
          : ''}
      </Text>
    </SectionCard>
  );
}

function TopProductsWidget({ items }: { items: NonNullable<WorkspaceDashboardSummary['blocks']['topProducts']> }) {
  return (
    <SectionCard title="Productos mas fuertes">
      {items.slice(0, 5).map((item) => (
        <View key={`${item.productName}-${item.quantity}`} style={styles.listRow}>
          <Text style={styles.listMain} numberOfLines={1}>{item.productName}</Text>
          <Text style={styles.listMeta}>{item.quantity} u</Text>
          <Text style={styles.listValue}>{money(item.revenueCop)}</Text>
        </View>
      ))}
      {items.length === 0 ? <Text style={styles.emptyText}>Sin datos de productos para este rango.</Text> : null}
    </SectionCard>
  );
}

function TransactionFlowWidget({ data }: { data: NonNullable<WorkspaceDashboardSummary['blocks']['transactionFlow']> }) {
  const max = useMemo(
    () =>
      Math.max(
        1,
        ...data.weekSeries.map((item) =>
          Math.max(
            Math.abs(Number(item.netCop || 0)),
            Math.abs(Number(item.incomeCop || 0)),
            Math.abs(Number(item.expenseCop || 0)),
          ),
        ),
      ),
    [data.weekSeries],
  );

  return (
    <SectionCard title="Flujo semanal">
      {data.weekSeries.map((item) => {
        const hasNet = typeof item.netCop === 'number';
        const value = hasNet ? Number(item.netCop || 0) : Number(item.incomeCop || 0) - Number(item.expenseCop || 0);
        return (
          <View key={item.key} style={styles.weekRow}>
            <Text style={styles.weekDay}>{item.dayLabel}</Text>
            <CompactBar value={value} max={max} tone={value < 0 ? 'warning' : 'default'} />
            <Text style={styles.weekValue}>{money(value)}</Text>
          </View>
        );
      })}
      {data.weekSeries.length === 0 ? <Text style={styles.emptyText}>Sin movimiento semanal para mostrar.</Text> : null}
    </SectionCard>
  );
}

function ExpenseCategoriesWidget({ items }: { items: NonNullable<WorkspaceDashboardSummary['blocks']['expenseCategories']> }) {
  return (
    <SectionCard title="Gastos que mas presionan">
      {items.slice(0, 5).map((item) => (
        <View key={`${item.category}-${item.amountCop}`} style={styles.listRow}>
          <Text style={styles.listMain}>{item.category || 'SIN_CATEGORIA'}</Text>
          <Text style={styles.listMeta}>{item.movements} mov</Text>
          <Text style={styles.listValue}>{money(item.amountCop)}</Text>
        </View>
      ))}
      {items.length === 0 ? <Text style={styles.emptyText}>Sin gastos para este rango.</Text> : null}
    </SectionCard>
  );
}

function InventoryHealthWidget({ data }: { data: NonNullable<WorkspaceDashboardSummary['blocks']['inventoryHealth']> }) {
  return (
    <SectionCard title="Salud de inventario">
      <View style={styles.grid}>
        <Metric label="Productos" value={String(data.productsTracked)} />
        <Metric label="Unidades stock" value={String(data.totalStockUnits)} />
        <Metric label="Valor inventario" value={money(data.inventoryValueCop)} />
        <Metric label="Stock bajo" value={String(data.lowStockCount)} tone={data.lowStockCount > 0 ? 'warning' : 'calm'} />
        <Metric label="Agotados" value={String(data.zeroStockCount)} tone={data.zeroStockCount > 0 ? 'warning' : 'calm'} />
      </View>
    </SectionCard>
  );
}

function StockAlertsWidget({ items }: { items: NonNullable<WorkspaceDashboardSummary['blocks']['stockAlerts']> }) {
  return (
    <SectionCard title="Alertas de stock">
      {items.slice(0, 6).map((item) => (
        <View key={item.productId || item.productName} style={styles.listRow}>
          <Text style={styles.listMain} numberOfLines={1}>{item.productName}</Text>
          <Text style={styles.listMeta}>{item.stock} u</Text>
          <Text style={styles.listValue}>min {item.minStock || 2}</Text>
        </View>
      ))}
      {items.length === 0 ? <Text style={styles.emptyText}>No hay alertas de stock para este momento.</Text> : null}
    </SectionCard>
  );
}

function PurchasePulseWidget({ data }: { data: NonNullable<WorkspaceDashboardSummary['blocks']['purchasePulse']> }) {
  return (
    <SectionCard title="Vista de compras">
      <View style={styles.grid}>
        <Metric label="Compras hoy" value={String(data.purchasesTodayCount)} />
        <Metric label="Monto comprado" value={money(data.purchasesTodayAmountCop)} />
        <Metric label="Facturas pendientes" value={String(data.pendingInvoicesCount)} tone={data.pendingInvoicesCount > 0 ? 'warning' : 'calm'} />
        <Metric label="Facturas vencidas" value={String(data.overdueInvoicesCount)} tone={data.overdueInvoicesCount > 0 ? 'warning' : 'calm'} />
      </View>
      <Text style={styles.hint}>Saldo pendiente a proveedores: {money(data.pendingInvoicesAmountCop)}</Text>
    </SectionCard>
  );
}

function MovementSummaryWidget({ data }: { data: NonNullable<WorkspaceDashboardSummary['blocks']['movementSummary']> }) {
  return (
    <SectionCard title="Movimiento de inventario">
      <View style={styles.grid}>
        <Metric label="Entradas" value={String(data.inboundUnits)} tone="calm" />
        <Metric label="Salidas" value={String(data.outboundUnits)} tone={data.outboundUnits > 0 ? 'warning' : 'default'} />
        <Metric label="Neto" value={String(data.netUnits)} tone={data.netUnits >= 0 ? 'calm' : 'warning'} />
        <Metric label="Movimientos" value={String(data.movementCount)} />
      </View>
    </SectionCard>
  );
}

function FactoryPipelineWidget({ data }: { data: NonNullable<WorkspaceDashboardSummary['blocks']['factoryPipeline']> }) {
  return (
    <SectionCard title="Pipeline de fabrica">
      <View style={styles.grid}>
        <Metric label="En produccion" value={String(data.inProductionItems)} />
        <Metric label="Bloq. materiales" value={String(data.blockedByMaterialsItems)} tone={data.blockedByMaterialsItems > 0 ? 'warning' : 'calm'} />
        <Metric label="Listo para entrega" value={String(data.readyForDeliveryItems)} tone={data.readyForDeliveryItems > 0 ? 'calm' : 'default'} />
        <Metric label="Atrasados" value={String(data.delayedFactoryItems)} tone={data.delayedFactoryItems > 0 ? 'warning' : 'calm'} />
      </View>
    </SectionCard>
  );
}

function FulfillmentPulseWidget({ data }: { data: NonNullable<WorkspaceDashboardSummary['blocks']['fulfillmentPulse']> }) {
  return (
    <SectionCard title="Vista de cumplimiento">
      <View style={styles.grid}>
        <Metric label="Pedidos abiertos" value={String(data.openManufactureOrders)} />
        <Metric label="Listos despacho" value={String(data.readyForDeliveryOrders)} tone={data.readyForDeliveryOrders > 0 ? 'calm' : 'default'} />
        <Metric label="En reparto" value={String(data.inDeliveryOrders)} />
        <Metric label="Atrasados" value={String(data.delayedOrders)} tone={data.delayedOrders > 0 ? 'warning' : 'calm'} />
      </View>
      <Text style={styles.hint}>Pendiente por cobrar de pedidos abiertos: {money(data.pendingReceivableCop)}</Text>
    </SectionCard>
  );
}

function LotPipelineWidget({ data }: { data: NonNullable<WorkspaceDashboardSummary['blocks']['lotPipeline']> }) {
  return (
    <SectionCard title="Pipeline de lotes">
      <View style={styles.grid}>
        <Metric label="Activos" value={String(data.totalActive)} />
        <Metric label="Pendientes" value={String(data.pending)} />
        <Metric label="En proceso" value={String(data.inProcess)} />
        <Metric label="Listos" value={String(data.readyToDeliver)} />
        <Metric label="Entregados" value={String(data.delivered)} tone="calm" />
      </View>
    </SectionCard>
  );
}

function ProductionSummaryWidget({ data }: { data: NonNullable<WorkspaceDashboardSummary['blocks']['productionSummary']> }) {
  return (
    <SectionCard title="Produccion">
      <View style={styles.kpiRow}>
        <Text style={styles.kpiLabel}>Avance</Text>
        <Text style={styles.kpiValue}>{data.progressPercent}%</Text>
      </View>
      <View style={styles.grid}>
        <Metric label="Esperadas" value={String(data.expectedUnits)} />
        <Metric label="Completadas" value={String(data.completedUnits)} />
        <Metric label="Pendientes" value={String(data.pendingUnits)} tone={data.pendingUnits > 0 ? 'warning' : 'calm'} />
      </View>
    </SectionCard>
  );
}

function LotFinanceWidget({ data }: { data: NonNullable<WorkspaceDashboardSummary['blocks']['lotFinance']> }) {
  return (
    <SectionCard title="Resultado operativo acumulado">
      <View style={styles.kpiRow}>
        <Text style={styles.kpiLabel}>Pendiente por cobrar (acumulado)</Text>
        <Text style={styles.kpiValue}>{money(data.incomePending)}</Text>
      </View>
      <View style={styles.grid}>
        <Metric label="Ingreso esperado" value={money(data.expectedIncome)} />
        <Metric label="Ingreso recibido" value={money(data.incomeReceived)} tone="calm" />
        <Metric label="Mano de obra acumulada" value={money(data.laborAccrued)} />
        <Metric label="Pendiente empleados" value={money(data.laborPending)} tone={data.laborPending > 0 ? 'warning' : 'calm'} />
        <Metric label="Costo total" value={money(data.totalCost)} tone="warning" />
        <Metric label="Resultado esperado" value={money(data.resultExpected)} tone={data.resultExpected >= 0 ? 'calm' : 'warning'} />
        <Metric label="Resultado" value={money(data.resultCurrent)} tone={data.resultCurrent >= 0 ? 'calm' : 'warning'} />
      </View>
    </SectionCard>
  );
}

function WorkerPayablesWidget({ items }: { items: NonNullable<WorkspaceDashboardSummary['blocks']['workerPayables']> }) {
  return (
    <SectionCard title="Confeccionistas con saldo pendiente">
      {items.slice(0, 6).map((item) => (
        <View key={`${item.workerEmployeeId}-${item.workerName}`} style={styles.listRow}>
          <Text style={styles.listMain} numberOfLines={1}>{item.workerName}</Text>
          <Text style={styles.listMeta}>{item.lotsInvolved} lotes</Text>
          <Text style={styles.listValue}>{money(item.pendingCop)}</Text>
        </View>
      ))}
      {items.length === 0 ? <Text style={styles.emptyText}>Sin pendientes acumulados por operario.</Text> : null}
      {items.length > 0 ? <Text style={styles.hint}>Lectura acumulada del taller, no solo del rango del dashboard.</Text> : null}
    </SectionCard>
  );
}

function Metric({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'warning' | 'calm' }) {
  return (
    <View style={[styles.metric, tone === 'warning' && styles.metricWarning, tone === 'calm' && styles.metricCalm]}>
      <Text style={styles.metricValue} numberOfLines={1}>{value}</Text>
      <Text style={styles.metricLabel} numberOfLines={2}>{label}</Text>
    </View>
  );
}

export function DashboardWidgetRenderer({
  widgetKey,
  summary,
}: {
  widgetKey: DashboardWidgetKey;
  summary: WorkspaceDashboardSummary;
}) {
  if (widgetKey === 'salesSummary' && summary.blocks.salesSummary) {
    return <SalesSummaryWidget data={summary.blocks.salesSummary} />;
  }
  if (widgetKey === 'salesSummary') {
    return (
      <EmptyBlockWidget
        title="Vista comercial"
        hint="No hay datos de ventas para construir el resumen del dia."
      />
    );
  }
  if (widgetKey === 'salesTrend' && summary.blocks.salesTrend) {
    return <SalesTrendWidget data={summary.blocks.salesTrend} />;
  }
  if (widgetKey === 'salesTrend') {
    return (
      <EmptyBlockWidget
        title="Tendencia de ventas (7 dias)"
        hint="Sin informacion semanal de ventas para este rango."
      />
    );
  }
  if (widgetKey === 'cashSummary' && summary.blocks.cashSummary) {
    return <CashSummaryWidget data={summary.blocks.cashSummary} />;
  }
  if (widgetKey === 'cashSummary') {
    return (
      <EmptyBlockWidget
        title="Caja del dia"
        hint="No hay movimientos de caja registrados para hoy."
      />
    );
  }
  if (widgetKey === 'topProducts' && summary.blocks.topProducts) {
    return <TopProductsWidget items={summary.blocks.topProducts} />;
  }
  if (widgetKey === 'topProducts') {
    return (
      <EmptyBlockWidget
        title="Productos mas fuertes"
        hint="Todavia no hay ventas de productos para este rango."
      />
    );
  }
  if (widgetKey === 'transactionFlow' && summary.blocks.transactionFlow) {
    return <TransactionFlowWidget data={summary.blocks.transactionFlow} />;
  }
  if (widgetKey === 'expenseCategories' && summary.blocks.expenseCategories) {
    return <ExpenseCategoriesWidget items={summary.blocks.expenseCategories} />;
  }
  if (widgetKey === 'expenseCategories') {
    return (
      <EmptyBlockWidget
        title="Gastos que mas presionan"
        hint="Sin gastos clasificados para este rango."
      />
    );
  }
  if (widgetKey === 'inventoryHealth' && summary.blocks.inventoryHealth) {
    return <InventoryHealthWidget data={summary.blocks.inventoryHealth} />;
  }
  if (widgetKey === 'inventoryHealth') {
    return (
      <EmptyBlockWidget
        title="Salud de inventario"
        hint="No hay datos de inventario para este negocio."
      />
    );
  }
  if (widgetKey === 'stockAlerts' && summary.blocks.stockAlerts) {
    return <StockAlertsWidget items={summary.blocks.stockAlerts} />;
  }
  if (widgetKey === 'stockAlerts') {
    return (
      <EmptyBlockWidget
        title="Alertas de stock"
        hint="No hay productos con alerta de stock en este momento."
      />
    );
  }
  if (widgetKey === 'purchasePulse' && summary.blocks.purchasePulse) {
    return <PurchasePulseWidget data={summary.blocks.purchasePulse} />;
  }
  if (widgetKey === 'purchasePulse') {
    return (
      <EmptyBlockWidget
        title="Vista de compras"
        hint="Sin datos de compras para este rango."
      />
    );
  }
  if (widgetKey === 'movementSummary' && summary.blocks.movementSummary) {
    return <MovementSummaryWidget data={summary.blocks.movementSummary} />;
  }
  if (widgetKey === 'movementSummary') {
    return (
      <EmptyBlockWidget
        title="Movimiento de inventario"
        hint="Sin movimientos de inventario en el rango seleccionado."
      />
    );
  }
  if (widgetKey === 'factoryPipeline' && summary.blocks.factoryPipeline) {
    return <FactoryPipelineWidget data={summary.blocks.factoryPipeline} />;
  }
  if (widgetKey === 'factoryPipeline') {
    return (
      <EmptyBlockWidget
        title="Pipeline de fabrica"
        hint="Sin procesos de fabrica para priorizar en este momento."
      />
    );
  }
  if (widgetKey === 'fulfillmentPulse' && summary.blocks.fulfillmentPulse) {
    return <FulfillmentPulseWidget data={summary.blocks.fulfillmentPulse} />;
  }
  if (widgetKey === 'fulfillmentPulse') {
    return (
      <EmptyBlockWidget
        title="Vista de cumplimiento"
        hint="Sin pedidos de fabricacion activos para seguimiento."
      />
    );
  }
  if (widgetKey === 'lotPipeline' && summary.blocks.lotPipeline) {
    return <LotPipelineWidget data={summary.blocks.lotPipeline} />;
  }
  if (widgetKey === 'lotPipeline') {
    return <EmptyBlockWidget title="Pipeline de lotes" hint="Todavia no hay lotes registrados para mostrar pipeline." />;
  }
  if (widgetKey === 'productionSummary' && summary.blocks.productionSummary) {
    return <ProductionSummaryWidget data={summary.blocks.productionSummary} />;
  }
  if (widgetKey === 'productionSummary') {
    return <EmptyBlockWidget title="Produccion" hint="Aun no hay operaciones acumuladas para calcular avance." />;
  }
  if (widgetKey === 'lotFinance' && summary.blocks.lotFinance) {
    return <LotFinanceWidget data={summary.blocks.lotFinance} />;
  }
  if (widgetKey === 'lotFinance') {
    return <EmptyBlockWidget title="Resultado operativo acumulado" hint="Sin datos financieros de lotes para este negocio." />;
  }
  if (widgetKey === 'workerPayables' && summary.blocks.workerPayables) {
    return <WorkerPayablesWidget items={summary.blocks.workerPayables} />;
  }
  if (widgetKey === 'workerPayables') {
    return <EmptyBlockWidget title="Confeccionistas con saldo pendiente" hint="Sin operarios acumulados por pagar todavia." />;
  }
  return null;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 12,
    gap: 8,
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.sm,
    fontWeight: theme.weight.bold,
  },
  kpiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  kpiLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.font.xs,
  },
  kpiValue: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.md,
    fontWeight: theme.weight.bold,
  },
  successText: {
    color: theme.colors.success,
  },
  dangerText: {
    color: theme.colors.danger,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metric: {
    width: '48.6%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#223d70',
    backgroundColor: '#0a1b39',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 2,
  },
  metricWarning: {
    borderColor: '#634e1d',
    backgroundColor: '#291f10',
  },
  metricCalm: {
    borderColor: '#214a3e',
    backgroundColor: '#0f2a23',
  },
  metricValue: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.sm,
    fontWeight: theme.weight.bold,
  },
  metricLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.font.xs,
  },
  hint: {
    color: theme.colors.textSecondary,
    fontSize: theme.font.xs,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listMain: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.font.xs,
  },
  listMeta: {
    width: 90,
    textAlign: 'right',
    color: theme.colors.textMuted,
    fontSize: theme.font.xs,
  },
  listValue: {
    width: 104,
    textAlign: 'right',
    color: theme.colors.textSecondary,
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weekDay: {
    width: 30,
    color: theme.colors.textMuted,
    fontSize: theme.font.xs,
    textTransform: 'capitalize',
  },
  weekValue: {
    width: 98,
    textAlign: 'right',
    color: theme.colors.textSecondary,
    fontSize: theme.font.xs,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#112a54',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: theme.colors.accent,
  },
  fillWarning: {
    backgroundColor: '#f2b53f',
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: theme.font.xs,
  },
});
