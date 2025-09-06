import React from "react";
import { Tabs } from "expo-router";
import Colors from "@/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        tabBarStyle: Platform.OS === 'android'
          ? {
              height: 65,
              paddingBottom: 10,
              paddingTop: 5,
              elevation: 8,
              borderTopWidth: 0,
            }
          : {
              height: 60,
              paddingBottom: 8,
              paddingTop: 0,
            },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }: { color: string }) => <MaterialIcons name="home" size={24} color={color} />,
          headerTitle: "KidMap",
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color }: { color: string }) => <FontAwesome5 name="map" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transit"
        options={{
          title: "Transit",
          tabBarIcon: ({ color }: { color: string }) => <MaterialIcons name="train" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: "Achievements",
          tabBarIcon: ({ color }: { color: string }) => <FontAwesome5 name="trophy" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }: { color: string }) => <Ionicons name="settings-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}