// src/modules/general-expenses/utils/generalExpenseForm.constants.ts

export const EXPENSE_CATEGORIES = [
    'Reparaciones',
    'Insumos',
    'Herramientas',
    'Combustible',
    'Otros',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
