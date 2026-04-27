import { useSearchArtists } from "@/hooks/useLastfm";
import { LastfmArtist } from "@/types/lastfm";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const GENRES = [
  { name: "Kpop", color: "#7BC744" },
  { name: "Indie", color: "#D63BAA" },
  { name: "R&B", color: "#4A5FC1" },
  { name: "Pop", color: "#C97820" },
];

const BROWSE = [
  { name: "Made for You", color: "#2BA8C8" },
  { name: "Released", color: "#7B3EC1" },
  { name: "Music Charts", color: "#3A5FC1" },
  { name: "Podcasts", color: "#C13A5F" },
  { name: "Bollywood", color: "#8B6914" },
  { name: "Pop Fusion", color: "#1A7B5F" },
];

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const { data: artists, isLoading } = useSearchArtists(query);

  function renderArtist({ item }: { item: LastfmArtist }) {
    return (
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderBottomWidth: 0.5,
          borderBottomColor: "#1A1A1A",
        }}
        onPress={() =>
          router.push({
            pathname: "/artist/[name]",
            params: { name: item.name },
          })
        }
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: "#1A1A1A",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="person" size={24} color="#9E9E9E" />
        </View>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>
            {item.name}
          </Text>
          {item.listeners && (
            <Text style={{ color: "#9E9E9E", fontSize: 13, marginTop: 2 }}>
              {parseInt(item.listeners).toLocaleString()} listeners
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color="#9E9E9E" />
      </TouchableOpacity>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0A0A" }}>
      <LinearGradient
        colors={["#0D2B2B", "#0A0A0A"]}
        style={{ paddingBottom: 20 }}
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
            <Ionicons name="musical-note" size={28} color="#00BFA5" />
            <Text style={{ color: "#00BFA5", fontSize: 28, fontWeight: "800" }}>
              Search
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
              paddingVertical: 12,
            }}
          >
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={{ flex: 1, marginLeft: 10, color: "#333", fontSize: 15 }}
              placeholder="Songs, Artists, Podcasts & More"
              placeholderTextColor="#999"
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      {isLoading && (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color="#00BFA5" />
        </View>
      )}

      {!isLoading && query.length > 1 && artists && (
        <FlatList
          data={artists}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          renderItem={renderArtist}
          showsVerticalScrollIndicator={false}
        />
      )}

      {query.length === 0 && (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: 20, paddingTop: 28 }}>
            <Text
              style={{
                color: "white",
                fontSize: 20,
                fontWeight: "800",
                marginBottom: 16,
              }}
            >
              Your Top Genres
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {GENRES.map((g) => (
                <TouchableOpacity
                  key={g.name}
                  style={{
                    width: "47%",
                    height: 100,
                    backgroundColor: g.color,
                    borderRadius: 12,
                    padding: 14,
                    justifyContent: "flex-start",
                  }}
                >
                  <Text
                    style={{ color: "white", fontSize: 16, fontWeight: "800" }}
                  >
                    {g.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 28,
              paddingBottom: 120,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 20,
                fontWeight: "800",
                marginBottom: 16,
              }}
            >
              Browse All
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {BROWSE.map((g) => (
                <TouchableOpacity
                  key={g.name}
                  style={{
                    width: "47%",
                    height: 100,
                    backgroundColor: g.color,
                    borderRadius: 12,
                    padding: 14,
                    justifyContent: "flex-start",
                  }}
                >
                  <Text
                    style={{ color: "white", fontSize: 16, fontWeight: "800" }}
                  >
                    {g.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
