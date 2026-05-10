import { recordTrackPlay } from "@/db/schema";
import { usePlayerStore } from "@/stores/playerStore";
import { Audio } from "expo-av";
import { useCallback, useEffect, useRef } from "react";

export function useAudio() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const {
    currentTrack,
    isPlaying,
    setIsPlaying,
    setPosition,
    setDuration,
    setSeekFn,
    nextTrack,
  } = usePlayerStore();

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    });
  }, []);

  const seek = useCallback(async (seconds: number) => {
    if (!soundRef.current) return;
    await soundRef.current.setPositionAsync(seconds * 1000);
    setPosition(seconds);
  }, []);

  // Enregistre seek dans le store pour que player.tsx puisse l'utiliser
  useEffect(() => {
    setSeekFn(seek);
  }, [seek]);

  useEffect(() => {
    if (!currentTrack) return;
    const uri = currentTrack.localUri ?? currentTrack.previewUrl;
    if (!uri) return;
    let mounted = true;

    const load = async () => {
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
            // Utilise getState() pour avoir les valeurs actuelles
            const { repeatMode, nextTrack } = usePlayerStore.getState();
            if (repeatMode === "one") {
              // Rejoue depuis le début
              soundRef.current?.replayAsync();
            } else {
              nextTrack();
            }
          }
        },
      );

      if (mounted) {
        soundRef.current = sound;
        setIsPlaying(true);

        // Enregistre la track dans les récentes
        if (currentTrack) {
          recordTrackPlay({
            id: currentTrack.id,
            title: currentTrack.title,
            artist: currentTrack.artist,
            coverUrl: currentTrack.coverUrl,
          }).catch(console.error);
        }
      }
    };

    load().catch(console.error);
    return () => {
      mounted = false;
    };
  }, [currentTrack?.id]);

  useEffect(() => {
    if (!soundRef.current) return;
    soundRef.current.getStatusAsync().then((status) => {
      if (!status.isLoaded) return;
      if (isPlaying) {
        soundRef.current?.playAsync();
      } else {
        soundRef.current?.pauseAsync();
      }
    });
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  return { seek, togglePlay };
}
