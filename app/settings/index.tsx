import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TEAL = "#00BFA5";
const BG = "#0A0A0A";
const HEADER_BG = "#0D2B2B";
const CARD_BG = "#1A1A1A";
const MUTED = "#9E9E9E";

export default function SettingsScreen() {
  const [wifiOnlyDownload, setWifiOnlyDownload] = useState(true);
  const [highQuality, setHighQuality] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [notifications, setNotifications] = useState(true);

  type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

  function Section({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) {
    return (
      <View style={{ marginBottom: 8 }}>
        <Text
          style={{
            color: MUTED,
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 0.8,
            textTransform: "uppercase",
            paddingHorizontal: 20,
            paddingVertical: 10,
          }}
        >
          {title}
        </Text>
        <View
          style={{
            marginHorizontal: 20,
            backgroundColor: CARD_BG,
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          {children}
        </View>
      </View>
    );
  }

  function SettingRow({
    icon,
    label,
    sublabel,
    rightElement,
    onPress,
    danger,
    last,
  }: {
    icon: IoniconsName;
    label: string;
    sublabel?: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
    danger?: boolean;
    last?: boolean;
  }) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderBottomWidth: last ? 0 : 0.5,
          borderBottomColor: "#2A2A2A",
          gap: 14,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: danger ? "#2A0A0A" : "#0D2B2B",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={icon} size={18} color={danger ? "#E05C5C" : TEAL} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: danger ? "#E05C5C" : "white",
              fontSize: 15,
              fontWeight: "600",
            }}
          >
            {label}
          </Text>
          {sublabel && (
            <Text style={{ color: MUTED, fontSize: 12, marginTop: 2 }}>
              {sublabel}
            </Text>
          )}
        </View>
        {rightElement ?? (
          onPress && <Ionicons name="chevron-forward" size={16} color={MUTED} />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={{ backgroundColor: HEADER_BG }}>
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
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={TEAL} />
            </TouchableOpacity>
            <Ionicons name="settings" size={26} color={TEAL} />
            <Text style={{ color: TEAL, fontSize: 24, fontWeight: "800" }}>
              Settings
            </Text>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}
      >
        {/* ── Account ── */}
        <Section title="Account">
          <SettingRow
            icon="person-circle-outline"
            label="Edit Profile"
            sublabel="Username & profile picture"
            onPress={() => router.push("/settings/edit-profile" as any)}
            last
          />
        </Section>

        {/* ── Playback ── */}
        <Section title="Playback">
          <SettingRow
            icon="musical-notes-outline"
            label="Audio quality"
            sublabel={highQuality ? "High (320 kbps)" : "Standard (128 kbps)"}
            rightElement={
              <Switch
                value={highQuality}
                onValueChange={setHighQuality}
                trackColor={{ false: "#2A2A2A", true: TEAL }}
                thumbColor="white"
              />
            }
          />
          <SettingRow
            icon="play-circle-outline"
            label="Autoplay"
            sublabel="Continue playing similar songs"
            rightElement={
              <Switch
                value={autoPlay}
                onValueChange={setAutoPlay}
                trackColor={{ false: "#2A2A2A", true: TEAL }}
                thumbColor="white"
              />
            }
            last
          />
        </Section>

        {/* ── Downloads & Sync ── */}
        <Section title="Downloads & Sync">
          <SettingRow
            icon="wifi-outline"
            label="Download over Wi-Fi only"
            rightElement={
              <Switch
                value={wifiOnlyDownload}
                onValueChange={setWifiOnlyDownload}
                trackColor={{ false: "#2A2A2A", true: TEAL }}
                thumbColor="white"
              />
            }
          />
          <SettingRow
            icon="server-outline"
            label="PC Server"
            sublabel="Configure Wi-Fi Sync"
            onPress={() => router.push("/wifi-sync")}
          />
          <SettingRow
            icon="folder-outline"
            label="Storage location"
            sublabel="Internal / Documents"
            last
          />
        </Section>

        {/* ── Notifications ── */}
        <Section title="Notifications">
          <SettingRow
            icon="notifications-outline"
            label="Push notifications"
            rightElement={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: "#2A2A2A", true: TEAL }}
                thumbColor="white"
              />
            }
            last
          />
        </Section>

        {/* ── About ── */}
        <Section title="About">
          <SettingRow
            icon="information-circle-outline"
            label="Version"
            sublabel="Musix 1.0.0"
          />
          <SettingRow
            icon="code-slash-outline"
            label="Last.fm API"
            sublabel="Connected"
            last
          />
        </Section>

        {/* ── Sign out ── */}
        <View
          style={{
            marginHorizontal: 20,
            backgroundColor: CARD_BG,
            borderRadius: 14,
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          <SettingRow
            icon="log-out-outline"
            label="Sign out"
            danger
            last
          />
        </View>
      </ScrollView>
    </View>
  );
}