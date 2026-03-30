import React from 'react';
import { LogBox } from 'react-native';
import { RootSiblingParent } from 'react-native-root-siblings';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import RootNavigator from './src/navigation/RootNavigator';
import PushNotificationsBootstrap from '@/boot/PushNotificationsBootstrap';
import { GlobalHelpModal } from '@/components/GlobalHelpModal/GlobalHelpModal';
import { AppUpdateModal } from '@/components/AppUpdateModal/AppUpdateModal';
import Toast from 'react-native-toast-message';

LogBox.ignoreLogs(['Setting a timer']);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 10,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootSiblingParent>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <PushNotificationsBootstrap />
            <RootNavigator />
            <GlobalHelpModal />
            <AppUpdateModal />
            <Toast />
          </QueryClientProvider>
        </SafeAreaProvider>
      </RootSiblingParent>
    </GestureHandlerRootView>
  );
}
