import { getAllTracks, getLinkedUri, linkLastfmTrack } from "@/db/schema";
import { deezer, lastfm } from "@/services/lastfm";
import { Track, usePlayerStore } from "@/stores/playerStore";
import { LastfmAlbum } from "@/types/lastfm";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TEAL = "#00BFA5";
const MUTED = "#9E9E9E";

type LocalFile = {
  id: number;
  title: string;
  artist: string;
  local_file_path: string;
};

export default function AlbumScreen() {
  const { artist, name } = useLocalSearchParams<{
    artist: string;
    name: string;
  }>();
  const router = useRouter();

  const [album, setAlbum] = useState<LastfmAlbum | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const [linkedUris, setLinkedUris] = useState<Record<string, string>>({});

  const { setTrack, setQueue, setIsMinimized } = usePlayerStore();

  useEffect(() => {
    if (artist && name) {
      Promise.all([
        lastfm.getAlbumInfo(artist, name),
        deezer.searchAlbumCover(artist, name),
        getAllTracks(),
      ])
        .then(([albumData, cover, files]) => {
          setAlbum(albumData);
          setCoverImage(cover);
          setLocalFiles(files);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [artist, name]);

  // Charge les URIs déjà liées pour les tracks de cet album
  useEffect(() => {
    if (!album?.tracks?.track) return;
    const trackList = Array.isArray(album.tracks.track)
      ? album.tracks.track
      : [album.tracks.track];

    Promise.all(
      trackList.map(async (t: any) => {
        const uri = await getLinkedUri(t.name, t.artist?.name ?? artist ?? "");
        return { key: t.name, uri };
      }),
    ).then((results) => {
      const map: Record<string, string> = {};
      results.forEach(({ key, uri }) => {
        if (uri) map[key] = uri;
      });
      setLinkedUris(map);
    });
  }, [album]);

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
    localUri: linkedUris[track.name] ?? null,
  });

  const handlePlayTrack = async (track: any, index: number) => {
    const queue = tracks.map((t: any) => buildTrack(t, coverImage));
    const localUri = linkedUris[track.name] ?? null;

    if (localUri) {
      // Fichier local disponible — joue directement
      queue[index] = { ...queue[index], localUri };
    } else {
      // Pas de fichier local — fetch preview Deezer
      const trackArtist = track.artist?.name ?? artist ?? "";
      const previewUrl = await deezer.searchTrackPreview(
        trackArtist,
        track.name,
      );
      queue[index] = { ...queue[index], previewUrl };
    }

    setQueue(queue);
    setTrack(queue[index]);
    setIsMinimized(true);
  };

  const handlePlayAll = async () => {
    if (tracks.length === 0) return;
    const queue = tracks.map((t: any) => buildTrack(t, coverImage));
    const firstTrack = tracks[0];
    const localUri = linkedUris[firstTrack.name] ?? null;

    if (localUri) {
      queue[0] = { ...queue[0], localUri };
    } else {
      const trackArtist = firstTrack.artist?.name ?? artist ?? "";
      const previewUrl = await deezer.searchTrackPreview(
        trackArtist,
        firstTrack.name,
      );
      queue[0] = { ...queue[0], previewUrl };
    }

    setQueue(queue);
    setTrack(queue[0]);
    setIsMinimized(true);
  };

  const openLinkModal = (track: any) => {
    setSelectedTrack(track);
    setModalVisible(true);
  };

  const handleLinkFile = async (file: LocalFile) => {
    if (!selectedTrack) return;
    const trackArtist = selectedTrack.artist?.name ?? artist ?? "";
    await linkLastfmTrack(
      selectedTrack.name,
      trackArtist,
      file.local_file_path,
    );
    setLinkedUris((prev) => ({
      ...prev,
      [selectedTrack.name]: file.local_file_path,
    }));
    setModalVisible(false);
    setSelectedTrack(null);
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
        <ActivityIndicator color={TEAL} size="large" />
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
              color: MUTED,
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
              <Ionicons name="musical-notes" size={80} color={MUTED} />
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
          <Text style={{ color: MUTED, fontSize: 15, marginTop: 6 }}>
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
              backgroundColor: TEAL,
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
                    <Text style={{ color: MUTED, fontSize: 12, marginTop: 2 }}>
                      {track.artist.name}
                    </Text>
                  )}
                </View>
                {/* Indicateur fichier local lié */}
                {linkedUris[track.name] && (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={TEAL}
                    style={{ marginRight: 8 }}
                  />
                )}
                {track.duration && track.duration !== "0" && (
                  <Text style={{ color: "#555", fontSize: 13, marginRight: 8 }}>
                    {formatDuration(Number(track.duration))}
                  </Text>
                )}
                <TouchableOpacity
                  onPress={() => openLinkModal(track)}
                  style={{ padding: 4 }}
                >
                  <Ionicons name="ellipsis-vertical" size={16} color="#555" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Modale de liaison MP3 */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
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
              paddingTop: 20,
              paddingBottom: 40,
              maxHeight: "70%",
            }}
          >
            {/* Header modale */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                marginBottom: 8,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{ color: "white", fontSize: 16, fontWeight: "800" }}
                >
                  Lier un fichier local
                </Text>
                <Text
                  style={{ color: MUTED, fontSize: 13, marginTop: 2 }}
                  numberOfLines={1}
                >
                  {selectedTrack?.name}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={MUTED} />
              </TouchableOpacity>
            </View>

            {localFiles.length === 0 ? (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <Ionicons name="folder-open-outline" size={48} color="#333" />
                <Text
                  style={{
                    color: "#555",
                    fontSize: 14,
                    marginTop: 12,
                    textAlign: "center",
                    paddingHorizontal: 32,
                  }}
                >
                  Aucun MP3 local disponible.{"\n"}Sync via Wi-Fi d'abord.
                </Text>
              </View>
            ) : (
              <FlatList
                data={localFiles}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleLinkFile(item)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 20,
                      paddingVertical: 14,
                      borderBottomWidth: 0.5,
                      borderBottomColor: "#1A1A1A",
                      gap: 14,
                    }}
                  >
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 8,
                        backgroundColor: "#1A1A1A",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="musical-note" size={20} color={TEAL} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: "white",
                          fontSize: 14,
                          fontWeight: "600",
                        }}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={{ color: MUTED, fontSize: 12, marginTop: 2 }}
                      >
                        {item.artist}
                      </Text>
                    </View>
                    <Ionicons name="link" size={18} color={TEAL} />
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
