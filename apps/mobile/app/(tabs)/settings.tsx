import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Modal } from '../../src/components/ui/Modal';
import { useAuth } from '../../src/hooks/useAuth';

const APP_VERSION = '1.0.0';

interface MenuItemProps {
  label: string;
  onPress: () => void;
  rightText?: string;
  textColor?: string;
}

function MenuItem({ label, onPress, rightText, textColor }: MenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between border-b border-gray-100 py-3.5 active:bg-gray-50"
    >
      <Text className={`text-sm ${textColor ?? 'text-gray-900'}`}>
        {label}
      </Text>
      {rightText ? (
        <Text className="text-sm text-gray-400">{rightText}</Text>
      ) : (
        <Text className="text-gray-400">{'>'}</Text>
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayName = user?.user_metadata?.display_name ?? user?.email ?? '사용자';
  const email = user?.email ?? '';

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            await signOut();
            router.replace('/(auth)/login');
          } catch {
            Alert.alert('오류', '로그아웃에 실패했습니다. 다시 시도해 주세요.');
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  const openURL = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('오류', '페이지를 열 수 없습니다.');
    });
  };

  // Get initials from display name
  const initials = displayName
    ? displayName.slice(0, 1)
    : '?';

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="bg-white px-4 pb-2 pt-4">
          <Text className="text-xl font-bold text-gray-900">설정</Text>
        </View>

        {/* Profile Section */}
        <Card className="mx-4 mt-4">
          <View className="flex-row items-center">
            {/* Avatar */}
            <View className="mr-4 h-14 w-14 items-center justify-center rounded-full bg-blue-100">
              <Text className="text-xl font-bold text-blue-700">
                {initials}
              </Text>
            </View>

            {/* Info */}
            <View className="flex-1">
              <Text className="text-base font-bold text-gray-900">
                {displayName}
              </Text>
              <Text className="mt-0.5 text-sm text-gray-500">
                {email}
              </Text>
            </View>
          </View>

          {/* Free analyses badge */}
          <View className="mt-4 flex-row items-center rounded-lg bg-blue-50 p-3">
            <Text className="text-sm text-blue-800">남은 무료 분석</Text>
            <View className="ml-2 rounded-full bg-blue-600 px-2.5 py-0.5">
              <Text className="text-xs font-bold text-white">
                {user?.user_metadata?.free_analyses_remaining ?? 0}회
              </Text>
            </View>
          </View>
        </Card>

        {/* Menu Section */}
        <Card className="mx-4 mt-4">
          <MenuItem
            label="이용약관"
            onPress={() =>
              openURL('https://contract-guardian.kr/terms')
            }
          />
          <MenuItem
            label="개인정보처리방침"
            onPress={() =>
              openURL('https://contract-guardian.kr/privacy')
            }
          />
          <MenuItem
            label="앱 정보"
            onPress={() => setShowVersionModal(true)}
            rightText={`v${APP_VERSION}`}
          />
        </Card>

        {/* Logout */}
        <View className="mx-4 mt-6">
          <Button
            variant="outline"
            size="lg"
            onPress={handleLogout}
            loading={isLoggingOut}
          >
            <Text className="font-semibold text-red-500">로그아웃</Text>
          </Button>
        </View>

        {/* App version footer */}
        <Text className="mt-8 text-center text-xs text-gray-400">
          계약서 지킴이 v{APP_VERSION}
        </Text>
      </ScrollView>

      {/* Version Modal */}
      <Modal
        visible={showVersionModal}
        onClose={() => setShowVersionModal(false)}
        title="앱 정보"
      >
        <View className="gap-3">
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500">앱 이름</Text>
            <Text className="text-sm font-medium text-gray-900">
              계약서 지킴이
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500">버전</Text>
            <Text className="text-sm font-medium text-gray-900">
              v{APP_VERSION}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500">플랫폼</Text>
            <Text className="text-sm font-medium text-gray-900">
              Expo + React Native
            </Text>
          </View>
          <View className="mt-4">
            <Button
              variant="primary"
              size="md"
              onPress={() => setShowVersionModal(false)}
            >
              닫기
            </Button>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
