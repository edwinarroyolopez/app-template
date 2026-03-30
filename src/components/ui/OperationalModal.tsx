import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/theme';

type OperationalModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
  presentation?: 'bottom-sheet' | 'center';
  animationType?: 'none' | 'slide' | 'fade';
  scrollable?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
  maxHeightPercent?: number;
  closeOnBackdropPress?: boolean;
};

export function OperationalModal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  footer,
  headerLeft,
  headerRight,
  presentation = 'bottom-sheet',
  animationType = 'slide',
  scrollable = true,
  contentContainerStyle,
  bodyStyle,
  maxHeightPercent = 0.92,
  closeOnBackdropPress = false,
}: OperationalModalProps) {
  const insets = useSafeAreaInsets();
  const surfaceMaxHeight = `${Math.round(Math.min(Math.max(maxHeightPercent, 0.5), 0.98) * 100)}%` as const;
  const bottomInsetPadding = Math.max(insets.bottom, 12);

  return (
    <Modal visible={visible} transparent animationType={animationType} onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.overlay, presentation === 'center' ? styles.overlayCenter : styles.overlayBottom]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeOnBackdropPress ? onClose : undefined}
          />

          <View
            style={[
              styles.surface,
              presentation === 'center' ? styles.surfaceCenter : styles.surfaceBottom,
              { maxHeight: surfaceMaxHeight },
              bodyStyle,
            ]}
          >
            <View style={styles.header}>
              <View style={styles.headerSide}>{headerLeft}</View>

              <View style={styles.headerTitleWrap}>
                <Text style={styles.title}>{title}</Text>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
              </View>

              <View style={styles.headerSide}>
                {headerRight || (
                  <Pressable onPress={onClose} style={styles.defaultCloseBtn} hitSlop={8}>
                    <X size={16} color="#8EA4CC" />
                  </Pressable>
                )}
              </View>
            </View>

            {scrollable ? (
              <ScrollView
                contentContainerStyle={[
                  styles.content,
                  { paddingBottom: footer ? 12 : bottomInsetPadding + 8 },
                  contentContainerStyle,
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>
            ) : (
              <View
                style={[
                  styles.content,
                  styles.nonScrollableContent,
                  { paddingBottom: footer ? 12 : bottomInsetPadding + 8 },
                  contentContainerStyle,
                ]}
              >
                {children}
              </View>
            )}

            {footer ? (
              <View style={[styles.footer, { paddingBottom: presentation === 'bottom-sheet' ? bottomInsetPadding : 12 }]}>
                {footer}
              </View>
            ) : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
  overlayBottom: {
    justifyContent: 'flex-end',
  },
  overlayCenter: {
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  surface: {
    backgroundColor: '#08142D',
    borderWidth: 1,
    borderColor: '#1F3765',
  },
  surfaceBottom: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomWidth: 0,
  },
  surfaceCenter: {
    borderRadius: 16,
  },
  header: {
    minHeight: 56,
    borderBottomWidth: 1,
    borderColor: '#1A2D52',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSide: {
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  title: {
    color: '#EAF1FF',
    fontSize: theme.font.md,
    fontWeight: theme.weight.bold,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 2,
    color: '#8EA4CC',
    fontSize: theme.font.xs,
    textAlign: 'center',
  },
  defaultCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F3765',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    gap: 8,
  },
  nonScrollableContent: {
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    borderColor: '#16315E',
    backgroundColor: '#08182F',
    paddingHorizontal: 14,
    paddingTop: 10,
  },
});
