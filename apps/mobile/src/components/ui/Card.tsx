import React from 'react';
import { Platform, Pressable, View } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
}

export function Card({ children, onPress, className = '' }: CardProps) {
  const shadowStyle = Platform.OS === 'android' ? 'elevation-2' : 'shadow-sm';
  const baseStyle = `bg-white rounded-xl p-4 ${shadowStyle} ${className}`;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={`${baseStyle} active:opacity-90`}
      >
        {children}
      </Pressable>
    );
  }

  return <View className={baseStyle}>{children}</View>;
}
