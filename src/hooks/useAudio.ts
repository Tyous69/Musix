import { useEffect, useRef, useCallback } from "react";
import { Audio } from "expo-av";
import { usePlayerStore } from "@/stores/playerStore";

export function useAudio() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const {
    currentTrack,
    isPlaying,
    setIsPlaying,
    setPosition,
    setDuration,
    nextTrack,
  } = usePlayerStore();

  // Configure audio session une seule fois
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    });
  }, []);

  // Charge et joue quand currentTrack change
  useEffect(() => {
    if (!currentTrack) return;

    const uri = currentTrack.localUri ?? currentTrack.previewUrl;
    if (!uri) return;

    let mounted = true;

    const load = async () => {
      // Décharge le son précédent
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, progressUpdateIntervalMillis: 500 },
        (status) => {
          if (!mounted || !status.isLoaded) return;
          setPosition(Math.floor(status.positionMillis / 1000));
          setDuration(Math.floor((status.durationMillis ?? 0) / 1000));
          if (status.didJustFinish) {
            nextTrack();
          }
        }
      );

      if (mounted) {
        soundRef.current = sound;
        setIsPlaying(true);
      }
    };

    load().catch(console.error);

    return () => {
      mounted = false;
    };
  }, [currentTrack?.id]);

  // Play / Pause
  useEffect(() => {
    if (!soundRef.current) return;
    if (isPlaying) {
      soundRef.current.playAsync();
    } else {
      soundRef.current.pauseAsync();
    }
  }, [isPlaying]);

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  const seek = useCallback(async (seconds: number) => {
    if (!soundRef.current) return;
    await soundRef.current.setPositionAsync(seconds * 1000);
    setPosition(seconds);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  return { seek, togglePlay };
}