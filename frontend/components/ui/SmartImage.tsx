"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * next/image with a graceful failure. A portfolio must never show a broken
 * image icon (§43), and skill icons come from an external CDN whose exact
 * slugs are editable by the admin — so a miss is always possible.
 */
export function SmartImage({
  src, alt, fill, width, height, className = "", fallback, sizes, priority,
  eager, unoptimized, style,
}: {
  src: string | null | undefined;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  fallback?: React.ReactNode;
  sizes?: string;
  priority?: boolean;
  /** Load immediately. Needed inside the marquee, where items sit off-screen
   *  and lazy loading never fires. */
  eager?: boolean;
  /** Skip the Next optimizer — right for small CDN icons. */
  unoptimized?: boolean;
  style?: React.CSSProperties;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <>{fallback ?? <FallbackTile label={alt} className={className} />}</>;
  }

  return (
    <Image
      src={src}
      alt={alt}
      {...(fill ? { fill: true } : { width: width ?? 96, height: height ?? 96 })}
      sizes={sizes}
      priority={priority}
      className={className}
      loading={eager ? "eager" : undefined}
      onError={() => setFailed(true)}
      unoptimized={unoptimized || src.endsWith(".svg")}
    />
  );
}

/** A lettered tile standing in for a missing image. */
export function FallbackTile({ label, className = "" }: { label: string; className?: string }) {
  const letter = label.trim()[0]?.toUpperCase() ?? "?";
  return (
    <span
      className={`flex items-center justify-center bg-[var(--bg-raised)] font-medium text-[var(--muted)] ${className}`}
      aria-hidden="true"
    >
      {letter}
    </span>
  );
}
