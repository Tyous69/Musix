import { initDatabase } from "@/db/schema";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    initDatabase()
      .then(() => console.log("✅ Database initialized"))
      .catch((err) => console.error("❌ Database error:", err));
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }} />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
