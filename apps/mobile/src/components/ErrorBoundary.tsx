import React, { Component } from 'react';
import { Pressable, Text, View } from 'react-native';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 bg-white items-center justify-center px-6">
          <Text className="text-4xl mb-4">⚠️</Text>
          <Text className="text-lg font-bold text-gray-900 mb-2 text-center">
            문제가 발생했습니다
          </Text>
          <Text className="text-sm text-gray-500 text-center mb-6 leading-5">
            앱에서 예상치 못한 오류가 발생했습니다.{'\n'}
            아래 버튼을 눌러 다시 시도해 주세요.
          </Text>
          <Pressable
            onPress={this.handleRetry}
            className="bg-blue-600 rounded-xl px-8 py-3 active:bg-blue-700"
          >
            <Text className="text-white font-semibold text-base">
              다시 시도
            </Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
