import { usePlayerStore } from "@/stores/playerStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function MiniPlayer() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const { currentTrack, isPlaying, setIsPlaying, nextTrack } = usePlayerStore();

  if (!currentTrack) return null;

  // Détecte si on est dans les tabs ou dans une page standalone
  const isInTabs = segments[0] === "(tabs)";
  const bottomOffset = isInTabs ? 0 : insets.bottom + 8;

  return (
    <View
      style={{
        paddingBottom: bottomOffset,
        paddingHorizontal: 8,
        paddingTop: 8,
      }}
    >
      <TouchableOpacity
        onPress={() => router.push("/player")}
        activeOpacity={0.9}
        style={{
          backgroundColor: "#1A1A1A",
          borderRadius: 12,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      >
        {currentTrack.coverUrl ? (
          <Image
            source={{ uri: currentTrack.coverUrl }}
            style={{ width: 44, height: 44, borderRadius: 8 }}
          />
        ) : (
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              backgroundColor: "#333",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="musical-note" size={22} color="#9E9E9E" />
          </View>
        )}
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text
            style={{ color: "white", fontWeight: "600", fontSize: 13 }}
            numberOfLines={1}
          >
            {currentTrack.title}
          </Text>
          <Text style={{ color: "#9E9E9E", fontSize: 12 }} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            setIsPlaying(!isPlaying);
          }}
          style={{ padding: 8 }}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={24}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            nextTrack();
          }}
          style={{ padding: 8 }}
        >
          <Ionicons name="play-skip-forward" size={22} color="white" />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}
