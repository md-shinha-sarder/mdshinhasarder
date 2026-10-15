import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import SiteBackground from "@/components/SiteBackground";
import FooterSection from "@/components/FooterSection";
import PageInfobox from "@/components/PageInfobox";
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
import { useSongsData, DEEZER_ARTIST_COVER, OFFICIAL_YOUTUBE_CHANNEL } from "@/hooks/useSongsData";

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
    // Scroll to video player
    setTimeout(() => {
      const el = document.getElementById("video-stream-player");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
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

  const musicStats = [
    { label: "Studio Releases", value: `${songs.length} Tracks`, color: "text-red-400", subtext: "Official Catalog" },
    { label: "Artist Verified", value: "Verified", color: "text-emerald-400", subtext: "Deezer & YouTube" },
    { label: "Primary Genre", value: "Ambient", color: "text-amber-400", subtext: "Melodic & Classical" },
    { label: "Distribution", value: "Global", color: "text-sky-300", subtext: "Multi-Platform HD" },
  ];

  const musicFacts = [
    { label: "Artist Entity", value: <span className="text-white font-bold">MD. Shinha Sarder (Verified Musical Artist)</span> },
    { label: "Streaming Platforms", value: <span className="text-sky-300 font-semibold">Deezer Artist Page (#338551431) · YouTube Official Channel · Spotify</span> },
    { label: "Discography Highlights", value: <span className="text-slate-100">Emotional Sad Theme · Memory of Village · Rainy Day Instrumental · Study Relax Beat · Koyra River Melody · Khulna City Breeze</span> },
    { label: "Audio Production", value: <span className="text-slate-100">Harmonic multi-voice sound synthesis, cinematic ambient arrangements, and algorithmic audio design</span> },
    { label: "Rights & Attribution", value: <span className="text-slate-100">Official Releases © MD. Shinha Sarder. Broadcast worldwide under digital copyright registry.</span> },
  ];

  return (
    <div className="relative min-h-screen bg-black text-slate-100 selection:bg-blue-500/30 selection:text-blue-200">
      <Helmet>
        <title>MD. Shinha Sarder — Music &amp; Official Releases</title>
        <meta
          name="description"
          content="Official discography, music videos, and ambient instrumental releases by MD. Shinha Sarder on YouTube, Deezer, and Spotify."
        />
        <link rel="canonical" href="https://www.mdshinhasarder.com/p/songs.html" />
      </Helmet>

      <SiteBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 container mx-auto px-4 sm:px-6 pt-24 pb-16 max-w-5xl">
          {/* Blue UI/UX Design Board Musical Artist Infobox */}
          <PageInfobox
            title="MD. Shinha Sarder — Musical Artist &amp; Discography"
            subtitle="Verified Musical Artist · Deezer (Artist #338551431), YouTube &amp; Streaming Catalog"
            badge="Verified Musical Artist"
            badgeIcon={Music}
            avatarUrl="/profile.webp"
            avatarAlt="MD. Shinha Sarder"
            verified={true}
            description="Original ambient melodies, instrumental tracks, and official YouTube music releases composed and produced by MD. Shinha Sarder."
            stats={musicStats}
            facts={musicFacts}
            actions={[
              {
                label: "YouTube Music Channel",
                href: OFFICIAL_YOUTUBE_CHANNEL,
                icon: Youtube,
                primary: true,
                external: true,
              },
              {
                label: "Deezer Artist Page",
                href: "https://www.deezer.com/en/artist/338551431",
                icon: Radio,
                external: true,
              },
              {
                label: copied ? "Copied" : "Share Music",
                onClick: handleShare,
                icon: copied ? Check : Share2,
              },
            ]}
          />

          {/* Featured Video Player Container with Blue UI/UX Board */}
          <div id="video-stream-player" className="my-8 scroll-mt-24 blue-uix-board p-5 sm:p-7 rounded-2xl sm:rounded-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-red-600 text-white shadow-md shadow-red-600/30">
                  <Youtube className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider block">Live Stream Player</span>
                  <span className="text-sm font-bold text-white">Now Streaming: {activeSong?.title}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={activeSong?.youtubeUrl || `https://www.youtube.com/watch?v=${activeVideoId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-600/30 transition-transform hover:scale-105"
                >
                  <Youtube size={13} />
                  <span>Stream on YouTube (Direct HD)</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-blue-500/30 shadow-2xl relative">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0&playsinline=1`}
                title={activeSong?.title || "MD. Shinha Sarder Music Video"}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>

            <div className="mt-3 p-3.5 rounded-xl blue-uix-card flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-blue-200">
              <span className="text-center sm:text-left">
                If YouTube restricts embed playback on your browser, stream the official video directly on YouTube.
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={activeSong?.youtubeUrl || `https://www.youtube.com/watch?v=${activeVideoId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-lg bg-red-600/30 text-red-300 hover:bg-red-600 hover:text-white border border-red-500/40 transition-colors font-semibold flex items-center gap-1"
                >
                  <span>Open Video in YouTube</span>
                  <ExternalLink size={11} />
                </a>
                <a
                  href="https://www.deezer.com/artist/338551431"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-white border border-amber-500/30 transition-colors font-semibold flex items-center gap-1"
                >
                  <Radio size={11} />
                  <span>Deezer Audio</span>
                </a>
              </div>
            </div>
          </div>

          {/* Deezer Official Stream Player in Blue Container */}
          <div className="mb-8 rounded-2xl overflow-hidden border border-blue-500/30 bg-black shadow-xl">
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

          {/* Interactive Synth Audio Controls Bar in Blue UI/UX Card */}
          <div className="p-4 sm:p-5 rounded-2xl blue-uix-card mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleSynth(currentSongIndex)}
                className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/35 transition-all hover:scale-105"
                title={isPlayingSynth ? "Pause Audio Synth" : "Play Harmonic Audio Synth"}
              >
                {isPlayingSynth ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
              </button>
              <div>
                <span className="text-sky-300 text-[10px] uppercase font-bold tracking-wider block">Interactive Audio Synth</span>
                <strong className="text-white text-sm">{activeSong?.title} ({activeSong?.freq} Hz)</strong>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-blue-300 hover:text-white p-1 rounded-lg hover:bg-blue-900/40 transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
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
                className="w-28 accent-sky-400 h-1.5 bg-blue-950 rounded-lg cursor-pointer"
              />
              <span className="font-mono text-sky-300 text-xs font-semibold">{activeSong?.duration}</span>
            </div>
          </div>

          {/* Song Catalog List with High-Contrast Blue UI/UX Rows */}
          <div className="border border-blue-500/30 rounded-2xl divide-y divide-blue-500/20 overflow-hidden bg-[#061230]/80 shadow-xl">
            {songs.map((song: Song, idx: number) => {
              const isCurrent = currentSongIndex === idx;
              const hasVideo = Boolean(song.youtubeId);
              return (
                <div
                  key={song.id}
                  className={`p-3.5 sm:p-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCurrent ? "bg-blue-900/40 border-l-4 border-l-sky-400" : "hover:bg-blue-900/20"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-blue-950 border border-blue-500/30 text-sky-300 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>

                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-blue-400/30 bg-black shadow-md">
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
                      <h3 className="font-bold text-white text-sm truncate">{song.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-blue-200/90 mt-0.5">
                        <span>{song.genre}</span>
                        <span>·</span>
                        <span>{song.year}</span>
                        <span>·</span>
                        <span>{song.duration}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* Watch video stream button */}
                    <button
                      onClick={() => selectSongAndVideo(idx)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        activeVideoId === song.youtubeId
                          ? "bg-red-600 text-white font-semibold shadow-sm"
                          : "bg-red-950/40 hover:bg-red-600 text-red-300 hover:text-white border border-red-800/40"
                      }`}
                    >
                      <Play size={12} className="fill-current" />
                      <span>{activeVideoId === song.youtubeId ? "Now Streaming" : "Stream"}</span>
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

                    {/* Deezer track / artist link */}
                    <a
                      href={song.deezerUrl || "https://www.deezer.com/artist/338551431"}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 transition-colors"
                      title="Stream on Deezer"
                    >
                      <Radio size={14} />
                    </a>

                    {/* YouTube external link */}
                    <a
                      href={song.youtubeUrl || OFFICIAL_YOUTUBE_CHANNEL}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-red-600/30 text-slate-400 hover:text-red-400 transition-colors"
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
