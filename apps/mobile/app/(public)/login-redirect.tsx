import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(auth)/login');
  }, [router]);

  return null;
}
