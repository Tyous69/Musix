import { usePlayerStore } from "@/stores/playerStore";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const COVER_SIZE = width - 32;

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

  const togglePlay = () => setIsPlaying(!isPlaying);
  const seek = (seconds: number) => seekFn?.(seconds);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
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
        <Text style={{ color: "#9E9E9E" }}>Aucune piste en cours</Text>
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
                  color: "#9E9E9E",
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
                <Text
                  style={{ color: "#00BFA5", fontSize: 14, fontWeight: "700" }}
                >
                  {currentTrack.album}
                </Text>
                <Ionicons name="chevron-down" size={14} color="#00BFA5" />
              </View>
            </View>
            <TouchableOpacity style={{ paddingTop: 4 }}>
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
                <Ionicons name="musical-notes" size={80} color="#9E9E9E" />
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
                style={{
                  color: "#9E9E9E",
                  fontSize: 16,
                  marginTop: 4,
                }}
                numberOfLines={1}
              >
                {currentTrack.artist}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 20, marginLeft: 16 }}>
              <TouchableOpacity>
                <Ionicons
                  name="share-social-outline"
                  size={24}
                  color="#9E9E9E"
                />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="heart-outline" size={24} color="#9E9E9E" />
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
              minimumTrackTintColor="#00BFA5"
              maximumTrackTintColor="#2A2A2A"
              thumbTintColor="#00BFA5"
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
              <Text style={{ color: "#9E9E9E", fontSize: 12 }}>
                {formatTime(position)}
              </Text>
              <Text style={{ color: "#9E9E9E", fontSize: 12 }}>
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
            {/* Shuffle avec fond sombre */}
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

            {/* Play button */}
            <TouchableOpacity
              onPress={togglePlay}
              style={{
                width: 68,
                height: 68,
                borderRadius: 34,
                backgroundColor: "#00BFA5",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#00BFA5",
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

            {/* Equalizer icon */}
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
              <Ionicons name="download-outline" size={22} color="#9E9E9E" />
            </TouchableOpacity>
          </View>

          {/* Lyrics section */}
          <View style={{ paddingHorizontal: 20 }}>
            <Text
              style={{
                color: "#9E9E9E",
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
                backgroundColor: "#00BFA5",
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
    </View>
  );
}
