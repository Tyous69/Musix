import axios from "axios";
import {
  LastfmArtist,
  LastfmAlbum,
  LastfmSearchResult,
} from "@/types/lastfm";


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
    size: "small" | "medium" | "large" | "extralarge" = "large"
  ): string | null {
    const img = images?.find((i) => i.size === size);
    return img?.["#text"] || images?.[images.length - 1]?.["#text"] || null;
  },
};