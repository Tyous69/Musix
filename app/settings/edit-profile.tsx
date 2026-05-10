import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TEAL = "#00BFA5";
const BG = "#0A0A0A";
const CARD_BG = "#1A1A1A";
const MUTED = "#9E9E9E";

export const STORAGE_KEYS = {
  USERNAME: "musix:username",
  AVATAR_URI: "musix:avatar_uri",
};

export default function EditProfileScreen() {
  const [username, setUsername] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const [name, avatar] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USERNAME),
        AsyncStorage.getItem(STORAGE_KEYS.AVATAR_URI),
      ]);
      if (name) setUsername(name);
      if (avatar) setAvatarUri(avatar);
    } catch (e) {
      console.error("Failed to load profile:", e);
    } finally {
      setLoading(false);
    }
  }

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow access to your photos to set a profile picture.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  }

  async function saveProfile() {
    if (!username.trim()) {
      Alert.alert("Username required", "Please enter a username.");
      return;
    }
    setSaving(true);
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USERNAME, username.trim()),
        avatarUri
          ? AsyncStorage.setItem(STORAGE_KEYS.AVATAR_URI, avatarUri)
          : AsyncStorage.removeItem(STORAGE_KEYS.AVATAR_URI),
      ]);
      router.back();
    } catch (e) {
      Alert.alert("Error", "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const initial = username ? username[0].toUpperCase() : "?";

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: BG, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={TEAL} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: BG }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <LinearGradient colors={["#0D2B2B", "#0A0A0A"]} style={{ paddingBottom: 32 }}>
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
            <Text style={{ color: TEAL, fontSize: 24, fontWeight: "800", flex: 1 }}>
              Edit Profile
            </Text>
            <TouchableOpacity onPress={saveProfile} disabled={saving}>
              {saving ? (
                <ActivityIndicator color={TEAL} size="small" />
              ) : (
                <Text style={{ color: TEAL, fontSize: 16, fontWeight: "700" }}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <View style={{ alignItems: "center" }}>
            <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
              <View style={{ position: "relative" }}>
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: 48,
                      borderWidth: 2.5,
                      borderColor: TEAL,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: 48,
                      borderWidth: 2.5,
                      borderColor: TEAL,
                      backgroundColor: "#1A3333",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 36, color: TEAL, fontWeight: "800" }}>
                      {initial}
                    </Text>
                  </View>
                )}
                {/* Overlay caméra */}
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: TEAL,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 2,
                    borderColor: BG,
                  }}
                >
                  <Ionicons name="camera" size={14} color="black" />
                </View>
              </View>
            </TouchableOpacity>
            <Text style={{ color: MUTED, fontSize: 13, marginTop: 10 }}>
              Tap to change photo
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Form */}
      <View style={{ paddingHorizontal: 20, paddingTop: 28 }}>
        <Text
          style={{
            color: MUTED,
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 0.8,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Username
        </Text>
        <View
          style={{
            backgroundColor: CARD_BG,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            borderWidth: 1,
            borderColor: "#2A2A2A",
          }}
        >
          <Ionicons name="person-outline" size={18} color={MUTED} />
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            placeholderTextColor={MUTED}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={30}
            style={{
              flex: 1,
              color: "white",
              fontSize: 16,
              fontWeight: "500",
            }}
          />
          {username.length > 0 && (
            <Text style={{ color: MUTED, fontSize: 12 }}>
              {username.length}/30
            </Text>
          )}
        </View>

        {/* Bouton Save principal */}
        <TouchableOpacity
          onPress={saveProfile}
          disabled={saving}
          style={{
            marginTop: 32,
            backgroundColor: TEAL,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
            opacity: saving ? 0.7 : 1,
          }}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="black" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="black" />
              <Text style={{ color: "black", fontSize: 16, fontWeight: "800" }}>
                Save Profile
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Supprimer la photo */}
        {avatarUri && (
          <TouchableOpacity
            onPress={() => setAvatarUri(null)}
            style={{ marginTop: 12, alignItems: "center", paddingVertical: 10 }}
            activeOpacity={0.7}
          >
            <Text style={{ color: "#E05C5C", fontSize: 14, fontWeight: "600" }}>
              Remove profile picture
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
