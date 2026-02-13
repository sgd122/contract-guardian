import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';

export default function CallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    access_token?: string;
    refresh_token?: string;
  }>();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { access_token, refresh_token } = params;

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (error) throw error;
        }

        router.replace('/(tabs)');
      } catch {
        router.replace('/(auth)/login');
      }
    };

    handleCallback();
  }, [params, router]);

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator size="large" color="#2563EB" />
      <Text className="text-gray-500 mt-4 text-base">로그인 처리 중...</Text>
    </View>
  );
}
