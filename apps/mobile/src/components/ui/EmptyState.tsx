import React from 'react';
import { Text, View } from 'react-native';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <View className={`items-center justify-center px-6 py-12 ${className}`}>
      {icon ? (
        <Text className="mb-4 text-5xl">{icon}</Text>
      ) : null}
      <Text className="mb-2 text-center text-lg font-bold text-gray-900">
        {title}
      </Text>
      {description ? (
        <Text className="mb-6 text-center text-sm text-gray-500">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button variant="primary" size="md" onPress={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}
