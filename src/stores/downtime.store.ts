import { create } from 'zustand';

type Downtime = {
    id: string;
    type: string;
    openedAt: string;
    closedAt?: string;
};

type DowntimeState = {
    active: Downtime[];
    history: Downtime[];

    setActive: (d: Downtime[]) => void;
    setHistory: (d: Downtime[]) => void;
};

export const useDowntimeStore = create<DowntimeState>((set) => ({
    active: [],
    history: [],

    setActive: (active) => set({ active }),
    setHistory: (history) => set({ history }),
}));
