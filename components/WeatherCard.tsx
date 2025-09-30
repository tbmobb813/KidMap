import { Cloud, Sun, CloudRain, Snowflake, Wind } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/constants/theme";
import { WeatherInfo } from "@/types/navigation";

type WeatherCardProps = {
  weather: WeatherInfo;
};

const WeatherCard: React.FC<WeatherCardProps> = ({ weather }) => {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const getWeatherIcon = () => {
    switch (weather.condition.toLowerCase()) {
      case "sunny":
        return <Sun size={24} color="#FFD700" />;
      case "cloudy":
        return <Cloud size={24} color="#87CEEB" />;
      case "rainy":
        return <CloudRain size={24} color="#4682B4" />;
      case "snowy":
        return <Snowflake size={24} color="#B0E0E6" />;
      default:
        return <Wind size={24} color={theme.colors.textSecondary} />;
    }
  };

  const getBackgroundColor = () => {
    switch (weather.condition.toLowerCase()) {
      case "sunny":
        return "#FFF8DC";
      case "cloudy":
        return "#F0F8FF";
      case "rainy":
        return "#E6F3FF";
      case "snowy":
        return "#F0F8FF";
      default:
        return theme.colors.surface;
    }
  };

  return (
    <View
      testID="weather-card"
      style={[styles.container, { backgroundColor: getBackgroundColor() }]}
    >
      <View style={styles.weatherInfo}>
        {getWeatherIcon()}
        <View style={styles.textContainer}>
          <Text style={styles.temperature}>{weather.temperature}°C</Text>
          <Text style={styles.condition}>{weather.condition}</Text>
        </View>
      </View>

      <Text style={styles.recommendation}>{weather.recommendation}</Text>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    condition: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      textTransform: "capitalize",
    },
    container: {
      borderLeftColor: theme.colors.primary,
      borderLeftWidth: 4,
      borderRadius: 12,
      margin: 16,
      padding: 16,
    },
    recommendation: {
      color: theme.colors.text,
      fontSize: 14,
      fontStyle: "italic",
    },
    temperature: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "700",
    },
    textContainer: {
      marginLeft: 12,
    },
    weatherInfo: {
      alignItems: "center",
      flexDirection: "row",
      marginBottom: 8,
    },
  });

export default WeatherCard;
