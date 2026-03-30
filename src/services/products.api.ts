// src/api/axios.ts
import axios from 'axios';

export const api = axios.create({
    baseURL: 'https://backend-ecommerce-production-ce65.up.railway.app/api',
    timeout: 10000,
});
