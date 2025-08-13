import { Image } from "expo-image";
import { ImageOff } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";

import { useTheme } from "@/constants/theme";


type OptimizedImageProps = {
  source: { uri: string } | number;
  style?: any;
  placeholder?: string;
  contentFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  onLoad?: () => void;
  onError?: () => void;
};

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  placeholder,
  contentFit = "cover",
  onLoad,
  onError,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    onError?.();
  };

  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  if (error) {
    return (
      <View style={[styles.errorContainer, style]}>
        <ImageOff size={24} color={theme.colors.textSecondary} />
      </View>
    );
  }

  return (
    <View style={style}>
      <Image
        source={source}
        style={StyleSheet.absoluteFill}
        contentFit={contentFit}
        placeholder={placeholder}
        onLoad={handleLoad}
        onError={handleError}
        cachePolicy="memory-disk"
      />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}
    </View>
  );
};
const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  errorContainer: {
    alignItems: "center",
    backgroundColor: theme.colors.border,
    justifyContent: "center",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
  },
});

export default OptimizedImage;
