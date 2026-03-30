import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';

import { ImageAttachmentField, type AttachmentImage } from '@/components/ui/ImageAttachmentField';
import { Input } from '@/components/ui/Input';
import { theme } from '@/theme';

type EventTypeOption = {
  value: string;
  label: string;
};

type Props = {
  visible: boolean;
  title: string;
  typeModalTitle: string;
  typeLabel: string;
  eventTypes: EventTypeOption[];
  selectedType: string;
  message: string;
  messagePlaceholder: string;
  submitLabel: string;
  canAttachImages: boolean;
  images: AttachmentImage[];
  onClose: () => void;
  onSelectType: (value: string) => void;
  onMessageChange: (value: string) => void;
  onImagesChange: (next: AttachmentImage[]) => void;
  onSubmit: () => void;
};

export function SaleEventComposerModal({
  visible,
  title,
  typeModalTitle,
  typeLabel,
  eventTypes,
  selectedType,
  message,
  messagePlaceholder,
  submitLabel,
  canAttachImages,
  images,
  onClose,
  onSelectType,
  onMessageChange,
  onImagesChange,
  onSubmit,
}: Props) {
  const [showTypeModal, setShowTypeModal] = useState(false);

  const selectedTypeLabel = useMemo(
    () => eventTypes.find((item) => item.value === selectedType)?.label || 'Seleccionar tipo',
    [eventTypes, selectedType],
  );

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowTypeModal(false);
          onClose();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{title}</Text>

            <Text style={styles.eventTypeLabel}>{typeLabel}</Text>
            <Pressable style={styles.eventTypeSelectorBtn} onPress={() => setShowTypeModal(true)}>
              <Text style={styles.eventTypeSelectorText}>{selectedTypeLabel}</Text>
              <ChevronRight size={16} color={theme.colors.textMuted} />
            </Pressable>

            <Input
              value={message}
              onChangeText={onMessageChange}
              placeholder={messagePlaceholder}
              multiline
              numberOfLines={4}
              style={styles.modalInput}
            />

            {canAttachImages && (
              <ImageAttachmentField
                title="Evidencias"
                helperText="Adjunta entre 1 y 3 fotos segun el evento."
                images={images}
                onChange={onImagesChange}
                maxImages={3}
              />
            )}

            <View style={styles.modalActionsRow}>
              <Pressable
                style={styles.modalGhostBtn}
                onPress={() => {
                  setShowTypeModal(false);
                  onClose();
                }}
              >
                <Text style={styles.modalGhostText}>Cancelar</Text>
              </Pressable>

              <Pressable style={styles.modalPrimaryBtn} onPress={onSubmit}>
                <Text style={styles.modalPrimaryText}>{submitLabel}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showTypeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTypeModal(false)}
      >
        <View style={styles.selectorOverlay}>
          <View style={styles.selectorSheet}>
            <View style={styles.selectorHeader}>
              <Pressable onPress={() => setShowTypeModal(false)} hitSlop={8}>
                <ArrowLeft size={20} color={theme.colors.textPrimary} />
              </Pressable>
              <Text style={styles.selectorTitle}>{typeModalTitle}</Text>
              <View style={styles.selectorHeaderSpacer} />
            </View>

            <View style={styles.selectorContent}>
              {eventTypes.map((item) => {
                const active = selectedType === item.value;
                return (
                  <Pressable
                    key={item.value}
                    style={[styles.selectorOption, active && styles.selectorOptionActive]}
                    onPress={() => {
                      onSelectType(item.value);
                      setShowTypeModal(false);
                    }}
                  >
                    <Text style={[styles.selectorOptionText, active && styles.selectorOptionTextActive]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 14,
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.md,
    fontWeight: theme.weight.bold,
  },
  modalInput: {
    marginTop: 10,
  },
  eventTypeLabel: {
    marginTop: 10,
    color: '#9FB0CF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  eventTypeSelectorBtn: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    minHeight: 40,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  eventTypeSelectorText: {
    color: '#EAF1FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
  },
  modalActionsRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  modalGhostBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalGhostText: {
    color: theme.colors.textSecondary,
    fontWeight: theme.weight.semibold,
  },
  modalPrimaryBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryText: {
    color: '#041427',
    fontWeight: theme.weight.bold,
  },
  selectorOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  selectorSheet: {
    backgroundColor: '#08142D',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: '#1F3765',
  },
  selectorHeader: {
    height: 56,
    borderBottomWidth: 1,
    borderColor: '#1A2D52',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  selectorTitle: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
  },
  selectorHeaderSpacer: {
    width: 20,
  },
  selectorContent: {
    padding: 16,
    gap: 10,
    paddingBottom: 24,
  },
  selectorOption: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectorOptionActive: {
    borderColor: '#F8C74A',
    backgroundColor: '#0D224A',
  },
  selectorOptionText: {
    color: '#9FB0CF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
  },
  selectorOptionTextActive: {
    color: '#F8C74A',
  },
});
