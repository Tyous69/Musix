import { getAllTracks } from "@/db/schema";
import { Track, usePlayerStore } from "@/stores/playerStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
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
};

export default function AllSongsScreen() {
  const [songs, setSongs] = useState<DBTrack[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { setTrack, setQueue } = usePlayerStore();

  useEffect(() => {
    getAllTracks()
      .then(setSongs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.artist.toLowerCase().includes(query.toLowerCase()),
  );

  const buildTrack = (s: DBTrack): Track => ({
    id: String(s.id),
    title: s.title,
    artist: s.artist,
    album: "",
    coverUrl: null,
    previewUrl: null,
    localUri: s.local_file_path,
  });

  const handlePlay = (s: DBTrack, index: number) => {
    const queue = filtered.map(buildTrack);
    setQueue(queue);
    setTrack(queue[index]);
  };

  const handlePlayAll = () => {
    if (filtered.length === 0) return;
    const queue = filtered.map(buildTrack);
    setQueue(queue);
    setTrack(queue[0]);
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return "";
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  function renderSong({ item, index }: { item: DBTrack; index: number }) {
    return (
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderBottomWidth: 0.5,
          borderBottomColor: "#1A1A1A",
          gap: 14,
        }}
        onPress={() => handlePlay(item, index)}
        activeOpacity={0.7}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            backgroundColor: CARD_BG,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: MUTED, fontSize: 16, fontWeight: "700" }}>
            {index + 1}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{ color: "white", fontSize: 15, fontWeight: "700" }}
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
        {item.duration_ms && (
          <Text style={{ color: MUTED, fontSize: 12 }}>
            {formatDuration(item.duration_ms)}
          </Text>
        )}
        <TouchableOpacity style={{ padding: 6 }}>
          <Ionicons name="ellipsis-vertical" size={18} color={MUTED} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <LinearGradient
        colors={["#0D2B2B", "#0A0A0A"]}
        style={{ paddingBottom: 28 }}
      >
        <SafeAreaView>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 16,
              gap: 10,
            }}
          >
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={TEAL} />
            </TouchableOpacity>
            <Ionicons name="musical-notes" size={26} color={TEAL} />
            <Text
              style={{ color: TEAL, fontSize: 24, fontWeight: "800", flex: 1 }}
            >
              All Songs
            </Text>
            <Text style={{ color: MUTED, fontSize: 13 }}>
              {songs.length} tracks
            </Text>
          </View>

          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 16,
              backgroundColor: "#E8E8E8",
              borderRadius: 30,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
          >
            <Ionicons name="search" size={18} color="#666" />
            <TextInput
              style={{ flex: 1, marginLeft: 10, color: "#333", fontSize: 14 }}
              placeholder="Search in your songs..."
              placeholderTextColor="#999"
              value={query}
              onChangeText={setQuery}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")}>
                <Ionicons name="close-circle" size={18} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 12,
          gap: 12,
          borderBottomWidth: 0.5,
          borderBottomColor: "#1A1A1A",
        }}
      >
        <TouchableOpacity
          onPress={handlePlayAll}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: TEAL,
            paddingHorizontal: 18,
            paddingVertical: 9,
            borderRadius: 24,
          }}
        >
          <Ionicons name="play" size={16} color="black" />
          <Text style={{ color: "black", fontWeight: "700", fontSize: 13 }}>
            Play all
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            borderWidth: 0.5,
            borderColor: "#2A2A2A",
            paddingHorizontal: 18,
            paddingVertical: 9,
            borderRadius: 24,
          }}
        >
          <Ionicons name="shuffle" size={16} color={TEAL} />
          <Text style={{ color: TEAL, fontWeight: "700", fontSize: 13 }}>
            Shuffle
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderSong}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Ionicons name="musical-notes-outline" size={60} color="#333" />
            <Text style={{ color: "#555", fontSize: 16, marginTop: 16 }}>
              {loading ? "Loading..." : "No songs yet"}
            </Text>
            {!loading && (
              <Text
                style={{
                  color: "#444",
                  fontSize: 13,
                  marginTop: 8,
                  textAlign: "center",
                  paddingHorizontal: 40,
                }}
              >
                Sync your MP3s via Wi-Fi Sync
              </Text>
            )}
          </View>
        }
      />
    </View>
  );
}
