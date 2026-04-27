import { usePlayerStore } from "@/stores/playerStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FILTERS = ["Playlists", "Artists", "Albums", "Podcasts & Shows"];

export default function LibraryScreen() {
  const [activeFilter, setActiveFilter] = useState("Artists");
  const [search, setSearch] = useState("");
  const { currentTrack } = usePlayerStore();

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0A0A" }}>
      <SafeAreaView>
        {/* Header */}
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
            <Ionicons name="musical-note" size={28} color="#00BFA5" />
            <Text style={{ color: "#00BFA5", fontSize: 24, fontWeight: "800" }}>
              Your Library
            </Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Filter pills */}
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
                backgroundColor: activeFilter === f ? "#00BFA5" : "transparent",
                borderWidth: 1,
                borderColor: activeFilter === f ? "#00BFA5" : "#555",
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

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Sort by */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
            marginBottom: 20,
          }}
        >
          <Text style={{ color: "white", fontSize: 15, fontWeight: "600" }}>
            Sort By
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ color: "#00BFA5", fontSize: 14, fontWeight: "600" }}>
              Recently played
            </Text>
            <Ionicons name="swap-vertical" size={16} color="#00BFA5" />
          </View>
        </View>

        {/* Empty state */}
        <View style={{ alignItems: "center", paddingTop: 60 }}>
          <Ionicons name="library-outline" size={60} color="#333" />
          <Text
            style={{
              color: "#555",
              fontSize: 16,
              marginTop: 16,
              textAlign: "center",
            }}
          >
            Your library is empty
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
            Search for artists and albums to start building your collection
          </Text>
          <TouchableOpacity
            style={{
              marginTop: 24,
              backgroundColor: "#00BFA5",
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 24,
            }}
            onPress={() => router.push("/(tabs)/search")}
          >
            <Text style={{ color: "black", fontWeight: "700", fontSize: 14 }}>
              Browse Music
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}
