import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { usePlayerStore } from "@/stores/playerStore";
import { useAudio } from "@/hooks/useAudio";

const { width } = Dimensions.get("window");

export default function PlayerScreen() {
  const router = useRouter();
  const { currentTrack, isPlaying, position, duration } = usePlayerStore();
  const { seek, togglePlay } = useAudio();

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (!currentTrack) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-gray-500">Aucune piste en cours</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-down" size={28} color="white" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-gray-400 text-xs uppercase tracking-widest">
            En écoute
          </Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Cover */}
      <View className="items-center mt-8 mb-10">
        {currentTrack.coverUrl ? (
          <Image
            source={{ uri: currentTrack.coverUrl }}
            style={{ width: width - 80, height: width - 80, borderRadius: 16 }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{ width: width - 80, height: width - 80, borderRadius: 16 }}
            className="bg-surface items-center justify-center"
          >
            <Ionicons name="musical-notes" size={100} color="#9E9E9E" />
          </View>
        )}
      </View>

      {/* Track info */}
      <View className="px-8 mb-6">
        <Text className="text-white text-2xl font-bold" numberOfLines={1}>
          {currentTrack.title}
        </Text>
        <Text className="text-gray-400 text-base mt-1" numberOfLines={1}>
          {currentTrack.artist}
        </Text>
      </View>

      {/* Slider */}
      <View className="px-6">
        <Slider
          minimumValue={0}
          maximumValue={duration || 1}
          value={position}
          onSlidingComplete={seek}
          minimumTrackTintColor="#FF6B35"
          maximumTrackTintColor="#333"
          thumbTintColor="#FF6B35"
        />
        <View className="flex-row justify-between mt-1">
          <Text className="text-gray-500 text-xs">{formatTime(position)}</Text>
          <Text className="text-gray-500 text-xs">{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View className="flex-row items-center justify-between px-10 mt-8">
        <TouchableOpacity>
          <Ionicons name="shuffle" size={24} color="#9E9E9E" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => usePlayerStore.getState().prevTrack()}>
          <Ionicons name="play-skip-back" size={36} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={togglePlay}
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: "#FF6B35",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => usePlayerStore.getState().nextTrack()}>
          <Ionicons name="play-skip-forward" size={36} color="white" />
        </TouchableOpacity>

        <TouchableOpacity>
          <Ionicons name="repeat" size={24} color="#9E9E9E" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}