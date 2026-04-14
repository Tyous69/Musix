import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "react-native";
import { MiniPlayer } from "@/components/player/MiniPlayer";
import { useAudio } from "@/hooks/useAudio";

function AudioEngine() {
  useAudio(); // Monte le moteur audio une seule fois pour toute l'app
  return null;
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const MINI_PLAYER_HEIGHT = 70;

  return (
    <View style={{ flex: 1 }}>
      <AudioEngine />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#1A1A1A",
            borderTopColor: "#2A2A2A",
            borderTopWidth: 0.5,
            height: 60 + insets.bottom + MINI_PLAYER_HEIGHT,
            paddingBottom: insets.bottom + 8 + MINI_PLAYER_HEIGHT,
          },
          tabBarActiveTintColor: "#00BFA5",
          tabBarInactiveTintColor: "#9E9E9E",
          tabBarLabelStyle: {
            fontSize: 11,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: "Library",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="library" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      {/* MiniPlayer flotte au dessus de la tab bar */}
      <View
        style={{
          position: "absolute",
          bottom: 60 + insets.bottom,
          left: 0,
          right: 0,
        }}
      >
        <MiniPlayer />
      </View>
    </View>
  );
}