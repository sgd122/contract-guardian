import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { signInWithProvider } from '../../src/lib/auth';

export default function LoginScreen() {
  const [loading, setLoading] = useState<'kakao' | 'google' | null>(null);

  const handleSignIn = async (provider: 'kakao' | 'google') => {
    if (loading) return;

    setLoading(provider);
    try {
      await signInWithProvider(provider);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.';
      Alert.alert('로그인 실패', message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <View className="flex-1 bg-white px-6">
      {/* Top spacer */}
      <View className="flex-1" />

      {/* Branding */}
      <View className="items-center mb-12">
        <View className="w-20 h-20 rounded-2xl bg-[#1E40AF] items-center justify-center mb-6">
          <Text className="text-white text-3xl font-bold">CG</Text>
        </View>
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          계약서 지킴이
        </Text>
        <Text className="text-base text-gray-500 text-center">
          AI 계약서 분석 플랫폼
        </Text>
      </View>

      {/* OAuth Buttons */}
      <View className="gap-3 mb-8">
        {/* Kakao Login */}
        <Pressable
          onPress={() => handleSignIn('kakao')}
          disabled={loading !== null}
          className={`flex-row items-center justify-center rounded-xl py-4 bg-[#FEE500] active:bg-[#F5DC00] ${
            loading !== null ? 'opacity-50' : ''
          }`}
        >
          <Text className="text-base font-semibold text-[#191919]">
            {loading === 'kakao' ? '로그인 중...' : '카카오로 시작하기'}
          </Text>
        </Pressable>

        {/* Google Login */}
        <Pressable
          onPress={() => handleSignIn('google')}
          disabled={loading !== null}
          className={`flex-row items-center justify-center rounded-xl py-4 bg-white border border-gray-300 active:bg-gray-50 ${
            loading !== null ? 'opacity-50' : ''
          }`}
        >
          <Text className="text-base font-semibold text-gray-800">
            {loading === 'google' ? '로그인 중...' : 'Google로 시작하기'}
          </Text>
        </Pressable>
      </View>

      {/* Bottom spacer */}
      <View className="flex-[2]" />

      {/* Terms */}
      <View className="items-center pb-8">
        <Text className="text-xs text-gray-400 text-center leading-5">
          로그인 시 이용약관 및 개인정보처리방침에 동의합니다
        </Text>
      </View>
    </View>
  );
}
