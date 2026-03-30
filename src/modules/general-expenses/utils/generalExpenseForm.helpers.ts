// src/modules/general-expenses/utils/generalExpenseForm.helpers.ts

/** Formats a raw numeric string as a COP money input (with thousand separators). */
export function formatMoneyInput(value: string): string {
    const numeric = value.replace(/\D/g, '');
    return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Strips formatting and returns the numeric value. */
export function cleanMoney(value: string): number {
    return Number(value.replace(/\D/g, '')) || 0;
}

/** Returns a YYYY-MM-DD string from a Date object. */
export function formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/** Returns a human-readable short date (ej: "14 mar. 2026"). */
export function formatDateReadable(date: Date): string {
    return date.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}
