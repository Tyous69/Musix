import { getStats } from "@/db/schema";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TEAL = "#00BFA5";
const BG = "#0A0A0A";
const CARD_BG = "#1A1A1A";
const MUTED = "#9E9E9E";

const STORAGE_KEYS = {
  USERNAME: "musix:username",
  AVATAR_URI: "musix:avatar_uri",
};

export default function ProfileScreen() {
  const [stats, setStats] = useState({
    totalTracks: 0,
    totalLinkedTracks: 0,
    totalPlaylists: 0,
    likedTracksCount: 0,
    totalListeningHours: 0,
  });
  const [username, setUsername] = useState("musix");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, []),
  );

  async function loadAll() {
    try {
      const [data, name, avatar] = await Promise.all([
        getStats(),
        AsyncStorage.getItem(STORAGE_KEYS.USERNAME),
        AsyncStorage.getItem(STORAGE_KEYS.AVATAR_URI),
      ]);
      setStats(data);
      if (name) setUsername(name);
      setAvatarUri(avatar ?? null);
    } catch (e) {
      console.error("Failed to load profile:", e);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { label: "Songs", value: stats.totalTracks.toString() },
    { label: "Playlists", value: stats.totalPlaylists.toString() },
    { label: "Hours", value: stats.totalListeningHours.toString() },
  ];

  const menuItems = [
    {
      icon: "musical-notes-outline" as const,
      label: "All Songs",
      badge:
        stats.totalLinkedTracks > 0 ? stats.totalLinkedTracks.toString() : null,
      route: "/all-songs",
    },
    {
      icon: "list-outline" as const,
      label: "Playlists",
      badge: stats.totalPlaylists > 0 ? stats.totalPlaylists.toString() : null,
      route: "/playlists",
    },
    {
      icon: "heart-outline" as const,
      label: "Liked Songs",
      badge:
        stats.likedTracksCount > 0 ? stats.likedTracksCount.toString() : null,
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
      badge: stats.totalTracks > 0 ? stats.totalTracks.toString() : null,
      route: "/downloads",
    },
    {
      icon: "settings-outline" as const,
      label: "Settings",
      badge: null,
      route: "/settings",
    },
  ];

  const initial = username ? username[0].toUpperCase() : "?";

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <LinearGradient
        colors={["#0D2B2B", "#0A0A0A"]}
        style={{ paddingBottom: 28 }}
      >
        <SafeAreaView>
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
            <Text
              style={{ color: TEAL, fontSize: 28, fontWeight: "800", flex: 1 }}
            >
              Profile
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/settings/edit-profile" as any)}
              style={{
                backgroundColor: "#1A3333",
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Ionicons name="pencil-outline" size={14} color={TEAL} />
              <Text style={{ color: TEAL, fontSize: 13, fontWeight: "700" }}>
                Edit
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: "center", paddingBottom: 4 }}>
            <TouchableOpacity
              onPress={() => router.push("/settings/edit-profile" as any)}
              activeOpacity={0.8}
            >
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={{
                    width: 86,
                    height: 86,
                    borderRadius: 43,
                    borderWidth: 2.5,
                    borderColor: TEAL,
                    marginBottom: 12,
                  }}
                />
              ) : (
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
                  <Text
                    style={{ fontSize: 32, color: TEAL, fontWeight: "800" }}
                  >
                    {initial}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <Text
              style={{
                color: "white",
                fontSize: 20,
                fontWeight: "800",
                marginBottom: 4,
              }}
            >
              {username}
            </Text>
            <Text style={{ color: MUTED, fontSize: 13 }}>
              {username.toLowerCase()}@music.local
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
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
          {loading ? (
            <View style={{ flex: 1, alignItems: "center" }}>
              <ActivityIndicator color={TEAL} />
            </View>
          ) : (
            statCards.map((s, i) => (
              <View
                key={s.label}
                style={{
                  flex: 1,
                  alignItems: "center",
                  borderRightWidth: i < statCards.length - 1 ? 0.5 : 0,
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
            ))
          )}
        </View>

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
      </ScrollView>
    </View>
  );
}
