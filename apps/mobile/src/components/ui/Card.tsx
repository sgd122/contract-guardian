import React from 'react';
import { Platform, Pressable, View } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  className?: string;
}

export function Card({ children, onPress, onLongPress, className = '' }: CardProps) {
  const shadowStyle = Platform.OS === 'android' ? 'elevation-2' : 'shadow-sm';
  const baseStyle = `bg-white rounded-2xl p-5 border border-gray-100/50 ${shadowStyle} ${className}`;

  if (onPress || onLongPress) {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        className={`${baseStyle} active:scale-[0.98] active:bg-gray-50/50`}
      >
        {children}
      </Pressable>
    );
  }

  return <View className={baseStyle}>{children}</View>;
}
