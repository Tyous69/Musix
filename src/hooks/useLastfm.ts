import { useQuery } from "@tanstack/react-query";
import { lastfm } from "@/services/lastfm";

export function useSearchArtists(query: string) {
  return useQuery({
    queryKey: ["artists", "search", query],
    queryFn: () => lastfm.searchArtists(query),
    enabled: query.length > 1,
    staleTime: 1000 * 60 * 5,
  });
}

export function useArtistInfo(name: string) {
  return useQuery({
    queryKey: ["artist", name],
    queryFn: () => lastfm.getArtistInfo(name),
    enabled: !!name,
    staleTime: 1000 * 60 * 10,
  });
}

export function useArtistTopAlbums(name: string) {
  return useQuery({
    queryKey: ["artist", name, "albums"],
    queryFn: () => lastfm.getArtistTopAlbums(name),
    enabled: !!name,
    staleTime: 1000 * 60 * 10,
  });
}

export function useAlbumInfo(artist: string, album: string) {
  return useQuery({
    queryKey: ["album", artist, album],
    queryFn: () => lastfm.getAlbumInfo(artist, album),
    enabled: !!artist && !!album,
    staleTime: 1000 * 60 * 10,
  });
}