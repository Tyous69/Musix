import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AlbumScreen() {
  const { artist, name } = useLocalSearchParams<{
    artist: string;
    name: string;
  }>();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Text className="text-text-primary p-4">
        {name} - {artist}
      </Text>
    </SafeAreaView>
  );
}
