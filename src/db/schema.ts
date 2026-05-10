import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync("musix.db");
  }
  return db;
}

export async function initDatabase(): Promise<void> {
  await cleanMissingFiles();
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
      listening_ms INTEGER DEFAULT 0,
      is_liked INTEGER DEFAULT 0,
      source TEXT DEFAULT 'download',
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
    CREATE TABLE IF NOT EXISTS recent_plays (
      track_id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      artist TEXT,
      cover_url TEXT,
      played_at INTEGER
    );
  `);

  // Migrations
  try {
    await db.execAsync(
      `ALTER TABLE tracks ADD COLUMN is_liked INTEGER DEFAULT 0;`,
    );
  } catch (e) {}
  try {
    await db.execAsync(
      `ALTER TABLE tracks ADD COLUMN source TEXT DEFAULT 'download';`,
    );
  } catch (e) {}
  try {
    await db.execAsync(`ALTER TABLE tracks ADD COLUMN cover_url TEXT;`);
  } catch (e) {}
  try {
    await db.execAsync(`ALTER TABLE playlists ADD COLUMN color TEXT;`);
  } catch (e) {}
  try {
    await db.execAsync(`ALTER TABLE tracks ADD COLUMN listening_ms INTEGER DEFAULT 0;`);
  } catch (e) {}
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

  let coverUrl: string | null = null;
  try {
    const { deezer } = await import("@/services/lastfm");
    coverUrl = await deezer.searchTrackPreviewAndCover(artistName, title);
  } catch (e) {}

  await db.execAsync(`
    INSERT OR IGNORE INTO tracks (artist_id, title, local_file_path, source, cover_url)
    VALUES (
      ${artist?.id ?? "NULL"},
      '${title.replace(/'/g, "''")}',
      '${filePath.replace(/'/g, "''")}',
      'download',
      ${coverUrl ? `'${coverUrl.replace(/'/g, "''")}'` : "NULL"}
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
    cover_url: string | null;
  }[]
> {
  const db = await getDatabase();
  return await db.getAllAsync(`
    SELECT t.id, t.title, t.local_file_path, t.duration_ms, t.is_liked, t.cover_url,
           COALESCE(a.name, 'Unknown Artist') as artist
    FROM tracks t
    LEFT JOIN artists a ON t.artist_id = a.id
    WHERE t.source = 'download'
    ORDER BY t.added_at DESC;
  `);
}

export async function getLinkedTracks(): Promise<
  {
    id: number;
    title: string;
    artist: string;
    local_file_path: string;
    duration_ms: number | null;
    is_liked: number;
    cover_url: string | null;
  }[]
