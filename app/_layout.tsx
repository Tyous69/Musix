import AnimatedSplash from "@/components/AnimatedSplash";
import { MiniPlayer } from "@/components/player/MiniPlayer";
import { initDatabase } from "@/db/schema";
import { useAudio } from "@/hooks/useAudio";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import "../global.css";

const queryClient = new QueryClient();

function AudioEngine() {
  useAudio();
  return null;
}

function RootLayoutInner() {
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const isInTabs = segments[0] === "(tabs)";

  useEffect(() => {
    initDatabase()
      .then(() => console.log("✅ Database initialized"))
      .catch((err) => console.error("❌ Database error:", err));
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
      <AudioEngine />
      {!isInTabs && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <MiniPlayer />
        </View>
      )}
    </View>
  );
}

export default function RootLayout() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  const handleAnimationFinish = () => {
    setIsSplashVisible(false);
  };

  if (isSplashVisible) {
    return <AnimatedSplash onAnimationFinish={handleAnimationFinish} />;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <RootLayoutInner />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
