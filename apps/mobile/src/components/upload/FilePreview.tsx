import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface FilePreviewProps {
  filename: string;
  fileSize: number; // bytes
  fileType: string; // 'pdf' | 'jpeg' | 'png'
  onRemove: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(fileType: string): string {
  if (fileType === 'pdf' || fileType === 'application/pdf') return '\uD83D\uDCC4';
  return '\uD83D\uDDBC\uFE0F';
}

function getFileTypeLabel(fileType: string): string {
  if (fileType === 'pdf' || fileType === 'application/pdf') return 'PDF';
  if (fileType === 'jpeg' || fileType === 'image/jpeg') return 'JPEG';
  if (fileType === 'png' || fileType === 'image/png') return 'PNG';
  return fileType.toUpperCase();
}

export function FilePreview({
  filename,
  fileSize,
  fileType,
  onRemove,
}: FilePreviewProps) {
  const displayName =
    filename.length > 30 ? `${filename.slice(0, 27)}...` : filename;

  return (
    <View className="flex-row items-center rounded-xl border border-gray-200 bg-white p-4">
      <Text className="mr-3 text-3xl">{getFileIcon(fileType)}</Text>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
          {displayName}
        </Text>
        <Text className="mt-0.5 text-xs text-gray-500">
          {getFileTypeLabel(fileType)} · {formatFileSize(fileSize)}
        </Text>
      </View>
      <Pressable
        onPress={onRemove}
        className="ml-2 rounded-full p-2 active:bg-gray-100"
      >
        <Text className="text-base text-gray-400">{'\u2715'}</Text>
      </Pressable>
    </View>
  );
}
