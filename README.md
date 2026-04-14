# Musix — Dev Log

## Stack

- Expo SDK 54 + Expo Go (RNTP plus tard)
- Expo Router (file-based)
- NativeWind (Tailwind)
- expo-sqlite, expo-av, expo-file-system
- Zustand + React Query
- Last.fm API + Deezer API (images)

## État actuel

- ✅ Setup complet
- ✅ SQLite initialisé
- ✅ Last.fm service + hooks
- ✅ Navigation tabs (Home, Search, Library, Profile)
- ✅ Search screen fonctionnel
- ✅ Artist screen (image Deezer, bio, albums)
- 🔜 Album screen
- 🔜 Player screen
- 🔜 Library screen
- 🔜 Sync Wi-Fi

## Clés API

- Last.fm : EXPO_PUBLIC_LASTFM_API_KEY dans .env
- Deezer : pas de clé requise

## Notes importantes

- Images Last.fm inutilisables → Deezer API pour les images
- .npmrc : legacy-peer-deps=true
- projectId EAS : 30a5b647-c5ea-4419-b655-aa9b6e97999a
