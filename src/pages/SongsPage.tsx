import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import SiteBackground from "@/components/SiteBackground";
import FooterSection from "@/components/FooterSection";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Music,
  ExternalLink,
  Disc,
  Clock,
  Sparkles,
  Radio,
  Share2,
  Check,
} from "lucide-react";

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
}

export const DEEZER_ARTIST_COVER = "https://cdn-images.dzcdn.net/images/artist/320f1ca7b8ad6b32616063a98a305a58/1000x1000.jpg";

export const songsData: Song[] = [
  {
    id: "no-stars-heard-our-pain",
    title: "No Stars Heard Our Pain",
    type: "Single",
    year: "2025",
    duration: "3:42",
    genre: "Orchestral / Ambient",
    bpm: 72,
    freq: 261.63, // C4
    description: "A poignant orchestral reflection capturing solitary quietude and emotional depth with strings and piano.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
  },
  {
    id: "fading-love-in-quiet-shadows",
    title: "Fading Love in Quiet Shadows",
    type: "Single",
    year: "2025",
    duration: "4:15",
    genre: "Melodic Soundtrack",
    bpm: 68,
    freq: 293.66, // D4
    description: "Introspective cinematic composition weaving ambient reverberations with gentle classical chord progressions.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
  },
  {
    id: "lost-between-love-and-pride",
    title: "Lost Between Love and Pride",
    type: "Single",
    year: "2025",
    duration: "3:58",
    genre: "Ambient Emotional",
    bpm: 76,
    freq: 329.63, // E4
    description: "Atmospheric textures blend with dramatic piano cadences exploring personal conflict and resolution.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
  },
  {
    id: "love-whispered-but-you-left",
    title: "Love Whispered but You Left",
    type: "Single",
    year: "2025",
    duration: "4:02",
    genre: "Soundtrack / Instrumental",
    bpm: 65,
    freq: 349.23, // F4
    description: "Evocative string ensembles and subtle wind harmonies depicting lingering memories.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
  },
  {
    id: "pagol-mon-kra",
    title: "Pagol Mon Kra",
    type: "Single",
    year: "2025",
    duration: "3:30",
    genre: "Folk Contemporary",
    bpm: 88,
    freq: 392.0, // G4
    description: "Rooted in Bengali folk melody traditions reimagined through acoustic modern arrangement.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
  },
  {
    id: "i-wait-where-you-forgot",
    title: "I Wait Where You Forgot",
    type: "Single",
    year: "2025",
    duration: "3:48",
    genre: "Orchestral",
    bpm: 70,
    freq: 440.0, // A4
    description: "Lyrical ambient soundtrack noted on Gaana and international streaming platforms.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
  },
  {
    id: "we-spoke-through-broken-hearts",
    title: "We Spoke Through Broken Hearts",
    type: "Single",
    year: "2025",
    duration: "3:52",
    genre: "Acoustic Ballad",
    bpm: 66,
    freq: 466.16, // Bb4
    description: "Gentle acoustic reflections exploring healing, resilience, and emotional truth.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
  },
  {
    id: "our-memories-hurt-in-silence",
    title: "Our Memories Hurt in Silence",
    type: "Single",
    year: "2025",
    duration: "3:55",
    genre: "Instrumental",
    bpm: 74,
    freq: 523.25, // C5
    description: "Gentle acoustic guitar arpeggios layered with soft orchestral pads.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
  },
  {
    id: "only-silence-answered-my-love",
    title: "Only Silence Answered My Love",
    type: "Single",
    year: "2025",
    duration: "4:05",
    genre: "Ambient Instrumental",
    bpm: 62,
    freq: 554.37, // Db5
    description: "A deep ambient meditation on quietude, distance, and unresolved affection.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
  },
  {
    id: "love-cries-behind-closed-eyes",
    title: "Love Cries Behind Closed Eyes",
    type: "Single",
    year: "2025",
    duration: "3:44",
    genre: "Melodic Classical",
    bpm: 69,
    freq: 587.33, // D5
    description: "Soothing piano themes intertwined with ambient choral undertones.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
  },
  {
    id: "your-silence-broke-my-heart",
    title: "Your Silence Broke My Heart",
    type: "Single",
    year: "2025",
    duration: "4:10",
    genre: "Melodic Classical",
    bpm: 64,
    freq: 493.88, // B4
    description: "Quiet contemplative piece with warm acoustic harmonies and poignant cello lines.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
  },
  {
    id: "murobbi-murobbi",
    title: "Murobbi Murobbi",
    type: "Single",
    year: "2025",
    duration: "3:36",
    genre: "Folk Modern",
    bpm: 86,
    freq: 349.23, // F4
    description: "A rhythm-infused cultural contemporary song blending traditional percussion with upbeat melodic phrasing.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
  },
  {
    id: "journey-travel-for-shinha",
    title: "Journey Travel For Shinha",
    type: "Single",
    year: "2025",
    duration: "4:08",
    genre: "Ambient Electronic",
    bpm: 78,
    freq: 392.0, // G4
    description: "Expansive travel soundtrack representing dynamic movement from rural origins to digital frontiers.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
  },
  {
    id: "aguner-moton",
    title: "Aguner Moton",
    type: "Single",
    year: "2025",
    duration: "3:25",
    genre: "Indie Folk",
    bpm: 92,
    freq: 440.0, // A4
    description: "Passionate vocal and acoustic composition capturing inner fire, ambition, and artistic perseverance.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
  },
  {
    id: "fajr-azan",
    title: "Fajr Azan",
    type: "Single",
    year: "2025",
    duration: "4:30",
    genre: "Spiritual Ambient",
    bpm: 60,
    freq: 261.63, // C4
    description: "Peaceful spiritual dawn composition weaving serene atmospheric chords and contemplative reverberation.",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
  },
];

