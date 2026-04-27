import { useArtistInfo, useArtistTopAlbums } from "@/hooks/useLastfm";
import { deezer } from "@/services/lastfm";
import { LastfmAlbum } from "@/types/lastfm";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

function AlbumRow({
  album,
  artistName,
}: {
  album: LastfmAlbum;
  artistName: string;
}) {
  const [cover, setCover] = useState<string | null>(null);

  useEffect(() => {
    deezer.searchAlbumCover(artistName, album.name).then(setCover);
  }, [album.name, artistName]);

  return (
    <TouchableOpacity
      style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
      onPress={() =>
        router.push({
          pathname: "/album/[artist]/[name]",
          params: { artist: artistName, name: album.name },
        })
      }
    >
      {cover ? (
        <Image
          source={{ uri: cover }}
          style={{ width: 60, height: 60, borderRadius: 8 }}
        />
      ) : (
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 8,
            backgroundColor: "#1A1A1A",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="musical-notes" size={24} color="#9E9E9E" />
        </View>
      )}
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text
          style={{ color: "white", fontSize: 15, fontWeight: "700" }}
          numberOfLines={1}
        >
          {album.name}
        </Text>
        <Text style={{ color: "#9E9E9E", fontSize: 13, marginTop: 2 }}>
          {artistName}
        </Text>
      </View>
      <Ionicons name="ellipsis-vertical" size={18} color="#555" />
    </TouchableOpacity>
  );
}

export default function ArtistScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const { data: artist, isLoading } = useArtistInfo(name);
  const { data: albums } = useArtistTopAlbums(name);
  const [artistImage, setArtistImage] = useState<string | null>(null);

  useEffect(() => {
    if (name) deezer.searchArtistImage(name).then(setArtistImage);
  }, [name]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0A0A0A",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#00BFA5" />
      </View>
    );
  }

  const bio = artist?.bio?.summary?.replace(/<a[^>]*>.*?<\/a>/g, "").trim();

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0A0A" }}>
      <SafeAreaView edges={["top"]}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingVertical: 12,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text
            style={{
              color: "#9E9E9E",
              fontSize: 12,
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            FROM "SEARCH"
          </Text>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image carrée */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          {artistImage ? (
            <Image
              source={{ uri: artistImage }}
              style={{
                width: width - 32,
                height: width - 32,
                borderRadius: 12,
              }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: width - 32,
                height: width - 32,
                borderRadius: 12,
                backgroundColor: "#1A1A1A",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="person" size={80} color="#9E9E9E" />
            </View>
          )}
        </View>

        {/* Nom + listeners */}
        <View
          style={{
            paddingHorizontal: 20,
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 32,
              fontWeight: "900",
              textAlign: "center",
              letterSpacing: -1,
            }}
          >
            {artist?.name ?? name}
          </Text>
          {artist?.listeners && (
            <Text style={{ color: "#9E9E9E", fontSize: 14, marginTop: 6 }}>
              {parseInt(artist.listeners).toLocaleString()} listeners
            </Text>
          )}
        </View>

        {/* Bio */}
        {bio && (
          <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
            <Text
              style={{
                color: "#9E9E9E",
                fontSize: 13,
                lineHeight: 20,
                textAlign: "center",
              }}
              numberOfLines={4}
            >
              {bio}
            </Text>
          </View>
        )}

        {/* Top Albums */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text
            style={{
              color: "white",
              fontSize: 18,
              fontWeight: "800",
              marginBottom: 16,
            }}
          >
            Top Albums
          </Text>
          {albums?.map((album, index) => (
            <AlbumRow
              key={`${album.name}-${index}`}
              album={album}
              artistName={name}
            />
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}
