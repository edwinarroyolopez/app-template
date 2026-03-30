import { create } from 'zustand';

type UiState = {
    isMenuOpen: boolean;
    openMenu: () => void;
    closeMenu: () => void;
    toggleMenu: () => void;
};

export const useUiStore = create<UiState>((set) => ({
    isMenuOpen: false,

    openMenu: () => set({ isMenuOpen: true }),
    closeMenu: () => set({ isMenuOpen: false }),
    toggleMenu: () =>
        set((s) => ({ isMenuOpen: !s.isMenuOpen })),
}));
