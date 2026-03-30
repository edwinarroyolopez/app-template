// src/modules/payables/screens/PayableDetailScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Calendar,
    User,
    DollarSign,
    AlertCircle,
    CheckCircle,
    XCircle,
    Coins,
    Clock,
    FileText,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';
import { theme } from '@/theme';

import { usePayable } from '../hooks/usePayable';
import { usePayments } from '../hooks/usePayments';
import { useDeletePayable } from '../hooks/useDeletePayable';
import { useDeletePayment } from '../hooks/useDeletePayment';
import PaymentCard from '../components/PaymentCard';
import CreatePaymentModal from '../components/CreatePaymentModal';
import CreatePayableModal from '../components/CreatePayableModal';

import type { AppStackParamList } from '@/navigation/AppNavigator';

type RouteParams = RouteProp<AppStackParamList, 'PayableDetail'>;

export default function PayableDetailScreen() {
    const route = useRoute<RouteParams>();
    const navigation = useNavigation();
    const { payableId } = route.params;

    const { data: payable, isLoading } = usePayable(payableId);
    const { data: payments, isLoading: paymentsLoading } = usePayments(payableId);
    const deletePayable = useDeletePayable();
    const deletePayment = useDeletePayment(payableId);

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    if (isLoading) {
        return (
            <MainLayout>
                <Screen>
                    <Loader message="Cargando detalles…" />
                </Screen>
            </MainLayout>
        );
    }

    if (!payable) {
        return (
            <MainLayout>
                <Screen>
                    <Text style={styles.errorText}>No se encontró la cuenta por pagar</Text>
                </Screen>
            </MainLayout>
        );
    }

    const isOverdue =
        payable.status === 'OPEN' && payable.dueDate && new Date(payable.dueDate) < new Date();

    const statusConfig = {
        OPEN: { color: theme.colors.warning, bgColor: `${theme.colors.warning}22`, icon: Clock, label: 'Pendiente' },
        PAID: { color: theme.colors.success, bgColor: `${theme.colors.success}22`, icon: CheckCircle, label: 'Pagado' },
        CANCELLED: { color: theme.colors.danger, bgColor: `${theme.colors.danger}22`, icon: XCircle, label: 'Cancelado' },
    }[payable.status];

    const StatusIcon = statusConfig.icon;

    function handleDelete() {
        Alert.alert(
            'Eliminar cuenta por pagar',
            '¿Estás seguro de que deseas cancelar esta cuenta por pagar?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deletePayable.mutateAsync(payableId);
                            Toast.show({
                                type: 'success',
                                text1: 'Cuenta por pagar cancelada',
                            });
                            navigation.goBack();
                        } catch (err: any) {
                            Toast.show({
                                type: 'error',
                                text1: 'Error al eliminar',
                                text2: err?.message || 'Error desconocido',
                            });
                        }
                    },
                },
            ]
        );
    }

    function handleDeletePayment(paymentId: string) {
        Alert.alert('Eliminar pago', '¿Estás seguro de que deseas eliminar este pago?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Eliminar',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deletePayment.mutateAsync(paymentId);
                        Toast.show({
                            type: 'success',
                            text1: 'Pago eliminado',
                        });
                    } catch (err: any) {
                        Toast.show({
                            type: 'error',
                            text1: 'Error al eliminar',
                            text2: err?.message || 'Error desconocido',
                        });
                    }
                },
            },
        ]);
    }

    return (
        <MainLayout>
            <View style={styles.container}>
                {/* HEADER */}
                <Card>
                    <View style={styles.header}>
                        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                            <ArrowLeft size={20} color={theme.colors.textPrimary} />
                        </Pressable>
                        <Text style={styles.headerTitle}>Detalle de cuenta</Text>
                        <View style={styles.headerSpacer} />
                    </View>
                </Card>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* STATUS & OVERDUE */}
                    <View style={styles.statusSection}>
                        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                            <StatusIcon size={18} color={statusConfig.color} />
                            <Text style={[styles.statusText, { color: statusConfig.color }]}>
                                {statusConfig.label}
                            </Text>
                        </View>

                        {isOverdue && (
                            <View style={styles.overdueWarning}>
                                <AlertCircle size={16} color={theme.colors.danger} />
                                <Text style={styles.overdueText}>
                                    Vencido desde {payable.dueDate!.slice(0, 10)}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* MAIN INFO */}
                    <Card>
                        <View style={styles.titleRow}>
                            <FileText size={16} color={theme.colors.textSecondary} />
                            <Text style={styles.title}>{payable.title}</Text>
                        </View>

                        {payable.vendorName && (
                            <View style={styles.infoRow}>
                                <User size={16} color={theme.colors.textMuted} />
                                <Text style={styles.infoText}>{payable.vendorName}</Text>
                            </View>
                        )}

                        <View style={styles.infoRow}>
                            <Calendar size={16} color={theme.colors.textMuted} />
                            <Text style={styles.infoText}>Fecha: {payable.date.slice(0, 10)}</Text>
                        </View>

                        {payable.dueDate && (
                            <View style={styles.infoRow}>
                                <Calendar size={16} color={theme.colors.textMuted} />
                                <Text style={styles.infoText}>
                                    Vencimiento: {payable.dueDate.slice(0, 10)}
                                </Text>
                            </View>
                        )}

                        {payable.description && (
                            <Text style={styles.description}>{payable.description}</Text>
                        )}
                    </Card>

                    {/* AMOUNTS */}
                    <Card>
                        <View style={styles.amountsGrid}>
                            <View style={styles.amountItem}>
                                <View style={styles.amountTitleRow}>
                                    <Coins size={13} color={theme.colors.accent} />
                                    <Text style={styles.amountLabel}>Total</Text>
                                </View>
                                <Text style={styles.amountValue}>
                                    ${payable.amountCop.toLocaleString()}
                                </Text>
                            </View>
                            <View style={styles.amountItem}>
                                <Text style={styles.amountLabel}>Pagado</Text>
                                <Text style={[styles.amountValue, styles.amountPaid]}> 
                                    ${payable.paidCop.toLocaleString()}
                                </Text>
                            </View>
                            <View style={styles.amountItem}>
                                <Text style={styles.amountLabel}>Pendiente</Text>
                                <Text style={[styles.amountValue, styles.amountPending]}> 
                                    ${payable.remainingCop.toLocaleString()}
                                </Text>
                            </View>
                        </View>
                    </Card>

                    {/* PAYMENTS SECTION */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Pagos registrados</Text>
                        {paymentsLoading ? (
                            <Text style={styles.loadingText}>Cargando pagos...</Text>
                        ) : payments && payments.length > 0 ? (
                            payments.map((payment) => (
                                <PaymentCard
                                    key={payment._id}
                                    payment={payment}
                                    onDelete={() => handleDeletePayment(payment._id)}
                                />
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No hay pagos registrados</Text>
                        )}
                    </View>

                    {/* REGISTER PAYMENT BUTTON */}
                    {payable.status !== 'CANCELLED' && payable.remainingCop > 0 && (
                        <Pressable
                            onPress={() => setShowPaymentModal(true)}
                            style={({ pressed }) => [styles.registerPaymentButton, pressed && styles.pressed]}
                        >
                            <DollarSign size={18} color={theme.colors.background} />
                            <Text style={styles.registerPaymentText}>Registrar pago</Text>
                        </Pressable>
                    )}

                    {/* ACTIONS */}
                    {payable.status !== 'PAID' && (
                        <View style={styles.actions}>
                            <Pressable
                                onPress={() => setShowEditModal(true)}
                                style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
                            >
                                <Edit size={16} color={theme.colors.textPrimary} />
                                <Text style={styles.actionButtonText}>Editar</Text>
                            </Pressable>

                            <Pressable onPress={handleDelete} style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}>
                                <Trash2 size={16} color={theme.colors.danger} />
                                <Text style={styles.deleteButtonText}>Eliminar</Text>
                            </Pressable>
                        </View>
                    )}
                </ScrollView>
            </View>

            {/* MODALS */}
            <CreatePaymentModal
                visible={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                payableId={payableId}
                remainingAmount={payable.remainingCop}
            />

            <CreatePayableModal
                visible={showEditModal}
                onClose={() => setShowEditModal(false)}
                initialData={payable}
            />

            <Toast />
        </MainLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.surfaceSoft,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: theme.font.lg,
        fontWeight: theme.weight.bold,
        color: theme.colors.textPrimary,
    },
    headerSpacer: {
        width: theme.spacing.md,
    },
    scrollContent: {
        padding: theme.spacing.md,
        paddingBottom: theme.spacing.xl,
        gap: theme.spacing.md,
    },
    statusSection: {
        gap: theme.spacing.sm,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        alignSelf: 'flex-start',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radius.lg,
    },
    statusText: {
        fontSize: theme.font.sm,
        fontWeight: theme.weight.bold,
    },
    overdueWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        padding: theme.spacing.sm,
        borderRadius: theme.radius.sm,
        backgroundColor: `${theme.colors.danger}1F`,
    },
    overdueText: {
        fontSize: theme.font.sm,
        color: theme.colors.danger,
        fontWeight: theme.weight.semibold,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        marginBottom: theme.spacing.sm,
    },
    title: {
        fontSize: theme.font.xl,
        fontWeight: theme.weight.bold,
        color: theme.colors.textPrimary,
        flex: 1,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        marginBottom: theme.spacing.xs,
    },
    infoText: {
        fontSize: theme.font.sm,
        color: theme.colors.textSecondary,
    },
    description: {
        fontSize: theme.font.sm,
        color: theme.colors.textMuted,
        marginTop: theme.spacing.sm,
        lineHeight: 20,
    },
    amountsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: theme.spacing.xs,
    },
    amountItem: {
        alignItems: 'center',
        flex: 1,
    },
    amountTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        marginBottom: theme.spacing.xs,
    },
    amountLabel: {
        fontSize: theme.font.xs,
        color: theme.colors.textMuted,
    },
    amountValue: {
        fontSize: theme.font.lg,
        fontWeight: theme.weight.bold,
        color: theme.colors.textPrimary,
    },
    amountPaid: {
        color: theme.colors.success,
    },
    amountPending: {
        color: theme.colors.warning,
    },
    section: {
        marginTop: theme.spacing.sm,
    },
    sectionTitle: {
        fontSize: theme.font.md,
        fontWeight: theme.weight.bold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.sm,
    },
    loadingText: {
        fontSize: theme.font.sm,
        color: theme.colors.textMuted,
        textAlign: 'center',
        paddingVertical: theme.spacing.md,
    },
    emptyText: {
        fontSize: theme.font.sm,
        color: theme.colors.textMuted,
        textAlign: 'center',
        paddingVertical: theme.spacing.lg,
    },
    registerPaymentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.xs,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.accent,
        marginTop: theme.spacing.sm,
    },
    registerPaymentText: {
        fontWeight: theme.weight.bold,
        color: theme.colors.background,
        fontSize: theme.font.md,
    },
    actions: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.md,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.xs,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surfaceSoft,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    actionButtonText: {
        fontSize: theme.font.sm,
        fontWeight: theme.weight.semibold,
        color: theme.colors.textPrimary,
    },
    deleteButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.xs,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.md,
        backgroundColor: `${theme.colors.danger}22`,
        borderWidth: 1,
        borderColor: `${theme.colors.danger}44`,
    },
    deleteButtonText: {
        fontSize: theme.font.sm,
        fontWeight: theme.weight.semibold,
        color: theme.colors.danger,
    },
    errorText: {
        fontSize: theme.font.md,
        color: theme.colors.textMuted,
        textAlign: 'center',
        marginTop: theme.spacing.xl,
    },
    pressed: {
        opacity: 0.84,
    },
});
