import { useCallback, useRef, useState } from 'react';
import { api } from '@/services/api';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { useIsOnline } from '@/hooks/useIsOnline';
import { storage } from '@/storage/mmkv';
import { useQueryClient } from '@tanstack/react-query';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function useDailyDelayedReview() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const isOnline = useIsOnline();
  const qc = useQueryClient();
  const [isReviewing, setIsReviewing] = useState(false);
  const reviewingRef = useRef(false);

  const runDailyReview = useCallback(async () => {
    if (!workspaceId || !isOnline || reviewingRef.current) return { skipped: true };

    const key = `sales-delayed-review:${workspaceId}:${todayKey()}`;
    if (storage.getString(key) === 'done') {
      return { skipped: true };
    }

    setIsReviewing(true);
    reviewingRef.current = true;
    try {
      const { data } = await api.post(`/workspaces/${workspaceId}/sales/delayed/review`);
      storage.set(key, 'done');
      qc.invalidateQueries({ queryKey: ['sales', workspaceId] });
      qc.invalidateQueries({ queryKey: ['delayed-sales', workspaceId] });
      return data;
    } finally {
      reviewingRef.current = false;
      setIsReviewing(false);
    }
  }, [workspaceId, isOnline, qc]);

  return {
    isReviewing,
    runDailyReview,
  };
}
