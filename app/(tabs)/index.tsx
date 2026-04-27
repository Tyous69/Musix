import { usePlayerStore } from "@/stores/playerStore";
import { Ionicons } from "@expo/vector-icons";
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const CONTINUE_LISTENING = [
  { title: "Coffee & Jazz", color: "#2A1F1A" },
  { title: "RELEASED", color: "#1A2A1A" },
  { title: "Anything Goes", color: "#1A1A2A" },
  { title: "Anime OSTs", color: "#2A1A1A" },
  { title: "Harry's House", color: "#2A2A1A" },
  { title: "Lo-Fi Beats", color: "#1A2A2A" },
];

const TOP_MIXES = [
  { title: "Pop Mix", color: "#C13A5F" },
  { title: "Chill Mix", color: "#C8A820" },
  { title: "Kpop Mix", color: "#3AC87B" },
];

export default function HomeScreen() {
  const { currentTrack } = usePlayerStore();

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0A0A" }}>
      <SafeAreaView>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 20,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#1A1A1A",
              borderWidth: 2,
              borderColor: "#00BFA5",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <Ionicons name="person" size={24} color="#9E9E9E" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: "white", fontSize: 18, fontWeight: "800" }}>
              Welcome back !
            </Text>
            <Text style={{ color: "#9E9E9E", fontSize: 13, marginTop: 1 }}>
              musix
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <TouchableOpacity>
              <Ionicons name="bar-chart" size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="notifications-outline" size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="settings-outline" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Continue Listening */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <Text
            style={{
              color: "white",
              fontSize: 22,
              fontWeight: "800",
              marginBottom: 16,
            }}
          >
            Continue Listening
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {CONTINUE_LISTENING.map((item) => (
              <TouchableOpacity
                key={item.title}
                style={{
                  width: (width - 52) / 2,
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#1A1A1A",
                  borderRadius: 8,
                  overflow: "hidden",
                  height: 56,
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    backgroundColor: item.color,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="musical-notes" size={22} color="#9E9E9E" />
                </View>
                <Text
                  style={{
                    color: "white",
                    fontSize: 13,
                    fontWeight: "600",
                    flex: 1,
                    paddingHorizontal: 10,
                  }}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Your Top Mixes */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              color: "white",
              fontSize: 22,
              fontWeight: "800",
              marginBottom: 16,
              paddingHorizontal: 20,
            }}
          >
            Your Top Mixes
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          >
            {TOP_MIXES.map((mix) => (
              <TouchableOpacity
                key={mix.title}
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: 12,
                  backgroundColor: "#1A1A1A",
                  overflow: "hidden",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    padding: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: "white",
                      opacity: 0.3,
                    }}
                  />
                  <Text
                    style={{ color: "white", fontSize: 15, fontWeight: "800" }}
                  >
                    {mix.title}
                  </Text>
                </View>
                <View style={{ height: 4, backgroundColor: mix.color }} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Based on your recent listening */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <Text
            style={{
              color: "white",
              fontSize: 22,
              fontWeight: "800",
              marginBottom: 16,
            }}
          >
            Based on your recent listening
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {[{ color: "#2A1F10" }, { color: "#1A1A3A" }].map((item, i) => (
              <TouchableOpacity
                key={i}
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  borderRadius: 12,
                  backgroundColor: item.color,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="musical-notes" size={40} color="#333" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}
