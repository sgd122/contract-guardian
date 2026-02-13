import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface UploadOptionProps {
  icon: string;
  title: string;
  description?: string;
  onPress: () => void;
}

export function UploadOption({
  icon,
  title,
  description,
  onPress,
}: UploadOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-3 flex-row items-center rounded-xl border border-gray-200 bg-white p-4 active:bg-gray-50"
    >
      <Text className="mr-4 text-3xl">{icon}</Text>
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900">{title}</Text>
        {description ? (
          <Text className="mt-0.5 text-sm text-gray-500">{description}</Text>
        ) : null}
      </View>
      <Text className="text-lg text-gray-400">{'>'}</Text>
    </Pressable>
  );
}
