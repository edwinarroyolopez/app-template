import React from 'react';
import { View, Text, Pressable, Share, StyleSheet } from 'react-native';
import {
    Crown,
    ShieldCheck,
    Zap,
    CalendarClock,
    AlertTriangle,
    MessageCircle,
    Share2,
    Copy,
    PlayCircle,
    Smartphone,
} from 'lucide-react-native';

import { Linking } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';

import { useAuthStore } from '@/stores/auth.store';
import { theme } from '@/theme';
import { useNavigation } from '@react-navigation/native';

/* ================= HELPERS ================= */

function daysBetween(date?: string | Date) {
    if (!date) return null;
    const d = new Date(date);
    const now = new Date();
    return Math.max(
        Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        0
    );
}

/* ================= SCREEN ================= */

export default function AccountOverviewScreen() {
    const nav = useNavigation<any>();

    const usage = useAuthStore(s => s.usage);
    const account = useAuthStore((s: any) => s.account); // si ya lo guardas — si no, luego lo conectamos

    const isPremium =
        account?.isActive &&
        (account?.tier === 'PLUS' || account?.tier === 'ENTERPRISE');

    const plan = (() => {
        if (!isPremium) return 'STARTER';
        if (account?.tier === 'ENTERPRISE') return 'ENTERPRISE';
        return 'PLUS';
    })();

    const daysLeft = daysBetween(account?.subscriptionEndsAt);

    const expiringSoon = typeof daysLeft === 'number' && daysLeft <= 5;

    function goUpgrade() {
        nav.navigate('Upgrade');
    }

    function openSupport() {
        // Replace with your support URL when you instantiate the product.
        Linking.openURL('https://example.com/support');
    }

    const APP_LINK = 'https://example.com/download';
    const YOUTUBE_LINK = 'https://example.com/demo-video';

    function copyLink(link: string, label: string) {
        Clipboard.setString(link);
        Toast.show({
            type: 'success',
            text1: 'Enlace copiado',
            text2: `${label} copiado al portapapeles`,
        });
    }

    async function shareLink(link: string, label: string) {
        try {
            await Share.share({
                message: `${label}\n${link}`,
            });
        } catch {
            Toast.show({
                type: 'error',
                text1: 'No se pudo compartir',
            });
        }
    }

    async function shareOnWhatsApp(link: string, label: string) {
        const message = encodeURIComponent(`${label}\n${link}`);

        try {
            await Linking.openURL(`https://wa.me/?text=${message}`);
        } catch {
            Toast.show({
                type: 'error',
                text1: 'No se pudo abrir WhatsApp',
            });
        }
    }


    return (
        <MainLayout>
            <Screen>

                {/* ===== PLAN CARD WRAPPER ===== */}
                <View style={[
                    styles.planWrapper,
                    expiringSoon && styles.planWrapperWarning
                ]}>
                    <Card>

                        <View style={styles.planHeader}>
                            <Crown size={22} color={theme.colors.accent} />
                            <Text style={styles.planTitle}>
                                Plan {plan}
                            </Text>
                        </View>

                        <Text style={styles.planSub}>
                            {isPremium
                                ? 'Modo operativo completo activo'
                                : 'Modo limitado BASIC'}
                        </Text>

                        {daysLeft !== null && (
                            <View style={styles.expRow}>
                                {expiringSoon
                                    ? <AlertTriangle size={14} color={theme.colors.danger} />
                                    : <CalendarClock size={14} color={theme.colors.textMuted} />
                                }

                                <Text style={[
                                    styles.expText,
                                    expiringSoon && { color: theme.colors.danger }
                                ]}>
                                    {daysLeft === 0
                                        ? 'Caduca hoy'
                                        : `${daysLeft} días restantes`}
                                </Text>
                            </View>
                        )}

                    </Card>
                </View>

                {/* ===== USAGE ===== */}
                {usage && (
                    <Card>
                        <Text style={styles.sectionTitle}>Uso actual</Text>

                        <UsageRow label="Workspaces" {...((usage as any)?.workspaces ?? { used: 0, max: 0 })} />
                        <UsageRow label="Members" {...((usage as any)?.members ?? { used: 0, max: 0 })} />
                    </Card>
                )}

                {/* ===== BENEFITS ===== */}
                <Card>
                    <Text style={styles.sectionTitle}>Ventajas Premium</Text>

                    <Benefit text="Histórico completo" />
                    <Benefit text="Sin límites operativos" />
                    <Benefit text="Analítica avanzada" />
                    <Benefit text="Marketplace & pedidos" />
                    <Benefit text="IA negocios" />
                </Card>

                {/* ===== CTA ===== */}
                {!isPremium && (
                    <View style={styles.ctaWrapper}>
                        <Card>
                            <View style={styles.ctaRow}>
                                <Zap size={18} color={theme.colors.accent} />

                                <Text style={styles.ctaTitle}>
                                    Desbloquear modo completo
                                </Text>

                                <Pressable
                                    style={styles.ctaBtn}
                                    onPress={goUpgrade}
                                >
                                    <Text style={styles.ctaText}>
                                        Upgrade
                                    </Text>
                                </Pressable>
                            </View>
                        </Card>
                    </View>
                )}

                {/* ===== SOPORTE ===== */}

                <View style={styles.supportWrapper}>
                    <Card>
                        <View style={styles.supportRow}>

                            <MessageCircle size={18} color="#25D366" />

                            <View style={styles.supportInfo}>
                                <Text style={styles.supportTitle}>
                                    Soporte directo
                                </Text>

                                <Text style={styles.supportSub}>
                                    Contact support for your organization
                                </Text>
                            </View>

                            <Pressable
                                onPress={openSupport}
                                style={styles.supportBtn}
                            >
                                <Text style={styles.supportBtnText}>
                                    Abrir
                                </Text>
                            </Pressable>

                        </View>
                    </Card>
                </View>

                {/* ===== COMPARTIR APP ===== */}
                <Card>
                    <Text style={styles.sectionTitle}>Share the app</Text>

                    <ShareLinkRow
                        icon={Smartphone}
                        title="Install link"
                        subtitle={APP_LINK}
                        onCopy={() => copyLink(APP_LINK, 'Install link')}
                        onShare={() => shareLink(APP_LINK, 'Download the app:')}
                        onWhatsApp={() => shareOnWhatsApp(APP_LINK, 'Download the app:')}
                    />

                    <ShareLinkRow
                        icon={PlayCircle}
                        title="Product video"
                        subtitle={YOUTUBE_LINK}
                        onCopy={() => copyLink(YOUTUBE_LINK, 'Product video')}
                        onShare={() => shareLink(YOUTUBE_LINK, 'Watch the product video:')}
                        onWhatsApp={() => shareOnWhatsApp(YOUTUBE_LINK, 'Watch the product video:')}
                    />
                </Card>


            </Screen>
        </MainLayout>
    );
}

