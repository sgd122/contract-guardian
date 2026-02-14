import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import type { AnalysisStatus } from '@cg/shared';
import { ProgressBar } from '../ui/ProgressBar';

interface AnalysisProgressProps {
  status: AnalysisStatus;
  className?: string;
}

const statusMessages: Record<string, string> = {
  pending_payment: '결제 대기 중...',
  paid: '분석 준비 중...',
  processing: 'AI가 계약서를 분석하고 있습니다...',
  completed: '분석 완료!',
  failed: '분석에 실패했습니다.',
};

const statusProgress: Record<string, number> = {
  pending_payment: 0.1,
  paid: 0.25,
  processing: 0.6,
  completed: 1,
  failed: 0,
};

export function AnalysisProgress({
  status,
  className = '',
}: AnalysisProgressProps) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'processing' || status === 'paid') {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    } else {
      Animated.timing(scale, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }
  }, [status, scale]);

  const message = statusMessages[status] ?? '처리 중...';
  const progress = statusProgress[status] ?? 0;
  const isActive = status === 'processing' || status === 'paid';

  return (
    <View className={`items-center justify-center px-6 py-16 ${className}`}>
      <Animated.View style={{ transform: [{ scale }] }} className="mb-6">
        <Text className="text-6xl">
          {status === 'completed' ? '✅' : status === 'failed' ? '❌' : '📋'}
        </Text>
      </Animated.View>

      <Text className="mb-2 text-center text-lg font-bold text-gray-900">
        {status === 'completed' ? '분석이 완료되었습니다' : '계약서 분석'}
      </Text>

      <Text className="mb-6 text-center text-sm text-gray-500">{message}</Text>

      {isActive ? (
        <ProgressBar
          progress={progress}
          color="#3B82F6"
          className="w-full max-w-[280px]"
        />
      ) : null}
    </View>
  );
}
