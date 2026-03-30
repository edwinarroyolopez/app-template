import type { AppStackParamList } from '@/navigation/AppNavigator';
import type { TransactionItem } from '../types/transaction.type';

type NavigationLike = {
  navigate: <T extends keyof AppStackParamList>(
    route: T,
    params?: AppStackParamList[T],
  ) => void;
};

function sourceIdAsString(value?: string) {
  return value ? String(value) : '';
}

export function hasTransactionOriginNavigation(item: TransactionItem) {
  if (item.origin?.type === 'MANUAL') return false;

  if (item.origin?.type === 'CASH_CLOSING') return true;
  if (item.origin?.type === 'SALE' || item.origin?.type === 'SALE_PAYMENT') return true;
  if (item.origin?.type === 'PURCHASE' || item.origin?.type === 'PURCHASE_PAYMENT') {
    return !!item.origin?.meta?.invoiceGroupId;
  }
  if (item.origin?.type === 'PAYABLE_PAYMENT') {
    return !!item.origin?.meta?.payableId;
  }

  return false;
}

export function navigateToTransactionOrigin(navigation: NavigationLike, item: TransactionItem) {
  const sourceType = item.origin?.type;
  const sourceId = sourceIdAsString(item.origin?.id);

  if (sourceType === 'CASH_CLOSING') {
    navigation.navigate('CashClosings');
    return;
  }

  if (sourceType === 'SALE') {
    const saleId = sourceId || String(item.origin?.meta?.saleId || '');
    if (saleId) navigation.navigate('SaleDetail', { saleId });
    return;
  }

  if (sourceType === 'SALE_PAYMENT') {
    const fromMeta = String(item.origin?.meta?.saleId || '');
    const fromSource = sourceId.includes(':payment:') ? sourceId.split(':payment:')[0] : sourceId;
    const saleId = fromMeta || fromSource;
    if (saleId) navigation.navigate('SaleDetail', { saleId });
    return;
  }

  if (sourceType === 'PURCHASE' || sourceType === 'PURCHASE_PAYMENT') {
    const invoiceKey = String(item.origin?.meta?.invoiceGroupId || '');
    if (invoiceKey) navigation.navigate('PurchaseInvoiceDetail', { invoiceKey });
    return;
  }

  if (sourceType === 'PAYABLE_PAYMENT') {
    const payableId = String(item.origin?.meta?.payableId || '');
    if (payableId) navigation.navigate('PayableDetail', { payableId });
  }
}
