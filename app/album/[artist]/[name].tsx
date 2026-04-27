import { deezer, lastfm } from "@/services/lastfm";
import { Track, usePlayerStore } from "@/stores/playerStore";
import { LastfmAlbum } from "@/types/lastfm";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AlbumScreen() {
  const { artist, name } = useLocalSearchParams<{
    artist: string;
    name: string;
  }>();
  const router = useRouter();

  const [album, setAlbum] = useState<LastfmAlbum | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { setTrack, setQueue, setIsMinimized } = usePlayerStore();

  useEffect(() => {
    if (artist && name) {
      Promise.all([
        lastfm.getAlbumInfo(artist, name),
        deezer.searchAlbumCover(artist, name),
      ])
        .then(([albumData, cover]) => {
          setAlbum(albumData);
          setCoverImage(cover);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [artist, name]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const buildTrack = (track: any, cover: string | null): Track => ({
    id: `${artist}-${track.name}`,
    title: track.name,
    artist: track.artist?.name ?? artist ?? "",
    album: album?.name ?? name ?? "",
    coverUrl: cover,
    previewUrl: null,
    localUri: null,
  });

  const handlePlayTrack = async (track: any, index: number) => {
    const trackArtist = track.artist?.name ?? artist ?? "";
    const previewUrl = await deezer.searchTrackPreview(trackArtist, track.name);
    const queue = tracks.map((t: any) => buildTrack(t, coverImage));
    queue[index] = { ...queue[index], previewUrl };
    setQueue(queue);
    setTrack(queue[index]);
    setIsMinimized(true);
  };

  const handlePlayAll = async () => {
    if (tracks.length === 0) return;
    const firstTrack = tracks[0];
    const trackArtist = firstTrack.artist?.name ?? artist ?? "";
    const previewUrl = await deezer.searchTrackPreview(
      trackArtist,
      firstTrack.name,
    );
    const queue = tracks.map((t: any) => buildTrack(t, coverImage));
    queue[0] = { ...queue[0], previewUrl };
    setQueue(queue);
    setTrack(queue[0]);
    setIsMinimized(true);
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0A0A0A",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color="#00BFA5" size="large" />
      </View>
    );
  }

  const tracks = Array.isArray(album?.tracks?.track)
    ? album.tracks.track
    : album?.tracks?.track
      ? [album.tracks.track]
      : [];

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0A0A" }}>
      <SafeAreaView edges={["top"]}>
        {/* Header */}
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
            FROM "ARTIST"
          </Text>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          {coverImage ? (
            <Image
              source={{ uri: coverImage }}
              style={{ width: "100%", aspectRatio: 1, borderRadius: 12 }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: "100%",
                aspectRatio: 1,
                borderRadius: 12,
                backgroundColor: "#1A1A1A",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="musical-notes" size={80} color="#9E9E9E" />
            </View>
          )}
        </View>

        {/* Album info */}
        <View
          style={{
            paddingHorizontal: 20,
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 28,
              fontWeight: "900",
              textAlign: "center",
              letterSpacing: -0.5,
            }}
          >
            {album?.name ?? name}
          </Text>
          <Text style={{ color: "#9E9E9E", fontSize: 15, marginTop: 6 }}>
            {artist}
          </Text>
          {tracks.length > 0 && (
            <Text style={{ color: "#555", fontSize: 13, marginTop: 4 }}>
              {tracks.length} titres
            </Text>
          )}
        </View>

        {/* Play All */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <TouchableOpacity
            onPress={handlePlayAll}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#00BFA5",
              borderRadius: 30,
              paddingVertical: 14,
              gap: 8,
            }}
          >
            <Ionicons name="play" size={20} color="black" />
            <Text style={{ color: "black", fontWeight: "800", fontSize: 15 }}>
              Tout lire
            </Text>
          </TouchableOpacity>
        </View>

        {/* Track list */}
        <View style={{ paddingHorizontal: 20 }}>
          {tracks.length === 0 ? (
            <Text
              style={{
                color: "#555",
                textAlign: "center",
                paddingVertical: 32,
              }}
            >
              Aucune piste disponible
            </Text>
          ) : (
            tracks.map((track: any, index: number) => (
              <TouchableOpacity
                key={track.name + index}
                onPress={() => handlePlayTrack(track, index)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomWidth: 0.5,
                  borderBottomColor: "#1A1A1A",
                }}
              >
                <Text style={{ color: "#555", width: 28, fontSize: 13 }}>
                  {index + 1}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ color: "white", fontSize: 14, fontWeight: "600" }}
                    numberOfLines={1}
                  >
                    {track.name}
                  </Text>
                  {track.artist?.name && track.artist.name !== artist && (
                    <Text
                      style={{ color: "#9E9E9E", fontSize: 12, marginTop: 2 }}
                    >
                      {track.artist.name}
                    </Text>
                  )}
                </View>
                {track.duration && track.duration !== "0" && (
                  <Text
                    style={{ color: "#555", fontSize: 13, marginRight: 12 }}
                  >
                    {formatDuration(Number(track.duration))}
                  </Text>
                )}
                <Ionicons name="ellipsis-vertical" size={16} color="#555" />
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}
