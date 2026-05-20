"use client";

import { Play } from "lucide-react";
import { useMemo, useRef, useState } from "react";

const palette = [
  ["#ec4899", "#0f172a"],
  ["#22c55e", "#111827"],
  ["#f97316", "#18181b"],
  ["#38bdf8", "#111827"],
  ["#facc15", "#1f2937"],
];

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "RS";

const createFallbackPoster = (name: string, index: number) => {
  const [accent, base] = palette[index % palette.length];
  const initials = getInitials(name);
  const label = name.replace(/[<>&"]/g, "").slice(0, 28);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${accent}"/>
          <stop offset="52%" stop-color="${base}"/>
          <stop offset="100%" stop-color="#020617"/>
        </linearGradient>
        <radialGradient id="r" cx="28%" cy="24%" r="65%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#g)"/>
      <rect width="1280" height="720" fill="url(#r)"/>
      <circle cx="640" cy="306" r="104" fill="#ffffff" opacity="0.14"/>
      <polygon points="620,260 620,352 702,306" fill="#ffffff" opacity="0.9"/>
      <text x="640" y="474" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="82" font-weight="700" fill="#ffffff">${initials}</text>
      <text x="640" y="536" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="600" fill="#ffffff" opacity="0.82">${label}</text>
      <text x="640" y="584" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#ffffff" opacity="0.58">Video message</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export default function SubmissionVideoPreview({
  name,
  message,
  videoUrl,
  index,
}: {
  name: string;
  message: string | null;
  videoUrl: string;
  index: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fallbackPoster = useMemo(
    () => createFallbackPoster(name, index),
    [index, name],
  );
  const [poster, setPoster] = useState(fallbackPoster);
  const [captured, setCaptured] = useState(false);

  function capturePoster() {
    const video = videoRef.current;

    if (!video || captured || video.readyState < 2) {
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      const context = canvas.getContext("2d");
      if (!context) return;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      setPoster(canvas.toDataURL("image/jpeg", 0.78));
      setCaptured(true);
    } catch {
      setCaptured(true);
    }
  }

  function seekForPoster() {
    const video = videoRef.current;

    if (!video || captured) {
      return;
    }

    if (!Number.isFinite(video.duration) || video.duration <= 0.35) {
      capturePoster();
      return;
    }

    try {
      video.currentTime = Math.min(0.6, video.duration * 0.18);
    } catch {
      capturePoster();
    }
  }

  return (
    <div className="motion-pop overflow-hidden rounded-2xl bg-neutral-800">
      <div className="relative bg-neutral-950">
        <video
          ref={videoRef}
          src={videoUrl}
          poster={poster}
          controls
          crossOrigin="anonymous"
          preload="metadata"
          onLoadedMetadata={seekForPoster}
          onSeeked={capturePoster}
          className="aspect-video w-full bg-neutral-950 object-cover"
        />

        <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          <Play size={13} fill="currentColor" />
          Preview
        </div>
      </div>

      <div className="p-4">
        <p className="font-semibold">{name}</p>
        {message && <p className="mt-1 text-sm text-neutral-300">{message}</p>}
      </div>
    </div>
  );
}
