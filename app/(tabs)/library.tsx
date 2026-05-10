import {
  deletePlaylist,
  getAllPlaylists,
  getAllTracks,
  getLikedTracks,
} from "@/db/schema";
import { Track, usePlayerStore } from "@/stores/playerStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TEAL = "#00BFA5";
const BG = "#0A0A0A";
const CARD_BG = "#1A1A1A";
const MUTED = "#9E9E9E";

const FILTERS = ["Playlists", "Songs", "Likes", "Downloads"];

type DBTrack = {
  id: number;
  title: string;
  artist: string;
  local_file_path: string;
  duration_ms: number | null;
  is_liked: number;
  cover_url: string | null;
};

type DBPlaylist = {
  id: number;
  name: string;
  color: string | null;
  track_count: number;
};

export default function LibraryScreen() {
  const [activeFilter, setActiveFilter] = useState("Songs");
  const [tracks, setTracks] = useState<DBTrack[]>([]);
  const [likedTracks, setLikedTracks] = useState<DBTrack[]>([]);
  const [downloads, setDownloads] = useState<DBTrack[]>([]);
  const [playlists, setPlaylists] = useState<DBPlaylist[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { currentTrack, setTrack, setQueue } = usePlayerStore();

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [allTracks, liked, allPlaylists] = await Promise.all([
        getAllTracks(),
        getLikedTracks(),
        getAllPlaylists(),
      ]);
      setDownloads(allTracks);
      setLikedTracks(liked as DBTrack[]);
      setPlaylists(allPlaylists);
      // Songs = linked tracks (lastfm source)
      const { getLinkedTracks } = await import("@/db/schema");
      const linked = await getLinkedTracks();
      setTracks(linked as DBTrack[]);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const buildQueue = (list: DBTrack[]): Track[] =>
    list.map((t) => ({
      id: String(t.id),
      title: t.title,
      artist: t.artist,
      album: "",
      coverUrl: t.cover_url ?? null,
      previewUrl: null,
      localUri: t.local_file_path,
    }));

  const handlePlay = (list: DBTrack[], index: number) => {
    const queue = buildQueue(list);
    setQueue(queue);
    setTrack(queue[index]);
  };

  const handleDeletePlaylist = (playlist: DBPlaylist) => {
    Alert.alert("Delete playlist", `Delete "${playlist.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deletePlaylist(playlist.id);
          setPlaylists((prev) => prev.filter((p) => p.id !== playlist.id));
        },
      },
    ]);
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return "";
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  };

  const renderTrackItem = (item: DBTrack, index: number, list: DBTrack[]) => (
    <TouchableOpacity
      key={String(item.id)}
      onPress={() => handlePlay(list, index)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: "#1A1A1A",
        gap: 14,
        backgroundColor:
          currentTrack?.id === String(item.id) ? "#0D2B2B" : "transparent",
      }}
    >
      {item.cover_url ? (
        <Image
          source={{ uri: item.cover_url }}
          style={{ width: 50, height: 50, borderRadius: 8 }}
        />
      ) : (
        <View
          style={{
            width: 50,
            height: 50,
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
      {item.is_liked ? <Ionicons name="heart" size={14} color={TEAL} /> : null}
    </TouchableOpacity>
  );

  const currentList =
    activeFilter === "Songs"
      ? tracks
      : activeFilter === "Likes"
        ? likedTracks
        : activeFilter === "Downloads"
          ? downloads
          : [];

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <LinearGradient
        colors={["#0D2B2B", "#0A0A0A"]}
        style={{ paddingBottom: 16 }}
      >
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
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Ionicons name="musical-note" size={28} color={TEAL} />
              <Text style={{ color: TEAL, fontSize: 24, fontWeight: "800" }}>
                Your Library
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/wifi-sync")}>
              <Ionicons name="wifi" size={24} color={TEAL} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingVertical: 12,
              gap: 8,
            }}
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
                <Text
                  style={{
                    color: activeFilter === f ? "black" : "white",
                    fontSize: 13,
                    fontWeight: "600",
                  }}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* Playlists */}
      {activeFilter === "Playlists" && (
        <FlatList
          data={playlists}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchData(true)}
              tintColor={TEAL}
              colors={[TEAL]}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/playlists/[id]",
                  params: { id: item.id },
                } as any)
              }
              onLongPress={() => handleDeletePlaylist(item)}
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
                <Text
                  style={{ color: "white", fontSize: 15, fontWeight: "700" }}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>
                  {item.track_count} songs
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={MUTED} />
            </TouchableOpacity>
          )}
          ListFooterComponent={
            <TouchableOpacity
              onPress={() => router.push("/playlists")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 20,
                paddingVertical: 16,
                gap: 14,
              }}
            >
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 8,
                  backgroundColor: "#1A1A1A",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "#2A2A2A",
                  borderStyle: "dashed",
                }}
              >
                <Ionicons name="add" size={24} color={TEAL} />
              </View>
              <Text style={{ color: TEAL, fontSize: 15, fontWeight: "600" }}>
                Create new playlist
              </Text>
            </TouchableOpacity>
          }
          ListEmptyComponent={
            <View
              style={{
                alignItems: "center",
                paddingTop: 60,
                paddingHorizontal: 40,
              }}
            >
              <Ionicons name="list-outline" size={60} color="#333" />
              <Text
                style={{
                  color: "#555",
                  fontSize: 16,
                  marginTop: 16,
                  textAlign: "center",
                }}
              >
                No playlists yet
              </Text>
              <Text
                style={{
                  color: "#444",
                  fontSize: 13,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                Create your first playlist to organize your music
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/playlists")}
                style={{
                  marginTop: 20,
                  backgroundColor: TEAL,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 24,
                }}
              >
                <Text style={{ color: "black", fontWeight: "700" }}>
                  Create playlist
                </Text>
              </TouchableOpacity>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}

      {/* Songs / Likes / Downloads */}
      {activeFilter !== "Playlists" && (
        <FlatList
          data={currentList}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchData(true)}
              tintColor={TEAL}
              colors={[TEAL]}
            />
          }
          renderItem={({ item, index }) =>
            renderTrackItem(item, index, currentList)
          }
          ListHeaderComponent={
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
                {currentList.length}{" "}
                {activeFilter === "Songs"
                  ? "linked songs"
                  : activeFilter === "Likes"
                    ? "liked songs"
                    : "downloads"}
              </Text>
              {currentList.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    if (currentList.length === 0) return;
                    const queue = buildQueue(currentList);
                    setQueue(queue);
                    setTrack(queue[0]);
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    backgroundColor: TEAL,
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    borderRadius: 20,
                  }}
                >
                  <Ionicons name="play" size={14} color="black" />
                  <Text
                    style={{ color: "black", fontWeight: "700", fontSize: 13 }}
                  >
                    Play all
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }
          ListEmptyComponent={
            <View
              style={{
                alignItems: "center",
                paddingTop: 60,
                paddingHorizontal: 40,
              }}
            >
              <Ionicons
                name={
                  activeFilter === "Likes"
                    ? "heart-outline"
                    : activeFilter === "Downloads"
                      ? "download-outline"
                      : "musical-notes-outline"
                }
                size={60}
                color="#333"
              />
              <Text
                style={{
                  color: "#555",
                  fontSize: 16,
                  marginTop: 16,
                  textAlign: "center",
                }}
              >
                {activeFilter === "Likes"
                  ? "No liked songs yet"
                  : activeFilter === "Downloads"
                    ? "No downloads yet"
                    : "No linked songs yet"}
              </Text>
              <Text
                style={{
                  color: "#444",
                  fontSize: 13,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                {activeFilter === "Downloads"
                  ? "Sync MP3s via Wi-Fi to see them here"
                  : activeFilter === "Likes"
                    ? "Like songs from the player to see them here"
                    : "Link MP3s to Last.fm tracks from album pages"}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}
    </View>
  );
}
