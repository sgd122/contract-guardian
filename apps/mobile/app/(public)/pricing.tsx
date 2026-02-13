import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { formatCurrency, PRICE_STANDARD, PRICE_EXTENDED } from '@cg/shared';
import { Card } from '../../src/components/ui';

const PLANS = [
  {
    name: '무료 체험',
    price: 0,
    description: '첫 1건 무료 분석',
    badge: '추천',
    features: [
      'PDF 계약서 분석',
      '8대 체크 항목 검토',
      '위험 조항 식별',
      '수정 제안 제공',
    ],
    highlighted: true,
  },
  {
    name: '일반 분석',
    price: PRICE_STANDARD,
    description: '1~5페이지 계약서',
    features: [
      'PDF 계약서 분석',
      '8대 체크 항목 검토',
      '위험 조항 식별',
      '수정 제안 제공',
      'PDF 리포트 다운로드',
    ],
    highlighted: false,
  },
  {
    name: '확장 분석',
    price: PRICE_EXTENDED,
    description: '6~20페이지 계약서',
    features: [
      'PDF 계약서 분석',
      '8대 체크 항목 검토',
      '위험 조항 식별',
      '수정 제안 제공',
      'PDF 리포트 다운로드',
      '관련 법령 참조',
    ],
    highlighted: false,
  },
];

export default function PricingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="px-6 pt-8 mb-8">
          <Text className="text-3xl font-bold text-gray-900 text-center mb-3">
            투명한 가격
          </Text>
          <Text className="text-base text-gray-600 text-center leading-6">
            {'건당 결제, 숨겨진 비용 없이\n합리적인 가격'}
          </Text>
        </View>

        {/* Pricing Cards */}
        <View className="px-6">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={`p-6 mb-4 ${plan.highlighted ? 'border-2 border-[#2563EB]' : ''}`}
            >
              {/* Badge */}
              {plan.badge ? (
                <View className="bg-[#2563EB] px-3 py-1 rounded-full self-start mb-4">
                  <Text className="text-xs font-semibold text-white">
                    {plan.badge}
                  </Text>
                </View>
              ) : null}

              {/* Plan Name & Price */}
              <Text className="text-xl font-bold text-gray-900 mb-2">
                {plan.name}
              </Text>
              <View className="flex-row items-baseline mb-3">
                {plan.price === 0 ? (
                  <Text className="text-3xl font-bold text-gray-900">무료</Text>
                ) : (
                  <>
                    <Text className="text-3xl font-bold text-gray-900">
                      {formatCurrency(plan.price)}
                    </Text>
                    <Text className="text-base text-gray-500 ml-1">/건</Text>
                  </>
                )}
              </View>
              <Text className="text-sm text-gray-600 mb-4">
                {plan.description}
              </Text>

              {/* Features */}
              <View className="gap-2 mb-6">
                {plan.features.map((feature) => (
                  <View key={feature} className="flex-row items-start">
                    <Text className="text-[#2563EB] mr-2 font-bold">✓</Text>
                    <Text className="text-sm text-gray-700 flex-1">
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>

              {/* CTA */}
              <Pressable
                onPress={() => router.push('/(auth)/login')}
                className={`rounded-xl py-3.5 items-center ${
                  plan.highlighted
                    ? 'bg-[#2563EB] active:bg-[#1D4ED8]'
                    : 'border border-gray-300 active:bg-gray-50'
                }`}
              >
                <Text
                  className={`text-base font-semibold ${
                    plan.highlighted ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  시작하기
                </Text>
              </Pressable>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
