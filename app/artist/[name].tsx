import { useArtistInfo, useArtistTopAlbums } from "@/hooks/useLastfm";
import { deezer, lastfm } from "@/services/lastfm";
import { LastfmAlbum } from "@/types/lastfm";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ArtistScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const { data: artist, isLoading: loadingArtist } = useArtistInfo(name);
  const { data: albums, isLoading: loadingAlbums } = useArtistTopAlbums(name);
  const [artistImage, setArtistImage] = useState<string | null>(null);

  useEffect(() => {
    if (name) {
      deezer
        .searchArtistImage(name)
        .then((url) => {
          console.log("🖼️ Deezer image URL:", url);
          setArtistImage(url);
        })
        .catch((err) => {
          console.log("❌ Deezer error:", err);
        });
    }
  }, [name]);

  if (loadingArtist) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#00BFA5" />
      </View>
    );
  }

  const bio = artist?.bio?.summary?.replace(/<a[^>]*>.*?<\/a>/g, "")?.trim();

  function renderAlbum({ item }: { item: LastfmAlbum }) {
    const coverUrl = lastfm.getImageUrl(item.image, "large");
    return (
      <TouchableOpacity
        className="mr-4 w-36"
        onPress={() =>
          router.push({
            pathname: "/album/[artist]/[name]",
            params: { artist: name, name: item.name },
          })
        }
      >
        {coverUrl ? (
          <Image
            source={{ uri: coverUrl }}
            className="w-36 h-36 rounded-xl bg-surface"
          />
        ) : (
          <View className="w-36 h-36 rounded-xl bg-surface items-center justify-center">
            <Ionicons name="musical-notes" size={36} color="#9E9E9E" />
          </View>
        )}
        <Text
          className="text-text-primary font-semibold mt-2 text-sm"
          numberOfLines={2}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <View className="relative">
          {artistImage ? (
            <Image
              source={{ uri: artistImage }}
              style={{ width: "100%", height: 288 }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{ width: "100%", height: 288 }}
              className="bg-surface items-center justify-center"
            >
              <Ionicons name="person" size={80} color="#9E9E9E" />
            </View>
          )}

          {/* Back button */}
          <SafeAreaView className="absolute top-0 left-0">
            <TouchableOpacity
              className="m-4 w-10 h-10 rounded-full bg-black/50 items-center justify-center"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Artist name over image */}
          <View className="absolute bottom-4 left-4 right-4">
            <Text className="text-white text-3xl font-bold">
              {artist?.name}
            </Text>
            {artist?.listeners && (
              <Text className="text-text-secondary text-sm mt-1">
                {parseInt(artist.listeners).toLocaleString()} listeners
              </Text>
            )}
          </View>
        </View>

        <View className="px-4 mt-6">
          {/* Albums */}
          {albums && albums.length > 0 && (
            <View className="mb-6">
              <Text className="text-text-primary text-xl font-bold mb-4">
                Top Albums
              </Text>
              {loadingAlbums ? (
                <ActivityIndicator color="#00BFA5" />
              ) : (
                <FlatList
                  data={albums}
                  keyExtractor={(item, index) => `${item.name}-${index}`}
                  renderItem={renderAlbum}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              )}
            </View>
          )}

          <View className="relative" style={{ overflow: "hidden" }}></View>

          {/* Bio */}
          {bio && (
            <View className="mb-8">
              <Text className="text-text-primary text-xl font-bold mb-3">
                About
              </Text>
              <Text className="text-text-secondary text-sm leading-6">
                {bio}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
