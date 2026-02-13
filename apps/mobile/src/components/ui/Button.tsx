import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

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
  primary: 'bg-[#2563EB]',
  secondary: 'bg-gray-100',
  outline: 'border border-gray-200 bg-white',
  ghost: 'bg-transparent',
};

const variantTextStyles: Record<string, string> = {
  primary: 'text-white',
  secondary: 'text-gray-900',
  outline: 'text-gray-900',
  ghost: 'text-gray-600',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-2',
  md: 'px-5 py-3',
  lg: 'px-8 py-4',
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
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!isDisabled) {
      scale.value = withSpring(0.96);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        className={`flex-row items-center justify-center rounded-2xl ${variantStyles[variant]} ${sizeStyles[size]} ${isDisabled ? 'opacity-50' : ''} ${className}`}
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
            className={`font-bold tracking-tight ${variantTextStyles[variant]} ${sizeTextStyles[size]}`}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </Pressable>
    </Animated.View>
  );
}
