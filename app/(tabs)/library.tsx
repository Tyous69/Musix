import { getAllPlaylists, getAllTracks } from "@/db/schema";
import { Track, usePlayerStore } from "@/stores/playerStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const TEAL = "#00BFA5";
const BG = "#0A0A0A";
const CARD_BG = "#1A1A1A";
const MUTED = "#9E9E9E";

const FILTERS = ["Playlists", "Artists", "Albums"];

type DBTrack = {
  id: number;
  title: string;
  artist: string;
  local_file_path: string;
  duration_ms: number | null;
  is_liked: number;
};

type DBPlaylist = {
  id: number;
  name: string;
  color: string | null;
  track_count: number;
};

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonItem({ index }: { index: number }) {
  const opacity = useSharedValue(0.3);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 700 }),
        withTiming(0.3, { duration: 700 })
      ),
      -1,
      false
    );
  }, []);
  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).duration(300)}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 14,
          gap: 14,
          borderBottomWidth: 0.5,
          borderBottomColor: "#1A1A1A",
        },
        animStyle,
      ]}
    >
      <View style={{ width: 50, height: 50, borderRadius: 8, backgroundColor: CARD_BG }} />
      <View style={{ flex: 1, gap: 8 }}>
        <View style={{ height: 14, width: "55%", borderRadius: 6, backgroundColor: CARD_BG }} />
        <View style={{ height: 11, width: "35%", borderRadius: 6, backgroundColor: "#111" }} />
      </View>
    </Animated.View>
  );
}

