import React from 'react';
import {
  Modal as RNModal,
  Pressable,
  Text,
  View,
} from 'react-native';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  return (
    <RNModal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="rounded-t-2xl bg-white px-4 pb-8 pt-3">
          {/* Handle bar */}
          <View className="mb-4 items-center">
            <View className="h-1 w-10 rounded-full bg-gray-300" />
          </View>

          {title ? (
            <Text className="mb-4 text-lg font-bold text-gray-900">
              {title}
            </Text>
          ) : null}

          {children}
        </View>
      </View>
    </RNModal>
  );
}
