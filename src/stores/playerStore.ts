import { create } from "zustand";

export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string | null;
  previewUrl: string | null;
  localUri: string | null;
};

type PlayerStore = {
  currentTrack: Track | null;
  queue: Track[];
  originalQueue: Track[]; // queue originale pour le shuffle
  isPlaying: boolean;
  position: number;
  duration: number;
  isMinimized: boolean;
  seekFn: ((seconds: number) => void) | null;
  isShuffle: boolean;
  repeatMode: "none" | "all" | "one";

  setTrack: (track: Track) => void;
  setQueue: (tracks: Track[]) => void;
  setIsPlaying: (v: boolean) => void;
  setPosition: (v: number) => void;
  setDuration: (v: number) => void;
  setIsMinimized: (v: boolean) => void;
  setSeekFn: (fn: (seconds: number) => void) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  nextTrack: () => Promise<void>;
  prevTrack: () => Promise<void>;
};

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  queue: [],
  originalQueue: [],
  isPlaying: false,
  position: 0,
  duration: 0,
  isMinimized: true,
  seekFn: null,
  isShuffle: false,
  repeatMode: "none",

  setTrack: (track) => set({ currentTrack: track, position: 0 }),

  setQueue: (tracks) =>
    set({
      queue: tracks,
      originalQueue: tracks,
    }),

  setIsPlaying: (v) => set({ isPlaying: v }),
  setPosition: (v) => set({ position: v }),
  setDuration: (v) => set({ duration: v }),
  setIsMinimized: (v) => set({ isMinimized: v }),
  setSeekFn: (fn) => set({ seekFn: fn }),

  toggleShuffle: () => {
    const { isShuffle, queue, originalQueue, currentTrack } = get();
    if (!isShuffle) {
      // Active shuffle — mélange la queue en gardant la track courante en premier
      const rest = queue.filter((t) => t.id !== currentTrack?.id);
      const shuffled = shuffleArray(rest);
      const newQueue = currentTrack ? [currentTrack, ...shuffled] : shuffled;
      set({ isShuffle: true, queue: newQueue });
    } else {
      // Désactive shuffle — restaure la queue originale
      set({ isShuffle: false, queue: originalQueue });
    }
  },

  toggleRepeat: () => {
    const { repeatMode } = get();
    const next =
      repeatMode === "none" ? "all" : repeatMode === "all" ? "one" : "none";
    set({ repeatMode: next });
  },

  nextTrack: async () => {
    const { queue, currentTrack, repeatMode } = get();
    if (!currentTrack || queue.length === 0) return;
    const idx = queue.findIndex((t) => t.id === currentTrack.id);

    // Repeat one — rejoue la même track
    if (repeatMode === "one") {
      set({ currentTrack: { ...currentTrack }, position: 0 });
      return;
    }

    const isLast = idx === queue.length - 1;

    // Repeat none et dernière track — stop
    if (repeatMode === "none" && isLast) {
      set({ isPlaying: false, position: 0 });
      return;
    }

    const nextIdx = isLast ? 0 : idx + 1;
    let next = queue[nextIdx];

    // Fetch preview auto si pas de localUri ni previewUrl
    if (!next.localUri && !next.previewUrl) {
      try {
        const { deezer } = await import("@/services/lastfm");
        const previewUrl = await deezer.searchTrackPreview(
          next.artist,
          next.title,
        );
        if (previewUrl) {
          next = { ...next, previewUrl };
          const newQueue = [...queue];
          newQueue[nextIdx] = next;
          set({ queue: newQueue });
        }
      } catch (e) {}
    }

    set({ currentTrack: next, position: 0 });
  },

  prevTrack: async () => {
    const { queue, currentTrack, position } = get();
    if (!currentTrack || queue.length === 0) return;

    // Si plus de 3 secondes jouées — revient au début de la track
    if (position > 3) {
      set({ position: 0 });
      get().seekFn?.(0);
      return;
    }

    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    const prevIdx = idx - 1 >= 0 ? idx - 1 : queue.length - 1;
    let prev = queue[prevIdx];

    if (!prev.localUri && !prev.previewUrl) {
      try {
        const { deezer } = await import("@/services/lastfm");
        const previewUrl = await deezer.searchTrackPreview(
          prev.artist,
          prev.title,
        );
        if (previewUrl) {
          prev = { ...prev, previewUrl };
          const newQueue = [...queue];
          newQueue[prevIdx] = prev;
          set({ queue: newQueue });
        }
      } catch (e) {}
    }

    set({ currentTrack: prev, position: 0 });
  },
}));