// ─── Track row ─────────────────────────────────────────────────────────────────
function TrackRow({
  item,
  index,
  isActive,
  onPress,
}: {
  item: DBTrack;
  index: number;
  isActive: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const formatDuration = (ms: number | null) => {
    if (!ms) return "";
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 40).duration(300)}
      layout={Layout.springify()}
    >
      <Animated.View style={animStyle}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={() => { scale.value = withSpring(0.97); }}
          onPressOut={() => { scale.value = withSpring(1); }}
          activeOpacity={1}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderBottomWidth: 0.5,
            borderBottomColor: "#1A1A1A",
            gap: 14,
            backgroundColor: isActive ? "#0D2B2B" : "transparent",
          }}
        >
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 8,
              backgroundColor: CARD_BG,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: isActive ? 1.5 : 0,
              borderColor: TEAL,
            }}
          >
            <Ionicons
              name={isActive ? "musical-note" : "musical-note-outline"}
              size={20}
              color={isActive ? TEAL : MUTED}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{ color: isActive ? TEAL : "white", fontSize: 15, fontWeight: "700" }}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={{ color: MUTED, fontSize: 13, marginTop: 2 }} numberOfLines={1}>
              {item.artist}
            </Text>
          </View>
          {item.duration_ms && (
            <Text style={{ color: MUTED, fontSize: 12 }}>
              {formatDuration(item.duration_ms)}
            </Text>
          )}
          {item.is_liked ? (
            <Ionicons name="heart" size={16} color={TEAL} />
          ) : null}
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Playlist row ──────────────────────────────────────────────────────────────
function PlaylistRow({ item, index }: { item: DBPlaylist; index: number }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(300)}
      layout={Layout.springify()}
    >
      <Animated.View style={animStyle}>
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/playlists/[id]", params: { id: item.id } } as any)}
          onPressIn={() => { scale.value = withSpring(0.97); }}
          onPressOut={() => { scale.value = withSpring(1); }}
          activeOpacity={1}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 14,
            borderBottomWidth: 0.5,
            borderBottomColor: "#1A1A1A",
            gap: 14,
          }}
        >
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 8,
              backgroundColor: item.color ?? "#2BA8C8",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="musical-notes" size={22} color="white" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "white", fontSize: 15, fontWeight: "700" }} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>
              {item.track_count} songs
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={MUTED} />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────────
export default function LibraryScreen() {
  const [activeFilter, setActiveFilter] = useState("Artists");
  const [tracks, setTracks] = useState<DBTrack[]>([]);
  const [playlists, setPlaylists] = useState<DBPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentTrack, setTrack, setQueue } = usePlayerStore();

  // ── Fetch ─────────────────────────────────────────────────────────────────
  async function fetchData(isRefresh = false) {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const [tracksData, playlistsData] = await Promise.all([
        getAllTracks(),
        getAllPlaylists(),
      ]);
      setTracks(tracksData);
      setPlaylists(playlistsData);
    } catch (e) {
      setError("Impossible de charger la bibliothèque.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  // ── Play track ────────────────────────────────────────────────────────────
  function handlePlay(item: DBTrack, index: number) {
    const queue: Track[] = tracks.map((t) => ({
      id: String(t.id),
      title: t.title,
      artist: t.artist,
      album: "",
      coverUrl: null,
      previewUrl: null,
      localUri: t.local_file_path,
    }));
    setQueue(queue);
    setTrack(queue[index]);
  }

  // ── Artists déduits des tracks ────────────────────────────────────────────
  const artists = [...new Map(tracks.map((t) => [t.artist, t])).values()];

  // ── Callbacks ─────────────────────────────────────────────────────────────
  const keyExtractorTrack = useCallback((item: DBTrack) => String(item.id), []);
  const keyExtractorPlaylist = useCallback((item: DBPlaylist) => String(item.id), []);

  const renderTrack = useCallback(
    ({ item, index }: { item: DBTrack; index: number }) => (
      <TrackRow
        item={item}
        index={index}
        isActive={currentTrack?.id === String(item.id)}
        onPress={() => handlePlay(item, index)}
      />
    ),
    [currentTrack, tracks]
  );

  const renderPlaylist = useCallback(
    ({ item, index }: { item: DBPlaylist; index: number }) => (
      <PlaylistRow item={item} index={index} />
    ),
    []
  );

  // ── ListHeaderComponent ────────────────────────────────────────────────────
  const ListHeader = (
    <View>
      {/* Sort bar */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderBottomWidth: 0.5,
          borderBottomColor: "#1A1A1A",
        }}
      >
        <Text style={{ color: "white", fontSize: 15, fontWeight: "600" }}>
          {activeFilter === "Playlists"
            ? `${playlists.length} playlists`
            : activeFilter === "Artists"
            ? `${artists.length} artists`
            : `${tracks.length} songs`}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={{ color: TEAL, fontSize: 14, fontWeight: "600" }}>
            Recently added
          </Text>
          <Ionicons name="swap-vertical" size={16} color={TEAL} />
        </View>
      </View>
    </View>
  );

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: BG }}>
        <LinearGradient colors={["#0D2B2B", "#0A0A0A"]} style={{ paddingBottom: 16 }}>
          <SafeAreaView>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Ionicons name="musical-note" size={28} color={TEAL} />
                <Text style={{ color: TEAL, fontSize: 24, fontWeight: "800" }}>Your Library</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12, gap: 8 }}>
              {FILTERS.map((f) => (
                <View key={f} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: CARD_BG, width: 80, height: 34 }} />
              ))}
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
        {Array.from({ length: 6 }).map((_, i) => <SkeletonItem key={i} index={i} />)}
      </View>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: BG }}>
        <LinearGradient colors={["#0D2B2B", "#0A0A0A"]} style={{ paddingBottom: 16 }}>
          <SafeAreaView>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
              <Ionicons name="musical-note" size={28} color={TEAL} />
              <Text style={{ color: TEAL, fontSize: 24, fontWeight: "800" }}>Your Library</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}>
          <Ionicons name="alert-circle-outline" size={60} color="#E05C5C" />
          <Text style={{ color: "white", fontSize: 16, fontWeight: "700", marginTop: 16, textAlign: "center" }}>{error}</Text>
          <TouchableOpacity onPress={() => fetchData()} style={{ marginTop: 20, backgroundColor: TEAL, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 }}>
            <Text style={{ color: "black", fontWeight: "700" }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Données courantes selon le filtre ─────────────────────────────────────
  const isEmptyLib = tracks.length === 0 && playlists.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <LinearGradient colors={["#0D2B2B", "#0A0A0A"]} style={{ paddingBottom: 16 }}>
        <SafeAreaView>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 8,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Ionicons name="musical-note" size={28} color={TEAL} />
              <Text style={{ color: TEAL, fontSize: 24, fontWeight: "800" }}>
                Your Library
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/wifi-sync")}>
              <Ionicons name="wifi" size={24} color={TEAL} />
            </TouchableOpacity>
          </View>

          {/* Filter pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12, gap: 8 }}
          >
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setActiveFilter(f)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: activeFilter === f ? TEAL : "transparent",
                  borderWidth: 1,
                  borderColor: activeFilter === f ? TEAL : "#555",
                }}
              >
                <Text style={{ color: activeFilter === f ? "black" : "white", fontSize: 13, fontWeight: "600" }}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* Bibliothèque vide */}
      {isEmptyLib ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}>
          <Ionicons name="library-outline" size={60} color="#333" />
          <Text style={{ color: "#555", fontSize: 16, marginTop: 16, textAlign: "center" }}>
            Your library is empty
          </Text>
          <Text style={{ color: "#444", fontSize: 13, marginTop: 8, textAlign: "center", paddingHorizontal: 20 }}>
            Use Wi-Fi Sync to import your MP3s
          </Text>
          <TouchableOpacity
            style={{ marginTop: 24, backgroundColor: TEAL, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 }}
            onPress={() => router.push("/wifi-sync")}
          >
            <Text style={{ color: "black", fontWeight: "700", fontSize: 14 }}>Wi-Fi Sync</Text>
          </TouchableOpacity>
        </View>
      ) : activeFilter === "Playlists" ? (
        <FlatList
          data={playlists}
          keyExtractor={keyExtractorPlaylist}
          renderItem={renderPlaylist}
          ListHeaderComponent={ListHeader}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor={TEAL} colors={[TEAL]} />}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 40 }}>
              <Ionicons name="list-outline" size={50} color="#333" />
              <Text style={{ color: "#555", fontSize: 15, marginTop: 12 }}>No playlists yet</Text>
              <TouchableOpacity onPress={() => router.push("/playlists")} style={{ marginTop: 16, backgroundColor: TEAL, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 }}>
                <Text style={{ color: "black", fontWeight: "700" }}>Create one</Text>
              </TouchableOpacity>
            </View>
          }
          windowSize={5}
          maxToRenderPerBatch={10}
          initialNumToRender={15}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      ) : activeFilter === "Artists" ? (
        <FlatList
          data={artists}
          keyExtractor={(item) => item.artist}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 40).duration(300)} layout={Layout.springify()}>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: "#1A1A1A", gap: 14 }}
                activeOpacity={0.7}
              >
                <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: CARD_BG, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="person" size={22} color={MUTED} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "white", fontSize: 15, fontWeight: "700" }} numberOfLines={1}>{item.artist}</Text>
                  <Text style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>
                    {tracks.filter((t) => t.artist === item.artist).length} songs
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={MUTED} />
              </TouchableOpacity>
            </Animated.View>
          )}
          ListHeaderComponent={ListHeader}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor={TEAL} colors={[TEAL]} />}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 40 }}>
              <Ionicons name="person-outline" size={50} color="#333" />
              <Text style={{ color: "#555", fontSize: 15, marginTop: 12 }}>No artists yet</Text>
            </View>
          }
          windowSize={5}
          maxToRenderPerBatch={10}
          initialNumToRender={15}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      ) : (
        // Albums = toutes les tracks
        <FlatList
          data={tracks}
          keyExtractor={keyExtractorTrack}
          renderItem={renderTrack}
          ListHeaderComponent={ListHeader}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor={TEAL} colors={[TEAL]} />}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 40 }}>
              <Ionicons name="musical-notes-outline" size={50} color="#333" />
              <Text style={{ color: "#555", fontSize: 15, marginTop: 12 }}>No songs yet</Text>
            </View>
          }
          windowSize={5}
          maxToRenderPerBatch={10}
          initialNumToRender={15}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}
    </View>
  );
}