import type { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: '계약서 지킴이',
  slug: 'contract-guardian',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  scheme: 'contract-guardian',
  platforms: ['ios', 'android'],
  icon: './assets/icon.png',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#1E40AF',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.contractguardian.app',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#1E40AF',
    },
    package: 'com.contractguardian.app',
  },
  plugins: [
    'expo-dev-client',
    'expo-router',
    'expo-secure-store',
    ['expo-camera', { cameraPermission: '계약서 촬영을 위해 카메라 접근이 필요합니다.' }],
    ['expo-document-picker', {}],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: { projectId: 'placeholder' },
  },
});
