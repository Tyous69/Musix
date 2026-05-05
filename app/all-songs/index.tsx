import { deleteTrack, getAllTracks, toggleLikedTrack } from "@/db/schema";
import { Track, usePlayerStore } from "@/stores/playerStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
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

type DBTrack = {
  id: number;
  title: string;
  artist: string;
  local_file_path: string;
  duration_ms: number | null;
  is_liked: number;
};

// ─── Skeleton item ─────────────────────────────────────────────────────────────
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
          paddingVertical: 12,
          gap: 14,
          borderBottomWidth: 0.5,
          borderBottomColor: "#1A1A1A",
        },
        animStyle,
      ]}
    >
      <View
        style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: CARD_BG }}
      />
      <View style={{ flex: 1, gap: 8 }}>
        <View
          style={{ height: 14, width: "60%", borderRadius: 6, backgroundColor: CARD_BG }}
        />
        <View
          style={{ height: 11, width: "35%", borderRadius: 6, backgroundColor: "#111" }}
        />
      </View>
      <View
        style={{ width: 32, height: 11, borderRadius: 6, backgroundColor: CARD_BG }}
      />
    </Animated.View>
  );
}

// ─── Song row ──────────────────────────────────────────────────────────────────
function SongRow({
  item,
  index,
  isActive,
  onPress,
  onLike,
  onDelete,
}: {
  item: DBTrack;
  index: number;
  isActive: boolean;
  onPress: () => void;
  onLike: () => void;
  onDelete: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const formatDuration = (ms: number | null) => {
    if (!ms) return "";
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
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
              width: 48,
              height: 48,
              borderRadius: 8,
              backgroundColor: CARD_BG,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: isActive ? 1.5 : 0,
              borderColor: TEAL,
            }}
          >
            {isActive ? (
              <Ionicons name="musical-note" size={22} color={TEAL} />
            ) : (
              <Text style={{ color: MUTED, fontSize: 16, fontWeight: "700" }}>
                {index + 1}
              </Text>
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: isActive ? TEAL : "white",
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

          <TouchableOpacity onPress={onLike} style={{ padding: 6 }}>
            <Ionicons
              name={item.is_liked ? "heart" : "heart-outline"}
              size={20}
              color={item.is_liked ? TEAL : MUTED}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={onDelete} style={{ padding: 6 }}>
            <Ionicons name="trash-outline" size={18} color="#E05C5C" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────────
export default function AllSongsScreen() {
  const [songs, setSongs] = useState<DBTrack[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentTrack, setTrack, setQueue } = usePlayerStore();

  // ── Fetch ─────────────────────────────────────────────────────────────────
  async function fetchTracks(isRefresh = false) {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const data = await getAllTracks();
      setSongs(data);
    } catch (e) {
      setError("Impossible de charger les musiques.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchTracks(); }, []);

  // ── Filtered ──────────────────────────────────────────────────────────────
  const filtered = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.artist.toLowerCase().includes(query.toLowerCase())
  );

  // ── Helpers ───────────────────────────────────────────────────────────────
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

  const handleShuffle = () => {
    if (filtered.length === 0) return;
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    const queue = shuffled.map(buildTrack);
    setQueue(queue);
    setTrack(queue[0]);
  };

  const handleDelete = (item: DBTrack) => {
    Alert.alert("Supprimer", `Supprimer "${item.title}" ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          await deleteTrack(item.id);
          setSongs((prev) => prev.filter((s) => s.id !== item.id));
        },
      },
    ]);
  };

  const handleToggleLike = async (item: DBTrack) => {
    await toggleLikedTrack(item.id);
    setSongs((prev) =>
      prev.map((s) =>
        s.id === item.id ? { ...s, is_liked: s.is_liked ? 0 : 1 } : s
      )
    );
  };

  // ── keyExtractor + renderItem avec useCallback ────────────────────────────
  const keyExtractor = useCallback((item: DBTrack) => String(item.id), []);

  const renderItem = useCallback(
    ({ item, index }: { item: DBTrack; index: number }) => (
      <SongRow
        item={item}
        index={index}
        isActive={currentTrack?.id === String(item.id)}
        onPress={() => handlePlay(item, index)}
        onLike={() => handleToggleLike(item)}
        onDelete={() => handleDelete(item)}
      />
    ),
    [currentTrack, filtered]
  );

  // ── ListHeaderComponent — play all bar dans la FlatList ────────────────
  const ListHeader = (
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
        onPress={handleShuffle}
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

      <Text style={{ color: MUTED, fontSize: 12, marginLeft: "auto" }}>
        {filtered.length} tracks
      </Text>
    </View>
  );

  // ── Skeleton state  ─────────────────────────────────────────────────────
  if (loading) {
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
              <Text style={{ color: TEAL, fontSize: 24, fontWeight: "800", flex: 1 }}>
                All Songs
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
              <View style={{ flex: 1, height: 14, marginLeft: 10, backgroundColor: "#DDD", borderRadius: 6 }} />
            </View>
          </SafeAreaView>
        </LinearGradient>
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonItem key={i} index={i} />
        ))}
      </View>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (error) {
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
              <Text style={{ color: TEAL, fontSize: 24, fontWeight: "800" }}>
                All Songs
              </Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}
        >
          <Ionicons name="alert-circle-outline" size={60} color="#E05C5C" />
          <Text
            style={{
              color: "white",
              fontSize: 16,
              fontWeight: "700",
              marginTop: 16,
              textAlign: "center",
            }}
          >
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => fetchTracks()}
            style={{
              marginTop: 20,
              backgroundColor: TEAL,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 24,
            }}
          >
            <Text style={{ color: "black", fontWeight: "700" }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
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

      {/*  FlatList avec tous les critères enseignant */}
      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        //  ListHeaderComponent — pas de nested ScrollView
        ListHeaderComponent={ListHeader}
        //  refreshControl
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchTracks(true)}
            tintColor={TEAL}
            colors={[TEAL]}
          />
        }
        //  Gestion données vides + erreur
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Ionicons name="musical-notes-outline" size={60} color="#333" />
            <Text style={{ color: "#555", fontSize: 16, marginTop: 16 }}>
              {query.length > 0
                ? `Aucun résultat pour "${query}"`
                : "No songs yet"}
            </Text>
            {!query.length && (
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
        //  Optimisations performances
        windowSize={5}
        maxToRenderPerBatch={10}
        initialNumToRender={15}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  );
}