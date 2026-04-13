export interface Artist {
  id: number;
  lastfm_mbid: string | null;
  name: string;
  bio_summary: string | null;
  image_url: string | null;
  created_at: number;
}

export interface Album {
  id: number;
  artist_id: number;
  lastfm_mbid: string | null;
  title: string;
  cover_url: string | null;
  release_year: number | null;
}

export interface Track {
  id: number;
  artist_id: number;
  album_id: number | null;
  title: string;
  lastfm_mbid: string | null;
  local_file_path: string | null;
  duration_ms: number | null;
  play_count: number;
  added_at: number;
}

export interface Playlist {
  id: number;
  name: string;
  cover_url: string | null;
  created_at: number;
  updated_at: number;
}

export interface PlaylistTrack {
  id: number;
  playlist_id: number;
  track_id: number;
  position: number;
}