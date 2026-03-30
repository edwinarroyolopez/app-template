import { Platform } from 'react-native';

// IMPORTANT:
// Keep this aligned with android/app/build.gradle versionName (and iOS build settings).
export const APP_CURRENT_VERSION = '1.6.6';
export const APP_PLATFORM: 'android' | 'ios' = Platform.OS === 'ios' ? 'ios' : 'android';
