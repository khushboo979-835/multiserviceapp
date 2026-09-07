import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { AlertOctagon, RotateCcw } from "lucide-react-native";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught rendering error in ErrorBoundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 bg-dark-950 justify-center items-center px-6 py-12">
          <View className="w-20 h-20 bg-rose-950/40 border border-rose-500/30 rounded-3xl items-center justify-center mb-6">
            <AlertOctagon size={40} color="#f43f5e" />
          </View>
          <Text className="text-white text-2xl font-bold text-center mb-2">Something went wrong</Text>
          <Text className="text-dark-400 text-sm text-center mb-6 px-4">
            An unexpected error occurred. You can safely reload the view without losing your saved session.
          </Text>

          <ScrollView className="max-h-32 bg-dark-900 border border-dark-800 p-4 rounded-2xl w-full mb-8">
            <Text className="text-rose-400 text-xs font-mono">
              {this.state.error?.message || "Unknown error"}
            </Text>
          </ScrollView>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={this.handleReset}
            className="w-full bg-primary-600 py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary-600/30"
          >
            <RotateCcw size={18} color="#ffffff" className="mr-2" />
            <Text className="text-white text-base font-bold">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
