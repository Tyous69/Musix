import { getAllTracks, linkLastfmTrack } from "@/db/schema";
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
  ScrollView,
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
  } = usePlayerStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);

  useEffect(() => {
    if (modalVisible) {
      getAllTracks().then(setLocalFiles).catch(console.error);
    }
  }, [modalVisible]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const seek = (seconds: number) => seekFn?.(seconds);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleLinkFile = async (file: LocalFile) => {
    if (!currentTrack) return;
    await linkLastfmTrack(
      currentTrack.title,
      currentTrack.artist,
      file.local_file_path,
    );
    usePlayerStore.setState((state) => ({
      currentTrack: state.currentTrack
        ? { ...state.currentTrack, localUri: file.local_file_path }
        : null,
    }));
    setModalVisible(false);
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
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
                PLAYING FROM PLAYLIST:
              </Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Text style={{ color: TEAL, fontSize: 14, fontWeight: "700" }}>
                  {currentTrack.album}
                </Text>
                <Ionicons name="chevron-down" size={14} color={TEAL} />
              </View>
            </View>
            {/* 👇 Ouvre la modale de liaison */}
            <TouchableOpacity
              style={{ paddingTop: 4 }}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="ellipsis-vertical" size={22} color="white" />
            </TouchableOpacity>
          </View>

          {/* Cover Art */}
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

          {/* Track info */}
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
                gap: 20,
                marginLeft: 16,
                alignItems: "center",
              }}
            >
              {/* Indicateur fichier local */}
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
                  <Text
                    style={{ color: TEAL, fontSize: 11, fontWeight: "700" }}
                  >
                    Local
                  </Text>
                </View>
              )}
              <TouchableOpacity>
                <Ionicons name="share-social-outline" size={24} color={MUTED} />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="heart-outline" size={24} color={MUTED} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Progress bar */}
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
              style={{
                backgroundColor: "#1A1A1A",
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 8,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Ionicons name="shuffle" size={18} color="white" />
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
              style={{
                backgroundColor: "#1A1A1A",
                borderRadius: 20,
                padding: 8,
              }}
            >
              <Ionicons name="add" size={18} color="white" />
            </TouchableOpacity>
          </View>

          {/* Download */}
          <View
            style={{
              alignItems: "flex-end",
              paddingHorizontal: 24,
              marginBottom: 28,
            }}
          >
            <TouchableOpacity>
              <Ionicons name="download-outline" size={22} color={MUTED} />
            </TouchableOpacity>
          </View>

          {/* Lyrics */}
          <View style={{ paddingHorizontal: 20 }}>
            <Text
              style={{
                color: MUTED,
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 2,
                marginBottom: 12,
              }}
            >
              LYRICS
            </Text>
            <View
              style={{
                borderRadius: 20,
                overflow: "hidden",
                backgroundColor: TEAL,
                padding: 24,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 20,
                  fontWeight: "800",
                  lineHeight: 32,
                }}
              >
                {"Lyrics not available\nfor this track"}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Modale liaison MP3 */}
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
                  Lier un fichier local
                </Text>
                <Text
                  style={{ color: MUTED, fontSize: 13, marginTop: 2 }}
                  numberOfLines={1}
                >
                  {currentTrack.title}
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
                  Aucun MP3 local.{"\n"}Sync via Wi-Fi d'abord.
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
