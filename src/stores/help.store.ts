// src/stores/help.store.ts
import { create } from 'zustand';
import { HELP_CONTENT, type HelpContent, type HelpContentKey } from '@/components/GlobalHelpModal/help-content';

interface HelpState {
    visible: boolean;
    content: HelpContent | null;
    show: (key: HelpContentKey | string) => void;
    hide: () => void;
}

export const useHelpStore = create<HelpState>((set) => ({
    visible: false,
    content: null,
    show: (key: string) => {
        const resolvedKey = key in HELP_CONTENT ? (key as HelpContentKey) : 'general';
        const content = HELP_CONTENT[resolvedKey];
        set({ visible: true, content });
    },
    hide: () => set({ visible: false }),
}));
