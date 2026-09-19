import { useState, useEffect, useCallback } from "react";

export interface Song {
  id: string;
  title: string;
  type: "Single" | "Album Track";
  year: string;
  duration: string;
  genre: string;
  bpm: number;
  freq: number;
  description: string;
  deezerUrl: string;
  spotifyUrl: string;
  cover: string;
  youtubeId: string;
  youtubeUrl: string;
}

export const DEEZER_ARTIST_COVER =
  "https://cdn-images.dzcdn.net/images/artist/320f1ca7b8ad6b32616063a98a305a58/1000x1000.jpg";

export const OFFICIAL_YOUTUBE_CHANNEL = "https://www.youtube.com/channel/UCejecdsURkKqMAa9UCy9eZw";

export const DEFAULT_SONGS: Song[] = [
  {
    id: "no-stars-heard-our-pain",
    title: "No Stars Heard Our Pain",
    type: "Single",
    year: "2025",
    duration: "3:42",
    genre: "Orchestral / Ambient",
    bpm: 72,
    freq: 261.63,
    description: "A poignant orchestral reflection capturing solitary quietude and emotional depth with strings and piano.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
    youtubeId: "dQMyeL9CDks",
    youtubeUrl: "https://www.youtube.com/watch?v=dQMyeL9CDks",
  },
  {
    id: "fading-love-in-quiet-shadows",
    title: "Fading Love in Quiet Shadows",
    type: "Single",
    year: "2025",
    duration: "4:05",
    genre: "Ambient / Classical",
    bpm: 68,
    freq: 293.66,
    description: "Introspective cinematic composition weaving ambient reverberations with gentle classical chord progressions.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
    youtubeId: "torYsa30kik",
    youtubeUrl: "https://www.youtube.com/watch?v=torYsa30kik",
  },
  {
    id: "lost-between-love-and-pride",
    title: "Lost Between Love and Pride",
    type: "Single",
    year: "2025",
    duration: "3:18",
    genre: "Cinematic Pop",
    bpm: 78,
    freq: 329.63,
    description: "Atmospheric textures blend with dramatic piano cadences exploring personal conflict and resolution.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
    youtubeId: "c8P76CI9ZJY",
    youtubeUrl: "https://www.youtube.com/watch?v=c8P76CI9ZJY",
  },
  {
    id: "love-whispered-but-you-left",
    title: "Love Whispered but You Left",
    type: "Single",
    year: "2025",
    duration: "3:52",
    genre: "Neo-Classical",
    bpm: 65,
    freq: 349.23,
    description: "Evocative string ensembles and subtle wind harmonies depicting lingering memories.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
    youtubeId: "gbtwQC2c71c",
    youtubeUrl: "https://www.youtube.com/watch?v=gbtwQC2c71c",
  },
  {
    id: "pagol-mon-kra",
    title: "Pagol Mon Kra",
    type: "Single",
    year: "2025",
    duration: "4:12",
    genre: "Folk Fusion",
    bpm: 85,
    freq: 392.0,
    description: "Rooted in Bengali folk melody traditions reimagined through acoustic modern arrangement.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
    youtubeId: "AZmbRgxwW98",
    youtubeUrl: "https://www.youtube.com/watch?v=AZmbRgxwW98",
  },
  {
    id: "i-wait-where-you-forgot",
    title: "I Wait Where You Forgot",
    type: "Single",
    year: "2025",
    duration: "3:30",
    genre: "Ambient Ballad",
    bpm: 70,
    freq: 440.0,
    description: "Lyrical ambient soundtrack noted on Gaana and international streaming platforms.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
    youtubeId: "7wUxCorK2CI",
    youtubeUrl: "https://www.youtube.com/watch?v=7wUxCorK2CI",
  },
  {
    id: "we-spoke-through-broken-hearts",
    title: "We Spoke Through Broken Hearts",
    type: "Single",
    year: "2025",
    duration: "3:45",
    genre: "Acoustic Pop",
    bpm: 74,
    freq: 493.88,
    description: "Gentle acoustic reflections exploring healing, resilience, and emotional truth.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
    youtubeId: "l3VHNH9RP6w",
    youtubeUrl: "https://www.youtube.com/watch?v=l3VHNH9RP6w",
  },
  {
    id: "our-memories-hurt-in-silence",
    title: "Our Memories Hurt in Silence",
    type: "Single",
    year: "2025",
    duration: "4:01",
    genre: "Modern Classical",
    bpm: 66,
    freq: 523.25,
    description: "Gentle acoustic guitar arpeggios layered with soft orchestral pads.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
    youtubeId: "t7pERNb1o9E",
    youtubeUrl: "https://www.youtube.com/watch?v=t7pERNb1o9E",
  },
  {
    id: "only-silence-answered-my-love",
    title: "Only Silence Answered My Love",
    type: "Single",
    year: "2025",
    duration: "3:24",
    genre: "Lo-Fi Instrumental",
    bpm: 80,
    freq: 261.63,
    description: "A deep ambient meditation on quietude, distance, and unresolved affection.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
    youtubeId: "xtz2YxkLBZE",
    youtubeUrl: "https://www.youtube.com/watch?v=xtz2YxkLBZE",
  },
  {
    id: "love-cries-behind-closed-eyes",
    title: "Love Cries Behind Closed Eyes",
    type: "Single",
    year: "2025",
    duration: "3:58",
    genre: "Ambient Piano",
    bpm: 64,
    freq: 293.66,
    description: "Soothing piano themes intertwined with ambient choral undertones.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
    youtubeId: "LwiUZExjuDE",
    youtubeUrl: "https://www.youtube.com/watch?v=LwiUZExjuDE",
  },
  {
    id: "your-silence-broke-my-heart",
    title: "Your Silence Broke My Heart",
    type: "Single",
    year: "2025",
    duration: "4:15",
    genre: "Acoustic / Cello",
    bpm: 72,
    freq: 329.63,
    description: "Quiet contemplative piece with warm acoustic harmonies and poignant cello lines.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
    youtubeId: "DIlnDQ0qSqg",
    youtubeUrl: "https://www.youtube.com/watch?v=DIlnDQ0qSqg",
  },
  {
    id: "ami-chini-go-chini-tomare",
    title: "আমি চিনি গো চিনি তোমারে (Ami Chini Go Chini)",
    type: "Single",
    year: "2025",
    duration: "3:10",
    genre: "Bangla Folk Song",
    bpm: 90,
    freq: 349.23,
    description: "Traditional Bengali song performance by MD. Shinha Sarder, blending classic lyrical heritage with acoustic instrumentation.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: "https://i.ytimg.com/vi/URXjye9UIHk/hqdefault.jpg",
    youtubeId: "URXjye9UIHk",
    youtubeUrl: "https://www.youtube.com/watch?v=URXjye9UIHk",
  },
  {
    id: "murobbi-murobbi",
    title: "Murobbi Murobbi (JKS Club Concert)",
    type: "Single",
    year: "2025",
    duration: "3:35",
    genre: "Cultural Contemporary",
    bpm: 92,
    freq: 349.23,
    description: "Live concert performance by MD. Shinha Sarder at Shirgati, Aichgati Union Parishad, Khulna.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
    youtubeId: "J8YT9F4GUGc",
    youtubeUrl: "https://www.youtube.com/watch?v=J8YT9F4GUGc",
  },
  {
    id: "journey-travel-for-shinha",
    title: "প্রাণের শহর খুলনা (Praneer Shahor Khulna)",
    type: "Single",
    year: "2025",
    duration: "4:00",
    genre: "Cinematic Soundtrack",
    bpm: 76,
    freq: 392.0,
    description: "Tribute poem and melodic composition honoring his hometown Khulna and the journey of tech entrepreneurship.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: "https://i.ytimg.com/vi/ogzm5SsMc18/hqdefault.jpg",
    youtubeId: "ogzm5SsMc18",
    youtubeUrl: "https://www.youtube.com/watch?v=ogzm5SsMc18",
  },
  {
    id: "aguner-moton",
    title: "আমাদের প্রাণের বাংলাদেশ (Aguner Moton)",
    type: "Single",
    year: "2025",
    duration: "3:28",
    genre: "Acoustic Vocal",
    bpm: 88,
    freq: 440.0,
    description: "Passionate vocal and acoustic composition capturing inner fire, ambition, and national love.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
    youtubeId: "v9utoeDkhqM",
    youtubeUrl: "https://www.youtube.com/watch?v=v9utoeDkhqM",
  },
  {
    id: "fajr-azan",
    title: "রমজান মোবারক ও ফজরের সুর (Fajr Azan)",
    type: "Single",
    year: "2025",
    duration: "4:20",
    genre: "Spiritual Ambient",
    bpm: 60,
    freq: 523.25,
    description: "Peaceful spiritual dawn composition weaving serene atmospheric chords and contemplative reverberation.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
    youtubeId: "vgaKWl4QSuI",
    youtubeUrl: "https://www.youtube.com/watch?v=vgaKWl4QSuI",
  },
];

