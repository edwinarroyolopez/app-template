import { api } from '@/services/api';

export async function fetchMe() {
    const { data } = await api.get('/me');
    return data as {
        user: any;
        businesses: {
            _id: string;
            name: string;
            role: 'OWNER' | 'ADMIN' | 'OPERATOR';
        }[];
    };
}
