import { deleteTrack, getAllTracks } from "@/db/schema";
import { Track, usePlayerStore } from "@/stores/playerStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TEAL = "#00BFA5";
const BG = "#0A0A0A";
const HEADER_BG = "#0D2B2B";
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

export default function DownloadsScreen() {
  const [tracks, setTracks] = useState<DBTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const { setTrack, setQueue } = usePlayerStore();

  useEffect(() => {
    getAllTracks()
      .then(setTracks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
    const queue = tracks.map(buildTrack);
    setQueue(queue);
    setTrack(queue[index]);
  };

  const handlePlayAll = () => {
    if (tracks.length === 0) return;
    const queue = tracks.map(buildTrack);
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
          setTracks((prev) => prev.filter((t) => t.id !== item.id));
        },
      },
    ]);
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return "";
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  function renderTrack({ item, index }: { item: DBTrack; index: number }) {
    return (
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 14,
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
          <Ionicons name="musical-note" size={22} color={TEAL} />
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
        {item.duration_ms ? (
          <Text style={{ color: MUTED, fontSize: 12 }}>
            {formatDuration(item.duration_ms)}
          </Text>
        ) : null}
        <TouchableOpacity
          onPress={() => handleDelete(item)}
          style={{ padding: 6 }}
        >
          <Ionicons name="trash-outline" size={18} color="#E05C5C" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={{ backgroundColor: HEADER_BG }}>
        <SafeAreaView>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 20,
              gap: 10,
            }}
          >
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={TEAL} />
            </TouchableOpacity>
            <Ionicons name="download" size={26} color={TEAL} />
            <Text
              style={{ color: TEAL, fontSize: 24, fontWeight: "800", flex: 1 }}
            >
              Downloads
            </Text>
            <Text style={{ color: MUTED, fontSize: 13 }}>
              {tracks.length} fichiers
            </Text>
          </View>
        </SafeAreaView>
      </View>

      {/* Play all bar */}
      {tracks.length > 0 && (
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
            onPress={() => router.push("/wifi-sync")}
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
            <Ionicons name="wifi" size={16} color={TEAL} />
            <Text style={{ color: TEAL, fontWeight: "700", fontSize: 13 }}>
              Wi-Fi Sync
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={tracks}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderTrack}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 80 }}>
            <Ionicons name="download-outline" size={60} color="#333" />
            <Text style={{ color: "#555", fontSize: 16, marginTop: 16 }}>
              {loading ? "Loading..." : "Aucun fichier téléchargé"}
            </Text>
            {!loading && (
              <>
                <Text
                  style={{
                    color: "#444",
                    fontSize: 13,
                    marginTop: 8,
                    textAlign: "center",
                    paddingHorizontal: 40,
                  }}
                >
                  Sync tes MP3 depuis ton PC via Wi-Fi
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/wifi-sync")}
                  style={{
                    marginTop: 24,
                    backgroundColor: TEAL,
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 24,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Ionicons name="wifi" size={18} color="black" />
                  <Text style={{ color: "black", fontWeight: "700" }}>
                    Ouvrir Wi-Fi Sync
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        }
      />
    </View>
  );
}
