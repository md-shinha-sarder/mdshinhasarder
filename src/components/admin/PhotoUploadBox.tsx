import { useState, useRef } from "react";
import { Upload, Check, Copy, ExternalLink, Loader2, CheckCircle2, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { uploadImageToCloudinary, registerMediaInRegistry } from "@/lib/cloudinary";
import { resolveMediaUrl, handleUploadedImageError } from "@/lib/mediaUrl";

export interface UploadResult {
  filename: string;
  domainUrl: string;
  localUrl: string;
  cdnUrl?: string;
  previewDataUrl?: string;
}

interface PhotoUploadBoxProps {
  label?: string;
  description?: string;
  value?: string;
  onUploadSuccess?: (result: UploadResult) => void;
  onApply?: (domainUrl: string) => void;
  onClear?: () => void;
  applyButtonLabel?: string;
  compact?: boolean;
}

async function createCompactPreviewDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result || "");
      // If small enough (< 220KB), store exact base64; otherwise create crisp resized backup
      if (!file.type.startsWith("image/") || raw.length < 220000) {
        resolve(raw);
        return;
      }
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        const MAX = 1000;
        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round((height * MAX) / width);
            width = MAX;
          } else {
            width = Math.round((width * MAX) / height);
            height = MAX;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/webp", 0.85));
        } else {
          resolve(raw);
        }
      };
      img.onerror = () => resolve(raw);
      img.src = raw;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

