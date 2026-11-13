import { useState } from "react";
import { useSongsData, Song, DEEZER_ARTIST_COVER } from "@/hooks/useSongsData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Youtube, ExternalLink, RotateCcw, Music, Play } from "lucide-react";
import { toast } from "sonner";

export default function SongsAdmin() {
  const { songs, addSong, updateSong, deleteSong, resetSongs } = useSongsData();
  const [editing, setEditing] = useState<Song | null>(null);
  const [open, setOpen] = useState(false);
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);

  const blankSong: Song = {
    id: `song-${Date.now()}`,
    title: "",
    type: "Single",
    year: "2025",
    duration: "3:30",
    genre: "Ambient / Classical",
    bpm: 75,
    freq: 261.63,
    description: "",
    deezerUrl: "https://www.deezer.com/en/artist/338551431",
    spotifyUrl: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
    cover: DEEZER_ARTIST_COVER,
    youtubeId: "",
    youtubeUrl: "https://www.youtube.com/channel/UCejecdsURkKqMAa9UCy9eZw",
  };

  const handleSave = () => {
    if (!editing) return;
    if (!editing.title.trim()) {
      toast.error("Song title is required");
      return;
    }

    // Auto extract youtube ID if full URL is provided in youtubeId or youtubeUrl
    let yId = editing.youtubeId.trim();
    if (yId.includes("watch?v=")) {
      yId = yId.split("watch?v=")[1].split("&")[0];
    } else if (yId.includes("youtu.be/")) {
      yId = yId.split("youtu.be/")[1].split("?")[0];
    }

    const payload: Song = {
      ...editing,
      youtubeId: yId,
      youtubeUrl: yId ? `https://www.youtube.com/watch?v=${yId}` : editing.youtubeUrl,
    };

    const exists = songs.some((s) => s.id === payload.id);
    if (exists) {
      updateSong(payload.id, payload);
      toast.success("Song updated successfully");
    } else {
      addSong(payload);
      toast.success("Song added successfully");
    }
    setOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete song "${title}"?`)) return;
    deleteSong(id);
    toast.success("Song deleted");
  };

  const handleReset = () => {
    if (!confirm("Reset songs catalog to default verified tracks?")) return;
    resetSongs();
    toast.success("Songs reset to defaults");
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dadce0] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202124] flex items-center gap-2">
            <Music className="w-6 h-6 text-[#e37400]" />
            <span>Songs &amp; YouTube Videos</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#5f6368] mt-0.5">
            Customize, add, and edit songs with YouTube video links, Deezer URLs, and cover art.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="border-[#dadce0] text-[#5f6368] hover:bg-[#f1f3f4] h-8 text-xs"
            title="Reset to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset Catalog
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                onClick={() => setEditing({ ...blankSong, id: `song-${Date.now()}` })}
                className="bg-[#e37400] hover:bg-[#d56b00] text-white text-xs font-medium rounded-full px-4 h-8 shadow-sm"
              >
                <Plus size={15} className="mr-1" /> Add New Song
              </Button>
            </DialogTrigger>

            <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90dvh] overflow-y-auto bg-white border border-[#dadce0] text-[#202124]">
              <DialogHeader>
                <DialogTitle>{editing && songs.some((s) => s.id === editing.id) ? "Edit Song" : "Add Song"}</DialogTitle>
              </DialogHeader>

              {editing && (
                <div className="space-y-4 pt-2">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label>Song Title *</Label>
                      <Input
                        value={editing.title}
                        onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                        placeholder="e.g. No Stars Heard Our Pain"
                      />
                    </div>
                    <div>
                      <Label>Genre</Label>
                      <Input
                        value={editing.genre}
                        onChange={(e) => setEditing({ ...editing, genre: e.target.value })}
                        placeholder="e.g. Ambient / Classical"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <Label>Release Year</Label>
                      <Input
                        value={editing.year}
                        onChange={(e) => setEditing({ ...editing, year: e.target.value })}
                        placeholder="2025"
                      />
                    </div>
                    <div>
                      <Label>Duration</Label>
                      <Input
                        value={editing.duration}
                        onChange={(e) => setEditing({ ...editing, duration: e.target.value })}
                        placeholder="3:42"
                      />
                    </div>
                    <div>
                      <Label>Audio Synth Freq (Hz)</Label>
                      <Input
                        type="number"
                        value={editing.freq}
                        onChange={(e) => setEditing({ ...editing, freq: parseFloat(e.target.value) || 261.63 })}
                        placeholder="261.63"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl p-3 bg-[#fce8e6]/60 border border-red-200 space-y-2">
                    <Label className="text-[#d93025] font-semibold flex items-center gap-1.5 text-xs">
                      <Youtube className="w-4 h-4 text-[#d93025]" />
                      YouTube Video ID or Link (from channel)
                    </Label>
                    <Input
                      value={editing.youtubeId}
                      onChange={(e) => setEditing({ ...editing, youtubeId: e.target.value })}
                      placeholder="e.g. dQMyeL9CDks or full YouTube watch link"
                      className="bg-white border-red-200 text-[#202124]"
                    />
                    <p className="text-[11px] text-[#5f6368]">
                      Channel:{" "}
                      <a
                        href="https://www.youtube.com/channel/UCejecdsURkKqMAa9UCy9eZw"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#d93025] underline break-all"
                      >
                        https://www.youtube.com/channel/UCejecdsURkKqMAa9UCy9eZw
                      </a>
                    </p>
                  </div>

                  <div>
                    <Label>Deezer URL</Label>
                    <Input
                      value={editing.deezerUrl}
                      onChange={(e) => setEditing({ ...editing, deezerUrl: e.target.value })}
                      placeholder="https://www.deezer.com/en/artist/338551431"
                    />
                  </div>

                  <div>
                    <Label>Cover Artwork URL</Label>
                    <Input
                      value={editing.cover}
                      onChange={(e) => setEditing({ ...editing, cover: e.target.value })}
                      placeholder="https://cdn-images.dzcdn.net/..."
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      rows={3}
                      value={editing.description}
                      onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                      placeholder="Atmospheric composition with gentle acoustic textures..."
                    />
                  </div>

                  <div className="pt-2">
                    <Button onClick={handleSave} className="w-full">
                      Save Song Details
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Video preview modal */}
      {previewVideoId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm text-white">YouTube Video Preview</span>
              <Button size="sm" variant="ghost" onClick={() => setPreviewVideoId(null)}>
                ✕ Close
              </Button>
            </div>
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${previewVideoId}?autoplay=1`}
                title="Song Video Preview"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Songs Table / Card List */}
      <div className="border border-border rounded-xl divide-y divide-border bg-card overflow-hidden">
        {songs.map((song, i) => (
          <div key={song.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/40 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-7 h-7 rounded-full bg-muted text-xs font-mono font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>

              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-border bg-black">
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
                <h3 className="font-semibold text-sm text-foreground truncate">{song.title}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                  <span>{song.genre}</span>
                  <span>·</span>
                  <span>{song.year}</span>
                  <span>·</span>
                  <span>{song.duration}</span>
                  {song.youtubeId && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                      <Youtube className="w-3 h-3 text-red-500" />
                      {song.youtubeId}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
              {song.youtubeId && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewVideoId(song.youtubeId)}
                  className="text-xs text-red-400 border-red-500/30 hover:bg-red-500/10"
                >
                  <Play className="w-3 h-3 mr-1 text-red-500 fill-red-500" />
                  Watch
                </Button>
              )}
              {song.youtubeUrl && (
                <a
                  href={song.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                  title="Open in YouTube"
                >
                  <ExternalLink size={14} />
                </a>
              )}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setEditing({ ...song });
                  setOpen(true);
                }}
              >
                <Pencil size={14} />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleDelete(song.id, song.title)}>
                <Trash2 size={14} className="text-red-400" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
