import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TEAL = "#00BFA5";
const BG = "#0A0A0A";
const CARD_BG = "#1A1A1A";
const MUTED = "#9E9E9E";

const stats = [
  { label: "Songs", value: "248" },
  { label: "Playlists", value: "12" },
  { label: "Hours", value: "340" },
];

const menuItems = [
  {
    icon: "musical-notes-outline" as const,
    label: "All Songs",
    badge: "248",
    route: "/all-songs",
  },
  {
    icon: "list-outline" as const,
    label: "Playlists",
    badge: "12",
    route: "/playlists",
  },
  {
    icon: "heart-outline" as const,
    label: "Liked Songs",
    badge: "34",
    route: "/liked-songs",
  },
  {
    icon: "wifi-outline" as const,
    label: "Wi-Fi Sync",
    badge: null,
    route: "/wifi-sync",
  },
  {
    icon: "download-outline" as const,
    label: "Downloads",
    badge: null,
    route: "/downloads",
  },
  {
    icon: "settings-outline" as const,
    label: "Settings",
    badge: null,
    route: "/settings",
  },
];

export default function ProfileScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Même LinearGradient que search.tsx */}
      <LinearGradient
        colors={["#0D2B2B", "#0A0A0A"]}
        style={{ paddingBottom: 28 }}
      >
        <SafeAreaView>
          {/* Titre */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 20,
              gap: 10,
            }}
          >
            <Ionicons name="person" size={28} color={TEAL} />
            <Text style={{ color: TEAL, fontSize: 28, fontWeight: "800" }}>
              Profile
            </Text>
          </View>

          {/* Avatar centré dans le gradient */}
          <View style={{ alignItems: "center", paddingBottom: 4 }}>
            <View
              style={{
                width: 86,
                height: 86,
                borderRadius: 43,
                borderWidth: 2.5,
                borderColor: TEAL,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#1A3333",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 32, color: TEAL, fontWeight: "800" }}>
                C
              </Text>
            </View>
            <Text
              style={{
                color: "white",
                fontSize: 20,
                fontWeight: "800",
                marginBottom: 4,
              }}
            >
              chandrama
            </Text>
            <Text style={{ color: MUTED, fontSize: 13 }}>
              chandrama@music.local
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Stats */}
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: 20,
            marginTop: 20,
            marginBottom: 16,
            backgroundColor: CARD_BG,
            borderRadius: 14,
            padding: 20,
          }}
        >
          {stats.map((s, i) => (
            <View
              key={s.label}
              style={{
                flex: 1,
                alignItems: "center",
                borderRightWidth: i < stats.length - 1 ? 0.5 : 0,
                borderRightColor: "#2A2A2A",
              }}
            >
              <Text
                style={{
                  color: TEAL,
                  fontSize: 22,
                  fontWeight: "800",
                  marginBottom: 2,
                }}
              >
                {s.value}
              </Text>
              <Text style={{ color: MUTED, fontSize: 12 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View
          style={{
            marginHorizontal: 20,
            backgroundColor: CARD_BG,
            borderRadius: 14,
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => router.push(item.route as any)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 15,
                paddingHorizontal: 16,
                borderBottomWidth: i < menuItems.length - 1 ? 0.5 : 0,
                borderBottomColor: "#2A2A2A",
                gap: 14,
              }}
              activeOpacity={0.7}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: "#0D2B2B",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name={item.icon} size={18} color={TEAL} />
              </View>
              <Text
                style={{
                  flex: 1,
                  color: "white",
                  fontSize: 15,
                  fontWeight: "600",
                }}
              >
                {item.label}
              </Text>
              {item.badge && (
                <View
                  style={{
                    backgroundColor: "#0D2B2B",
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{ color: TEAL, fontSize: 12, fontWeight: "700" }}
                  >
                    {item.badge}
                  </Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={16} color={MUTED} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity
          style={{
            marginHorizontal: 20,
            paddingVertical: 14,
            borderRadius: 12,
            borderWidth: 0.5,
            borderColor: "#3A1A1A",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
            backgroundColor: CARD_BG,
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={18} color="#E05C5C" />
          <Text style={{ color: "#E05C5C", fontSize: 14, fontWeight: "700" }}>
            Sign out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
