import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { RiskSummary } from '../../src/components/analysis/RiskSummary';
import { ClauseCard } from '../../src/components/analysis/ClauseCard';
import { AnalysisProgress } from '../../src/components/analysis/AnalysisProgress';
import { useAnalysis } from '../../src/hooks/useAnalysis';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
}

function LoadingSkeleton() {
  return (
    <View className="px-4 py-6">
      <Skeleton height={24} width="60%" className="mb-2" />
      <Skeleton height={16} width="40%" className="mb-8" />
      <View className="mb-8 items-center">
        <Skeleton height={150} width={150} borderRadius={75} className="mb-4" />
        <Skeleton height={20} width="30%" className="mb-2" />
        <Skeleton height={48} width="90%" />
      </View>
      <Skeleton height={16} width="50%" className="mb-3" />
      <Skeleton height={160} className="mb-3" />
      <Skeleton height={160} className="mb-3" />
      <Skeleton height={160} />
    </View>
  );
}

export default function AnalysisDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { analysis, isLoading, error, refetch } = useAnalysis(id ?? null);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <View className="flex-row items-center px-4 py-3">
          <Pressable onPress={() => router.back()} className="mr-3 p-1">
            <Text className="text-2xl text-gray-700">{'<'}</Text>
          </Pressable>
          <Skeleton height={20} width="50%" />
        </View>
        <ScrollView>
          <LoadingSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !analysis) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <View className="flex-row items-center px-4 py-3">
          <Pressable onPress={() => router.back()} className="mr-3 p-1">
            <Text className="text-2xl text-gray-700">{'<'}</Text>
          </Pressable>
          <Text className="text-lg font-bold text-gray-900">분석 결과</Text>
        </View>
        <EmptyState
          icon="⚠️"
          title="분석 결과를 불러올 수 없습니다"
          description={error?.message ?? '잠시 후 다시 시도해 주세요.'}
          actionLabel="다시 시도"
          onAction={() => {
            refetch();
          }}
        />
      </SafeAreaView>
    );
  }

  // Processing / pending state
  if (
    analysis.status === 'processing' ||
    analysis.status === 'paid' ||
    analysis.status === 'pending_payment'
  ) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <View className="flex-row items-center px-4 py-3">
          <Pressable onPress={() => router.back()} className="mr-3 p-1">
            <Text className="text-2xl text-gray-700">{'<'}</Text>
          </Pressable>
          <Text className="text-lg font-bold text-gray-900">
            {analysis.original_filename}
          </Text>
        </View>
        <AnalysisProgress status={analysis.status} />
      </SafeAreaView>
    );
  }

  // Failed state
  if (analysis.status === 'failed') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <View className="flex-row items-center px-4 py-3">
          <Pressable onPress={() => router.back()} className="mr-3 p-1">
            <Text className="text-2xl text-gray-700">{'<'}</Text>
          </Pressable>
          <Text className="text-lg font-bold text-gray-900">분석 결과</Text>
        </View>
        <EmptyState
          icon="❌"
          title="분석에 실패했습니다"
          description="계약서 분석 중 오류가 발생했습니다. 다시 시도해 주세요."
          actionLabel="돌아가기"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  // Completed state - full analysis view
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-200 bg-white px-4 py-3">
        <Pressable onPress={() => router.back()} className="mr-3 p-1">
          <Text className="text-2xl text-gray-700">{'<'}</Text>
        </Pressable>
        <View className="flex-1">
          <Text
            className="text-base font-bold text-gray-900"
            numberOfLines={1}
          >
            {analysis.original_filename}
          </Text>
          <Text className="text-xs text-gray-500">
            {formatDate(analysis.created_at)}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Overall Risk Section */}
        {analysis.overall_risk_score != null &&
        analysis.overall_risk_level &&
        analysis.summary ? (
          <View className="bg-white px-4 py-6">
            <RiskSummary
              riskScore={analysis.overall_risk_score}
              riskLevel={analysis.overall_risk_level}
              summary={analysis.summary}
            />
          </View>
        ) : null}

        {/* Contract Info Section */}
        {(analysis.contract_type || analysis.contract_parties) ? (
          <Card className="mx-4 mt-4">
            <Text className="mb-3 text-base font-bold text-gray-900">
              계약 정보
            </Text>
            {analysis.contract_type ? (
              <View className="mb-2 flex-row">
                <Text className="w-20 text-sm text-gray-500">계약 유형</Text>
                <Text className="flex-1 text-sm font-medium text-gray-800">
                  {analysis.contract_type}
                </Text>
              </View>
            ) : null}
            {analysis.contract_parties ? (
              <>
                <View className="mb-2 flex-row">
                  <Text className="w-20 text-sm text-gray-500">갑 (발주자)</Text>
                  <Text className="flex-1 text-sm font-medium text-gray-800">
                    {analysis.contract_parties.party_a}
                  </Text>
                </View>
                <View className="flex-row">
                  <Text className="w-20 text-sm text-gray-500">을 (수급자)</Text>
                  <Text className="flex-1 text-sm font-medium text-gray-800">
                    {analysis.contract_parties.party_b}
                  </Text>
                </View>
              </>
            ) : null}
          </Card>
        ) : null}

        {/* Clause Breakdown Section */}
        {analysis.clauses.length > 0 ? (
          <View className="mt-6 px-4">
            <Text className="mb-3 text-lg font-bold text-gray-900">
              조항별 분석 결과
            </Text>
            {analysis.clauses.map((clause) => (
              <ClauseCard key={clause.id} clause={clause} />
            ))}
          </View>
        ) : null}

        {/* Missing Clauses Section */}
        {analysis.missing_clauses && analysis.missing_clauses.length > 0 ? (
          <View className="mt-6 px-4">
            <Text className="mb-3 text-lg font-bold text-gray-900">
              누락된 조항
            </Text>
            <Card>
              {analysis.missing_clauses.map((clause, index) => (
                <View
                  key={clause}
                  className={`flex-row items-center py-2 ${
                    index < analysis.missing_clauses!.length - 1
                      ? 'border-b border-gray-100'
                      : ''
                  }`}
                >
                  <Text className="mr-2 text-base text-amber-500">⚠</Text>
                  <Text className="text-sm text-gray-800">{clause}</Text>
                </View>
              ))}
            </Card>
          </View>
        ) : null}

        {/* Improvements Section */}
        {analysis.improvements.length > 0 ? (
          <View className="mt-6 px-4">
            <Text className="mb-3 text-lg font-bold text-gray-900">
              개선 권고사항
            </Text>
            <Card>
              {analysis.improvements.map((item, index) => (
                <View
                  key={`${item.priority}-${index}`}
                  className={`flex-row py-3 ${
                    index < analysis.improvements.length - 1
                      ? 'border-b border-gray-100'
                      : ''
                  }`}
                >
                  <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                    <Text className="text-xs font-bold text-blue-700">
                      {index + 1}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-900">
                      {item.title}
                    </Text>
                    <Text className="mt-0.5 text-sm leading-5 text-gray-600">
                      {item.description}
                    </Text>
                  </View>
                </View>
              ))}
            </Card>
          </View>
        ) : null}

        {/* Report button */}
        <View className="mt-8 px-4">
          <Button
            variant="primary"
            size="lg"
            onPress={() => router.push(`/report/${id}`)}
          >
            리포트 보기
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
