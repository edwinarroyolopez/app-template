import { Alert, Platform } from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

import { storage } from '@/storage/mmkv';
import { navigationRef } from '@/navigation/navigationRef';
import { useAuthStore } from '@/stores/auth.store';
import { registerPushToken } from '@/modules/auth/services/auth.api';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';

const FCM_TOKEN_KEY = 'fcm:token';
const FCM_TOKEN_USER_KEY = 'fcm:token:user';
const PENDING_PUSH_CONTEXT_KEY = 'push:pending:context';

type SalePushData = {
  type?: string;
  saleId?: string;
  workspaceId?: string;
  screen?: string;
  mode?: 'FACTORY' | 'DELIVERY';
};

type PendingPushContext = {
  saleId?: string;
  workspaceId?: string;
  screen?: string;
  mode?: 'FACTORY' | 'DELIVERY';
};

function extractSalePushData(message?: FirebaseMessagingTypes.RemoteMessage | null): SalePushData {
  if (!message?.data) return {};

  const parse = (value: unknown) => (typeof value === 'string' ? value : undefined);

  return {
    type: parse(message.data.type),
    saleId: parse(message.data.saleId),
    workspaceId: parse(message.data.workspaceId ?? message.data.businessId),
    screen: parse(message.data.screen),
    mode: parse(message.data.mode) as 'FACTORY' | 'DELIVERY' | undefined,
  };
}

function queueSaleNavigation(context: PendingPushContext) {
  storage.set(PENDING_PUSH_CONTEXT_KEY, JSON.stringify(context));
}

function clearQueuedSaleNavigation() {
  storage.delete(PENDING_PUSH_CONTEXT_KEY);
}

/** Canonical key is `workspaceId`; older backends may still send `businessId`. */
function ensureActiveWorkspaceForPush(workspaceId?: string) {
  if (!workspaceId) return true;

  const state = useOperationalWorkspaceContextStore.getState();
  if (state.activeWorkspaceContext?.workspace.id === workspaceId) return true;

  const found = state.workspaceContexts.find((item) => item.workspace?.id === workspaceId);
  if (found) {
    state.setActiveWorkspaceContext(found);
    return true;
  }

  return false;
}

function navigateFromPushContext(context: PendingPushContext) {
  if (!navigationRef.isReady()) {
    queueSaleNavigation(context);
    return;
  }

  if (!ensureActiveWorkspaceForPush(context.workspaceId)) {
    queueSaleNavigation(context);
    return;
  }

  if (context.screen === 'FactoryOrders') {
    navigationRef.navigate('FactoryOrders');
    return;
  }

  if (context.screen === 'FactoryOrderDetail' && context.saleId) {
    navigationRef.navigate('FactoryOrderDetail', { saleId: context.saleId, mode: context.mode });
    return;
  }

  if (context.screen === 'ReadyForDeliveryOrders') {
    navigationRef.navigate('ReadyForDeliveryOrders');
    return;
  }

  if (context.screen === 'Sales') {
    navigationRef.navigate('Sales');
    return;
  }

  if (context.screen === 'SaleDetail' && context.saleId) {
    navigationRef.navigate('SaleDetail', { saleId: context.saleId });
    return;
  }

  if (context.saleId) {
    navigationRef.navigate('SaleDetail', { saleId: context.saleId });
  }
}

export function flushPendingPushNavigation() {
  const raw = storage.getString(PENDING_PUSH_CONTEXT_KEY);
  if (!raw) return;

  let context: PendingPushContext | null = null;
  try {
    context = JSON.parse(raw) as PendingPushContext;
  } catch {
    clearQueuedSaleNavigation();
    return;
  }
  if (!context?.saleId && !context?.screen) {
    clearQueuedSaleNavigation();
    return;
  }

  if (!navigationRef.isReady()) return;
  const isAuthenticated = useAuthStore.getState().isAuthenticated;
  if (!isAuthenticated) return;

  clearQueuedSaleNavigation();
  navigateFromPushContext(context);
}

function handleSalePushNavigation(message?: FirebaseMessagingTypes.RemoteMessage | null) {
  const data = extractSalePushData(message);

  const isSaleNotification = data.type === 'SALE_CREATED' || data.type === 'SALE_STATUS_CHANGED';
  if (!isSaleNotification) {
    return;
  }

  const isAuthenticated = useAuthStore.getState().isAuthenticated;
  if (!isAuthenticated) {
    queueSaleNavigation({ saleId: data.saleId, workspaceId: data.workspaceId, screen: data.screen, mode: data.mode });
    return;
  }

  navigateFromPushContext({ saleId: data.saleId, workspaceId: data.workspaceId, screen: data.screen, mode: data.mode });
}

export async function ensurePushPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  return enabled;
}

export async function registerPushTokenForCurrentUser(options?: { force?: boolean }) {
  const authState = useAuthStore.getState();
  const userId = authState.user?.id;
  if (!authState.token || !userId) return;

  const enabled = await ensurePushPermission();
  if (!enabled) return;

  const fcmToken = await messaging().getToken();
  if (!fcmToken) return;

  const savedToken = storage.getString(FCM_TOKEN_KEY);
  const savedTokenUserId = storage.getString(FCM_TOKEN_USER_KEY);
  if (!options?.force && savedToken === fcmToken && savedTokenUserId === userId) {
    return;
  }

  await registerPushToken({
    token: fcmToken,
    platform: Platform.OS as 'android' | 'ios',
  });

  storage.set(FCM_TOKEN_KEY, fcmToken);
  storage.set(FCM_TOKEN_USER_KEY, userId);
}

export function setupPushMessageListeners() {
  const unsubOnMessage = messaging().onMessage(async (message) => {
    const data = extractSalePushData(message);
    const isSaleNotification = data.type === 'SALE_CREATED' || data.type === 'SALE_STATUS_CHANGED';
    if (!isSaleNotification) return;

    Alert.alert(
      message.notification?.title || 'Actualización de venta',
      message.notification?.body || 'Se actualizó una venta',
      [
        { text: 'Cerrar', style: 'cancel' },
        {
          text: 'Ver venta',
          onPress: () =>
            navigateFromPushContext({
              saleId: data.saleId,
              workspaceId: data.workspaceId,
              screen: data.screen,
              mode: data.mode,
            }),
        },
      ],
    );
  });

  const unsubOnOpened = messaging().onNotificationOpenedApp((message) => {
    handleSalePushNavigation(message);
  });

  const unsubTokenRefresh = messaging().onTokenRefresh(async (nextToken) => {
    const authState = useAuthStore.getState();
    const userId = authState.user?.id;
    if (!authState.token || !userId || !nextToken) return;

    await registerPushToken({
      token: nextToken,
      platform: Platform.OS as 'android' | 'ios',
    });

    storage.set(FCM_TOKEN_KEY, nextToken);
    storage.set(FCM_TOKEN_USER_KEY, userId);
  });

  return () => {
    unsubOnMessage();
    unsubOnOpened();
    unsubTokenRefresh();
  };
}

export async function handleInitialPushOpen() {
  const initial = await messaging().getInitialNotification();
  if (!initial) return;

  handleSalePushNavigation(initial);
}
