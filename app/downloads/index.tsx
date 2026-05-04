import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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

type SyncFile = {
  id: string;
  name: string;
  size: string;
  status: "idle" | "downloading" | "done";
};

const MOCK_FILES: SyncFile[] = [
  { id: "1", name: "Blue Bird - Ikimono-gakari.mp3", size: "8.2 MB", status: "idle" },
  { id: "2", name: "Gurenge - LiSA.mp3", size: "7.1 MB", status: "idle" },
  { id: "3", name: "Silhouette - KANA-BOON.mp3", size: "6.8 MB", status: "idle" },
  { id: "4", name: "Rain - Sid.mp3", size: "9.4 MB", status: "idle" },
  { id: "5", name: "Unravel - TK.mp3", size: "7.6 MB", status: "idle" },
];

export default function WifiSyncScreen() {
  const [ip, setIp] = useState("");
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [files, setFiles] = useState<SyncFile[]>([]);
  const [error, setError] = useState("");

  async function connect() {
    if (!ip.trim()) return;
    setConnecting(true);
    setError("");
    // Simulate connection attempt
    await new Promise((r) => setTimeout(r, 1500));
    if (ip.trim() === "192.168.1.0") {
      setError("Cannot reach server. Check the IP and make sure the PC server is running.");
      setConnecting(false);
      return;
    }
    setFiles(MOCK_FILES);
    setConnected(true);
    setConnecting(false);
  }

  function disconnect() {
    setConnected(false);
    setFiles([]);
    setIp("");
  }

  function downloadFile(id: string) {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "downloading" } : f))
    );
    setTimeout(() => {
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: "done" } : f))
      );
    }, 2000);
  }

  function downloadAll() {
    const idleIds = files.filter((f) => f.status === "idle").map((f) => f.id);
    idleIds.forEach((id) => downloadFile(id));
  }

  function renderFile({ item }: { item: SyncFile }) {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderBottomWidth: 0.5,
          borderBottomColor: "#1A1A1A",
          gap: 12,
        }}
      >
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 8,
            backgroundColor: CARD_BG,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="musical-note" size={20} color={TEAL} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{ color: "white", fontSize: 13, fontWeight: "600" }}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text style={{ color: MUTED, fontSize: 12, marginTop: 2 }}>
            {item.size}
          </Text>
        </View>

        {item.status === "idle" && (
          <TouchableOpacity
            onPress={() => downloadFile(item.id)}
            style={{
              borderWidth: 0.5,
              borderColor: TEAL,
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: TEAL, fontSize: 12, fontWeight: "700" }}>
              Get
            </Text>
          </TouchableOpacity>
        )}
        {item.status === "downloading" && (
          <ActivityIndicator size="small" color={TEAL} />
        )}
        {item.status === "done" && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Ionicons name="checkmark-circle" size={20} color={TEAL} />
            <Text style={{ color: TEAL, fontSize: 12, fontWeight: "700" }}>
              Saved
            </Text>
          </View>
        )}
      </View>
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
            <Ionicons name="wifi" size={26} color={TEAL} />
            <Text style={{ color: TEAL, fontSize: 24, fontWeight: "800", flex: 1 }}>
              Wi-Fi Sync
            </Text>
            {connected && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: "#0A3A2A",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 20,
                }}
              >
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 4,
                    backgroundColor: TEAL,
                  }}
                />
                <Text style={{ color: TEAL, fontSize: 12, fontWeight: "700" }}>
                  Connected
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>

      {!connected ? (
        <View style={{ padding: 24 }}>
          {/* Instructions */}
          <View
            style={{
              backgroundColor: "#0D2B2B",
              borderRadius: 14,
              padding: 16,
              marginBottom: 24,
              gap: 10,
            }}
          >
            <Text style={{ color: TEAL, fontSize: 14, fontWeight: "700", marginBottom: 4 }}>
              How to connect
            </Text>
            {[
              "1. Launch the PC server (node server.js)",
              "2. Make sure your phone & PC are on the same Wi-Fi",
              "3. Enter the IP shown in the PC terminal",
            ].map((t) => (
              <Text key={t} style={{ color: MUTED, fontSize: 13, lineHeight: 20 }}>
                {t}
              </Text>
            ))}
          </View>

          <Text style={{ color: MUTED, fontSize: 13, marginBottom: 8 }}>
            PC Server IP address
          </Text>
          <View
            style={{
              backgroundColor: CARD_BG,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderWidth: 0.5,
              borderColor: "#2A2A2A",
              marginBottom: 12,
            }}
          >
            <Ionicons name="desktop-outline" size={18} color={MUTED} style={{ marginRight: 10 }} />
            <TextInput
              style={{ flex: 1, color: "white", fontSize: 16, fontFamily: "monospace" }}
              placeholder="192.168.1.XX"
              placeholderTextColor="#444"
              value={ip}
              onChangeText={setIp}
              keyboardType="numeric"
              autoCorrect={false}
            />
          </View>

          {error !== "" && (
            <View
              style={{
                backgroundColor: "#2A0A0A",
                borderRadius: 10,
                padding: 12,
                marginBottom: 16,
                flexDirection: "row",
                gap: 8,
                alignItems: "center",
              }}
            >
              <Ionicons name="alert-circle" size={16} color="#E05C5C" />
              <Text style={{ color: "#E05C5C", fontSize: 13, flex: 1 }}>
                {error}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={connect}
            disabled={connecting || !ip.trim()}
            style={{
              backgroundColor: ip.trim() ? TEAL : "#1A3A35",
              paddingVertical: 15,
              borderRadius: 14,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {connecting ? (
              <ActivityIndicator size="small" color="black" />
            ) : (
              <Ionicons name="wifi" size={18} color={ip.trim() ? "black" : MUTED} />
            )}
            <Text
              style={{
                color: ip.trim() ? "black" : MUTED,
                fontWeight: "700",
                fontSize: 15,
              }}
            >
              {connecting ? "Connecting..." : "Connect"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Server info bar */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderBottomWidth: 0.5,
              borderBottomColor: "#1A1A1A",
              gap: 10,
            }}
          >
            <Ionicons name="desktop-outline" size={16} color={MUTED} />
            <Text style={{ color: MUTED, fontSize: 13, flex: 1 }}>
              {ip} — {files.length} files available
            </Text>
            <TouchableOpacity onPress={downloadAll}>
              <Text style={{ color: TEAL, fontSize: 13, fontWeight: "700" }}>
                Get all
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={disconnect}
              style={{ marginLeft: 8, padding: 4 }}
            >
              <Ionicons name="close-circle" size={18} color="#E05C5C" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={files}
            keyExtractor={(item) => item.id}
            renderItem={renderFile}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          />
        </>
      )}
    </View>
  );
}
