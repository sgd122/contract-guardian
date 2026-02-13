import React from 'react';
import { Text, View } from 'react-native';
import type { ClauseAnalysis } from '@cg/shared';
import { CLAUSE_TYPE_LABELS } from '@cg/shared';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface ClauseCardProps {
  clause: ClauseAnalysis;
  className?: string;
}

export function ClauseCard({ clause, className = '' }: ClauseCardProps) {
  const typeLabel = CLAUSE_TYPE_LABELS[clause.clause_type] ?? clause.clause_type;

  return (
    <Card className={`mb-3 ${className}`}>
      {/* Header: clause type + risk badge */}
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-base font-bold text-gray-900">{typeLabel}</Text>
        <Badge level={clause.risk_level} />
      </View>

      {/* Risk score */}
      <Text className="mb-3 text-xs text-gray-500">
        위험도: {clause.risk_score}/100
      </Text>

      {/* Original text - quoted style */}
      <View className="mb-3 rounded-lg bg-gray-100 p-3">
        <Text className="text-sm leading-5 text-gray-700">
          "{clause.original_text}"
        </Text>
      </View>

      {/* Explanation */}
      <View className="mb-3">
        <Text className="mb-1 text-xs font-semibold text-gray-500">분석</Text>
        <Text className="text-sm leading-5 text-gray-800">
          {clause.explanation}
        </Text>
      </View>

      {/* Suggestion - info colored box */}
      <View className="mb-2 rounded-lg bg-blue-50 p-3">
        <Text className="mb-1 text-xs font-semibold text-blue-700">
          수정 제안
        </Text>
        <Text className="text-sm leading-5 text-blue-900">
          {clause.suggestion}
        </Text>
      </View>

      {/* Relevant law reference */}
      {clause.relevant_law ? (
        <Text className="mt-1 text-xs text-gray-400">
          관련 법률: {clause.relevant_law}
        </Text>
      ) : null}
    </Card>
  );
}
