"use client";

import { Check, Copy, Play, Share2 } from "lucide-react";
import { useRef, useState } from "react";

const fallbackPoster = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#ec4899"/>
        <stop offset="50%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#020617"/>
      </linearGradient>
      <radialGradient id="r" cx="34%" cy="28%" r="70%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1280" height="720" fill="url(#g)"/>
    <rect width="1280" height="720" fill="url(#r)"/>
    <circle cx="640" cy="300" r="110" fill="#ffffff" opacity="0.14"/>
    <polygon points="620,250 620,350 710,300" fill="#ffffff" opacity="0.92"/>
    <text x="640" y="486" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="62" font-weight="700" fill="#ffffff">Final Montage</text>
    <text x="640" y="540" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#ffffff" opacity="0.68">Ready to share</text>
  </svg>
`)}`;

export default function FinalVideoCard({
  videoUrl,
  watchLink,
  title = "Final video ready",
  showOpenLink = true,
}: {
  videoUrl: string;
  watchLink: string;
  title?: string;
  showOpenLink?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [poster, setPoster] = useState(fallbackPoster);
  const [captured, setCaptured] = useState(false);
  const [copied, setCopied] = useState(false);

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

    if (!Number.isFinite(video.duration) || video.duration <= 0.5) {
      capturePoster();
      return;
    }

    try {
      video.currentTime = Math.min(0.8, video.duration * 0.12);
    } catch {
      capturePoster();
    }
  }

  async function copyWatchLink() {
    try {
      await navigator.clipboard.writeText(watchLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  async function shareWatchLink() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Rabbit Share final video",
          text: "Watch the final Rabbit Share video montage.",
          url: watchLink,
        });
        return;
      } catch {
        return;
      }
    }

    await copyWatchLink();
  }

  return (
    <div className="motion-rise overflow-hidden rounded-3xl bg-neutral-900 p-6 text-left">
      <h2 className="text-xl font-bold">{title}</h2>

      <div className="relative mt-4 overflow-hidden rounded-2xl bg-neutral-950">
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
          Final video
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
        <input
          readOnly
          value={watchLink}
          onFocus={(event) => event.currentTarget.select()}
          className="w-full rounded-2xl bg-neutral-800 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/10 transition focus:ring-pink-400"
          aria-label="Final video watch link"
        />

        {showOpenLink && (
          <a
            href={watchLink}
            className="pressable-cta inline-flex items-center justify-center gap-2 rounded-2xl bg-pink-500 px-4 py-3 text-sm font-semibold text-white"
          >
            <Play size={18} fill="currentColor" />
            Open
          </a>
        )}

        <button
          type="button"
          onClick={copyWatchLink}
          className="pressable-cta inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
          {copied ? "Copied" : "Copy"}
        </button>

        <button
          type="button"
          onClick={shareWatchLink}
          className="pressable-cta inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-neutral-800 px-4 py-3 text-sm font-semibold text-white"
        >
          <Share2 size={18} />
          Share
        </button>
      </div>
    </div>
  );
}
