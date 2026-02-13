import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card, Logo } from '../../src/components/ui';

const STEPS = [
  {
    step: '01',
    title: '계약서 업로드',
    description: 'PDF 파일을 선택하거나 카메라로 촬영하세요',
  },
  {
    step: '02',
    title: 'AI 분석',
    description: '8대 체크 항목 기준으로 2~3분 내 분석 완료',
  },
  {
    step: '03',
    title: '결과 확인',
    description: '위험 조항, 수정 제안, PDF 리포트 다운로드',
  },
];

export default function PublicHomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Branding */}
          <View className="items-center pt-10 pb-10 px-8 mb-12 bg-blue-50/50">
            <View className="mb-6 shadow-2xl shadow-blue-200">
              <Logo size={80} />
            </View>
            <Text className="text-[13px] font-bold uppercase tracking-[4px] text-blue-600 mb-2">
              Contract Guardian
            </Text>
            <Text className="text-sm font-medium text-gray-400">
              AI 기반 계약서 안심 분석 플랫폼
            </Text>
          </View>

          {/* Hero */}
          <View className="px-8 mb-12">
            <Text className="text-4xl font-bold text-gray-900 text-center tracking-tighter leading-[48px] mb-6">
              {'AI가 계약서의\n위험을 찾아드립니다'}
            </Text>
            <Text className="text-[15px] text-gray-500 text-center leading-7 mb-10">
              {'프리랜서와 1인 사업자를 위한 맞춤형 서비스.\n독소 조항과 불리한 조건을 자동으로 찾아\n전문적인 수정 방향을 제안합니다.'}
            </Text>

            {/* Stats - Dashboard style */}
            <View className="flex-row justify-between rounded-3xl bg-gray-50/80 p-6 border border-gray-100">
              <View className="flex-1 items-center">
                <Text className="text-lg font-bold text-gray-900 mb-1">3,900원</Text>
                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">분석 비용</Text>
              </View>
              <View className="h-8 w-[1px] bg-gray-200 self-center" />
              <View className="flex-1 items-center">
                <Text className="text-lg font-bold text-gray-900 mb-1">3분 내</Text>
                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">분석 시간</Text>
              </View>
              <View className="h-8 w-[1px] bg-gray-200 self-center" />
              <View className="flex-1 items-center">
                <Text className="text-lg font-bold text-gray-900 mb-1">24시간</Text>
                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">상시 분석</Text>
              </View>
            </View>
          </View>

          {/* How It Works */}
          <View className="px-8 mb-12">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold tracking-tight text-gray-900">
                이용 방법
              </Text>
              <View className="h-[2px] flex-1 ml-4 bg-gray-100" />
            </View>
            <View className="gap-4">
              {STEPS.map((item) => (
                <Card key={item.step} className="p-6 border-0 bg-gray-50/50">
                  <View className="flex-row items-start">
                    <View className="mr-4 h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                      <Text className="text-white font-bold text-xs">
                        {item.step}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-gray-900 mb-1.5">
                        {item.title}
                      </Text>
                      <Text className="text-sm leading-6 text-gray-500">
                        {item.description}
                      </Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          </View>

          {/* CTAs */}
          <View className="px-8 gap-3">
            <Pressable
              onPress={() => router.push('/(auth)/login')}
              className="bg-blue-600 rounded-2xl py-4 items-center shadow-lg shadow-blue-200 active:scale-[0.98] active:bg-blue-700"
            >
              <Text className="text-base font-bold text-white">
                무료로 시작하기
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/(public)/pricing')}
              className="bg-white border border-gray-100 rounded-2xl py-4 items-center shadow-sm active:scale-[0.98] active:bg-gray-50"
            >
              <Text className="text-base font-bold text-gray-700">
                가격 및 요금제 보기
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
