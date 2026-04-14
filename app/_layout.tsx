import { initDatabase } from "@/db/schema";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "react-native";
import { MiniPlayer } from "@/components/player/MiniPlayer";
import { useAudio } from "@/hooks/useAudio";
import "../global.css";

const queryClient = new QueryClient();

function AudioEngine() {
  useAudio();
  return null;
}

function RootLayoutInner() {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    initDatabase()
      .then(() => console.log("✅ Database initialized"))
      .catch((err) => console.error("❌ Database error:", err));
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
      <AudioEngine />
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 60,
          left: 0,
          right: 0,
        }}
      >
        <MiniPlayer />
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <RootLayoutInner />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}