// src/hooks/useIsOnline.ts
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export function useIsOnline() {
    const [online, setOnline] = useState(true);

    useEffect(() => {
        const unsub = NetInfo.addEventListener((state) => {
            const ok = Boolean(state.isConnected && state.isInternetReachable !== false);
            setOnline(ok);
        });

        return () => unsub();
    }, []);

    return online;
}
