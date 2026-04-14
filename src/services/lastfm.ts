import { LastfmAlbum, LastfmArtist, LastfmSearchResult } from "@/types/lastfm";
import axios from "axios";

const API_KEY = process.env.EXPO_PUBLIC_LASTFM_API_KEY;
console.log("🔑 API Key:", API_KEY);
const BASE_URL = "https://ws.audioscrobbler.com/2.0";

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    format: "json",
  },
});

export const lastfm = {
  async searchArtists(query: string): Promise<LastfmArtist[]> {
    const { data } = await api.get<LastfmSearchResult>("", {
      params: {
        method: "artist.search",
        artist: query,
        limit: 20,
      },
    });
    const results = data.results?.artistmatches?.artist ?? [];
    return Array.isArray(results) ? results : [results];
  },

  async getArtistInfo(name: string): Promise<LastfmArtist> {
    const { data } = await api.get("", {
      params: {
        method: "artist.getinfo",
        artist: name,
      },
    });
    return data.artist;
  },

  async getArtistTopAlbums(name: string): Promise<LastfmAlbum[]> {
    const { data } = await api.get("", {
      params: {
        method: "artist.gettopalbums",
        artist: name,
        limit: 10,
      },
    });
    return data.topalbums?.album ?? [];
  },

  async getAlbumInfo(artist: string, album: string): Promise<LastfmAlbum> {
    const { data } = await api.get("", {
      params: {
        method: "album.getinfo",
        artist,
        album,
      },
    });
    return data.album;
  },

  async searchAlbums(query: string): Promise<LastfmAlbum[]> {
    const { data } = await api.get<LastfmSearchResult>("", {
      params: {
        method: "album.search",
        album: query,
        limit: 20,
      },
    });
    const results = data.results?.albummatches?.album ?? [];
    return Array.isArray(results) ? results : [results];
  },

  getImageUrl(
    images: { "#text": string; size: string }[],
    size: "small" | "medium" | "large" | "extralarge" = "large",
  ): string | null {
    const img = images?.find((i) => i.size === size);
    return img?.["#text"] || images?.[images.length - 1]?.["#text"] || null;
  },
};

export const deezer = {
  async searchArtistImage(name: string): Promise<string | null> {
    try {
      // Prend uniquement le premier artiste si c'est un feat
      const primaryArtist = name.split(",")[0].trim();
      const { data } = await axios.get(
        `https://api.deezer.com/search/artist?q=${encodeURIComponent(primaryArtist)}&limit=1`,
      );
      return data.data?.[0]?.picture_xl ?? null;
    } catch {
      return null;
    }
  },

  async searchAlbumCover(
    artist: string,
    album: string,
  ): Promise<string | null> {
    try {
      const { data } = await axios.get(
        `https://api.deezer.com/search/album?q=${encodeURIComponent(artist + " " + album)}&limit=1`,
      );
      return data.data?.[0]?.cover_xl ?? null;
    } catch {
      return null;
    }
  },
};
