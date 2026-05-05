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
      is_liked INTEGER DEFAULT 0,
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

  // Migration — ajoute is_liked si elle n'existe pas
  try {
    await db.execAsync(
      `ALTER TABLE tracks ADD COLUMN is_liked INTEGER DEFAULT 0;`,
    );
  } catch (e) {
    // Colonne déjà existante, on ignore
  }
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
    is_liked: number;
  }[]
> {
  const db = await getDatabase();
  return await db.getAllAsync(`
    SELECT t.id, t.title, t.local_file_path, t.duration_ms, t.is_liked,
           COALESCE(a.name, 'Unknown Artist') as artist
    FROM tracks t
    LEFT JOIN artists a ON t.artist_id = a.id
    ORDER BY t.added_at DESC;
  `);
}

export async function deleteTrack(id: number): Promise<void> {
  const db = await getDatabase();

  const track = await db.getFirstAsync<{ local_file_path: string }>(
    `SELECT local_file_path FROM tracks WHERE id = ${id};`,
  );

  if (track?.local_file_path) {
    try {
      const { deleteAsync } = await import("expo-file-system/legacy");
      await deleteAsync(track.local_file_path, { idempotent: true });
    } catch (e) {
      console.error("File delete error:", e);
    }
  }

  await db.execAsync(`DELETE FROM tracks WHERE id = ${id};`);
}

export async function toggleLikedTrack(id: number): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    UPDATE tracks SET is_liked = CASE WHEN is_liked = 1 THEN 0 ELSE 1 END
    WHERE id = ${id};
  `);
}

export async function getLikedTracks(): Promise<
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
    WHERE t.is_liked = 1
    ORDER BY t.added_at DESC;
  `);
}

export async function getStats(): Promise<{
  totalTracks: number;
  totalPlaylists: number;
}> {
  const db = await getDatabase();
  const tracks = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM tracks;`,
  );
  const playlists = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM playlists;`,
  );
  return {
    totalTracks: tracks?.count ?? 0,
    totalPlaylists: playlists?.count ?? 0,
  };
}

export async function linkLastfmTrack(
  title: string,
  artist: string,
  localUri: string,
): Promise<void> {
  const db = await getDatabase();

  // Cherche si l'artiste existe
  await db.execAsync(
    `INSERT OR IGNORE INTO artists (name) VALUES ('${artist.replace(/'/g, "''")}');`,
  );
  const artistRow = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM artists WHERE name = '${artist.replace(/'/g, "''")}';`,
  );

  // Met à jour ou crée la track avec la localUri
  const existing = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM tracks WHERE title = '${title.replace(/'/g, "''")}' AND artist_id = ${artistRow?.id ?? "NULL"};`,
  );

  if (existing) {
    await db.execAsync(
      `UPDATE tracks SET local_file_path = '${localUri.replace(/'/g, "''")}' WHERE id = ${existing.id};`,
    );
  } else {
    await db.execAsync(`
      INSERT INTO tracks (artist_id, title, local_file_path)
      VALUES (${artistRow?.id ?? "NULL"}, '${title.replace(/'/g, "''")}', '${localUri.replace(/'/g, "''")}');
    `);
  }
}

export async function getLinkedUri(
  title: string,
  artist: string,
): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ local_file_path: string | null }>(`
    SELECT t.local_file_path FROM tracks t
    LEFT JOIN artists a ON t.artist_id = a.id
    WHERE t.title = '${title.replace(/'/g, "''")}' 
    AND (a.name = '${artist.replace(/'/g, "''")}' OR t.artist_id IS NULL)
    LIMIT 1;
  `);
  return row?.local_file_path ?? null;
}
