import {
  addTrackToPlaylist,
  getAllPlaylists,
  getAllTracks,
  isLastfmTrackLiked,
  likeLastfmTrack,
  linkLastfmTrack,
  unlikeLastfmTrack,
} from "@/db/schema";
import { usePlayerStore } from "@/stores/playerStore";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const COVER_SIZE = width - 32;
const TEAL = "#00BFA5";
const MUTED = "#9E9E9E";

type LocalFile = {
  id: number;
  title: string;
  artist: string;
  local_file_path: string;
};
type Playlist = {
  id: number;
  name: string;
  color: string | null;
  track_count: number;
};
type ModalView = "menu" | "link" | "playlist";

export default function PlayerScreen() {
  const router = useRouter();
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    setIsPlaying,
    seekFn,
    nextTrack,
    prevTrack,
    isShuffle,
    repeatMode,
    toggleShuffle,
    toggleRepeat,
  } = usePlayerStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalView, setModalView] = useState<ModalView>("menu");
  const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLiked, setIsLiked] = useState(false);

  // Vérifie le statut liked au changement de track
  useEffect(() => {
    if (!currentTrack) return;
    isLastfmTrackLiked(currentTrack.title, currentTrack.artist)
      .then(setIsLiked)
      .catch(() => setIsLiked(false));
  }, [currentTrack?.id]);

  // Charge les données quand la modale s'ouvre
  useEffect(() => {
    if (!modalVisible) return;
    getAllTracks().then(setLocalFiles).catch(console.error);
    getAllPlaylists().then(setPlaylists).catch(console.error);
  }, [modalVisible]);

  const openModal = () => {
    setModalView("menu");
    setModalVisible(true);
  };
  const closeModal = () => setModalVisible(false);
  const togglePlay = () => setIsPlaying(!isPlaying);
  const seek = (seconds: number) => seekFn?.(seconds);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleToggleLike = async () => {
    if (!currentTrack) return;
    if (isLiked) {
      await unlikeLastfmTrack(currentTrack.title, currentTrack.artist);
      setIsLiked(false);
    } else {
      await likeLastfmTrack(
        currentTrack.title,
        currentTrack.artist,
        currentTrack.coverUrl,
      );
      setIsLiked(true);
    }
  };

  const handleLinkFile = async (file: LocalFile) => {
    if (!currentTrack) return;
    await linkLastfmTrack(
      currentTrack.title,
      currentTrack.artist,
      file.local_file_path,
      currentTrack.coverUrl,
    );
    usePlayerStore.setState((state) => ({
      currentTrack: state.currentTrack
        ? { ...state.currentTrack, localUri: file.local_file_path }
        : null,
    }));
    closeModal();
  };

  const handleAddToPlaylist = async (playlist: Playlist) => {
    if (!currentTrack) return;
    try {
      // Cherche dans toutes les tracks
      const { findTrackByTitleAndArtist, likeLastfmTrack } =
        await import("@/db/schema");
      let found = await findTrackByTitleAndArtist(
        currentTrack.title,
        currentTrack.artist,
      );

      // Si pas trouvée, crée-la
      if (!found) {
        await likeLastfmTrack(
          currentTrack.title,
          currentTrack.artist,
          currentTrack.coverUrl,
        );
        found = await findTrackByTitleAndArtist(
          currentTrack.title,
          currentTrack.artist,
        );
      }

      if (found) await addTrackToPlaylist(playlist.id, found.id);
      closeModal();
    } catch (e) {
      console.error(e);
    }
  };

  if (!currentTrack) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0A0A0A",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: MUTED }}>Aucune piste en cours</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0A0A" }}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Top bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 20,
          }}
        >
          <View>
            <Text
              style={{
                color: MUTED,
                fontSize: 10,
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              PLAYING FROM:
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Text style={{ color: TEAL, fontSize: 14, fontWeight: "700" }}>
                {currentTrack.album || "Unknown"}
              </Text>
              <Ionicons name="chevron-down" size={14} color={TEAL} />
            </View>
          </View>
          <TouchableOpacity style={{ paddingTop: 4 }} onPress={openModal}>
            <Ionicons name="ellipsis-vertical" size={22} color="white" />
          </TouchableOpacity>
        </View>

        {/* Cover */}
        <View style={{ paddingHorizontal: 16, marginBottom: 28 }}>
          {currentTrack.coverUrl ? (
            <Image
              source={{ uri: currentTrack.coverUrl }}
              style={{
                width: COVER_SIZE,
                height: COVER_SIZE,
                borderRadius: 16,
              }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: COVER_SIZE,
                height: COVER_SIZE,
                borderRadius: 16,
                backgroundColor: "#1A1A1A",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="musical-notes" size={80} color={MUTED} />
            </View>
          )}
        </View>

        {/* Track info + like */}
        <View
          style={{
            paddingHorizontal: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: "white",
                fontSize: 26,
                fontWeight: "800",
                letterSpacing: -0.5,
              }}
              numberOfLines={1}
            >
              {currentTrack.title}
            </Text>
            <Text
              style={{ color: MUTED, fontSize: 16, marginTop: 4 }}
              numberOfLines={1}
            >
              {currentTrack.artist}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              gap: 16,
              marginLeft: 16,
              alignItems: "center",
            }}
          >
            {currentTrack.localUri && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: "#0A3A2A",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}
              >
                <Ionicons name="checkmark-circle" size={12} color={TEAL} />
                <Text style={{ color: TEAL, fontSize: 11, fontWeight: "700" }}>
                  Local
                </Text>
              </View>
            )}
            <TouchableOpacity onPress={handleToggleLike}>
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={26}
                color={isLiked ? TEAL : MUTED}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Slider */}
        <View style={{ paddingHorizontal: 16, marginBottom: 4 }}>
          <Slider
            minimumValue={0}
            maximumValue={duration || 1}
            value={position}
            onSlidingComplete={seek}
            minimumTrackTintColor={TEAL}
            maximumTrackTintColor="#2A2A2A"
            thumbTintColor={TEAL}
            style={{ height: 40 }}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: -8,
              paddingHorizontal: 4,
            }}
          >
            <Text style={{ color: MUTED, fontSize: 12 }}>
              {formatTime(position)}
            </Text>
            <Text style={{ color: MUTED, fontSize: 12 }}>
              {formatTime(duration)}
            </Text>
          </View>
        </View>

        {/* Controls */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 24,
            marginTop: 16,
            marginBottom: 20,
          }}
        >
          <TouchableOpacity
            onPress={toggleShuffle}
            style={{
              backgroundColor: isShuffle ? TEAL : "#1A1A1A",
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 8,
            }}
          >
            <Ionicons
              name="shuffle"
              size={18}
              color={isShuffle ? "black" : "white"}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={prevTrack}>
            <Ionicons name="play-skip-back" size={34} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={togglePlay}
            style={{
              width: 68,
              height: 68,
              borderRadius: 34,
              backgroundColor: TEAL,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: TEAL,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={30}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={nextTrack}>
            <Ionicons name="play-skip-forward" size={34} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleRepeat}
            style={{
              backgroundColor: repeatMode !== "none" ? TEAL : "#1A1A1A",
              borderRadius: 20,
              padding: 8,
            }}
          >
            <Ionicons
              name={repeatMode === "one" ? "repeat-sharp" : "repeat"}
              size={18}
              color={repeatMode !== "none" ? "black" : "white"}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Modale */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
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
                marginBottom: 16,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{ color: "white", fontSize: 16, fontWeight: "800" }}
                >
                  {modalView === "menu"
                    ? currentTrack.title
                    : modalView === "link"
                      ? "Link a local file"
                      : "Add to playlist"}
                </Text>
                <Text
                  style={{ color: MUTED, fontSize: 13, marginTop: 2 }}
                  numberOfLines={1}
                >
                  {currentTrack.artist}
                </Text>
              </View>
              <TouchableOpacity
                onPress={
                  modalView === "menu" ? closeModal : () => setModalView("menu")
                }
              >
                <Ionicons
                  name={modalView === "menu" ? "close" : "arrow-back"}
                  size={24}
                  color={MUTED}
                />
              </TouchableOpacity>
            </View>

            {/* Menu principal */}
            {modalView === "menu" && (
              <View>
                <TouchableOpacity
                  onPress={() => setModalView("playlist")}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                    borderBottomWidth: 0.5,
                    borderBottomColor: "#1A1A1A",
                    gap: 16,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: "#0D2B2B",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={22}
                      color={TEAL}
                    />
                  </View>
                  <Text
                    style={{ color: "white", fontSize: 15, fontWeight: "600" }}
                  >
                    Add to playlist
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={MUTED}
                    style={{ marginLeft: "auto" }}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setModalView("link")}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                    gap: 16,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: "#0D2B2B",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="link-outline" size={22} color={TEAL} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: "white",
                        fontSize: 15,
                        fontWeight: "600",
                      }}
                    >
                      Link local MP3
                    </Text>
                    {currentTrack.localUri && (
                      <Text style={{ color: TEAL, fontSize: 12, marginTop: 2 }}>
                        ✓ Already linked
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={MUTED} />
                </TouchableOpacity>
              </View>
            )}

            {/* Vue Link MP3 */}
            {modalView === "link" &&
              (localFiles.length === 0 ? (
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
                    No local MP3.{"\n"}Sync via Wi-Fi first.
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
              ))}

            {/* Vue Add to playlist */}
            {modalView === "playlist" &&
              (playlists.length === 0 ? (
                <View style={{ alignItems: "center", paddingVertical: 40 }}>
                  <Ionicons name="list-outline" size={48} color="#333" />
                  <Text
                    style={{
                      color: "#555",
                      fontSize: 14,
                      marginTop: 12,
                      textAlign: "center",
                    }}
                  >
                    No playlists yet.{"\n"}Create one in Library.
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={playlists}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleAddToPlaylist(item)}
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
                          backgroundColor: item.color ?? "#2BA8C8",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons
                          name="musical-notes"
                          size={20}
                          color="white"
                        />
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
                          {item.name}
                        </Text>
                        <Text
                          style={{ color: MUTED, fontSize: 12, marginTop: 2 }}
                        >
                          {item.track_count} songs
                        </Text>
                      </View>
                      <Ionicons name="add" size={22} color={TEAL} />
                    </TouchableOpacity>
                  )}
                />
              ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}
