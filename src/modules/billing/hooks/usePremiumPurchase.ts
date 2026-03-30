// src/modules/billing/hooks/usePremiumPurchase.ts

import { useEffect, useRef } from 'react';
import {
    initConnection,
    endConnection,
    fetchProducts,
    requestPurchase,
    finishTransaction,
    purchaseUpdatedListener,
    purchaseErrorListener,
    getAvailablePurchases,
    type PurchaseError,
} from 'react-native-iap';

import { useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import Toast from 'react-native-toast-message';
import { IAP_SUBSCRIPTIONS } from '../iap.constants';

/* ========================= */

/** Must match `applicationId` in `android/app/build.gradle` (update when you change the Android id). */
const PACKAGE_NAME = 'com.pulsocop';

/* ========================= */

export function usePremiumPurchase() {
    const purchaseUpdateSub = useRef<{ remove: () => void } | null>(null);
    const purchaseErrorSub = useRef<{ remove: () => void } | null>(null);

    /* ================= BACKEND VERIFY ================= */

    const verifyMutation = useMutation({
        mutationFn: async (payload: {
            purchaseToken: string;
            productId: string;
            packageName: string;
        }) => {
            const { data } = await api.post(
                '/billing/google-play/verify',
                payload,
            );
            return data;
        },
    });

    /* ================= INIT ================= */

    useEffect(() => {
        let mounted = true;

        async function init() {
            try {
                await initConnection();

                purchaseUpdateSub.current =
                    purchaseUpdatedListener(async (purchase: any) => {
                        if (!mounted) return;

                        try {
                            const token =
                                purchase.purchaseToken ??
                                purchase.transactionReceipt;

                            if (!token) return;

                            await verifyMutation.mutateAsync({
                                purchaseToken: token,
                                productId: purchase.productId,
                                packageName: PACKAGE_NAME,
                            });

                            await finishTransaction({
                                purchase,
                                isConsumable: false,
                            });

                            Toast.show({
                                type: 'success',
                                text1: 'Premium activado',
                                text2: 'Suscripción validada',
                            });

                        } catch (e: any) {
                            Toast.show({
                                type: 'error',
                                text1: 'Error validando compra',
                                text2: e?.message ?? 'verify failed',
                            });
                        }
                    });

                purchaseErrorSub.current =
                    purchaseErrorListener((error: PurchaseError) => {
                        if (!mounted) return;

                        Toast.show({
                            type: 'error',
                            text1: 'Compra cancelada',
                            text2: error?.message ?? 'IAP error',
                        });
                    });

            } catch (e) {
                console.log('IAP init error', e);
            }
        }

        init();

        return () => {
            mounted = false;
            purchaseUpdateSub.current?.remove();
            purchaseErrorSub.current?.remove();
            endConnection();
        };

    }, [verifyMutation]);

    /* ================= BUY ================= */

    async function buyPremium(plan: 'MONTHLY' | 'YEARLY') {

        const sku =
            plan === 'YEARLY'
                ? IAP_SUBSCRIPTIONS.PREMIUM_YEARLY
                : IAP_SUBSCRIPTIONS.PREMIUM_MONTHLY;

        try {

            // ✅ NUEVO — fetchProducts (Nitro API)
            const products = await fetchProducts({
                skus: [sku],
                type: 'subs',
            });

            if (!products?.length) {
                Toast.show({
                    type: 'error',
                    text1: 'No disponible',
                    text2: 'Suscripción no encontrada',
                });
                return;
            }

            const sub: any = products[0];

            const offerToken =
                sub.subscriptionOfferDetailsAndroid?.[0]?.offerToken;

            // ✅ NUEVO — requestPurchase
            await requestPurchase({
                type: 'subs',
                request: {
                    android: {
                        skus: [sku],
                        subscriptionOffers: offerToken
                            ? [{ sku, offerToken }]
                            : undefined,
                    },
                    apple: {
                        sku,
                    },
                },
            });

        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: 'Error compra',
                text2: err?.message ?? 'request failed',
            });
        }
    }

    /* ================= RESTORE ================= */

    async function restorePremium() {
        try {

            const purchases = await getAvailablePurchases();

            const sub = purchases.find(p =>
                p.productId === IAP_SUBSCRIPTIONS.PREMIUM_MONTHLY ||
                p.productId === IAP_SUBSCRIPTIONS.PREMIUM_YEARLY
            );

            if (!sub?.purchaseToken) return false;

            await verifyMutation.mutateAsync({
                purchaseToken: sub.purchaseToken,
                productId: sub.productId,
                packageName: PACKAGE_NAME,
            });

            Toast.show({
                type: 'success',
                text1: 'Premium restaurado',
            });

            return true;

        } catch {
            return false;
        }
    }

    /* ================= */

    return {
        buyPremium,
        restorePremium,
        isLoading: verifyMutation.isPending,
    };
}
