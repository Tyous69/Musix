import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { lastfm, deezer } from "@/services/lastfm";
import { LastfmAlbum } from "@/types/lastfm";
import { usePlayerStore, Track } from "@/stores/playerStore";

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
    // Met à jour la preview uniquement pour la track cliquée
    queue[index] = { ...queue[index], previewUrl };
    setQueue(queue);
    setTrack(queue[index]);
    setIsMinimized(true);
  };

  const handlePlayAll = async () => {
    if (tracks.length === 0) return;
    // Fetch la preview de la première track pour démarrer vite
    const firstTrack = tracks[0];
    const trackArtist = firstTrack.artist?.name ?? artist ?? "";
    const previewUrl = await deezer.searchTrackPreview(trackArtist, firstTrack.name);
    const queue = tracks.map((t: any) => buildTrack(t, coverImage));
    queue[0] = { ...queue[0], previewUrl };
    setQueue(queue);
    setTrack(queue[0]);
    setIsMinimized(true);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="#FF6B35" size="large" />
      </View>
    );
  }

  const tracks = Array.isArray(album?.tracks?.track)
    ? album.tracks.track
    : album?.tracks?.track
      ? [album.tracks.track]
      : [];

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header back button */}
        <TouchableOpacity onPress={() => router.back()} className="px-4 py-2">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {/* Cover */}
        <View className="items-center px-8 pb-6">
          {coverImage ? (
            <Image
              source={{ uri: coverImage }}
              style={{ width: 240, height: 240, borderRadius: 12 }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{ width: 240, height: 240, borderRadius: 12 }}
              className="bg-surface items-center justify-center"
            >
              <Ionicons name="musical-notes" size={80} color="#9E9E9E" />
            </View>
          )}

          {/* Album info */}
          <Text className="text-white text-2xl font-bold mt-4 text-center">
            {album?.name ?? name}
          </Text>
          <Text className="text-gray-400 text-base mt-1">{artist}</Text>
          {tracks.length > 0 && (
            <Text className="text-gray-500 text-sm mt-1">
              {tracks.length} titres
            </Text>
          )}
        </View>

        {/* Play All button */}
        <View className="px-4 mb-6">
          <TouchableOpacity
            className="flex-row items-center justify-center bg-primary rounded-full py-3 gap-2"
            onPress={handlePlayAll}
          >
            <Ionicons name="play" size={20} color="white" />
            <Text className="text-white font-semibold text-base">
              Tout lire
            </Text>
          </TouchableOpacity>
        </View>

        {/* Track list */}
        <View className="px-4">
          {tracks.length === 0 ? (
            <Text className="text-gray-500 text-center py-8">
              Aucune piste disponible
            </Text>
          ) : (
            tracks.map((track: any, index: number) => (
              <TouchableOpacity
                key={track.name + index}
                className="flex-row items-center py-3 border-b border-surface"
                onPress={() => handlePlayTrack(track, index)}
              >
                <Text className="text-gray-500 w-8 text-sm">{index + 1}</Text>
                <View className="flex-1">
                  <Text
                    className="text-white text-sm font-medium"
                    numberOfLines={1}
                  >
                    {track.name}
                  </Text>
                  {track.artist?.name && track.artist.name !== artist && (
                    <Text className="text-gray-500 text-xs mt-0.5">
                      {track.artist.name}
                    </Text>
                  )}
                </View>
                {track.duration && track.duration !== "0" ? (
                  <Text className="text-gray-500 text-sm">
                    {formatDuration(Number(track.duration))}
                  </Text>
                ) : null}
                <Ionicons
                  name="ellipsis-vertical"
                  size={16}
                  color="#9E9E9E"
                  style={{ marginLeft: 12 }}
                />
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}