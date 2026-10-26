import { useState, useRef } from "react";
import { Upload, Check, Copy, ExternalLink, Image as ImageIcon, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { uploadImageToCloudinary, registerMediaInRegistry } from "@/lib/cloudinary";

export interface UploadResult {
  filename: string;
  domainUrl: string;
  localUrl: string;
  cdnUrl?: string;
}

interface PhotoUploadBoxProps {
  label?: string;
  description?: string;
  onUploadSuccess?: (result: UploadResult) => void;
  onApply?: (domainUrl: string) => void;
  applyButtonLabel?: string;
  compact?: boolean;
}

export function PhotoUploadBox({
  label = "Upload Photo to /images Folder",
  description = "Whichever photo you upload is directly saved to /images/ and creates your official domain link.",
  onUploadSuccess,
  onApply,
  applyButtonLabel = "Use As Cover Photo",
  compact = false,
}: PhotoUploadBoxProps) {
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<{
    filename: string;
    domainUrl: string;
    localUrl: string;
    previewSrc: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, WebP, GIF, SVG).");
      return;
    }

    setUploading(true);
    setCopied(false);

    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const baseClean = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "-")
        .toLowerCase() || "photo";
      const uniqueSlug = `${baseClean}-${Date.now().toString(36).slice(-4)}`;
      const uniqueFileName = `${uniqueSlug}.${ext}`;
      const domainUrl = `https://mdshinhasarder.com/images/${uniqueFileName}`;
      const localUrl = `/images/${uniqueFileName}`;

      // 1. Read file as base64 for immediate live preview and server-side disk save
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => resolve("");
        reader.readAsDataURL(file);
      });

      // Show the EXACT photo right away in the UI
      setUploadedPhoto({
        filename: uniqueFileName,
        domainUrl,
        localUrl,
        previewSrc: dataUrl || localUrl,
      });

      // 2. Save directly to server /public/images/ and /dist/images/
      if (dataUrl) {
        try {
          await fetch("/api/save-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName: uniqueFileName,
              dataUrl,
              publicId: uniqueSlug,
            }),
          });
        } catch (_saveErr) {
          console.warn("Direct /api/save-image save notice:", _saveErr);
        }
      }

      // 3. Upload to Cloudinary for instant CDN distribution
      let cdnUrl = "";
      try {
        const cldRes = await uploadImageToCloudinary(file, uniqueSlug);
        if (cldRes?.cdn_optimized_url) {
          cdnUrl = cldRes.cdn_optimized_url;
        }
      } catch (cldErr) {
        console.warn("Cloudinary CDN upload notice:", cldErr);
      }

      // 4. Save to localStorage items & registry so it shows across the entire site
      try {
        const mediaItem = {
          id: `upload-${Date.now()}-${uniqueSlug}`,
          name: file.name,
          url: domainUrl,
          localUrl,
          path: uniqueSlug,
          mime_type: file.type,
          size_bytes: file.size,
          cloudinary_url: cdnUrl,
          created_at: new Date().toISOString(),
        };

        const raw = localStorage.getItem("shinha_media_items");
        const list = raw ? JSON.parse(raw) : [];
        const updated = [mediaItem, ...list.filter((x: any) => x.url !== domainUrl)];
        localStorage.setItem("shinha_media_items", JSON.stringify(updated.slice(0, 100)));
        localStorage.setItem("shinha_last_uploaded_photo", JSON.stringify(mediaItem));

        registerMediaInRegistry({
          slug: uniqueFileName,
          publicId: uniqueSlug,
          cloudinaryUrl: cdnUrl || domainUrl,
          domainUrl,
          name: file.name,
        });
      } catch (_storageErr) {
        void _storageErr;
      }

      const result: UploadResult = {
        filename: uniqueFileName,
        domainUrl,
        localUrl,
        cdnUrl,
      };

      toast.success(`Photo uploaded! Domain link: ${domainUrl}`);
      onUploadSuccess?.(result);

      if (onApply) {
        onApply(domainUrl);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload photo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Domain image link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-blue-500/30 bg-[#060e24]/90 p-4 sm:p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
            <Upload size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <span>{label}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                /images/
              </span>
            </h3>
            <p className="text-xs text-slate-300">{description}</p>
          </div>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) processFile(f);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition-all flex flex-col items-center justify-center gap-2 ${
          drag
            ? "border-blue-400 bg-blue-500/15 scale-[1.01]"
            : "border-blue-500/30 bg-[#03081a]/60 hover:border-blue-400/60 hover:bg-[#081233]"
        } ${compact ? "py-4" : "py-6"}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) processFile(f);
          }}
        />

        <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
          {uploading ? <Loader2 size={22} className="animate-spin text-blue-400" /> : <Upload size={22} />}
        </div>

        <div className="text-xs sm:text-sm font-semibold text-white">
          {uploading ? "Saving photo to /images/ folder & generating link..." : "Click to select or drop any photo here"}
        </div>
        <p className="text-[11px] text-slate-400">
          Supports JPG, PNG, WebP, SVG, GIF. Automatically saves to <b>/public/images/</b>
        </p>
      </div>

      {/* Uploaded Photo Preview Card (Shows the EXACT photo uploaded) */}
      {uploadedPhoto && (
        <div className="rounded-xl border border-emerald-500/40 bg-[#041226] p-3.5 sm:p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 size={15} /> Uploaded Photo &amp; Domain Link
            </span>
            <span className="text-[11px] font-mono text-cyan-300 truncate max-w-[200px]">
              {uploadedPhoto.filename}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* The EXACT Uploaded Photo Thumbnail */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden border border-emerald-500/30 bg-black/60 shrink-0 flex items-center justify-center p-1">
              <img
                src={uploadedPhoto.previewSrc}
                alt={uploadedPhoto.filename}
                className="max-w-full max-h-full object-contain rounded"
              />
            </div>

            {/* Domain Link & Action Buttons */}
            <div className="flex-1 w-full min-w-0 space-y-2">
              <div className="text-xs text-slate-300">
                Official Website Domain Link:
              </div>
              <div className="bg-[#02050f] border border-blue-500/30 rounded-lg p-2 flex items-center justify-between gap-2">
                <code className="text-xs font-mono text-cyan-300 truncate flex-1 select-all">
                  {uploadedPhoto.domainUrl}
                </code>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleCopy(uploadedPhoto.domainUrl)}
                  className={`h-8 text-xs font-semibold ${
                    copied ? "bg-emerald-600 text-white" : "bg-blue-600 hover:bg-blue-500 text-white"
                  }`}
                >
                  {copied ? <Check size={13} className="mr-1" /> : <Copy size={13} className="mr-1" />}
                  {copied ? "Copied Link!" : "Copy Domain Link"}
                </Button>

                <Button
                  asChild
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs border-blue-500/30 text-blue-300 hover:bg-blue-600/10"
                >
                  <a href={uploadedPhoto.localUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={13} className="mr-1" /> View Photo
                  </a>
                </Button>

                {onApply && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      onApply(uploadedPhoto.domainUrl);
                      toast.success("Applied to cover photo!");
                    }}
                    className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                  >
                    <Sparkles size={13} className="mr-1 text-yellow-300" />
                    {applyButtonLabel}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
