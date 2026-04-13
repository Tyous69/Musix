import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <Text className="text-text-primary text-2xl font-bold p-4">Search</Text>
    </SafeAreaView>
  );
}