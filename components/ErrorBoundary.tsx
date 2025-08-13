import { AlertTriangle, RefreshCw } from "lucide-react-native";
import React, { useState, useCallback } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";

import { useTheme } from '@/constants/theme';

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
};

class ErrorBoundaryInner extends React.Component<ErrorBoundaryProps, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) { console.error('Error caught by boundary:', error, info); }
  reset = () => this.setState({ error: null });
  render() { return this.props.children; }
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children, fallback: Fallback }) => {
  const [error, setError] = useState<Error | null>(null);
  const theme = useTheme();
  const retry = useCallback(() => setError(null), []);

  // Wrap children in legacy class boundary (simplest capture), intercept error via fallback render phase.
  // Since converting fully to hooks-based boundary requires custom error handling, we keep minimal class inside.
  if (error) {
    if (Fallback) return <Fallback error={error} retry={retry} />;
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
        <AlertTriangle size={48} color={theme.colors.error} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Something went wrong</Text>
        <Text style={[styles.message, { color: theme.colors.textSecondary }]}>An unexpected error occurred.</Text>
        <Pressable style={[styles.retryButton, { backgroundColor: theme.colors.primary }]} onPress={retry} accessibilityLabel="Retry after error">
          <RefreshCw size={20} color={theme.colors.primaryForeground} />
          <Text style={[styles.retryText, { color: theme.colors.primaryForeground }]}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ErrorBoundaryInner fallback={Fallback}>
      {children}
    </ErrorBoundaryInner>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 32 },
  message: { fontSize: 16, lineHeight: 24, marginBottom: 24, textAlign: 'center' },
  retryButton: { alignItems: 'center', borderRadius: 8, flexDirection: 'row', gap: 8, paddingHorizontal: 24, paddingVertical: 12 },
  retryText: { fontSize: 16, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8, marginTop: 16, textAlign: 'center' },
});

export default ErrorBoundary;
