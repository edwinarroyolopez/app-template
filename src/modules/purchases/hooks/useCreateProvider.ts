import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { useIsOnline } from '@/hooks/useIsOnline';
import { addLocalProvider } from '@/storage/providers.local';
import { generateObjectId } from '@/utils/generateId';
import { providerService } from '../services/provider.service';

export function useCreateProvider() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const isOnline = useIsOnline();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      phone?: string;
      address?: string;
      rating: 1 | 2 | 3 | 4 | 5;
    }) => {
      if (!workspaceId || !isOnline) {
        const localId = generateObjectId();
        addLocalProvider({
          id: localId,
          workspaceId: workspaceId!,
          name: payload.name,
          phone: payload.phone,
          address: payload.address,
          rating: payload.rating,
          syncStatus: 'LOCAL',
          createdAt: Date.now(),
        });

        return {
          _id: localId,
          workspaceId,
          ...payload,
          createdAt: Date.now(),
          offline: true,
        };
      }

      return providerService.create(workspaceId, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['providers', workspaceId] });
    },
  });
}
