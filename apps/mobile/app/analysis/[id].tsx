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
      <View className="flex-1 bg-white">
        <SafeAreaView edges={['top']}>
          <View className="flex-row items-center px-6 py-4">
            <Pressable onPress={() => router.back()} className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-gray-50 active:bg-gray-100">
              <Text className="text-xl font-medium text-gray-900">{'←'}</Text>
            </Pressable>
            <Skeleton height={24} width="40%" borderRadius={4} />
          </View>
        </SafeAreaView>
        <ScrollView>
          <LoadingSkeleton />
        </ScrollView>
      </View>
    );
  }

  // Error state
  if (error || !analysis) {
    return (
      <View className="flex-1 bg-white">
        <SafeAreaView edges={['top']}>
          <View className="flex-row items-center px-6 py-4">
            <Pressable onPress={() => router.back()} className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-gray-50 active:bg-gray-100">
              <Text className="text-xl font-medium text-gray-900">{'←'}</Text>
            </Pressable>
            <Text className="text-lg font-bold tracking-tight text-gray-900">분석 결과</Text>
          </View>
        </SafeAreaView>
        <EmptyState
          icon="⚠️"
          title="분석 결과를 불러올 수 없습니다"
          description={error?.message ?? '잠시 후 다시 시도해 주세요.'}
          actionLabel="다시 시도"
          onAction={() => refetch()}
        />
      </View>
    );
  }

  // Processing / pending state
  if (
    analysis.status === 'processing' ||
    analysis.status === 'paid' ||
    analysis.status === 'pending_payment'
  ) {
    return (
      <View className="flex-1 bg-white">
        <SafeAreaView edges={['top']}>
          <View className="flex-row items-center px-6 py-4">
            <Pressable onPress={() => router.back()} className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-gray-50 active:bg-gray-100">
              <Text className="text-xl font-medium text-gray-900">{'←'}</Text>
            </Pressable>
            <Text className="flex-1 text-lg font-bold tracking-tight text-gray-900" numberOfLines={1}>
              {analysis.original_filename}
            </Text>
          </View>
        </SafeAreaView>
        <AnalysisProgress status={analysis.status} />
      </View>
    );
  }

  // Failed state
  if (analysis.status === 'failed') {
    return (
      <View className="flex-1 bg-white">
        <SafeAreaView edges={['top']}>
          <View className="flex-row items-center px-6 py-4">
            <Pressable onPress={() => router.back()} className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-gray-50 active:bg-gray-100">
              <Text className="text-xl font-medium text-gray-900">{'←'}</Text>
            </Pressable>
            <Text className="text-lg font-bold tracking-tight text-gray-900">분석 결과</Text>
          </View>
        </SafeAreaView>
        <EmptyState
          icon="❌"
          title="분석에 실패했습니다"
          description="계약서 분석 중 오류가 발생했습니다. 다시 시도해 주세요."
          actionLabel="돌아가기"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  // Completed state - full analysis view
  return (
    <View className="flex-1 bg-white">
      <SafeAreaView edges={['top']} className="bg-white">
        <View className="flex-row items-center px-6 py-4">
          <Pressable 
            onPress={() => router.back()} 
            className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-gray-50 active:bg-gray-100"
          >
            <Text className="text-xl font-medium text-gray-900">{'←'}</Text>
          </Pressable>
          <View className="flex-1">
            <Text className="text-sm font-bold tracking-widest uppercase text-blue-600">
              Analysis Result
            </Text>
            <Text className="mt-0.5 text-lg font-bold tracking-tight text-gray-900" numberOfLines={1}>
              {analysis.original_filename}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        className="flex-1 bg-gray-50/50"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Overall Risk Section */}
        {analysis.overall_risk_score != null &&
        analysis.overall_risk_level &&
        analysis.summary ? (
          <View className="bg-white px-6 pb-8 pt-2 shadow-sm">
            <RiskSummary
              riskScore={analysis.overall_risk_score}
              riskLevel={analysis.overall_risk_level}
              summary={analysis.summary}
            />
          </View>
        ) : null}

        {/* Contract Info Section */}
        {(analysis.contract_type || analysis.contract_parties) ? (
          <View className="mt-6 px-6">
            <Text className="mb-3 text-[13px] font-bold uppercase tracking-wider text-gray-400">
              계약 정보
            </Text>
            <Card className="p-5">
              {analysis.contract_type ? (
                <View className="mb-4 flex-row items-center border-b border-gray-50 pb-3">
                  <Text className="w-24 text-sm font-medium text-gray-500">계약 유형</Text>
                  <Text className="flex-1 text-sm font-bold text-gray-900">
                    {analysis.contract_type}
                  </Text>
                </View>
              ) : null}
              {analysis.contract_parties ? (
                <>
                  <View className="mb-3 flex-row">
                    <Text className="w-24 text-sm font-medium text-gray-500">갑 (발주자)</Text>
                    <Text className="flex-1 text-sm font-bold text-gray-900">
                      {analysis.contract_parties.party_a}
                    </Text>
                  </View>
                  <View className="flex-row">
                    <Text className="w-24 text-sm font-medium text-gray-500">을 (수급자)</Text>
                    <Text className="flex-1 text-sm font-bold text-gray-900">
                      {analysis.contract_parties.party_b}
                    </Text>
                  </View>
                </>
              ) : null}
            </Card>
          </View>
        ) : null}

        {/* Clause Breakdown Section */}
        {analysis.clauses.length > 0 ? (
          <View className="mt-8 px-6">
            <Text className="mb-3 text-[13px] font-bold uppercase tracking-wider text-gray-400">
              조항별 분석 결과
            </Text>
            {analysis.clauses.map((clause) => (
              <ClauseCard key={clause.id} clause={clause} />
            ))}
          </View>
        ) : null}

        {/* Missing Clauses Section */}
        {analysis.missing_clauses && analysis.missing_clauses.length > 0 ? (
          <View className="mt-8 px-6">
            <Text className="mb-3 text-[13px] font-bold uppercase tracking-wider text-gray-400">
              누락된 조항
            </Text>
            <Card className="p-5">
              {analysis.missing_clauses.map((clause, index) => (
                <View
                  key={clause}
                  className={`flex-row items-center py-3 ${
                    index < analysis.missing_clauses!.length - 1
                      ? 'border-b border-gray-50'
                      : ''
                  }`}
                >
                  <View className="mr-3 h-5 w-5 items-center justify-center rounded-full bg-amber-50">
                    <Text className="text-[10px] text-amber-600">⚠</Text>
                  </View>
                  <Text className="text-sm font-medium text-gray-800">{clause}</Text>
                </View>
              ))}
            </Card>
          </View>
        ) : null}

        {/* Improvements Section */}
        {analysis.improvements.length > 0 ? (
          <View className="mt-8 px-6">
            <Text className="mb-3 text-[13px] font-bold uppercase tracking-wider text-gray-400">
              개선 권고사항
            </Text>
            <Card className="p-5">
              {analysis.improvements.map((item, index) => (
                <View
                  key={`${item.priority}-${index}`}
                  className={`flex-row py-4 ${
                    index < analysis.improvements.length - 1
                      ? 'border-b border-gray-50'
                      : ''
                  }`}
                >
                  <View className="mr-4 h-7 w-7 items-center justify-center rounded-full bg-blue-50">
                    <Text className="text-xs font-bold text-blue-600">
                      {index + 1}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-gray-900">
                      {item.title}
                    </Text>
                    <Text className="mt-1 text-[13px] leading-5 text-gray-500">
                      {item.description}
                    </Text>
                  </View>
                </View>
              ))}
            </Card>
          </View>
        ) : null}

        {/* Report button */}
        <View className="mt-12 px-6">
          <Button
            variant="primary"
            size="lg"
            onPress={() => router.push(`/report/${id}`)}
            className="shadow-lg shadow-blue-200"
          >
            전체 리포트 확인하기
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
