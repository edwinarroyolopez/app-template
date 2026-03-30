import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

type SyncRunner = () => Promise<unknown> | unknown;

export function useOnlineSyncEffect(runner: SyncRunner) {
  useEffect(() => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected) {
        void runner();
      }
    });

    const unsub = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        void runner();
      }
    });

    return () => unsub();
  }, [runner]);
}
