import React from 'react';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { AnalysisResult } from '@cg/shared';
import { CLAUSE_TYPE_LABELS, RISK_LABELS } from '@cg/shared';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { RiskGauge } from '../../src/components/ui/RiskGauge';
import { useAnalysis } from '../../src/hooks/useAnalysis';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
}

function buildShareText(analysis: AnalysisResult): string {
  const lines: string[] = [];
  lines.push('=== 계약서 분석 리포트 ===');
  lines.push('');
  lines.push(`파일: ${analysis.original_filename}`);
  lines.push(`분석일: ${formatDate(analysis.created_at)}`);
  if (analysis.overall_risk_level && analysis.overall_risk_score != null) {
    lines.push(
      `종합 위험도: ${RISK_LABELS[analysis.overall_risk_level]} (${analysis.overall_risk_score}점)`,
    );
  }
  if (analysis.summary) {
    lines.push('');
    lines.push(`요약: ${analysis.summary}`);
  }
  if (analysis.clauses.length > 0) {
    lines.push('');
    lines.push('--- 조항별 분석 ---');
    for (const clause of analysis.clauses) {
      const label = CLAUSE_TYPE_LABELS[clause.clause_type] ?? clause.clause_type;
      lines.push(`\n[${label}] ${RISK_LABELS[clause.risk_level]} (${clause.risk_score}점)`);
      lines.push(`분석: ${clause.explanation}`);
      lines.push(`제안: ${clause.suggestion}`);
    }
  }
  if (analysis.improvements.length > 0) {
    lines.push('');
    lines.push('--- 개선 권고사항 ---');
    analysis.improvements.forEach((item, i) => {
      lines.push(`${i + 1}. ${item.title}: ${item.description}`);
    });
  }
  lines.push('');
  lines.push('계약서 지킴이 - AI 계약서 분석 서비스');
  return lines.join('\n');
}

export default function ReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { analysis, isLoading } = useAnalysis(id ?? null);

  const handleShare = async () => {
    if (!analysis) return;
    try {
      await Share.share({
        title: '계약서 분석 리포트',
        message: buildShareText(analysis),
      });
    } catch {
      // User cancelled or error - silently ignore
    }
  };

  // Loading
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <Pressable onPress={() => router.back()} className="p-1">
            <Text className="text-2xl text-gray-700">{'<'}</Text>
          </Pressable>
          <Skeleton height={20} width={120} />
          <View className="w-8" />
        </View>
        <ScrollView className="flex-1 px-4 py-6">
          <Skeleton height={28} width="60%" className="mb-2" />
          <Skeleton height={16} width="40%" className="mb-6" />
          <View className="mb-6 items-center">
            <Skeleton height={120} width={120} borderRadius={60} />
          </View>
          <Skeleton height={120} className="mb-4" />
          <Skeleton height={120} className="mb-4" />
          <Skeleton height={80} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Error / no data
  if (!analysis) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <View className="flex-row items-center px-4 py-3">
          <Pressable onPress={() => router.back()} className="p-1">
            <Text className="text-2xl text-gray-700">{'<'}</Text>
          </Pressable>
        </View>
        <EmptyState
          icon="📄"
          title="리포트를 불러올 수 없습니다"
          description="잠시 후 다시 시도해 주세요."
          actionLabel="돌아가기"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header with back + share */}
      <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <Pressable onPress={() => router.back()} className="p-1">
          <Text className="text-2xl text-gray-700">{'<'}</Text>
        </Pressable>
        <Text className="text-base font-bold text-gray-900">
          분석 리포트
        </Text>
        <Pressable onPress={handleShare} className="p-1">
          <Text className="text-xl text-blue-600">공유</Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Report Title Section */}
        <View className="bg-white px-4 pb-6 pt-5">
          <Text className="text-xl font-bold text-gray-900">
            계약서 분석 리포트
          </Text>
          <Text className="mt-1 text-sm text-gray-500">
            {analysis.original_filename}
          </Text>
          <Text className="text-xs text-gray-400">
            {formatDate(analysis.created_at)}
          </Text>
        </View>

        {/* Overall Risk */}
        {analysis.overall_risk_score != null && analysis.overall_risk_level ? (
          <View className="mt-3 items-center bg-white px-4 py-6">
            <Text className="mb-4 text-base font-bold text-gray-900">
              종합 위험도
            </Text>
            <RiskGauge
              score={analysis.overall_risk_score}
              size={120}
              strokeWidth={10}
            />
            {analysis.summary ? (
              <Text className="mt-4 px-2 text-center text-sm leading-5 text-gray-600">
                {analysis.summary}
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* Clause Analysis Sections */}
        {analysis.clauses.length > 0 ? (
          <View className="mt-3 bg-white px-4 py-5">
            <Text className="mb-4 text-base font-bold text-gray-900">
              조항별 분석
            </Text>
            {analysis.clauses.map((clause, index) => {
              const typeLabel =
                CLAUSE_TYPE_LABELS[clause.clause_type] ?? clause.clause_type;
              return (
                <View
                  key={clause.id}
                  className={`py-4 ${
                    index < analysis.clauses.length - 1
                      ? 'border-b border-gray-100'
                      : ''
                  }`}
                >
                  {/* Type + badge */}
                  <View className="mb-2 flex-row items-center justify-between">
                    <Text className="text-sm font-bold text-gray-900">
                      {typeLabel}
                    </Text>
                    <Badge level={clause.risk_level} />
                  </View>
                  {/* Explanation */}
                  <Text className="mb-2 text-sm leading-5 text-gray-700">
                    {clause.explanation}
                  </Text>
                  {/* Suggestion */}
                  <View className="rounded-lg bg-blue-50 p-3">
                    <Text className="text-xs font-semibold text-blue-700">
                      수정 제안
                    </Text>
                    <Text className="mt-1 text-sm leading-5 text-blue-900">
                      {clause.suggestion}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        {/* Improvements */}
        {analysis.improvements.length > 0 ? (
          <View className="mt-3 bg-white px-4 py-5">
            <Text className="mb-3 text-base font-bold text-gray-900">
              개선 권고사항
            </Text>
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
          </View>
        ) : null}

        {/* Missing Clauses */}
        {analysis.missing_clauses && analysis.missing_clauses.length > 0 ? (
          <View className="mt-3 bg-white px-4 py-5">
            <Text className="mb-3 text-base font-bold text-gray-900">
              누락된 조항
            </Text>
            {analysis.missing_clauses.map((clause) => (
              <View key={clause} className="flex-row items-center py-2">
                <Text className="mr-2 text-base text-amber-500">⚠</Text>
                <Text className="text-sm text-gray-800">{clause}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Bottom Share Button */}
        <View className="mt-6 px-4">
          <Button variant="primary" size="lg" onPress={handleShare}>
            리포트 공유하기
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