const STORAGE_KEY = "md_shinha_songs_catalog_v2";

export function useSongsData() {
  const [songs, setSongs] = useState<Song[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn("Failed to load songs from localStorage:", e);
      }
    }
    return DEFAULT_SONGS;
  });

  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setSongs(JSON.parse(saved));
        }
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener("songs_updated", handleStorage);
    return () => window.removeEventListener("songs_updated", handleStorage);
  }, []);

  const saveSongs = useCallback((updated: Song[]) => {
    setSongs(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event("songs_updated"));
      } catch (e) {
        console.error("Failed to save songs:", e);
      }
    }
  }, []);

  const addSong = useCallback(
    (newSong: Song) => {
      saveSongs([newSong, ...songs]);
    },
    [songs, saveSongs]
  );

  const updateSong = useCallback(
    (id: string, updatedFields: Partial<Song>) => {
      const next = songs.map((s) => (s.id === id ? { ...s, ...updatedFields } : s));
      saveSongs(next);
    },
    [songs, saveSongs]
  );

  const deleteSong = useCallback(
    (id: string) => {
      const next = songs.filter((s) => s.id !== id);
      saveSongs(next);
    },
    [songs, saveSongs]
  );

  const resetSongs = useCallback(() => {
    saveSongs(DEFAULT_SONGS);
  }, [saveSongs]);

  return {
    songs,
    addSong,
    updateSong,
    deleteSong,
    resetSongs,
  };
}
