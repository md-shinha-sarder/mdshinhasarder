import React, { useState } from "react";
import { toCloudinaryImageUrl, CloudinaryTransformOptions } from "@/lib/cloudinary";

export interface CldImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string;
  width?: number | string;
  height?: number | string;
  alt?: string;
  crop?:
    | {
        type?: "auto" | "fill" | "scale" | "fit" | "limit" | "thumb";
        source?: boolean;
        gravity?: "auto" | "face" | "center";
      }
    | "auto"
    | "fill"
    | "scale"
    | "fit"
    | "limit";
  quality?: "auto" | "auto:best" | "auto:good" | "auto:eco" | number;
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
  fallbackSrc?: string;
}

export const CldImage: React.FC<CldImageProps> = ({
  src,
  width,
  height,
  alt = "MD. Shinha Sarder Asset",
  crop,
  quality = "auto",
  format = "auto",
  fallbackSrc,
  className = "",
  style,
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);

  const numWidth = typeof width === "number" ? width : parseInt(String(width || ""), 10) || undefined;
  const numHeight = typeof height === "number" ? height : parseInt(String(height || ""), 10) || undefined;

  let cropType: any = "auto";
  let gravity: any = "auto";
  if (typeof crop === "object" && crop !== null) {
    cropType = crop.type || "auto";
    gravity = crop.gravity || "auto";
  } else if (typeof crop === "string") {
    cropType = crop;
  }

  const transformOptions: CloudinaryTransformOptions = {
    width: numWidth,
    height: numHeight,
    crop: cropType,
    quality,
    format,
    gravity,
  };

  const cloudinaryUrl = toCloudinaryImageUrl(src, transformOptions);

  // Fallback to local or raw source if error
  const finalSrc = hasError ? (fallbackSrc || (src.startsWith("/") ? src : `/images/${src.replace(/^[a-z0-9_-]+\//i, "")}`)) : cloudinaryUrl;

  return (
    <img
      src={finalSrc}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (!hasError) setHasError(true);
      }}
      className={className}
      style={style}
      {...rest}
    />
  );
};

export default CldImage;
