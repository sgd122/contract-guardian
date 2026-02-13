import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export function Logo({ size = 40, showText = false }: LogoProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ width: size, height: size }}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <Path d="M50 5L15 20V45C15 67.5 30 88 50 95C70 88 85 67.5 85 45V20L50 5Z" fill="#2563EB" />
          <Path d="M50 8L18 21.7V45C18 66 32 85 50 91.5C68 85 82 66 82 45V21.7L50 8Z" fill="url(#paint0_linear_mobile)" />
          <Rect x="35" y="32" width="30" height="36" rx="3" fill="white" />
          <Path d="M42 42H58" stroke="#2563EB" stroke-width="2" stroke-linecap="round" />
          <Path d="M42 50H58" stroke="#2563EB" stroke-width="2" stroke-linecap="round" />
          <Path d="M42 58H50" stroke="#2563EB" stroke-width="2" stroke-linecap="round" />
          <Defs>
            <LinearGradient id="paint0_linear_mobile" x1="50" y1="5" x2="50" y2="95">
              <Stop offset="0" stopColor="#3B82F6" />
              <Stop offset="1" stopColor="#1E40AF" />
            </LinearGradient>
          </Defs>
        </Svg>
      </View>
      {showText && (
        <View style={{ marginLeft: 12 }}>
          <Text style={{ fontSize: size * 0.45, fontWeight: 'bold', color: '#111827', letterSpacing: -1 }}>
            계약서 지킴이
          </Text>
        </View>
      )}
    </View>
  );
}
