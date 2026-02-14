import React, { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { AnalysisResult } from '@cg/shared';
import { Badge, Card, EmptyState, Skeleton, StatusBadge } from '../../src/components/ui';
import { useAnalyses } from '../../src/hooks/useAnalyses';
import { API_CONFIG } from '../../src/constants/config';

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
    <View className="mb-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Skeleton width="60%" height={18} borderRadius={4} />
          <View className="mt-3">
            <Skeleton width="30%" height={12} borderRadius={4} />
          </View>
        </View>
        <Skeleton width={64} height={24} borderRadius={12} />
      </View>
    </View>
  );
}

function AnalysisItem({
  item,
  onPress,
  onLongPress,
}: {
  item: AnalysisResult;
  onPress: () => void;
  onLongPress: () => void;
}) {
  return (
    <Card onPress={onPress} onLongPress={onLongPress} className="mb-4">
      <View className="flex-row items-center">
        <View className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
          <Text className="text-2xl">
            {item.file_type === 'pdf' ? '📄' : '🖼️'}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-bold tracking-tight text-gray-900">
            {truncateFilename(item.original_filename)}
          </Text>
          <Text className="mt-1 text-xs font-medium text-gray-400">
            {formatDate(item.created_at)}
          </Text>
        </View>
        <View className="items-end gap-2">
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
        <Text className="ml-3 text-xl text-gray-300">{'›'}</Text>
      </View>
    </Card>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { analyses, isLoading, refetch, removeAnalysis } = useAnalyses();
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

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert('분석 삭제', '이 분석을 삭제하시겠습니까?', [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(
                `${API_CONFIG.baseUrl}/api/analyses/${id}`,
                { method: 'DELETE' },
              );
              if (res.ok) {
                removeAnalysis(id);
              } else {
                Alert.alert('오류', '삭제에 실패했습니다.');
              }
            } catch {
              Alert.alert('오류', '삭제에 실패했습니다.');
            }
          },
        },
      ]);
    },
    [removeAnalysis],
  );

  const navigateToUpload = useCallback(() => {
    router.push('/(tabs)/upload' as any);
  }, [router]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <SafeAreaView edges={['top']}>
          <View className="px-6 pb-6 pt-4">
            <Text className="text-3xl font-bold tracking-tighter text-gray-900">
              내 계약서
            </Text>
            <View className="mt-2 h-1 w-8 rounded-full bg-blue-500" />
          </View>
        </SafeAreaView>
        <View className="flex-1 bg-gray-50/50 px-4 pt-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView edges={['top']} className="bg-white">
        <View className="px-6 pb-6 pt-4">
          <View className="flex-row items-end justify-between">
            <View>
              <Text className="text-[13px] font-bold uppercase tracking-widest text-blue-600">
                Dashboard
              </Text>
              <Text className="mt-1 text-3xl font-bold tracking-tighter text-gray-900">
                내 계약서
              </Text>
            </View>
            <View className="mb-1 rounded-full bg-blue-50 px-3 py-1.5">
              <Text className="text-[11px] font-bold text-blue-600">
                총 {analyses.length}건
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      <View className="flex-1 bg-gray-50/50">
        <FlatList
          data={analyses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AnalysisItem
              item={item}
              onPress={() => handleItemPress(item.id)}
              onLongPress={() => handleDelete(item.id)}
            />
          )}
          contentContainerStyle={
            analyses.length === 0
              ? { flex: 1 }
              : { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 }
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#2563EB"
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={'\uD83D\uDCCB'}
              title="분석된 계약서가 없습니다"
              description="첫 계약서를 업로드하고 안전하게 보호하세요"
              actionLabel="지금 분석하기"
              onAction={navigateToUpload}
            />
          }
        />
      </View>
    </View>
  );
}
