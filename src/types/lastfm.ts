export interface LastfmArtist {
  name: string;
  mbid: string;
  url: string;
  image: LastfmImage[];
  listeners?: string;
  playcount?: string;
  bio?: {
    summary: string;
    content: string;
  };
}

export interface LastfmAlbum {
  name: string;
  artist: string;
  mbid: string;
  url: string;
  image: LastfmImage[];
  tracks?: {
    track: LastfmTrack | LastfmTrack[];
  };
}

export interface LastfmTrack {
  name: string;
  mbid: string;
  url: string;
  duration: string;
  artist: {
    name: string;
    mbid: string;
  };
}

export interface LastfmImage {
  "#text": string;
  size: "small" | "medium" | "large" | "extralarge" | "mega" | "";
}

export interface LastfmSearchResult {
  results: {
    artistmatches?: {
      artist: LastfmArtist[];
    };
    albummatches?: {
      album: LastfmAlbum[];
    };
  };
}