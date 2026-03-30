// src/config/appMode.ts
const env = (globalThis as any)?.process?.env ?? {};
export const APP_MODE = (env.APP_MODE as 'public' | 'direct' | undefined) ?? 'public';
export const IS_PUBLIC = APP_MODE === 'public';
export const IS_DIRECT = APP_MODE === 'direct';
