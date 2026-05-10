import { getAllTracks } from "@/db/schema";
import { Track, usePlayerStore } from "@/stores/playerStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const TEAL = "#00BFA5";
const BG = "#0A0A0A";
const CARD_BG = "#1A1A1A";
const MUTED = "#9E9E9E";

const TRACK_COLORS = [
  "#2A1F1A", "#1A2A1A", "#1A1A2A",
  "#2A1A1A", "#2A2A1A", "#1A2A2A",
];

const TOP_MIXES = [
  { title: "Pop Mix", color: "#C13A5F" },
  { title: "Chill Mix", color: "#C8A820" },
  { title: "Kpop Mix", color: "#3AC87B" },
];

type DBTrack = {
  id: number;
  title: string;
  artist: string;
  local_file_path: string;
  duration_ms: number | null;
  is_liked: number;
};

export default function HomeScreen() {
  const [recentTracks, setRecentTracks] = useState<DBTrack[]>([]);
  const [allTracks, setAllTracks] = useState<DBTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentTrack, setTrack, setQueue } = usePlayerStore();

  useEffect(() => {
    getAllTracks()
      .then((data) => {
        setAllTracks(data);
        // Les 6 dernières ajoutées pour "Continue Listening"
        setRecentTracks(data.slice(0, 6));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function playTrack(item: DBTrack) {
    const queue: Track[] = allTracks.map((t) => ({
      id: String(t.id),
      title: t.title,
      artist: t.artist,
      album: "",
      coverUrl: null,
      previewUrl: null,
      localUri: t.local_file_path,
    }));
    const idx = queue.findIndex((t) => t.id === String(item.id));
    setQueue(queue);
    setTrack(queue[idx >= 0 ? idx : 0]);
    router.push("/player");
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <SafeAreaView>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 20,
          }}
        >
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile")}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: CARD_BG,
              borderWidth: 2,
              borderColor: TEAL,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="person" size={24} color={MUTED} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: "white", fontSize: 18, fontWeight: "800" }}>
              Welcome back !
            </Text>
            <Text style={{ color: MUTED, fontSize: 13, marginTop: 1 }}>
              {allTracks.length > 0 ? `${allTracks.length} songs in library` : "musix"}
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
              <Ionicons name="search" size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/wifi-sync")}>
              <Ionicons name="wifi" size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/settings")}>
              <Ionicons name="settings-outline" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Continue Listening — tracks réelles ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ color: "white", fontSize: 22, fontWeight: "800" }}>
              Continue Listening
            </Text>
            {allTracks.length > 0 && (
              <TouchableOpacity onPress={() => router.push("/all-songs")}>
                <Text style={{ color: TEAL, fontSize: 13 }}>See all</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            // Skeleton continue listening
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: (width - 52) / 2,
                    height: 56,
                    borderRadius: 8,
                    backgroundColor: CARD_BG,
                    opacity: 0.4,
                  }}
                />
              ))}
            </View>
          ) : recentTracks.length === 0 ? (
            // Empty state
            <TouchableOpacity
              onPress={() => router.push("/wifi-sync")}
              style={{
                backgroundColor: CARD_BG,
                borderRadius: 12,
                padding: 20,
                alignItems: "center",
                gap: 8,
              }}
            >
              <Ionicons name="wifi-outline" size={32} color={TEAL} />
              <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>
                Import your first MP3
              </Text>
              <Text style={{ color: MUTED, fontSize: 12, textAlign: "center" }}>
                Use Wi-Fi Sync to add music from your PC
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {recentTracks.map((item, i) => (
                <Animated.View
                  key={item.id}
                  entering={FadeInDown.delay(i * 60).duration(300)}
                >
                  <TouchableOpacity
                    onPress={() => playTrack(item)}
                    style={{
                      width: (width - 52) / 2,
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: CARD_BG,
                      borderRadius: 8,
                      overflow: "hidden",
                      height: 56,
                      borderWidth: currentTrack?.id === String(item.id) ? 1 : 0,
                      borderColor: TEAL,
                    }}
                  >
                    <View
                      style={{
                        width: 56,
                        height: 56,
                        backgroundColor: TRACK_COLORS[i % TRACK_COLORS.length],
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {currentTrack?.id === String(item.id) ? (
                        <Ionicons name="musical-note" size={22} color={TEAL} />
                      ) : (
                        <Ionicons name="musical-notes" size={22} color={MUTED} />
                      )}
                    </View>
                    <Text
                      style={{
                        color: currentTrack?.id === String(item.id) ? TEAL : "white",
                        fontSize: 13,
                        fontWeight: "600",
                        flex: 1,
                        paddingHorizontal: 10,
                      }}
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          )}
        </View>

        {/* ── Your Top Mixes ── */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ color: "white", fontSize: 22, fontWeight: "800", marginBottom: 16, paddingHorizontal: 20 }}>
            Your Top Mixes
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          >
            {TOP_MIXES.map((mix) => (
              <TouchableOpacity
                key={mix.title}
                onPress={() => router.push("/playlists")}
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: 12,
                  backgroundColor: CARD_BG,
                  overflow: "hidden",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ padding: 12, flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: "white", opacity: 0.3 }} />
                  <Text style={{ color: "white", fontSize: 15, fontWeight: "800" }}>{mix.title}</Text>
                </View>
                <View style={{ height: 4, backgroundColor: mix.color }} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Based on recent listening — dernières tracks ── */}
        {allTracks.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Text style={{ color: "white", fontSize: 22, fontWeight: "800" }}>
                Based on your recent listening
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 12 }}>
              {allTracks.slice(0, 2).map((item, i) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => playTrack(item)}
                  style={{
                    flex: 1,
                    aspectRatio: 1,
                    borderRadius: 12,
                    backgroundColor: TRACK_COLORS[i + 2],
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: currentTrack?.id === String(item.id) ? 1.5 : 0,
                    borderColor: TEAL,
                  }}
                >
                  <Ionicons name="musical-notes" size={40} color="#444" />
                  <Text style={{ color: "white", fontSize: 12, fontWeight: "600", marginTop: 8, textAlign: "center", paddingHorizontal: 8 }} numberOfLines={2}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}