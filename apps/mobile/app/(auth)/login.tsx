import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithProvider } from '../../src/lib/auth';
import { Logo } from '../../src/components/ui';

export default function LoginScreen() {
  const router = useRouter();
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
    <View className="flex-1 bg-white">
      <View className="flex-1 px-8">
        {/* Top spacer */}
        <View className="flex-[1.5]" />

        {/* Branding */}
        <View className="items-center pt-10 pb-10 mb-16 bg-blue-50/50 -mx-8 px-8">
          <View className="mb-8 shadow-2xl shadow-blue-200">
            <Logo size={96} />
          </View>
          <Text className="text-[13px] font-bold uppercase tracking-[4px] text-blue-600 mb-2">
            AI Contract Review
          </Text>
          <Text className="text-3xl font-bold text-gray-900 mb-4 tracking-tighter">
            계약서 지킴이
          </Text>
          <Text className="text-base text-gray-500 text-center leading-6">
            프리랜서를 위한{'\n'}AI 계약서 분석 플랫폼
          </Text>
        </View>

        {/* OAuth Buttons */}
        <View className="gap-4 mb-10">
          {/* Kakao Login */}
          <Pressable
            onPress={() => handleSignIn('kakao')}
            disabled={loading !== null}
            className={`flex-row items-center justify-center rounded-2xl py-4 bg-[#FEE500] active:scale-[0.98] ${
              loading !== null ? 'opacity-50' : ''
            }`}
          >
            <Text className="text-base font-bold text-[#191919]">
              {loading === 'kakao' ? '로그인 중...' : '카카오로 시작하기'}
            </Text>
          </Pressable>

          {/* Google Login */}
          <Pressable
            onPress={() => handleSignIn('google')}
            disabled={loading !== null}
            className={`flex-row items-center justify-center rounded-2xl py-4 bg-white border border-gray-100 shadow-sm active:scale-[0.98] active:bg-gray-50 ${
              loading !== null ? 'opacity-50' : ''
            }`}
          >
            <Text className="text-base font-bold text-gray-800">
              {loading === 'google' ? '로그인 중...' : 'Google로 시작하기'}
            </Text>
          </Pressable>
        </View>

        {/* Browse without login */}
        <Pressable
          onPress={() => router.replace('/(public)')}
          className="items-center py-4"
        >
          <Text className="text-sm font-medium text-gray-400">
            로그인 없이 둘러보기
          </Text>
        </Pressable>

        {/* Bottom spacer */}
        <View className="flex-[2.5]" />

        {/* Terms */}
        <View className="items-center pb-10">
          <Text className="text-[11px] text-gray-400 text-center leading-5">
            로그인 시 이용약관 및{'\n'}개인정보처리방침에 동의하게 됩니다
          </Text>
        </View>
      </View>
    </View>
  );
}
