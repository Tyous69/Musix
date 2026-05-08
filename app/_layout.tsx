import { MiniPlayer } from "@/components/player/MiniPlayer";
import SplashAnimation from "@/components/SplashAnimation";
import { initDatabase } from "@/db/schema";
import { useAudio } from "@/hooks/useAudio";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, usePathname } from "expo-router";
import * as ExpoSplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import "../global.css";

ExpoSplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AudioEngine() {
  useAudio();
  return null;
}

function RootLayoutInner() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const [dbReady, setDbReady] = useState(false);
  const [animDone, setAnimDone] = useState(false);

  useEffect(() => {
    initDatabase()
      .then(() => {
        console.log("✅ Database initialized");
        setDbReady(true);
      })
      .catch((err) => console.error("❌ Database error:", err));
  }, []);

  useEffect(() => {
    if (dbReady) ExpoSplashScreen.hideAsync();
  }, [dbReady]);

  const handleAnimFinish = useCallback(() => {
    setAnimDone(true);
  }, []);

  if (!dbReady) return null;
  if (!animDone) return <SplashAnimation onFinish={handleAnimFinish} />;

  // Sur le player screen — pas de MiniPlayer
  const isPlayerScreen = pathname === "/player";

  // Sur les screens avec tab bar (tabs) — MiniPlayer au-dessus de la tab bar
  const isTabScreen =
    pathname === "/" ||
    pathname.startsWith("/(tabs)") ||
    pathname === "/search" ||
    pathname === "/library" ||
    pathname === "/profile";

  const miniPlayerBottom = isTabScreen ? insets.bottom + 60 : insets.bottom + 8;

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
      <AudioEngine />
      {!isPlayerScreen && (
        <View
          style={{
            position: "absolute",
            bottom: miniPlayerBottom,
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
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <RootLayoutInner />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
