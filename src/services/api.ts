import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';
import { resolveApiBaseUrl } from '@/config/apiBaseUrl';

export const api = axios.create({
    baseURL: resolveApiBaseUrl(),
    timeout: 10000,
});

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
