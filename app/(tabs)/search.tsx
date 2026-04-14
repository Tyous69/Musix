import { useSearchArtists } from "@/hooks/useLastfm";
import { lastfm } from "@/services/lastfm";
import { LastfmArtist } from "@/types/lastfm";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const { data: artists, isLoading } = useSearchArtists(query);

  function renderArtist({ item }: { item: LastfmArtist }) {
    const imageUrl = lastfm.getImageUrl(item.image, "large");

    return (
      <TouchableOpacity
        className="flex-row items-center px-4 py-3 border-b border-border"
        onPress={() =>
          router.push({
            pathname: "/artist/[name]",
            params: { name: item.name },
          })
        }
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="w-14 h-14 rounded-full bg-surface"
          />
        ) : (
          <View className="w-14 h-14 rounded-full bg-surface items-center justify-center">
            <Ionicons name="person" size={24} color="#9E9E9E" />
          </View>
        )}
        <View className="ml-4 flex-1">
          <Text className="text-text-primary font-semibold text-base">
            {item.name}
          </Text>
          {item.listeners && (
            <Text className="text-text-secondary text-sm mt-0.5">
              {parseInt(item.listeners).toLocaleString()} listeners
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-text-primary text-2xl font-bold mb-4">
          Search
        </Text>
        <View className="flex-row items-center bg-surface rounded-xl px-4 py-3">
          <Ionicons name="search" size={20} color="#9E9E9E" />
          <TextInput
            className="flex-1 ml-3 text-text-primary text-base"
            placeholder="Artists, songs, podcasts"
            placeholderTextColor="#9E9E9E"
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9E9E9E" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00BFA5" />
        </View>
      )}

      {!isLoading && query.length > 1 && artists && artists.length > 0 && (
        <FlatList
          data={artists}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          renderItem={renderArtist}
          showsVerticalScrollIndicator={false}
        />
      )}

      {!isLoading && query.length === 0 && (
        <View className="px-4 mt-6">
          <Text className="text-text-primary text-lg font-bold mb-4">
            Browse categories
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {GENRES.map((genre) => (
              <TouchableOpacity
                key={genre.name}
                className="rounded-xl px-5 py-4 w-[47%]"
                style={{ backgroundColor: genre.color }}
              >
                <Text className="text-white font-bold text-base">
                  {genre.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const GENRES = [
  { name: "Pop", color: "#E91E8C" },
  { name: "Hip-Hop", color: "#FF6B35" },
  { name: "Rock", color: "#7C3AED" },
  { name: "Electronic", color: "#00BFA5" },
  { name: "Jazz", color: "#F59E0B" },
  { name: "Classical", color: "#3B82F6" },
  { name: "R&B", color: "#EC4899" },
  { name: "Metal", color: "#6B7280" },
];
