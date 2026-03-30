import { useMutation } from '@tanstack/react-query';
import { requestOtp } from '../services/auth.api';

export function useRequestOtp() {
    return useMutation({
        mutationFn: requestOtp,
    });
}
