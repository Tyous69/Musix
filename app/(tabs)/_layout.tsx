import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "react-native";
import { MiniPlayer } from "@/components/player/MiniPlayer";
import { useAudio } from "@/hooks/useAudio";

function AudioEngine() {
  useAudio();
  return null;
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <AudioEngine />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#00BFA5",
          tabBarInactiveTintColor: "#9E9E9E",
          tabBarStyle: {
            backgroundColor: "#1A1A1A",
            borderTopColor: "#2A2A2A",
            borderTopWidth: 0.5,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
          },
        }}
        tabBar={(props) => (
          <View style={{ backgroundColor: "#1A1A1A" }}>
            <MiniPlayer />
            <BottomTabBar {...props} />
          </View>
        )}
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
    </>
  );
}