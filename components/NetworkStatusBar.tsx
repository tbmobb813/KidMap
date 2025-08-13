import { WifiOff, RefreshCw } from "lucide-react-native";
import React, { useMemo } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";

import { useTheme } from "@/constants/theme";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

type NetworkStatusBarProps = {
  onRetry?: () => void;
};

const NetworkStatusBar: React.FC<NetworkStatusBarProps> = ({ onRetry }) => {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const theme = useTheme();
  
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (isConnected && isInternetReachable) return null;

  return (
    <View style={styles.container}>
      <WifiOff size={16} color={theme.colors.error} />
      <Text style={styles.text}>
        {!isConnected ? "No connection" : "Limited connectivity"}
      </Text>
      {onRetry && (
        <Pressable style={styles.retryButton} onPress={onRetry}>
          <RefreshCw size={14} color={theme.colors.error} />
        </Pressable>
      )}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: theme.colors.error,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryButton: {
    padding: 4,
  },
  text: {
    color: theme.colors.onError,
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default NetworkStatusBar;