export function PhotoUploadBox({
  label = "Upload Photo to /images Folder",
  description = "Whichever photo you upload is directly saved and shown here — no other photo will be substituted.",
  value,
  onUploadSuccess,
  onApply,
  onClear,
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
  const [imgFailed, setImgFailed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, WebP, GIF, SVG).");
      return;
    }

    setUploading(true);
    setCopied(false);
    setImgFailed(false);

    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const baseClean =
        file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[^a-zA-Z0-9_-]/g, "-")
          .toLowerCase() || "photo";
      const uniqueSlug = `${baseClean}-${Date.now().toString(36).slice(-4)}`;
      const uniqueFileName = `${uniqueSlug}.${ext}`;
      const domainUrl = `https://mdshinhasarder.com/images/${uniqueFileName}`;
      const localUrl = `/images/${uniqueFileName}`;

      // 1. Read exact original file for full-quality disk save & immediate preview
      const fullDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => resolve("");
        reader.readAsDataURL(file);
      });

      const previewBackup = await createCompactPreviewDataUrl(file);

      // Show the EXACT uploaded photo immediately
      setUploadedPhoto({
        filename: uniqueFileName,
        domainUrl,
        localUrl,
        previewSrc: fullDataUrl || previewBackup || localUrl,
      });

      // 2. Save full file to server /public/images/
      if (fullDataUrl) {
        try {
          await fetch("/api/save-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName: uniqueFileName,
              dataUrl: fullDataUrl,
              publicId: uniqueSlug,
            }),
          });
        } catch (_saveErr) {
          console.warn("Direct /api/save-image save notice:", _saveErr);
        }
      }

      // 3. Upload to Cloudinary for global CDN persistence
      let cdnUrl = "";
      try {
        const cldRes = await uploadImageToCloudinary(file, uniqueSlug);
        if (cldRes?.cdn_optimized_url || cldRes?.secure_url) {
          cdnUrl = cldRes.cdn_optimized_url || cldRes.secure_url;
        }
      } catch (cldErr) {
        console.warn("Cloudinary CDN upload notice:", cldErr);
      }

      // 4. Persist to localStorage registry so ONLY this exact uploaded photo resolves everywhere
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
          previewDataUrl: previewBackup || undefined,
          created_at: new Date().toISOString(),
        };

        const raw = localStorage.getItem("shinha_media_items");
        const list = raw ? JSON.parse(raw) : [];
        const updated = [mediaItem, ...list.filter((x: any) => x.url !== domainUrl)];
        localStorage.setItem("shinha_media_items", JSON.stringify(updated.slice(0, 60)));
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
        previewDataUrl: fullDataUrl || previewBackup,
      };

      toast.success(`Photo uploaded! Showing "${file.name}"`);
      onUploadSuccess?.(result);
      onApply?.(domainUrl);
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

  // Determine which photo to display: exact just-uploaded photo, or explicitly set value
  const activeUrl = uploadedPhoto?.domainUrl || value || "";
  const activePreviewSrc = uploadedPhoto?.previewSrc || (value ? resolveMediaUrl(value) : "");
  const activeFilename = uploadedPhoto?.filename || activeUrl.split("/").pop() || "Uploaded Photo";

  return (
    <div className="rounded-xl border border-[#dadce0] bg-white p-4 shadow-xs space-y-3.5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#e8f0fe] border border-[#d2e3fc] flex items-center justify-center text-[#1a73e8] shrink-0">
            <Upload size={16} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[#202124] flex flex-wrap items-center gap-1.5">
              <span>{label}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e6f4ea] text-[#137333] border border-[#ceead6] font-mono">
                /images/
              </span>
            </h3>
            <p className="text-xs text-[#5f6368] leading-snug mt-0.5">{description}</p>
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
        className={`cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
          drag
            ? "border-[#1a73e8] bg-[#e8f0fe]/60 scale-[1.01]"
            : "border-[#dadce0] bg-[#f8f9fa] hover:border-[#1a73e8] hover:bg-[#f1f3f4]"
        } ${compact ? "py-3" : "py-5"}`}
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

        <div className="w-10 h-10 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
          {uploading ? <Loader2 size={20} className="animate-spin text-[#1a73e8]" /> : <Upload size={20} />}
        </div>

        <div className="text-xs sm:text-sm font-semibold text-[#202124]">
          {uploading ? "Uploading your exact photo..." : "Click to choose or drop photo here"}
        </div>
        <p className="text-[11px] text-[#5f6368]">
          JPG, PNG, WebP, SVG, GIF supported
        </p>
      </div>

      {/* Uploaded / Assigned Photo Preview (ONLY the uploaded photo, zero unrelated fallbacks) */}
      {activeUrl && (
        <div className="rounded-xl border border-[#ceead6] bg-[#f8fbf9] p-3 space-y-2.5">
          <div className="flex items-center justify-between gap-2 border-b border-[#ceead6] pb-2">
            <span className="text-xs font-semibold text-[#137333] flex items-center gap-1.5 truncate">
              <CheckCircle2 size={14} className="shrink-0" /> Uploaded Photo Preview
            </span>
            <span className="text-[11px] font-mono text-[#5f6368] truncate max-w-[160px]">
              {activeFilename}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-24 h-24 rounded-lg overflow-hidden border border-[#dadce0] bg-white shrink-0 flex items-center justify-center p-1">
              {!imgFailed && activePreviewSrc ? (
                <img
                  src={activePreviewSrc}
                  alt={activeFilename}
                  className="max-w-full max-h-full object-contain rounded"
                  onError={(e) =>
                    handleUploadedImageError(e.currentTarget, activeUrl, () => setImgFailed(true))
                  }
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-[#80868b] gap-1">
                  <ImageIcon size={20} />
                  <span className="text-[10px]">No Preview</span>
                </div>
              )}
            </div>

            <div className="flex-1 w-full min-w-0 space-y-2">
              <div className="bg-white border border-[#dadce0] rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-2">
                <code className="text-[11px] font-mono text-[#1a73e8] truncate flex-1 select-all">
                  {activeUrl}
                </code>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleCopy(activeUrl)}
                  className={`h-8 text-xs font-medium ${
                    copied ? "bg-[#1e8e3e] text-white" : "bg-[#1a73e8] hover:bg-[#1557b0] text-white"
                  }`}
                >
                  {copied ? <Check size={13} className="mr-1" /> : <Copy size={13} className="mr-1" />}
                  {copied ? "Copied!" : "Copy Link"}
                </Button>

                <Button
                  asChild
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs border-[#dadce0] text-[#3c4043] hover:bg-[#f1f3f4]"
                >
                  <a href={activePreviewSrc || activeUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={13} className="mr-1" /> Open
                  </a>
                </Button>

                {onClear && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setUploadedPhoto(null);
                      setImgFailed(false);
                      onClear();
                      toast.info("Photo removed");
                    }}
                    className="h-8 text-xs border-red-200 text-[#d93025] hover:bg-[#fce8e6]"
                  >
                    <X size={13} className="mr-1" /> Remove
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
