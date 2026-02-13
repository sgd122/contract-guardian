import React, { useRef, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button } from '../ui';

interface CameraCaptureProps {
  onCapture: (uri: string) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">카메라 로딩 중...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="mb-2 text-5xl">📷</Text>
        <Text className="mb-2 text-center text-lg font-bold text-gray-900">
          카메라 권한이 필요합니다
        </Text>
        <Text className="mb-6 text-center text-sm text-gray-500">
          계약서를 촬영하려면 카메라 접근을 허용해주세요
        </Text>
        <Button variant="primary" size="md" onPress={requestPermission}>
          권한 허용하기
        </Button>
        <View className="mt-3">
          <Button variant="ghost" size="sm" onPress={onClose}>
            돌아가기
          </Button>
        </View>
      </View>
    );
  }

  if (photoUri) {
    return (
      <View className="flex-1 bg-black">
        <Image
          source={{ uri: photoUri }}
          className="flex-1"
          style={{ resizeMode: 'contain' }}
        />
        <View className="flex-row gap-3 bg-black px-6 pb-8 pt-4">
          <View className="flex-1">
            <Button
              variant="outline"
              size="lg"
              onPress={() => setPhotoUri(null)}
            >
              다시 촬영
            </Button>
          </View>
          <View className="flex-1">
            <Button
              variant="primary"
              size="lg"
              onPress={() => onCapture(photoUri)}
            >
              사용하기
            </Button>
          </View>
        </View>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });
      if (photo) {
        setPhotoUri(photo.uri);
      }
    }
  };

  return (
    <View className="flex-1 bg-black">
      <CameraView ref={cameraRef} className="flex-1" facing="back">
        <View className="absolute left-0 right-0 top-12 items-center">
          <View className="rounded-full bg-black/50 px-4 py-2">
            <Text className="text-sm font-medium text-white">
              계약서를 화면에 맞춰주세요
            </Text>
          </View>
        </View>
      </CameraView>
      <View className="flex-row items-center justify-center gap-6 bg-black px-6 pb-8 pt-4">
        <Pressable
          onPress={onClose}
          className="rounded-full bg-white/20 px-5 py-3"
        >
          <Text className="font-semibold text-white">취소</Text>
        </Pressable>
        <Pressable
          onPress={takePicture}
          className="h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white active:bg-gray-200"
        >
          <View className="h-12 w-12 rounded-full bg-white" />
        </Pressable>
        <View className="px-5 py-3 opacity-0">
          <Text>취소</Text>
        </View>
      </View>
    </View>
  );
}
