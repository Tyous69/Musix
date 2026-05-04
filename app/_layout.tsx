import { MiniPlayer } from "@/components/player/MiniPlayer";
import SplashAnimation from "@/components/SplashAnimation";
import { initDatabase } from "@/db/schema";
import { useAudio } from "@/hooks/useAudio";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
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

  // Cache le splash natif seulement quand DB prête
  useEffect(() => {
    if (dbReady) ExpoSplashScreen.hideAsync();
  }, [dbReady]);

  const handleAnimFinish = useCallback(() => {
    setAnimDone(true);
  }, []);

  // DB pas encore prête — on attend (splash natif reste visible)
  if (!dbReady) return null;

  // DB prête mais animation pas finie
  if (!animDone) {
    return <SplashAnimation onFinish={handleAnimFinish} />;
  }

  // Tout prêt — affiche l'app
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
