import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import SiteBackground from "@/components/SiteBackground";
import FooterSection from "@/components/FooterSection";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ExternalLink,
  Youtube,
  Radio,
  Music,
  Share2,
  Check,
  Sparkles,
} from "lucide-react";
import { useSongsData, Song, DEEZER_ARTIST_COVER, DEFAULT_SONGS, OFFICIAL_YOUTUBE_CHANNEL } from "@/hooks/useSongsData";

// Re-export for compatibility with other components
export { DEEZER_ARTIST_COVER, DEFAULT_SONGS as songsData };
export type { Song };

export default function SongsPage() {
  const { songs } = useSongsData();
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const [isPlayingSynth, setIsPlayingSynth] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string>(songs[0]?.youtubeId || "dQMyeL9CDks");
  const [copied, setCopied] = useState(false);

  // Web Audio Synth
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscNodesRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  const activeSong = songs[currentSongIndex] || songs[0];

  const stopSynth = () => {
    oscNodesRef.current.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // ignore
      }
    });
    oscNodesRef.current = [];
    setIsPlayingSynth(false);
  };

  const playSynth = (song: Song) => {
    stopSynth();
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : volume * 0.35, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Harmonic chord voices based on fundamental frequency
      const f = song.freq || 261.63;
      const freqs = [f, f * 1.25, f * 1.5, f * 2]; // root, major 3rd, 5th, octave

      const newOscs = freqs.map((hz, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx % 2 === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(hz, ctx.currentTime);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.25 / (idx + 1), ctx.currentTime);
        osc.connect(subGain);
        subGain.connect(masterGain);

        osc.start();
        return osc;
      });

      oscNodesRef.current = newOscs;
      setIsPlayingSynth(true);
    } catch (e) {
      console.error("Audio synth error:", e);
    }
  };

  const toggleSynth = (index: number) => {
    if (currentSongIndex === index && isPlayingSynth) {
      stopSynth();
    } else {
      setCurrentSongIndex(index);
      playSynth(songs[index]);
    }
  };

  const selectSongAndVideo = (index: number) => {
    setCurrentSongIndex(index);
    const s = songs[index];
    if (s?.youtubeId) {
      setActiveVideoId(s.youtubeId);
    }
  };

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(isMuted ? 0 : volume * 0.35, audioCtxRef.current.currentTime);
    }
  }, [volume, isMuted]);

  useEffect(() => {
    return () => {
      stopSynth();
    };
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen bg-black text-slate-100">
      <Helmet>
        <title>MD. Shinha Sarder — Music &amp; Official Releases</title>
        <meta
          name="description"
          content="Official discography, music videos, and ambient instrumental releases by MD. Shinha Sarder on YouTube, Deezer, and Spotify."
        />
      </Helmet>

      <SiteBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 container mx-auto px-4 sm:px-6 pt-24 pb-16 max-w-5xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/60">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-red-400 font-semibold bg-red-950/50 px-2.5 py-0.5 rounded-full border border-red-900/40">
                  Verified Musical Artist
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-400">YouTube &amp; Streaming Catalog</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mt-1">
                Songs &amp; YouTube Releases
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Official instrumental releases, original melodies, and YouTube video catalog by MD. Shinha Sarder.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={OFFICIAL_YOUTUBE_CHANNEL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <Youtube size={15} />
                <span>YouTube Channel</span>
                <ExternalLink size={12} />
              </a>

              <a
                href="https://www.deezer.com/en/artist/338551431"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/50 transition-colors"
              >
                <Radio size={14} className="text-amber-400" />
                <span>Deezer</span>
              </a>

              <button
                onClick={handleShare}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700/50"
                title="Share link"
              >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
              </button>
            </div>
          </div>

          {/* Featured Video Player */}
          <div className="my-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-500" />
                <span className="text-sm font-semibold text-white">Now Playing: {activeSong?.title}</span>
              </div>
              <span className="text-xs text-slate-400">Official YouTube Stream</span>
            </div>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/60 shadow-2xl">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=0&rel=0`}
                title={activeSong?.title || "MD. Shinha Sarder Music Video"}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Deezer Official Stream Player */}
          <div className="mb-8 rounded-xl overflow-hidden border border-slate-800/60 bg-black">
            <iframe
              title="Deezer Artist Stream"
              src="https://widget.deezer.com/widget/dark/artist/338551431"
              width="100%"
              height="152"
              frameBorder="0"
              allow="encrypted-media; clipboard-write"
              className="w-full"
            />
          </div>

          {/* Synth Audio Controls Bar */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleSynth(currentSongIndex)}
                className="w-9 h-9 rounded-full bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center shadow-md transition-colors"
              >
                {isPlayingSynth ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
              </button>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Interactive Audio Synth</span>
                <strong className="text-white text-xs">{activeSong?.title} ({activeSong?.freq} Hz)</strong>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-slate-400 hover:text-white"
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="w-24 accent-sky-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
              />
              <span className="font-mono text-slate-400 text-[11px]">{activeSong?.duration}</span>
            </div>
          </div>

          {/* Song Catalog List - Clean Laravel list with no heavy boxed containers */}
          <div className="border border-slate-800/60 rounded-xl divide-y divide-slate-800/40 overflow-hidden bg-slate-950/40">
            {songs.map((song: Song, idx: number) => {
              const isCurrent = currentSongIndex === idx;
              const hasVideo = Boolean(song.youtubeId);
              return (
                <div
                  key={song.id}
                  className={`p-3.5 sm:p-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCurrent ? "bg-slate-900/50" : "hover:bg-slate-900/30"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 text-xs font-mono font-medium flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>

                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-800 bg-black">
                      <img
                        src={song.youtubeId ? `https://i.ytimg.com/vi/${song.youtubeId}/hqdefault.jpg` : song.cover}
                        alt={song.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = DEEZER_ARTIST_COVER;
                        }}
                      />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-white text-sm truncate">{song.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>{song.genre}</span>
                        <span>·</span>
                        <span>{song.year}</span>
                        <span>·</span>
                        <span>{song.duration}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* Watch video button */}
                    <button
                      onClick={() => selectSongAndVideo(idx)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        activeVideoId === song.youtubeId
                          ? "bg-red-600 text-white font-semibold"
                          : "bg-red-950/40 hover:bg-red-600 text-red-300 hover:text-white border border-red-800/40"
                      }`}
                    >
                      <Play size={12} className="fill-current" />
                      <span>Watch</span>
                    </button>

                    {/* Synth toggle */}
                    <button
                      onClick={() => toggleSynth(idx)}
                      className={`p-2 rounded-lg transition-colors ${
                        isCurrent && isPlayingSynth
                          ? "bg-sky-600 text-white"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                      }`}
                      title="Play synth audio"
                    >
                      {isCurrent && isPlayingSynth ? <Pause size={14} /> : <Music size={14} />}
                    </button>

                    {/* YouTube external link */}
                    <a
                      href={song.youtubeUrl || OFFICIAL_YOUTUBE_CHANNEL}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      title="Open on YouTube"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        <FooterSection />
      </div>
    </div>
  );
}
