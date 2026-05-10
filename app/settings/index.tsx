import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
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
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [wipeInput, setWipeInput] = useState("");
  const [username, setUsername] = useState("");
  const [wiping, setWiping] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("musix:username").then((v) => {
      if (v) setUsername(v);
    });
  }, []);

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
        {rightElement ??
          (onPress && (
            <Ionicons name="chevron-forward" size={16} color={MUTED} />
          ))}
      </TouchableOpacity>
    );
  }

  const handleWipe = async () => {
    setWiping(true);
    try {
      const { wipeAllData } = await import("@/db/schema");
      await wipeAllData();
      setShowWipeModal(false);
      setWipeInput("");
      router.replace("/(tabs)" as any);
    } catch (e) {
      Alert.alert("Error", "Failed to delete data. Please try again.");
    } finally {
      setWiping(false);
    }
  };

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
        <Section title="Account">
          <SettingRow
            icon="person-circle-outline"
            label="Edit Profile"
            sublabel="Username & profile picture"
            onPress={() => router.push("/settings/edit-profile" as any)}
            last
          />
        </Section>

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

        <Section title="Danger Zone">
          <SettingRow
            icon="trash-outline"
            label="Delete all data"
            sublabel="Wipe everything — irreversible"
            danger
            last
            onPress={() => setShowWipeModal(true)}
          />
        </Section>
      </ScrollView>

      {/* Modal wipe */}
      <Modal
        visible={showWipeModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowWipeModal(false);
          setWipeInput("");
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.85)",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: "#141414",
              borderRadius: 20,
              padding: 24,
              width: "100%",
            }}
          >
            <Ionicons
              name="warning-outline"
              size={40}
              color="#E05C5C"
              style={{ alignSelf: "center", marginBottom: 12 }}
            />
            <Text
              style={{
                color: "white",
                fontSize: 18,
                fontWeight: "800",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Delete all data?
            </Text>
            <Text
              style={{
                color: MUTED,
                fontSize: 13,
                textAlign: "center",
                marginBottom: 20,
                lineHeight: 20,
              }}
            >
              This will permanently delete all your downloads, playlists, likes
              and profile. This cannot be undone.{"\n\n"}
              Type your username{" "}
              <Text style={{ color: "#E05C5C", fontWeight: "700" }}>
                "{username}"
              </Text>{" "}
              to confirm.
            </Text>
            <TextInput
              value={wipeInput}
              onChangeText={setWipeInput}
              placeholder={username || "your username"}
              placeholderTextColor="#444"
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                backgroundColor: "#1A1A1A",
                borderRadius: 10,
                padding: 14,
                color: "white",
                fontSize: 15,
                marginBottom: 16,
                borderWidth: 1,
                borderColor:
                  wipeInput === username && username.length > 0
                    ? "#E05C5C"
                    : "#2A2A2A",
              }}
            />
            <TouchableOpacity
              disabled={
                wipeInput !== username || wiping || username.length === 0
              }
              onPress={handleWipe}
              style={{
                backgroundColor:
                  wipeInput === username && username.length > 0
                    ? "#E05C5C"
                    : "#2A1A1A",
                borderRadius: 12,
                padding: 14,
                alignItems: "center",
                marginBottom: 8,
                opacity:
                  wipeInput !== username || username.length === 0 ? 0.5 : 1,
              }}
            >
              {wiping ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  style={{ color: "white", fontWeight: "800", fontSize: 15 }}
                >
                  Delete everything
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowWipeModal(false);
                setWipeInput("");
              }}
              style={{ padding: 12, alignItems: "center" }}
            >
              <Text style={{ color: MUTED, fontSize: 14 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
