import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TEAL = "#00BFA5";
const BG = "#0A0A0A";
const HEADER_BG = "#0D2B2B";
const CARD_BG = "#1A1A1A";
const MUTED = "#9E9E9E";

const MOCK_LIKED = [
  { id: "1", title: "Blue Bird", artist: "Ikimono-gakari", duration: "4:12" },
  { id: "2", title: "Gurenge", artist: "LiSA", duration: "3:57" },
  { id: "5", title: "Silhouette", artist: "KANA-BOON", duration: "3:41" },
  { id: "7", title: "Rain", artist: "Sid", duration: "4:35" },
  { id: "10", title: "Coffee & Jazz Mix", artist: "Various", duration: "58:00" },
];

type Song = typeof MOCK_LIKED[0];

export default function LikedSongsScreen() {
  const [liked, setLiked] = useState<Song[]>(MOCK_LIKED);

  function unlike(id: string) {
    setLiked((prev) => prev.filter((s) => s.id !== id));
  }

  function renderSong({ item, index }: { item: Song; index: number }) {
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
          <Text style={{ color: MUTED, fontSize: 15, fontWeight: "700" }}>
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
          <Text style={{ color: MUTED, fontSize: 13, marginTop: 2 }} numberOfLines={1}>
            {item.artist}
          </Text>
        </View>
        <Text style={{ color: MUTED, fontSize: 12 }}>{item.duration}</Text>
        <TouchableOpacity
          onPress={() => unlike(item.id)}
          style={{ padding: 6 }}
        >
          <Ionicons name="heart" size={20} color={TEAL} />
        </TouchableOpacity>
        <TouchableOpacity style={{ padding: 6 }}>
          <Ionicons name="ellipsis-vertical" size={18} color={MUTED} />
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
            <Ionicons name="heart" size={26} color={TEAL} />
            <Text style={{ color: TEAL, fontSize: 24, fontWeight: "800", flex: 1 }}>
              Liked Songs
            </Text>
            <Text style={{ color: MUTED, fontSize: 13 }}>
              {liked.length} tracks
            </Text>
          </View>
        </SafeAreaView>
      </View>

      {/* Play all bar */}
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
        data={liked}
        keyExtractor={(item) => item.id}
        renderItem={renderSong}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Ionicons name="heart-outline" size={60} color="#333" />
            <Text style={{ color: "#555", fontSize: 16, marginTop: 16 }}>
              No liked songs yet
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
              Tap the heart on any song to save it here
            </Text>
          </View>
        }
      />
    </View>
  );
}