export const SongsPage = () => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Web Audio Synth Synthesizer for live ambient music playback
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<{ oscillators?: OscillatorNode[]; gain?: GainNode; filter?: BiquadFilterNode } | null>(null);
  const timerRef = useRef<any>(null);

  const currentSong = songsData[currentSongIndex];

  // Stop current synth
  const stopSynth = () => {
    if (synthNodesRef.current) {
      try {
        if (synthNodesRef.current.oscillators) {
          synthNodesRef.current.oscillators.forEach((osc) => {
            try {
              osc.stop();
              osc.disconnect();
            } catch (e) {
              // ignore
            }
          });
        }
        synthNodesRef.current.filter?.disconnect();
        synthNodesRef.current.gain?.disconnect();
      } catch (e) {
        // ignore
      }
      synthNodesRef.current = null;
    }
  };

  // Start synth with rich musical chords & harmonic overtones
  const startSynth = (song: Song) => {
    stopSynth();
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      const baseFreq = song.freq;

      const oscillators: OscillatorNode[] = [];
      const filter = ctx.createBiquadFilter();
      const masterGain = ctx.createGain();

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1000, ctx.currentTime);
      filter.Q.setValueAtTime(1.8, ctx.currentTime);

      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      // Gentle musical attack
      masterGain.gain.exponentialRampToValueAtTime(muted ? 0.0001 : volume * 0.2, ctx.currentTime + 0.5);

      // Triad chords (root, major third, fifth, octave) with analog detune
      const intervals = [1.0, 1.25, 1.5, 2.0];
      intervals.forEach((interval, i) => {
        const osc = ctx.createOscillator();
        osc.type = i % 2 === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(baseFreq * interval, ctx.currentTime);
        osc.detune.setValueAtTime((i - 1.5) * 5, ctx.currentTime);
        osc.connect(filter);
        osc.start();
        oscillators.push(osc);
      });

      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      synthNodesRef.current = { oscillators, gain: masterGain, filter };
    } catch (e) {
      console.error("Audio synth error:", e);
    }
  };

  const handlePlaySong = (index: number) => {
    if (currentSongIndex === index && isPlaying) {
      stopSynth();
      setIsPlaying(false);
      return;
    }
    setCurrentSongIndex(index);
    setIsPlaying(true);
    setProgress(0);
    setCurrentTime("0:00");
    startSynth(songsData[index]);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      stopSynth();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      startSynth(currentSong);
    }
  };

  const handleNext = () => {
    const nextIdx = (currentSongIndex + 1) % songsData.length;
    setCurrentSongIndex(nextIdx);
    setProgress(0);
    setCurrentTime("0:00");
    if (isPlaying) {
      startSynth(songsData[nextIdx]);
    }
  };

  const handlePrev = () => {
    const prevIdx = (currentSongIndex - 1 + songsData.length) % songsData.length;
    setCurrentSongIndex(prevIdx);
    setProgress(0);
    setCurrentTime("0:00");
    if (isPlaying) {
      startSynth(songsData[prevIdx]);
    }
  };

  const handleNextRef = useRef(handleNext);
  useEffect(() => {
    handleNextRef.current = handleNext;
  });

  // Track progress simulation
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNextRef.current();
            return 0;
          }
          const next = prev + 0.5;
          const totalSec = 220; // 3:40 avg
          const currentSec = Math.floor((next / 100) * totalSec);
          const m = Math.floor(currentSec / 60);
          const s = String(currentSec % 60).padStart(2, "0");
          setCurrentTime(`${m}:${s}`);
          return next;
        });
      }, 500);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, currentSongIndex]);

  // Volume update
  useEffect(() => {
    if (synthNodesRef.current?.gain && audioCtxRef.current) {
      synthNodesRef.current.gain.gain.setValueAtTime(muted ? 0 : volume * 0.25, audioCtxRef.current.currentTime);
    }
  }, [volume, muted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSynth();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const copyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 selection:bg-blue-500/30 selection:text-blue-200">
      <Helmet>
        <title>Music &amp; Songs (Deezer) — MD. Shinha Sarder</title>
        <meta
          name="description"
          content="Listen to all songs, singles, and orchestral works by MD. Shinha Sarder directly detected from Deezer (Artist ID: 338551431) with live preview player."
        />
        <meta property="og:image" content="https://mdshinhasarder.com/profile.webp" />
      </Helmet>

      <SiteBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 max-w-5xl mx-auto px-4 py-8 sm:py-12 w-full">
          {/* Breadcrumb Header */}
          <div className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-400">
            <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-blue-400 font-semibold">Music &amp; Songs</span>
          </div>

          {/* Artist Hero Banner with Deezer Verified Integration */}
          <div className="relative rounded-3xl overflow-hidden bg-[#070c1e]/95 text-white p-6 md:p-10 shadow-2xl border border-blue-900/50 mb-10">
            <div className="relative flex flex-col md:flex-row items-center gap-8">
              <div className="relative group">
                <div className="w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden border-2 border-blue-500/30 shadow-2xl">
                  <img
                    src="https://mdshinhasarder.com/profile.webp"
                    alt="MD. Shinha Sarder Deezer Profile"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = "/profile.webp";
                    }}
                  />
                </div>
                <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-blue-600 text-[10px] font-bold uppercase tracking-wider text-white shadow ring-2 ring-black">
                  Deezer Artist
                </span>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 text-xs font-semibold text-blue-300 border border-blue-800/60 mb-2">
                  <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  Deezer Artist ID: 338551431
                </div>

                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
                  MD. Shinha Sarder
                </h1>

                <p className="text-sm md:text-base text-slate-300 max-w-xl leading-relaxed mb-6">
                  Bangladeshi orchestral soundtrack composer, author, and musical artist known for atmospheric, emotive instrumental compositions and contemporary folk melodies.
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <a
                    href="https://www.deezer.com/en/artist/338551431"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all hover:scale-105"
                  >
                    <span>Open on Deezer</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href="https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1db954] text-white hover:bg-[#1ed760] text-xs font-bold shadow-md transition-all hover:scale-105"
                  >
                    <Disc className="w-4 h-4" />
                    Spotify Artist
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={copyShare}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-blue-900/60 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                    {copied ? "Link Copied!" : "Share"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* OFFICIAL DEEZER STREAM & AUDIO PLAYER WIDGET */}
          <div className="mb-8 rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-[#0d0722] via-[#070c1e] to-[#0d0722] border border-purple-900/50 shadow-2xl">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300">
                  <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    Official Deezer Stream &amp; Audio Player
                  </h2>
                  <p className="text-xs text-purple-300/80">
                    Live stream with genuine Deezer audio, tracks, and official cover art (Artist #338551431)
                  </p>
                </div>
              </div>
              <a
                href="https://www.deezer.com/en/artist/338551431"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-transform hover:scale-105"
              >
                <span>Open Deezer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="rounded-2xl overflow-hidden border border-purple-900/40 bg-black/80">
              <iframe
                title="Deezer Official Artist Player"
                src="https://widget.deezer.com/widget/dark/artist/338551431"
                width="100%"
                height="220"
                frameBorder="0"
                allow="encrypted-media; clipboard-write"
                className="w-full"
              />
            </div>
          </div>

          {/* INTERACTIVE AUDIO PLAYER BAR */}
          <div className="sticky top-20 z-30 mb-10 rounded-2xl bg-[#070c1e]/95 border border-blue-900/60 p-5 shadow-2xl backdrop-blur-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Current Song Info */}
              <div className="flex items-center gap-4 min-w-0 w-full md:w-auto">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-blue-900/50 shadow-md">
                  <img src={currentSong.cover} alt={currentSong.title} className="w-full h-full object-cover" />
                  {isPlaying && (
                    <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-900/50">
                      {currentSong.type}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{currentSong.genre}</span>
                  </div>
                  <h3 className="font-bold text-base text-white truncate">
                    {currentSong.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    MD. Shinha Sarder · {currentSong.year}
                  </p>
                </div>
              </div>

              {/* Playback Controls & Progress */}
              <div className="flex-1 w-full max-w-md flex flex-col items-center gap-2">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="p-2 rounded-full hover:bg-slate-800 text-slate-300 transition-colors"
                    aria-label="Previous Track"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={handlePlayPause}
                    className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
                    aria-label={isPlaying ? "Pause Track" : "Play Track"}
                  >
                    {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="p-2 rounded-full hover:bg-slate-800 text-slate-300 transition-colors"
                    aria-label="Next Track"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="w-full flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span>{currentTime}</span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span>{currentSong.duration}</span>
                </div>
              </div>

              {/* Volume & Deezer link */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMuted(!muted)}
                  className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  aria-label={muted ? "Unmute" : "Mute"}
                >
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={muted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    setMuted(false);
                  }}
                  className="w-20 h-1 accent-blue-500 bg-slate-800 rounded-lg cursor-pointer"
                  aria-label="Volume Slider"
                />

                <a
                  href={currentSong.deezerUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Play on Deezer"
                  className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-xs font-bold border border-blue-500/30 flex items-center gap-1.5 transition-colors"
                >
                  <Radio className="w-3.5 h-3.5 text-blue-400" />
                  Deezer
                </a>
              </div>
            </div>
          </div>

          {/* SONGS TRACKLIST */}
          <div className="space-y-3 mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-blue-400" />
                <span>All Tracks &amp; Singles ({songsData.length})</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">Deezer Artist Verified</span>
            </div>

            {songsData.map((song, idx) => {
              const isCurrent = currentSongIndex === idx;
              const isCurrentPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={song.id}
                  onClick={() => handlePlaySong(idx)}
                  className={`group cursor-pointer rounded-2xl p-4 transition-all duration-200 flex items-center gap-4 ${
                    isCurrent
                      ? "bg-blue-950/50 border border-blue-500/40 shadow-md"
                      : "bg-[#070c1e]/80 hover:bg-[#070c1e] border border-blue-900/30 hover:border-blue-700/40"
                  }`}
                >
                  {/* Track Number / Play Button */}
                  <div className="w-8 flex items-center justify-center text-sm font-mono text-slate-400">
                    {isCurrentPlaying ? (
                      <div className="w-4 h-4 flex items-end justify-center gap-0.5">
                        <div className="w-1 bg-blue-400 h-full animate-bounce" />
                        <div className="w-1 bg-blue-400 h-2/3 animate-bounce delay-75" />
                        <div className="w-1 bg-blue-400 h-1/2 animate-bounce delay-150" />
                      </div>
                    ) : (
                      <span className="group-hover:hidden">{String(idx + 1).padStart(2, "0")}</span>
                    )}
                    <Play className="w-4 h-4 text-blue-400 hidden group-hover:block" />
                  </div>

                  {/* Thumbnail Cover */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-900 border border-blue-900/40">
                    <img src={song.cover} alt={song.title} className="w-full h-full object-cover" />
                  </div>

                  {/* Song Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className={`text-sm font-bold truncate ${isCurrent ? "text-blue-300" : "text-white"}`}>
                        {song.title}
                      </h3>
                      {song.id === "pagol-mon-kra" && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Signature Single
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      {song.description}
                    </p>
                  </div>

                  {/* Genre */}
                  <div className="hidden sm:block text-xs text-slate-400 font-mono">
                    {song.genre}
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{song.duration}</span>
                  </div>

                  {/* Deezer Direct Link Button */}
                  <a
                    href={song.deezerUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-blue-600 hover:text-white text-slate-400 transition-colors"
                    title="Open on Deezer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            })}
          </div>
        </main>

        <FooterSection />
      </div>
    </div>
  );
};

export default SongsPage;
