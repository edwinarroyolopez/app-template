// src/modules/billing/screens/UpgradeScreen.tsx

import { View, Text, Pressable, ScrollView, Linking, StyleSheet } from 'react-native';
import {
    Crown,
    Check,
    Sparkles,
    Shield,
    MessageCircle,
    BarChart3,
    Brain,
    Infinity,
    Zap
} from 'lucide-react-native';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { Card } from '@/components/ui/Card';
import { theme } from '@/theme';
import { useUpgradeIntent } from '@/modules/accounts/hooks/useUpgradeIntent';
import { usePremiumPurchase } from '../hooks/usePremiumPurchase';
import Toast from 'react-native-toast-message';
import { ActionLoader } from '@/components/ui/ActionLoader';
import { useState } from 'react';

const WHATSAPP_URL =
    'https://wa.me/?text=Replace%20with%20your%20sales%20WhatsApp%20deep%20link%20when%20you%20instantiate%20the%20product';

export default function UpgradeScreen() {

    const { buyPremium } = usePremiumPurchase();
    const intent = useUpgradeIntent();

    const [processing, setProcessing] = useState(false);
    const [plan, setPlan] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

    /* ================= TRACK ================= */

    function track(planType: 'PREMIUM' | 'PRO', context: string) {
        intent.mutate({
            sourceScreen: 'UpgradeScreen',
            suggestedPlan: planType,
            context,
        });
    }

    /* ================= ACTIONS ================= */

    function openWhatsApp() {
        track('PRO', 'pro_whatsapp_cta');
        Linking.openURL(WHATSAPP_URL);
    }

    async function handlePremium() {
        try {
            setProcessing(true);

            track('PREMIUM', `premium_${plan.toLowerCase()}_cta`);

            await buyPremium(plan);

        } catch (err: any) {

            const message =
                err?.response?.data?.message ||
                err?.message ||
                'No fue posible completar la compra';

            Toast.show({
                type: 'error',
                text1: 'Error en la compra',
                text2: message,
            });

        } finally {
            setProcessing(false);
        }
    }

    const priceText =
        plan === 'MONTHLY'
            ? '$49.900 COP / mes'
            : '$499.000 COP / año';

    const savingsText =
        plan === 'YEARLY'
            ? 'Ahorra ~2 meses'
            : null;
    /* ================= RENDER ================= */

    return (
        <MainLayout>
            <ScrollView
                contentContainerStyle={{
                    padding: theme.spacing.lg,
                    gap: theme.spacing.lg,
                }}
            >

                {/* HEADER */}

                <Card>
                    <View style={{ gap: 12 }}>
                        <Crown size={28} color={theme.colors.accent} />

                        <Text style={styles.title}>
                            Unlock premium
                        </Text>

                        <Text style={styles.subtitle}>
                            Raise limits and ship with clearer operational headroom — tune copy when you
                            instantiate the product.
                        </Text>
                    </View>
                </Card>

                {/* ===== COMPARADOR V2 ===== */}

                <Card>
                    <Text style={styles.sectionTitle}>
                        Comparador de planes
                    </Text>

                    <PlanRow label="Operations" basic="Limitadas" premium="Ilimitadas" />
                    <PlanRow label="Analíticas" basic="Básico" premium="Avanzado" />
                    <PlanRow label="IA" basic="—" premium="Incluida" />
                    <PlanRow label="Marketplace" basic="—" premium="Incluido" />
                    <PlanRow label="Pedidos" basic="—" premium="Incluido" />
                </Card>

                {/* BENEFICIOS */}

                <Card>
                    <Text style={styles.sectionTitle}>
                        Beneficios Premium
                    </Text>

                    <Benefit icon={Infinity} text="Operations ilimitadas" />
                    <Benefit icon={BarChart3} text="Analíticas avanzadas" />
                    <Benefit icon={Brain} text="Diagnóstico operativo con IA" />
                    <Benefit text="Costo real por ciclo" />
                    <Benefit text="Reportes para partners" />
                </Card>

                {/* PREMIUM */}

                <Card>
                    <View style={{ gap: 12 }}>

                        <View style={styles.planHeader}>
                            <Sparkles size={18} color={theme.colors.accent} />
                            <Text style={styles.planTitle}>
                                Plan Premium
                            </Text>
                        </View>

                        {/* selector */}

                        <View style={styles.toggleRow}>

                            <Pressable
                                onPress={() => setPlan('MONTHLY')}
                                style={[
                                    styles.planToggle,
                                    plan === 'MONTHLY' && styles.planToggleActive,
                                ]}
                            >
                                <Text style={[
                                    styles.toggleText,
                                    { color: plan === 'MONTHLY' ? '#000' : theme.colors.textPrimary }
                                ]}>
                                    Mensual
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={() => setPlan('YEARLY')}
                                style={[
                                    styles.planToggle,
                                    plan === 'YEARLY' && styles.planToggleActive,
                                ]}
                            >
                                <Text style={[
                                    styles.toggleText,
                                    { color: plan === 'YEARLY' ? '#000' : theme.colors.textPrimary }
                                ]}>
                                    Anual
                                </Text>
                            </Pressable>

                        </View>

                        <Text style={styles.priceText}>
                            {priceText}
                        </Text>

                        {savingsText && (
                            <Text style={styles.savingsText}>
                                {savingsText}
                            </Text>
                        )}

                        <Text style={styles.subText}>
                            Activación automática — sin llamadas
                        </Text>

                        <Pressable
                            onPress={handlePremium}
                            style={styles.primaryBtn}
                        >
                            <Zap size={16} color="#000" />
                            <Text style={styles.primaryBtnText}>
                                Activar Premium ahora
                            </Text>
                        </Pressable>

                    </View>
                </Card>

                {/* PRO */}

                <Card>
                    <View style={{ gap: 12 }}>

                        <View style={styles.planHeader}>
                            <Shield size={18} color={theme.colors.accent} />
                            <Text style={styles.planTitle}>
                                Plan PRO Directo
                            </Text>
                        </View>

                        <Text style={styles.subText}>
                            Para operaciones que quieren acompañamiento real
                        </Text>

                        <Benefit text="Setup guiado" />
                        <Benefit text="Configuración operacional" />
                        <Benefit text="Soporte prioritario" />
                        <Benefit text="Ajustes personalizados" />
                        <Benefit text="Activación manual" />


                        <Pressable
                            onPress={openWhatsApp}
                            style={styles.secondaryBtn}
                        >
                            <MessageCircle size={16} color="#000" />
                            <Text style={styles.secondaryBtnText}>
                                Hablar con un asesor
                            </Text>
                        </Pressable>

                    </View>
                </Card>

                {/* FOOTER */}

                <Text style={styles.footerText}>
                    Una mala liquidación paga varios meses de Premium.
                </Text>

            </ScrollView>

            <ActionLoader
                visible={processing}
                steps={[
                    'Conectando a Google Play…',
                    'Procesando suscripción…',
                    'Validando compra…',
                    'Activando Premium…',
                    'Abriendo túnel de ingresos…',
                ]}
            />

            <Toast />
        </MainLayout>
    );
}

