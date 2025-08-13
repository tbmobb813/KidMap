import React, { useState } from "react";
import { ScrollView, RefreshControl, Platform } from "react-native";

import { useTheme } from "@/constants/theme";

type PullToRefreshProps = {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshing?: boolean;
};

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  refreshing = false,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const theme = useTheme();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing || isRefreshing}
          onRefresh={handleRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
          progressBackgroundColor={theme.colors.surface}
          // Android-specific styling
          {...(Platform.OS === 'android' && {
            progressViewOffset: 20,
          })}
        />
      }
    >
      {children}
    </ScrollView>
  );
};

export default PullToRefresh;
