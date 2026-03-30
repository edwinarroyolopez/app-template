import {
    Modal,
    View,
    Pressable,
    Text,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
} from 'react-native';
import { X } from 'lucide-react-native';

import CreateBusinessForm from './CreateBusinessForm';
import { theme } from '@/theme';
import { useCanCreateWorkspace } from '@/selectors/useCanCreateWorkspace';
import { CapabilityGate } from '@/components/CapabilityGate/CapabilityGate';

export function CreateBusinessModal({ visible, onClose }: any) {
    const canCreateWorkspaceCapability = useCanCreateWorkspace();

    return (
        <Modal animationType="slide" visible={visible} transparent>
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.container}>

                    {/* HEADER */}
                    <View
                        style={styles.header}
                    >
                        <Pressable
                            onPress={onClose}
                            style={styles.closeBtn}
                        >
                            <X size={18} color={theme.colors.textPrimary} />
                            <Text style={styles.closeText}>
                                Cerrar
                            </Text>
                        </Pressable>
                    </View>

                    {/* BODY */}
                    <CapabilityGate
                        capability={canCreateWorkspaceCapability}
                        mode="blur"
                        secondaryActionLabel="Cerrar"
                        onSecondaryPress={onClose}
                    >
                        <CreateBusinessForm onSuccess={onClose} />
                    </CapabilityGate>

                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: `${theme.colors.background}CC`,
    },
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        padding: theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    closeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    closeText: {
        color: theme.colors.textPrimary,
    },
});