> {
  const db = await getDatabase();
  return await db.getAllAsync(`
    SELECT t.id, t.title, t.local_file_path, t.duration_ms, t.is_liked, t.cover_url,
           COALESCE(a.name, 'Unknown Artist') as artist
    FROM tracks t
    LEFT JOIN artists a ON t.artist_id = a.id
    WHERE t.source = 'lastfm'
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
    is_liked: number;
    cover_url: string | null;
  }[]
> {
  const db = await getDatabase();
  return await db.getAllAsync(`
    SELECT t.id, t.title, t.local_file_path, t.duration_ms, t.is_liked, t.cover_url,
           COALESCE(a.name, 'Unknown Artist') as artist
    FROM tracks t
    LEFT JOIN artists a ON t.artist_id = a.id
    WHERE t.is_liked = 1
    ORDER BY t.added_at DESC;
  `);
}

// ─── Playlists ─────────────────────────────────────────────────────────────────

export async function getAllPlaylists(): Promise<
  {
    id: number;
    name: string;
    color: string | null;
    track_count: number;
  }[]
> {
  const db = await getDatabase();
  return await db.getAllAsync(`
    SELECT p.id, p.name, p.color,
           COUNT(pt.track_id) as track_count
    FROM playlists p
    LEFT JOIN playlist_tracks pt ON pt.playlist_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC;
  `);
}

// ─── Stats enrichies ───────────────────────────────────────────────────────────

export async function getStats(): Promise<{
  totalTracks: number;
  totalPlaylists: number;
  likedTracksCount: number;
  totalListeningHours: number;
}> {
  const db = await getDatabase();

  const tracks = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM tracks WHERE source = 'download';`,
  );
  const playlists = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM playlists;`,
  );
  const liked = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM tracks WHERE is_liked = 1;`,
  );
  // listening_ms accumulé via incrementListeningTime()
  const listening = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(listening_ms), 0) as total FROM tracks;`,
  );

  const totalMs = listening?.total ?? 0;
  const totalHours = Math.round(totalMs / 1000 / 60 / 60);

  return {
    totalTracks: tracks?.count ?? 0,
    totalPlaylists: playlists?.count ?? 0,
    likedTracksCount: liked?.count ?? 0,
    totalListeningHours: totalHours,
  };
}

/**
 * Appelle cette fonction depuis le player quand une track avance
 * ex: incrementListeningTime(trackId, 1000) toutes les secondes
 */
export async function incrementListeningTime(
  trackId: number,
  ms: number,
): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(
    `UPDATE tracks SET listening_ms = COALESCE(listening_ms, 0) + ${ms} WHERE id = ${trackId};`,
  );
}

export async function incrementPlayCount(trackId: number): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(
    `UPDATE tracks SET play_count = play_count + 1 WHERE id = ${trackId};`,
  );
}

// ─── Fin stats ─────────────────────────────────────────────────────────────────

export async function linkLastfmTrack(
  title: string,
  artist: string,
  localUri: string,
  coverUrl?: string | null,
): Promise<void> {
  const db = await getDatabase();

  await db.execAsync(
    `INSERT OR IGNORE INTO artists (name) VALUES ('${artist.replace(/'/g, "''")}');`,
  );
  const artistRow = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM artists WHERE name = '${artist.replace(/'/g, "''")}';`,
  );

  const existing = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM tracks WHERE title = '${title.replace(/'/g, "''")}' AND artist_id = ${artistRow?.id ?? "NULL"};`,
  );

  const safeCoverUrl = coverUrl ? `'${coverUrl.replace(/'/g, "''")}'` : "NULL";

  if (existing) {
    await db.execAsync(
      `UPDATE tracks 
       SET local_file_path = '${localUri.replace(/'/g, "''")}', 
           source = 'lastfm', 
           cover_url = ${safeCoverUrl} 
       WHERE id = ${existing.id};`,
    );
  } else {
    await db.execAsync(`
      INSERT INTO tracks (artist_id, title, local_file_path, source, cover_url)
      VALUES (${artistRow?.id ?? "NULL"}, '${title.replace(/'/g, "''")}', '${localUri.replace(/'/g, "''")}', 'lastfm', ${safeCoverUrl});
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
    AND t.source = 'lastfm'
    LIMIT 1;
  `);
  return row?.local_file_path ?? null;
}

export async function cleanMissingFiles(): Promise<void> {
  const db = await getDatabase();

  const tracks = await db.getAllAsync<{ id: number; local_file_path: string }>(
    `SELECT id, local_file_path FROM tracks WHERE local_file_path IS NOT NULL;`,
  );

  const { getInfoAsync } = await import("expo-file-system/legacy");

  for (const track of tracks) {
    try {
      const info = await getInfoAsync(track.local_file_path);
      if (!info.exists) {
        console.log(`🗑️ Removing missing file: ${track.local_file_path}`);
        await db.execAsync(`DELETE FROM tracks WHERE id = ${track.id};`);
      }
    } catch (e) {}
  }
}

export async function recordTrackPlay(track: {
  id: string;
  title: string;
  artist: string;
  coverUrl: string | null;
}): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    INSERT OR REPLACE INTO recent_plays (track_id, title, artist, cover_url, played_at)
    VALUES (
      '${track.id.replace(/'/g, "''")}',
      '${track.title.replace(/'/g, "''")}',
      '${track.artist.replace(/'/g, "''")}',
      ${track.coverUrl ? `'${track.coverUrl.replace(/'/g, "''")}'` : "NULL"},
      ${Date.now()}
    );
  `);
}

export async function getRecentTracks(): Promise<
  {
    track_id: string;
    title: string;
    artist: string;
    cover_url: string | null;
  }[]
> {
  const db = await getDatabase();
  return await db.getAllAsync(`
    SELECT track_id, title, artist, cover_url
    FROM recent_plays
    ORDER BY played_at DESC
    LIMIT 6;
  `);
}