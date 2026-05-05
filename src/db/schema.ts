import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync("musix.db");
  }
  return db;
}

export async function initDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS artists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lastfm_mbid TEXT,
      name TEXT NOT NULL,
      bio_summary TEXT,
      image_url TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
    CREATE TABLE IF NOT EXISTS albums (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      artist_id INTEGER,
      lastfm_mbid TEXT,
      title TEXT NOT NULL,
      cover_url TEXT,
      release_year INTEGER,
      FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS tracks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      artist_id INTEGER,
      album_id INTEGER,
      title TEXT NOT NULL,
      lastfm_mbid TEXT,
      local_file_path TEXT,
      duration_ms INTEGER,
      play_count INTEGER DEFAULT 0,
      added_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE,
      FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS playlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      cover_url TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
    CREATE TABLE IF NOT EXISTS playlist_tracks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      playlist_id INTEGER NOT NULL,
      track_id INTEGER NOT NULL,
      position INTEGER NOT NULL,
      FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
      FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
    );
  `);
}

export async function insertTrackFromFile(
  fileName: string,
  filePath: string,
): Promise<void> {
  const db = await getDatabase();

  const nameWithoutExt = fileName.replace(/\.mp3$/i, "");
  const parts = nameWithoutExt.split(" - ");
  const artistName = parts.length >= 2 ? parts[0].trim() : "Unknown Artist";
  const title =
    parts.length >= 2 ? parts.slice(1).join(" - ").trim() : nameWithoutExt;

  await db.execAsync(
    `INSERT OR IGNORE INTO artists (name) VALUES ('${artistName.replace(/'/g, "''")}');`,
  );

  const artist = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM artists WHERE name = '${artistName.replace(/'/g, "''")}';`,
  );

  await db.execAsync(`
    INSERT OR IGNORE INTO tracks (artist_id, title, local_file_path)
    VALUES (
      ${artist?.id ?? "NULL"},
      '${title.replace(/'/g, "''")}',
      '${filePath.replace(/'/g, "''")}'
    );
  `);
}

export async function getAllTracks(): Promise<
  {
    id: number;
    title: string;
    artist: string;
    local_file_path: string;
    duration_ms: number | null;
  }[]
> {
  const db = await getDatabase();
  return await db.getAllAsync(`
    SELECT t.id, t.title, t.local_file_path, t.duration_ms,
           COALESCE(a.name, 'Unknown Artist') as artist
    FROM tracks t
    LEFT JOIN artists a ON t.artist_id = a.id
    ORDER BY t.added_at DESC;
  `);
}
