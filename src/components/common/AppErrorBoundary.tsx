import React, { ErrorInfo, ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled screen render error", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#f8fafc" }}>
        <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "800", textAlign: "center" }}>
          Something went wrong
        </Text>
        <Text style={{ color: "#475569", fontSize: 14, marginTop: 8, textAlign: "center" }}>
          The screen could not be displayed. Please try again.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => this.setState({ hasError: false })}
          style={{ marginTop: 20, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, backgroundColor: "#dc2626" }}
        >
          <Text style={{ color: "#ffffff", fontSize: 14, fontWeight: "700" }}>Retry</Text>
        </Pressable>
      </View>
    );
  }
}