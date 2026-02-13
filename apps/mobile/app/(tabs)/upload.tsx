import React, { useCallback, useState } from 'react';
import { Alert, Modal, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { MAX_FILE_SIZE, SUPPORTED_FORMATS } from '@cg/shared';
import { Button, ProgressBar } from '../../src/components/ui';
import {
  CameraCapture,
  FilePreview,
  UploadOption,
} from '../../src/components/upload';
import { useUpload } from '../../src/hooks/useUpload';

interface SelectedFile {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}

function getSimpleFileType(mimeType: string): string {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType === 'image/jpeg') return 'jpeg';
  if (mimeType === 'image/png') return 'png';
  return mimeType;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadScreen() {
  const router = useRouter();
  const { upload, isUploading, progress: uploadProgress, error: uploadError, reset: resetUpload } = useUpload();
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const validateFile = useCallback(
    (file: { name: string; size: number; mimeType: string }): string | null => {
      if (file.size > MAX_FILE_SIZE) {
        return `파일 크기가 ${formatFileSize(MAX_FILE_SIZE)}를 초과합니다 (현재: ${formatFileSize(file.size)})`;
      }
      if (
        !(SUPPORTED_FORMATS as readonly string[]).includes(file.mimeType)
      ) {
        return '지원하지 않는 파일 형식입니다. PDF, JPEG, PNG 파일만 업로드할 수 있습니다.';
      }
      return null;
    },
    [],
  );

  const handlePickDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      const file = {
        uri: asset.uri,
        name: asset.name,
        size: asset.size ?? 0,
        mimeType: asset.mimeType ?? 'application/octet-stream',
      };

      const error = validateFile(file);
      if (error) {
        setValidationError(error);
        setSelectedFile(null);
        return;
      }

      setValidationError(null);
      setSelectedFile(file);
    } catch {
      Alert.alert('오류', '파일을 선택하는 중 문제가 발생했습니다.');
    }
  }, [validateFile]);

  const handleCameraCapture = useCallback(
    async (uri: string) => {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      const file = {
        uri,
        name: `계약서_촬영_${Date.now()}.jpg`,
        size: fileInfo.exists ? (fileInfo.size ?? 0) : 0,
        mimeType: 'image/jpeg',
      };

      const error = validateFile(file);
      if (error) {
        setValidationError(error);
        setSelectedFile(null);
        setShowCamera(false);
        return;
      }

      setValidationError(null);
      setSelectedFile(file);
      setShowCamera(false);
    },
    [validateFile],
  );

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setValidationError(null);
    resetUpload();
  }, [resetUpload]);

  const handleStartAnalysis = useCallback(async () => {
    if (!selectedFile) return;

    try {
      const analysisId = await upload({
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType,
        size: selectedFile.size,
      });
      if (analysisId) {
        router.push(`/analysis/${analysisId}` as any);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '업로드 중 오류가 발생했습니다.';
      Alert.alert('업로드 실패', message);
    }
  }, [selectedFile, upload, router]);

  if (showCamera) {
    return (
      <Modal visible animationType="slide">
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      </Modal>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="px-4 pb-2 pt-4">
          <Text className="text-2xl font-bold text-gray-900">
            계약서 분석하기
          </Text>
          <Text className="mt-1 text-sm text-gray-500">
            PDF 파일을 업로드하거나 카메라로 촬영하세요
          </Text>
        </View>

        {/* Upload Options */}
        <View className="mt-4 px-4">
          <Text className="mb-2 text-sm font-medium text-gray-700">
            업로드 방법 선택
          </Text>
          <UploadOption
            icon={'\uD83D\uDCC4'}
            title="파일 선택"
            description="PDF, JPEG, PNG (최대 20MB)"
            onPress={handlePickDocument}
          />
          <UploadOption
            icon={'\uD83D\uDCF7'}
            title="카메라로 촬영"
            description="계약서를 촬영하여 분석합니다"
            onPress={() => setShowCamera(true)}
          />
        </View>

        {/* Validation Error */}
        {validationError ? (
          <View className="mx-4 mt-3 rounded-lg bg-red-50 px-4 py-3">
            <Text className="text-sm text-red-600">{validationError}</Text>
          </View>
        ) : null}

        {/* Selected File Preview */}
        {selectedFile ? (
          <View className="mt-4 px-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">
              선택된 파일
            </Text>
            <FilePreview
              filename={selectedFile.name}
              fileSize={selectedFile.size}
              fileType={getSimpleFileType(selectedFile.mimeType)}
              onRemove={handleRemoveFile}
            />
          </View>
        ) : null}

        {/* Upload Progress */}
        {isUploading ? (
          <View className="mt-4 px-4">
            <ProgressBar
              progress={uploadProgress}
              label={
                uploadProgress < 1 ? '업로드 중...' : '업로드 완료!'
              }
            />
            <Text className="mt-1 text-center text-xs text-gray-500">
              {Math.round(uploadProgress * 100)}%
            </Text>
          </View>
        ) : null}

        {/* Start Analysis Button */}
        <View className="mt-6 px-4">
          <Button
            variant="primary"
            size="lg"
            onPress={handleStartAnalysis}
            disabled={!selectedFile || isUploading}
            loading={isUploading}
            className="w-full"
          >
            분석 시작
          </Button>
        </View>

        {/* Info */}
        <View className="mt-6 px-4">
          <View className="rounded-lg bg-blue-50 px-4 py-3">
            <Text className="mb-1 text-sm font-medium text-blue-800">
              분석 안내
            </Text>
            <Text className="text-xs leading-5 text-blue-700">
              {
                '• AI가 계약서의 8가지 핵심 조항을 분석합니다\n• 위험도 점수와 개선 제안을 제공합니다\n• 분석에는 약 1-2분이 소요됩니다'
              }
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
