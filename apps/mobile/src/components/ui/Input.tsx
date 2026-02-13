import React from 'react';
import { Text, TextInput, View } from 'react-native';

interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  multiline?: boolean;
  className?: string;
}

export function Input({
  label,
  error,
  helperText,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  multiline = false,
  className = '',
}: InputProps) {
  const borderColor = error ? 'border-red-500' : 'border-gray-300';
  const focusClass = error ? 'focus:border-red-500' : 'focus:border-blue-500';

  return (
    <View className={`gap-1.5 ${className}`}>
      {label ? (
        <Text className="text-sm font-medium text-gray-700">{label}</Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        className={`rounded-lg border px-3 py-2.5 text-base text-gray-900 ${borderColor} ${focusClass} ${multiline ? 'min-h-[100px] text-start' : ''}`}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      {error ? (
        <Text className="text-sm text-red-500">{error}</Text>
      ) : null}
      {helperText && !error ? (
        <Text className="text-sm text-gray-500">{helperText}</Text>
      ) : null}
    </View>
  );
}
