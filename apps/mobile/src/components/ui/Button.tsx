import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<string, string> = {
  primary: 'bg-[#2563EB] active:bg-[#1D4ED8]',
  secondary: 'bg-gray-200 active:bg-gray-300',
  outline: 'border border-gray-300 bg-transparent active:bg-gray-50',
  ghost: 'bg-transparent active:bg-gray-100',
};

const variantTextStyles: Record<string, string> = {
  primary: 'text-white',
  secondary: 'text-gray-900',
  outline: 'text-gray-900',
  ghost: 'text-gray-700',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5',
  md: 'px-4 py-2.5',
  lg: 'px-6 py-3.5',
};

const sizeTextStyles: Record<string, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

const spinnerColors: Record<string, string> = {
  primary: '#FFFFFF',
  secondary: '#111827',
  outline: '#111827',
  ghost: '#374151',
};

export function Button({
  variant = 'primary',
  size = 'md',
  onPress,
  disabled = false,
  loading = false,
  children,
  className = '',
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`flex-row items-center justify-center rounded-lg ${variantStyles[variant]} ${sizeStyles[size]} ${isDisabled ? 'opacity-50' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={spinnerColors[variant]}
          className="mr-2"
        />
      ) : null}
      {typeof children === 'string' ? (
        <Text
          className={`font-semibold ${variantTextStyles[variant]} ${sizeTextStyles[size]}`}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
