import { deletePlaylist, getPlaylistTracks } from "@/db/schema";
import { Track, usePlayerStore } from "@/stores/playerStore";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TEAL = "#00BFA5";
const BG = "#0A0A0A";
const CARD_BG = "#1A1A1A";
const MUTED = "#9E9E9E";

type DBTrack = {
  id: number;
  title: string;
  artist: string;
  local_file_path: string;
  duration_ms: number | null;
  cover_url: string | null;
  is_liked: number;
};

export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tracks, setTracks] = useState<DBTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const { setTrack, setQueue, currentTrack } = usePlayerStore();

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      getPlaylistTracks(Number(id))
        .then(setTracks)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [id]),
  );

  const buildQueue = (): Track[] =>
    tracks.map((t) => ({
      id: String(t.id),
      title: t.title,
      artist: t.artist,
      album: "",
      coverUrl: t.cover_url ?? null,
      previewUrl: null,
      localUri: t.local_file_path,
    }));

  const handlePlay = (index: number) => {
    const queue = buildQueue();
    setQueue(queue);
    setTrack(queue[index]);
  };

  const handlePlayAll = () => {
    if (tracks.length === 0) return;
    const queue = buildQueue();
    setQueue(queue);
    setTrack(queue[0]);
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return "";
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <SafeAreaView edges={["top"]}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingVertical: 12,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text
            style={{
              color: MUTED,
              fontSize: 12,
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            PLAYLIST
          </Text>
          <TouchableOpacity
            onPress={() => {
              Alert.alert("Delete playlist", "Delete this playlist?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: async () => {
                    await deletePlaylist(Number(id));
                    router.back();
                  },
                },
              ]);
            }}
          >
            <Ionicons name="trash-outline" size={22} color="#E05C5C" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <FlatList
        data={tracks}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListHeaderComponent={
          <View>
            {/* Cover placeholder */}
            <View
              style={{
                marginHorizontal: 16,
                marginBottom: 24,
                aspectRatio: 1,
                borderRadius: 12,
                backgroundColor: CARD_BG,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {tracks[0]?.cover_url ? (
                <Image
                  source={{ uri: tracks[0].cover_url }}
                  style={{ width: "100%", height: "100%", borderRadius: 12 }}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="musical-notes" size={80} color="#333" />
              )}
            </View>

            {/* Info */}
            <View
              style={{
                paddingHorizontal: 20,
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Text style={{ color: "#555", fontSize: 13, marginTop: 4 }}>
                {tracks.length} tracks
              </Text>
            </View>

            {/* Play All */}
            {tracks.length > 0 && (
              <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
                <TouchableOpacity
                  onPress={handlePlayAll}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: TEAL,
                    borderRadius: 30,
                    paddingVertical: 14,
                    gap: 8,
                  }}
                >
                  <Ionicons name="play" size={20} color="black" />
                  <Text
                    style={{ color: "black", fontWeight: "800", fontSize: 15 }}
                  >
                    Play All
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => handlePlay(index)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderBottomWidth: 0.5,
              borderBottomColor: "#1A1A1A",
              gap: 14,
              backgroundColor:
                currentTrack?.id === String(item.id)
                  ? "#0D2B2B"
                  : "transparent",
            }}
          >
            {item.cover_url ? (
              <Image
                source={{ uri: item.cover_url }}
                style={{ width: 48, height: 48, borderRadius: 8 }}
              />
            ) : (
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  backgroundColor: CARD_BG,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: currentTrack?.id === String(item.id) ? 1.5 : 0,
                  borderColor: TEAL,
                }}
              >
                <Ionicons
                  name={
                    currentTrack?.id === String(item.id)
                      ? "musical-note"
                      : "musical-note-outline"
                  }
                  size={20}
                  color={currentTrack?.id === String(item.id) ? TEAL : MUTED}
                />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: currentTrack?.id === String(item.id) ? TEAL : "white",
                  fontSize: 15,
                  fontWeight: "700",
                }}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text
                style={{ color: MUTED, fontSize: 13, marginTop: 2 }}
                numberOfLines={1}
              >
                {item.artist}
              </Text>
            </View>
            {item.duration_ms ? (
              <Text style={{ color: MUTED, fontSize: 12 }}>
                {formatDuration(item.duration_ms)}
              </Text>
            ) : null}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <Ionicons name="musical-notes-outline" size={60} color="#333" />
              <Text style={{ color: "#555", fontSize: 16, marginTop: 16 }}>
                No songs in this playlist
              </Text>
              <Text
                style={{
                  color: "#444",
                  fontSize: 13,
                  marginTop: 8,
                  textAlign: "center",
                  paddingHorizontal: 40,
                }}
              >
                Add songs from the player using the ··· menu
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