/* ================= COMPONENTS ================= */

function Benefit({ text, icon: Icon }: any) {
    return (
        <View style={styles.benefitRow}>
            {Icon
                ? <Icon size={16} color={theme.colors.accent} />
                : <Check size={16} color={theme.colors.accent} />}
            <Text style={styles.benefitText}>{text}</Text>
        </View>
    );
}

function PlanRow({ label, basic, premium }: any) {
    return (
        <View style={styles.planRow}>
            <Text style={styles.planRowLabel}>{label}</Text>
            <Text style={styles.planBasic}>{basic}</Text>
            <Text style={styles.planPremium}>{premium}</Text>
        </View>
    );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({

    title: {
        fontSize: theme.font.xl,
        fontWeight: theme.weight.bold,
        color: theme.colors.textPrimary,
    },

    subtitle: {
        color: theme.colors.textSecondary,
        fontSize: theme.font.sm,
        lineHeight: 20,
    },

    sectionTitle: {
        fontSize: theme.font.md,
        fontWeight: theme.weight.bold,
        color: theme.colors.textPrimary,
        marginBottom: 8,
    },

    benefitRow: {
        flexDirection: 'row' as const,
        gap: 8,
        alignItems: 'center' as const,
    },

    benefitText: {
        color: theme.colors.textSecondary,
        fontSize: theme.font.sm,
    },

    planHeader: {
        flexDirection: 'row' as const,
        gap: 8,
        alignItems: 'center' as const,
    },

    planTitle: {
        fontSize: theme.font.md,
        fontWeight: theme.weight.bold,
        color: theme.colors.textPrimary,
    },

    toggleRow: {
        flexDirection: 'row' as const,
        gap: 12,
    },

    planToggle: {
        flex: 1,
        padding: 10,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surfaceSoft,
        alignItems: 'center' as const,
    },

    planToggleActive: {
        backgroundColor: theme.colors.accent,
    },

    toggleText: {
        fontWeight: theme.weight.bold,
    },

    priceText: {
        fontSize: theme.font.lg,
        fontWeight: theme.weight.bold,
        color: theme.colors.accent,
    },

    savingsText: {
        fontSize: theme.font.sm,
        fontWeight: theme.weight.bold,
        color: theme.colors.success,
    },

    subText: {
        color: theme.colors.textSecondary,
        fontSize: theme.font.sm,
    },

    primaryBtn: {
        backgroundColor: theme.colors.accent,
        paddingVertical: 14,
        borderRadius: theme.radius.lg,
        alignItems: 'center' as const,
        flexDirection: 'row' as const,
        gap: 8,
        justifyContent: 'center' as const,
    },

    primaryBtnText: {
        color: '#000',
        fontWeight: theme.weight.bold,
    },

    secondaryBtn: {
        backgroundColor: '#25D366',
        paddingVertical: 14,
        borderRadius: theme.radius.lg,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        flexDirection: 'row' as const,
        gap: 8,
    },

    secondaryBtnText: {
        color: '#000',
        fontWeight: theme.weight.bold,
    },

    proBox: {
        backgroundColor: theme.colors.surfaceSoft,
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
        gap: 4,
    },

    proPrice: {
        fontWeight: theme.weight.bold,
        color: theme.colors.textPrimary,
    },

    footerText: {
        textAlign: 'center' as const,
        color: theme.colors.textMuted,
        fontSize: theme.font.xs,
        marginTop: 8,
    },

    planRow: {
        flexDirection: 'row' as const,
        justifyContent: 'space-between',
        paddingVertical: 6,
    },

    planRowLabel: {
        flex: 1,
        color: theme.colors.textPrimary,
        fontWeight: theme.weight.semibold,
    },

    planBasic: {
        flex: 1,
        textAlign: 'center' as const,
        color: theme.colors.textMuted,
    },

    planPremium: {
        flex: 1,
        textAlign: 'center' as const,
        color: theme.colors.accent,
        fontWeight: theme.weight.bold,
    },
});
