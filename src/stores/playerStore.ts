import { create } from "zustand";

export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string | null;
  previewUrl: string | null; // Deezer 30s preview
  localUri: string | null;   // fichier local
};

type PlayerStore = {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  position: number;      // en secondes
  duration: number;      // en secondes
  isMinimized: boolean;  // mini player ou full screen

  setTrack: (track: Track) => void;
  setQueue: (tracks: Track[]) => void;
  setIsPlaying: (v: boolean) => void;
  setPosition: (v: number) => void;
  setDuration: (v: number) => void;
  setIsMinimized: (v: boolean) => void;
  nextTrack: () => void;
  prevTrack: () => void;
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  position: 0,
  duration: 0,
  isMinimized: true,

  setTrack: (track) => set({ currentTrack: track, position: 0 }),
  setQueue: (tracks) => set({ queue: tracks }),
  setIsPlaying: (v) => set({ isPlaying: v }),
  setPosition: (v) => set({ position: v }),
  setDuration: (v) => set({ duration: v }),
  setIsMinimized: (v) => set({ isMinimized: v }),

  nextTrack: () => {
    const { queue, currentTrack } = get();
    if (!currentTrack || queue.length === 0) return;
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    const next = queue[idx + 1] ?? queue[0];
    set({ currentTrack: next, position: 0 });
  },

  prevTrack: () => {
    const { queue, currentTrack } = get();
    if (!currentTrack || queue.length === 0) return;
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    const prev = queue[idx - 1] ?? queue[queue.length - 1];
    set({ currentTrack: prev, position: 0 });
  },
}));