function ShareLinkRow({
    icon: Icon,
    title,
    subtitle,
    onCopy,
    onShare,
    onWhatsApp,
}: {
    icon: any;
    title: string;
    subtitle: string;
    onCopy: () => void;
    onShare: () => void;
    onWhatsApp: () => void;
}) {
    return (
        <View style={styles.shareRow}>
            <View style={styles.shareInfo}>
                <View style={styles.shareIconWrap}>
                    <Icon size={14} color={theme.colors.accent} />
                </View>
                <View style={styles.shareTexts}>
                    <Text style={styles.shareTitle}>{title}</Text>
                    <Text style={styles.shareSub}>{subtitle}</Text>
                </View>
            </View>

            <View style={styles.shareActions}>
                <Pressable onPress={onCopy} style={styles.shareBtn}>
                    <Copy size={14} color={theme.colors.textPrimary} />
                </Pressable>
                <Pressable onPress={onShare} style={styles.shareBtn}>
                    <Share2 size={14} color={theme.colors.textPrimary} />
                </Pressable>
                <Pressable onPress={onWhatsApp} style={[styles.shareBtn, styles.whatsBtn]}>
                    <MessageCircle size={14} color="#000" />
                </Pressable>
            </View>
        </View>
    );
}

/* ================= SUB COMPONENTS ================= */

