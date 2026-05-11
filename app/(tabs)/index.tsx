import { getAllPlaylists, getAllTracks, getRecentTracks } from "@/db/schema";
import { Track, usePlayerStore } from "@/stores/playerStore";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const TEAL = "#00BFA5";
const BG = "#0A0A0A";
const CARD_BG = "#1A1A1A";
const MUTED = "#9E9E9E";

const TRACK_COLORS = [
  "#2A1F1A",
  "#1A2A1A",
  "#1A1A2A",
  "#2A1A1A",
  "#2A2A1A",
  "#1A2A2A",
];

const PLAYLIST_COLORS = [
  "#2BA8C8",
  "#7B3EC1",
  "#C13A5F",
  "#3A5FC1",
  "#7BC744",
  "#C97820",
];

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

type RecentTrack = {
  track_id: string;
  title: string;
  artist: string;
  cover_url: string | null;
};

export default function HomeScreen() {
  const [recentTracks, setRecentTracks] = useState<RecentTrack[]>([]);
  const [allTracks, setAllTracks] = useState<DBTrack[]>([]);
  const [playlists, setPlaylists] = useState<DBPlaylist[]>([]);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [username, setUsername] = useState("musix");
  const { currentTrack, setTrack, setQueue } = usePlayerStore();

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        getAllTracks(),
        getRecentTracks(),
        getAllPlaylists(),
        AsyncStorage.getItem("musix:username"),
        AsyncStorage.getItem("musix:avatar_uri"),
      ])
        .then(([tracks, recent, pls, name, avatar]) => {
          setAllTracks(tracks);
          setRecentTracks(recent);
          setPlaylists(pls.slice(0, 5));
          if (name) setUsername(name);
          setAvatarUri(avatar ?? null);
        })
        .catch(console.error);
    }, []),
  );

  function playTrack(item: DBTrack | RecentTrack) {
    const queue: Track[] = allTracks.map((t) => ({
      id: String(t.id),
      title: t.title,
      artist: t.artist,
      album: "",
      coverUrl: t.cover_url ?? null,
      previewUrl: null,
      localUri: t.local_file_path,
    }));
    const idx = queue.findIndex(
      (t) => t.id === ("id" in item ? String(item.id) : item.track_id),
    );
    setQueue(queue);
    setTrack(queue[idx >= 0 ? idx : 0]);
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
          {/* Avatar */}
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  borderWidth: 2,
                  borderColor: TEAL,
                }}
              />
            ) : (
              <View
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
              </View>
            )}
          </TouchableOpacity>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: "white", fontSize: 18, fontWeight: "800" }}>
              Welcome back !
            </Text>
            <Text style={{ color: MUTED, fontSize: 13, marginTop: 1 }}>
              {allTracks.length > 0
                ? `${allTracks.length} songs in library`
                : username}
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
        {/* Continue Listening */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ color: "white", fontSize: 22, fontWeight: "800" }}>
              Continue Listening
            </Text>
            {allTracks.length > 0 && (
              <TouchableOpacity onPress={() => router.push("/downloads")}>
                <Text style={{ color: TEAL, fontSize: 13 }}>See all</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentTracks.length === 0 ? (
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
                <TouchableOpacity
                  key={item.track_id}
                  onPress={() => {
                    const found = allTracks.find(
                      (t) => String(t.id) === item.track_id,
                    );
                    if (found) {
                      const queue = allTracks.map((t) => ({
                        id: String(t.id),
                        title: t.title,
                        artist: t.artist,
                        album: "",
                        coverUrl: t.cover_url ?? null,
                        previewUrl: null,
                        localUri: t.local_file_path,
                      }));
                      const idx = queue.findIndex(
                        (t) => t.id === String(found.id),
                      );
                      setQueue(queue);
                      setTrack(queue[idx >= 0 ? idx : 0]);
                    }
                  }}
                  style={{
                    width: (width - 52) / 2,
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: CARD_BG,
                    borderRadius: 8,
                    overflow: "hidden",
                    height: 56,
                    borderWidth: currentTrack?.id === item.track_id ? 1 : 0,
                    borderColor: TEAL,
                  }}
                >
                  {item.cover_url ? (
                    <Image
                      source={{ uri: item.cover_url }}
                      style={{ width: 56, height: 56 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={{
                        width: 56,
                        height: 56,
                        backgroundColor: TRACK_COLORS[i % TRACK_COLORS.length],
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="musical-notes" size={22} color={MUTED} />
                    </View>
                  )}
                  <Text
                    style={{
                      color:
                        currentTrack?.id === item.track_id ? TEAL : "white",
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
              ))}
            </View>
          )}
        </View>

        {/* Your Playlists */}
        <View style={{ marginBottom: 32 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
              paddingHorizontal: 20,
            }}
          >
            <Text style={{ color: "white", fontSize: 22, fontWeight: "800" }}>
              Your Playlists
            </Text>
            <TouchableOpacity onPress={() => router.push("/playlists")}>
              <Text style={{ color: TEAL, fontSize: 13 }}>See all</Text>
            </TouchableOpacity>
          </View>

          {playlists.length === 0 ? (
            <View style={{ paddingHorizontal: 20 }}>
              <TouchableOpacity
                onPress={() => router.push("/playlists")}
                style={{
                  backgroundColor: CARD_BG,
                  borderRadius: 12,
                  padding: 20,
                  alignItems: "center",
                  gap: 8,
                  borderWidth: 1,
                  borderColor: "#2A2A2A",
                  borderStyle: "dashed",
                }}
              >
                <Ionicons name="add-circle-outline" size={32} color={TEAL} />
                <Text
                  style={{ color: "white", fontSize: 14, fontWeight: "600" }}
                >
                  Create your first playlist
                </Text>
                <Text
                  style={{ color: MUTED, fontSize: 12, textAlign: "center" }}
                >
                  Organize your music into playlists
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            >
              {playlists.map((pl, i) => (
                <TouchableOpacity
                  key={pl.id}
                  onPress={() =>
                    router.push({
                      pathname: "/playlists/[id]",
                      params: { id: pl.id },
                    } as any)
                  }
                  style={{
                    width: 140,
                    borderRadius: 12,
                    backgroundColor: CARD_BG,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      height: 100,
                      backgroundColor:
                        pl.color ?? PLAYLIST_COLORS[i % PLAYLIST_COLORS.length],
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="musical-notes"
                      size={36}
                      color="rgba(255,255,255,0.6)"
                    />
                  </View>
                  <View style={{ padding: 10 }}>
                    <Text
                      style={{
                        color: "white",
                        fontSize: 13,
                        fontWeight: "700",
                      }}
                      numberOfLines={1}
                    >
                      {pl.name}
                    </Text>
                    <Text style={{ color: MUTED, fontSize: 11, marginTop: 2 }}>
                      {pl.track_count} songs
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              {/* Card créer une playlist */}
              <TouchableOpacity
                onPress={() => router.push("/playlists")}
                style={{
                  width: 140,
                  borderRadius: 12,
                  backgroundColor: CARD_BG,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: "#2A2A2A",
                }}
              >
                <View
                  style={{
                    height: 100,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="add" size={36} color={TEAL} />
                </View>
                <View style={{ padding: 10 }}>
                  <Text
                    style={{ color: TEAL, fontSize: 13, fontWeight: "700" }}
                  >
                    New playlist
                  </Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}
