"use client";

import Image from "next/image";
import { useState } from "react";

interface FoodImageProps {
  src: string;
  alt: string;
  emoji: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * Fills its (relative, sized) parent with the meal photo and gracefully
 * falls back to a warm gradient + emoji if the remote image fails.
 */
export function FoodImage({
  src,
  alt,
  emoji,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
  className = "",
}: FoodImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        aria-label={alt}
        role="img"
        className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-100 via-cream-200 to-brand-200 text-5xl ${className}`}
      >
        <span>{emoji}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
