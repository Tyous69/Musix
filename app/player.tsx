import {
  View, Text, Image, TouchableOpacity, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { usePlayerStore } from "@/stores/playerStore";

const { width } = Dimensions.get("window");

export default function PlayerScreen() {
  const router = useRouter();
  const {
    currentTrack, isPlaying, position, duration,
    setIsPlaying, seekFn, nextTrack, prevTrack,
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
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-gray-500">Aucune piste en cours</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-row items-center justify-between px-4 py-2">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-down" size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-gray-400 text-xs uppercase tracking-widest">
          En écoute
        </Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color="white" />
        </TouchableOpacity>
      </View>

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

      <View className="px-8 mb-6">
        <Text className="text-white text-2xl font-bold" numberOfLines={1}>
          {currentTrack.title}
        </Text>
        <Text className="text-gray-400 text-base mt-1" numberOfLines={1}>
          {currentTrack.artist}
        </Text>
      </View>

      <View className="px-6">
        <Slider
          minimumValue={0}
          maximumValue={duration || 1}
          value={position}
          onSlidingComplete={seek}
          minimumTrackTintColor="#00BFA5"
          maximumTrackTintColor="#333"
          thumbTintColor="#00BFA5"
        />
        <View className="flex-row justify-between mt-1">
          <Text className="text-gray-500 text-xs">{formatTime(position)}</Text>
          <Text className="text-gray-500 text-xs">{formatTime(duration)}</Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between px-10 mt-8">
        <TouchableOpacity>
          <Ionicons name="shuffle" size={24} color="#9E9E9E" />
        </TouchableOpacity>
        <TouchableOpacity onPress={prevTrack}>
          <Ionicons name="play-skip-back" size={36} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={togglePlay}
          style={{
            width: 64, height: 64, borderRadius: 32,
            backgroundColor: "#00BFA5",
            alignItems: "center", justifyContent: "center",
          }}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={nextTrack}>
          <Ionicons name="play-skip-forward" size={36} color="white" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="repeat" size={24} color="#9E9E9E" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}