function UsageRow({ label, used, max }: any) {

    const unlimited =
        max === Infinity ||
        max === null ||
        max === undefined ||
        max === -1;

    return (
        <View style={styles.usageRow}>
            <Text style={styles.usageLabel}>{label}</Text>

            <Text style={styles.usageValue}>
                {unlimited
                    ? `${used} / Ilimitado`
                    : `${used} / ${max}`
                }
            </Text>
        </View>
    );
}


function Benefit({ text }: any) {
    return (
        <View style={styles.benefitRow}>
            <ShieldCheck size={14} color={theme.colors.accent} />
            <Text style={styles.benefitText}>{text}</Text>
        </View>
    );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({

    /* PLAN WRAPPER (no style en Card) */
    planWrapper: {
        borderWidth: 1,
        borderColor: theme.colors.accent,
        borderRadius: theme.radius.lg,
    },

    planWrapperWarning: {
        borderColor: theme.colors.danger,
    },

    planHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    planTitle: {
        fontSize: theme.font.lg,
        fontWeight: theme.weight.bold,
        color: theme.colors.accent,
    },

    planSub: {
        marginTop: 6,
        color: theme.colors.textMuted,
        fontSize: theme.font.sm,
    },

    expRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        marginTop: 8,
    },

    expText: {
        fontSize: theme.font.xs,
        color: theme.colors.textMuted,
        fontWeight: theme.weight.bold,
    },

    sectionTitle: {
        fontSize: theme.font.md,
        fontWeight: theme.weight.bold,
        marginBottom: 12,
        color: theme.colors.textPrimary,
    },

    usageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },

    usageLabel: {
        color: theme.colors.textMuted,
    },

    usageValue: {
        fontWeight: theme.weight.bold,
        color: theme.colors.textPrimary,
    },

    benefitRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
        alignItems: 'center',
    },

    benefitText: {
        color: theme.colors.textPrimary,
        fontSize: theme.font.sm,
    },

    ctaWrapper: {
        borderWidth: 1,
        borderColor: theme.colors.accent,
        borderRadius: theme.radius.lg,
    },

    ctaRow: {
        alignItems: 'center',
        gap: 12,
    },

    ctaTitle: {
        fontWeight: theme.weight.bold,
        textAlign: 'center',
        color: theme.colors.textPrimary,
    },

    ctaBtn: {
        backgroundColor: theme.colors.accent,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 999,
    },

    ctaText: {
        fontWeight: theme.weight.bold,
        color: '#000',
    },

    supportWrapper: {
        borderWidth: 1,
        borderColor: '#25D366',
        borderRadius: theme.radius.lg,
    },

    supportRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    supportTitle: {
        fontWeight: theme.weight.bold,
        color: theme.colors.textPrimary,
    },

    supportSub: {
        fontSize: theme.font.xs,
        color: theme.colors.textMuted,
    },
    supportInfo: {
        flex: 1,
    },

    supportBtn: {
        backgroundColor: '#25D366',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
    },

    supportBtnText: {
        fontWeight: theme.weight.bold,
        color: '#000',
    },

    shareRow: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        padding: 10,
        marginBottom: 10,
        gap: 10,
    },
    shareInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    shareIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: theme.colors.surfaceSoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    shareTexts: {
        flex: 1,
    },
    shareTitle: {
        color: theme.colors.textPrimary,
        fontSize: theme.font.sm,
        fontWeight: theme.weight.bold,
    },
    shareSub: {
        color: theme.colors.textMuted,
        fontSize: theme.font.xs,
    },
    shareActions: {
        flexDirection: 'row',
        gap: 8,
    },
    shareBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surfaceSoft,
    },
    whatsBtn: {
        backgroundColor: '#25D366',
        borderColor: '#25D366',
    },

});
