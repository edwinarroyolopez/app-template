import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AppVersionStatusResponse } from '@/modules/auth/services/auth.api';

type AppUpdateState = {
  visible: boolean;
  payload: AppVersionStatusResponse | null;
  lastDismissedVersion: string | null;
  show: (payload: AppVersionStatusResponse) => void;
  hide: () => void;
  dismissForVersion: (version: string) => void;
};

export const useAppUpdateStore = create<AppUpdateState>()(
  persist(
    (set) => ({
      visible: false,
      payload: null,
      lastDismissedVersion: null,
      show: (payload) => set({ visible: true, payload }),
      hide: () => set((state) => ({
        visible: state.payload?.forceUpdate ? true : false,
      })),
      dismissForVersion: (version) =>
        set({
          visible: false,
          lastDismissedVersion: version,
        }),
    }),
    {
      name: 'app-update-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        lastDismissedVersion: state.lastDismissedVersion,
      }),
    },
  ),
);
