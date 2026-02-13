import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface RiskGaugeProps {
  score: number; // 0-100
  size?: number; // default 120
  strokeWidth?: number; // default 10
  className?: string;
}

function getColor(score: number): string {
  if (score <= 33) return '#22C55E';
  if (score <= 66) return '#F59E0B';
  return '#EF4444';
}

function getLabel(score: number): string {
  if (score <= 33) return '\uC548\uC804';
  if (score <= 66) return '\uC8FC\uC758';
  return '\uC704\uD5D8';
}

export function RiskGauge({
  score,
  size = 120,
  strokeWidth = 10,
  className = '',
}: RiskGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (clampedScore / 100) * circumference;
  const strokeDashoffset = circumference - progress;
  const color = getColor(clampedScore);
  const label = getLabel(clampedScore);

  return (
    <View className={`items-center ${className}`}>
      <View style={{ width: size, height: size }} className="items-center justify-center">
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress arc */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        {/* Center text */}
        <View className="absolute items-center">
          <Text
            className="font-bold text-gray-900"
            style={{ fontSize: size * 0.25 }}
          >
            {clampedScore}
          </Text>
          <Text
            className="font-medium"
            style={{ fontSize: size * 0.12, color }}
          >
            {label}
          </Text>
        </View>
      </View>
    </View>
  );
}
