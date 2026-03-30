import { Platform } from 'react-native';

/**
 * Dev default targets `template-backend` (see `template-backend` `PORT`, default 7000).
 * For a physical device, use your machine LAN IP instead of `10.0.2.2` / `localhost`.
 * For production, set `PRODUCTION_API_BASE_URL` before release.
 */
const DEV_ANDROID = 'http://10.0.2.2:7000/api';
const DEV_IOS = 'http://localhost:7000/api';

/** Replace when you deploy the instantiated product. */
const PRODUCTION_API_BASE_URL = 'https://api.example.com/api';

export function resolveApiBaseUrl(): string {
    if (__DEV__) {
        return Platform.OS === 'android' ? DEV_ANDROID : DEV_IOS;
    }
    return PRODUCTION_API_BASE_URL;
}
