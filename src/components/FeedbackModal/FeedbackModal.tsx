import { View, Text, Modal, Pressable, TextInput } from 'react-native';
import { useState } from 'react';
import { ThumbsUp, Meh, ThumbsDown } from 'lucide-react-native';
import { theme } from '@/theme';
import { useCreateFeedback } from '@/hooks/useCreateFeedback';

type DifficultyReason =
    | 'NO_ENTENDI'
    | 'LENTO'
    | 'ERROR'
    | 'OTRO';

type Props = {
    visible: boolean;
    feature: string;
    onClose: () => void;
};

export function FeedbackModal({ visible, feature, onClose }: Props) {
    const createFeedback = useCreateFeedback();

    const [easy, setEasy] = useState<boolean | null>(null);
    const [reason, setReason] = useState<DifficultyReason | null>(null);
    const [comment, setComment] = useState('');

    function submit() {
        if (easy === null && !reason) return;

        createFeedback.mutate({
            feature,
            easy,
            difficultyReason: reason || undefined,
            comment: comment || undefined,
        });

        setEasy(null);
        setReason(null);
        setComment('');
        onClose();
    }

    function renderScoreButton(
        value: boolean | null,
        Icon: any,
        label: string,
        color: string,
    ) {
        const selected = easy === value;

        return (
            <Pressable
                onPress={() => setEasy(value)}
                style={{
                    alignItems: 'center',
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor: selected
                        ? color
                        : theme.colors.surfaceSoft,
                    borderWidth: 1,
                    borderColor: selected
                        ? color
                        : theme.colors.border,
                    width: 90,
                }}
            >
                <Icon
                    size={28}
                    color={selected ? '#000' : theme.colors.textMuted}
                />
                <Text
                    style={{
                        marginTop: 6,
                        fontSize: theme.font.xs,
                        fontWeight: selected
                            ? theme.weight.bold
                            : theme.weight.medium,
                        color: selected ? '#000' : theme.colors.textMuted,
                    }}
                >
                    {label}
                </Text>
            </Pressable>
        );
    }

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.65)',
                    justifyContent: 'center',
                    padding: theme.spacing.lg,
                }}
            >
                <View
                    style={{
                        backgroundColor: theme.colors.surface,
                        padding: theme.spacing.lg,
                        borderRadius: theme.radius.lg,
                    }}
                >
                    <Text
                        style={{
                            fontSize: theme.font.lg,
                            fontWeight: theme.weight.bold,
                            textAlign: 'center',
                            color: theme.colors.textPrimary,
                        }}
                    >
                        ¿Esto fue fácil?
                    </Text>

                    {/* SCORE */}
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginTop: 20,
                        }}
                    >
                        {renderScoreButton(
                            true,
                            ThumbsUp,
                            'Fácil',
                            theme.colors.success,
                        )}
                        {renderScoreButton(
                            null,
                            Meh,
                            'Regular',
                            theme.colors.warning,
                        )}
                        {renderScoreButton(
                            false,
                            ThumbsDown,
                            'Difícil',
                            theme.colors.danger,
                        )}
                    </View>

                    {/* PAIN */}
                    {(easy === false || easy === null) && (
                        <>
                            <Text
                                style={{
                                    marginTop: 24,
                                    fontWeight: theme.weight.bold,
                                    color: theme.colors.textPrimary,
                                }}
                            >
                                ¿Qué fue lo difícil?
                            </Text>

                            {[
                                ['NO_ENTENDI', 'No entendí qué hacer'],
                                ['LENTO', 'Tardó mucho'],
                                ['ERROR', 'Me dio error'],
                                ['OTRO', 'Otra cosa'],
                            ].map(([value, label]) => {
                                const selected = reason === value;
                                return (
                                    <Pressable
                                        key={value}
                                        onPress={() =>
                                            setReason(value as any)
                                        }
                                        style={{
                                            padding: 12,
                                            borderRadius: 10,
                                            marginTop: 10,
                                            backgroundColor: selected
                                                ? theme.colors.accent
                                                : theme.colors.surfaceSoft,
                                            borderWidth: 1,
                                            borderColor: selected
                                                ? theme.colors.accent
                                                : theme.colors.border,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: selected
                                                    ? '#000'
                                                    : theme.colors.textSecondary,
                                                fontWeight: selected
                                                    ? theme.weight.bold
                                                    : theme.weight.medium,
                                            }}
                                        >
                                            {label}
                                        </Text>
                                    </Pressable>
                                );
                            })}

                            <TextInput
                                placeholder="Cuéntanos en una frase"
                                placeholderTextColor={
                                    theme.colors.textMuted
                                }
                                value={comment}
                                onChangeText={setComment}
                                multiline
                                style={{
                                    marginTop: 14,
                                    padding: 12,
                                    minHeight: 70,
                                    borderWidth: 1,
                                    borderColor: theme.colors.border,
                                    borderRadius: 10,
                                    color: theme.colors.textPrimary,
                                    backgroundColor:
                                        theme.colors.surfaceSoft,
                                }}
                            />
                        </>
                    )}

                    {/* SUBMIT */}
                    <Pressable
                        onPress={submit}
                        style={{
                            marginTop: 28,
                            backgroundColor: theme.colors.accent,
                            padding: 14,
                            borderRadius: 12,
                            alignItems: 'center',
                            opacity:
                                easy === null && !reason ? 0.5 : 1,
                        }}
                    >
                        <Text
                            style={{
                                fontWeight: theme.weight.bold,
                                color: '#000',
                            }}
                        >
                            Enviar feedback
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}
