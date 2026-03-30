import { useCallback } from 'react';

import { useOnlineSyncEffect } from './useOnlineSyncEffect';

export function useOperationalSyncBridge() {
  const runSync = useCallback(async () => {
    await Promise.resolve();
  }, []);

  useOnlineSyncEffect(runSync);
}
