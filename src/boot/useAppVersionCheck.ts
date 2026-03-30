import { useEffect } from 'react';
import { getAppVersionStatus } from '@/modules/auth/services/auth.api';
import { APP_CURRENT_VERSION, APP_PLATFORM } from '@/config/appVersion';
import { useAppUpdateStore } from '@/stores/app-update.store';

export function useAppVersionCheck(enabled: boolean) {
  const show = useAppUpdateStore((s) => s.show);
  const lastDismissedVersion = useAppUpdateStore((s) => s.lastDismissedVersion);

  useEffect(() => {
    if (!enabled) return;

    let active = true;

    async function run() {
      try {
        const status = await getAppVersionStatus({
          platform: APP_PLATFORM,
          currentVersion: APP_CURRENT_VERSION,
        });

        if (!active) return;

        if (!status.requiresUpdate) return;

        if (!status.forceUpdate && lastDismissedVersion === status.latestVersion) {
          return;
        }

        show(status);
      } catch {
        // no-op: version check must not block app startup
      }
    }

    run();

    return () => {
      active = false;
    };
  }, [enabled, lastDismissedVersion, show]);
}
