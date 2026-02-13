import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { AnalysisResult } from '@cg/shared';
import { Badge, Card, EmptyState, Skeleton, StatusBadge } from '../../src/components/ui';
import { useAnalyses } from '../../src/hooks/useAnalyses';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

function truncateFilename(name: string, maxLength = 24): string {
  if (name.length <= maxLength) return name;
  const ext = name.lastIndexOf('.') !== -1 ? name.slice(name.lastIndexOf('.')) : '';
  const base = name.slice(0, maxLength - ext.length - 3);
  return `${base}...${ext}`;
}

function SkeletonCard() {
  return (
    <View className="mb-3 rounded-xl bg-white p-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Skeleton width="70%" height={16} borderRadius={4} />
          <View className="mt-2">
            <Skeleton width="40%" height={12} borderRadius={4} />
          </View>
        </View>
        <Skeleton width={60} height={24} borderRadius={12} />
      </View>
    </View>
  );
}

function AnalysisItem({
  item,
  onPress,
}: {
  item: AnalysisResult;
  onPress: () => void;
}) {
  return (
    <Card onPress={onPress} className="mb-3">
      <View className="flex-row items-center">
        <View className="mr-3">
          <Text className="text-2xl">
            {item.file_type === 'pdf' ? '\uD83D\uDCC4' : '\uD83D\uDDBC\uFE0F'}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-900">
            {truncateFilename(item.original_filename)}
          </Text>
          <Text className="mt-0.5 text-xs text-gray-500">
            {formatDate(item.created_at)}
          </Text>
        </View>
        <View className="items-end gap-1.5">
          <StatusBadge status={item.status} />
          {item.status === 'completed' &&
          item.overall_risk_level &&
          item.overall_risk_score != null ? (
            <Badge
              level={item.overall_risk_level}
              label={`${item.overall_risk_score}점`}
            />
          ) : null}
        </View>
        <Text className="ml-2 text-lg text-gray-300">{'›'}</Text>
      </View>
    </Card>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { analyses, isLoading, refetch } = useAnalyses();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const handleItemPress = useCallback(
    (id: string) => {
      router.push(`/analysis/${id}` as any);
    },
    [router],
  );

  const navigateToUpload = useCallback(() => {
    router.push('/(tabs)/upload' as any);
  }, [router]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <View className="px-4 pb-2 pt-4">
          <Text className="text-2xl font-bold text-gray-900">내 계약서</Text>
        </View>
        <View className="px-4 pt-2">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="px-4 pb-2 pt-4">
        <Text className="text-2xl font-bold text-gray-900">내 계약서</Text>
      </View>
      <FlatList
        data={analyses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AnalysisItem
            item={item}
            onPress={() => handleItemPress(item.id)}
          />
        )}
        contentContainerStyle={
          analyses.length === 0 ? { flex: 1 } : { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }
        }
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon={'\uD83D\uDCCB'}
            title="아직 분석한 계약서가 없습니다"
            description="첫 계약서를 업로드하고 AI 분석을 받아보세요"
            actionLabel="분석하기"
            onAction={navigateToUpload}
          />
        }
      />
    </SafeAreaView>
  );
}
