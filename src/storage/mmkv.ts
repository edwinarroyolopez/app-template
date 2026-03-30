// src/storage/mmkv.ts
import { MMKV } from 'react-native-mmkv';

let mmkvInstance: MMKV | null = null;

try {
    // Intentamos instanciar la clase nativa
    mmkvInstance = new MMKV({
        id: 'business-storage',
    });
    console.log("MMKV: Instancia nativa cargada con éxito.");
} catch {
    console.warn("MMKV: El módulo nativo no está listo. Usando fallback en memoria.");
}

// Respaldo en RAM para evitar que 'storage.getString' falle
const memoryFallback = new Map<string, string>();

export const storage = {
    /** Métodos para Zustand Persist **/
    setItem: (name: string, value: string) => {
        mmkvInstance ? mmkvInstance.set(name, value) : memoryFallback.set(name, value);
    },
    getItem: (name: string) => {
        return mmkvInstance ? (mmkvInstance.getString(name) ?? null) : (memoryFallback.get(name) ?? null);
    },
    removeItem: (name: string) => {
        mmkvInstance ? mmkvInstance.delete(name) : memoryFallback.delete(name);
    },

    /** Métodos para operational-costs.local.ts **/
    // Estos nombres deben coincidir exactamente con los que usa tu archivo .local.ts
    getString: (key: string) => {
        return mmkvInstance ? mmkvInstance.getString(key) : memoryFallback.get(key);
    },
    set: (key: string, value: string | number | boolean) => {
        if (mmkvInstance) {
            mmkvInstance.set(key, value);
        } else {
            memoryFallback.set(key, String(value));
        }
    },
    delete: (key: string) => {
        mmkvInstance ? mmkvInstance.delete(key) : memoryFallback.delete(key);
    }
};
