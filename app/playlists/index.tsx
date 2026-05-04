import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TEAL = "#00BFA5";
const BG = "#0A0A0A";
const HEADER_BG = "#0D2B2B";
const CARD_BG = "#1A1A1A";
const MUTED = "#9E9E9E";

const PLAYLIST_COLORS = [
  "#2BA8C8", "#7B3EC1", "#C13A5F", "#3A5FC1",
  "#7BC744", "#C97820", "#1A7B5F", "#8B6914",
];

type Playlist = {
  id: string;
  name: string;
  count: number;
  color: string;
};

const MOCK_PLAYLISTS: Playlist[] = [
  { id: "1", name: "Coffee & Jazz", count: 24, color: "#2BA8C8" },
  { id: "2", name: "Lo-Fi Beats", count: 18, color: "#7B3EC1" },
  { id: "3", name: "Anime OSTs", count: 56, color: "#C13A5F" },
  { id: "4", name: "Chill Mix", count: 12, color: "#3A5FC1" },
  { id: "5", name: "Pop Mix", count: 30, color: "#7BC744" },
];

export default function PlaylistsScreen() {
  const [playlists, setPlaylists] = useState<Playlist[]>(MOCK_PLAYLISTS);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [pickedColor, setPickedColor] = useState(PLAYLIST_COLORS[0]);

  function createPlaylist() {
    if (!newName.trim()) return;
    const pl: Playlist = {
      id: Date.now().toString(),
      name: newName.trim(),
      count: 0,
      color: pickedColor,
    };
    setPlaylists((prev) => [pl, ...prev]);
    setNewName("");
    setShowModal(false);
  }

  function renderPlaylist({ item }: { item: Playlist }) {
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
        activeOpacity={0.7}
      >
        <View
          style={{
            width: 54,
            height: 54,
            borderRadius: 10,
            backgroundColor: item.color,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="musical-notes" size={24} color="white" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{ color: "white", fontSize: 15, fontWeight: "700" }}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>
            {item.count} songs
          </Text>
        </View>
        <TouchableOpacity style={{ padding: 6 }}>
          <Ionicons name="play-circle" size={28} color={TEAL} />
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
            <Ionicons name="list" size={26} color={TEAL} />
            <Text style={{ color: TEAL, fontSize: 24, fontWeight: "800", flex: 1 }}>
              Playlists
            </Text>
            <TouchableOpacity
              onPress={() => setShowModal(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: TEAL,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
              }}
            >
              <Ionicons name="add" size={18} color="black" />
              <Text style={{ color: "black", fontWeight: "700", fontSize: 13 }}>
                New
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={renderPlaylist}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Ionicons name="list-outline" size={60} color="#333" />
            <Text style={{ color: "#555", fontSize: 16, marginTop: 16 }}>
              No playlists yet
            </Text>
            <TouchableOpacity
              onPress={() => setShowModal(true)}
              style={{
                marginTop: 20,
                backgroundColor: TEAL,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 24,
              }}
            >
              <Text style={{ color: "black", fontWeight: "700" }}>
                Create a playlist
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Create playlist modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.7)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#141414",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 24,
              paddingBottom: 40,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 18,
                fontWeight: "800",
                marginBottom: 20,
              }}
            >
              New Playlist
            </Text>

            <TextInput
              style={{
                backgroundColor: CARD_BG,
                borderRadius: 12,
                color: "white",
                fontSize: 15,
                paddingHorizontal: 16,
                paddingVertical: 14,
                marginBottom: 20,
                borderWidth: 0.5,
                borderColor: "#2A2A2A",
              }}
              placeholder="Playlist name..."
              placeholderTextColor={MUTED}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />

            {/* Color picker */}
            <Text style={{ color: MUTED, fontSize: 13, marginBottom: 12 }}>
              Pick a color
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
                marginBottom: 24,
              }}
            >
              {PLAYLIST_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setPickedColor(c)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: c,
                    borderWidth: pickedColor === c ? 2.5 : 0,
                    borderColor: "white",
                  }}
                />
              ))}
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  borderWidth: 0.5,
                  borderColor: "#2A2A2A",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: MUTED, fontWeight: "700" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={createPlaylist}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: TEAL,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "black", fontWeight: "700" }}>
                  Create
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
