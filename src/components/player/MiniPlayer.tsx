import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { usePlayerStore } from "@/stores/playerStore";

export function MiniPlayer() {
  const router = useRouter();
  const { currentTrack, isPlaying, setIsPlaying, nextTrack } = usePlayerStore();

  if (!currentTrack) return null;

  return (
    <TouchableOpacity
      onPress={() => router.push("/player")}
      activeOpacity={0.9}
      style={{
        position: "absolute",
        bottom: 0,
        left: 8,
        right: 8,
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 8,
      }}
    >
      {/* Cover */}
      {currentTrack.coverUrl ? (
        <Image
          source={{ uri: currentTrack.coverUrl }}
          style={{ width: 44, height: 44, borderRadius: 8 }}
        />
      ) : (
        <View
          style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: "#333", alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="musical-note" size={22} color="#9E9E9E" />
        </View>
      )}

      {/* Info */}
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={{ color: "white", fontWeight: "600", fontSize: 13 }} numberOfLines={1}>
          {currentTrack.title}
        </Text>
        <Text style={{ color: "#9E9E9E", fontSize: 12 }} numberOfLines={1}>
          {currentTrack.artist}
        </Text>
      </View>

      {/* Controls */}
      <TouchableOpacity
        onPress={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
        style={{ padding: 8 }}
      >
        <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={(e) => { e.stopPropagation(); nextTrack(); }}
        style={{ padding: 8 }}
      >
        <Ionicons name="play-skip-forward" size={22} color="white" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}