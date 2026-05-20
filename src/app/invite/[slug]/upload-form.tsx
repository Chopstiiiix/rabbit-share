"use client";

import { type FormEvent, useState } from "react";
import { upload } from "@vercel/blob/client";
import { nanoid } from "nanoid";
import Link from "next/link";

const getVideoExtension = (file: File) =>
  file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "mp4";

export default function UploadForm({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string | null>(null);

  async function submitVideo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setProgress(0);
    setStatus("Preparing upload...");
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const video = formData.get("video") as File | null;

    if (!name || !video) {
      setError("Add your name and choose a video before submitting.");
      setLoading(false);
      setStatus(null);
      return;
    }

    try {
      const pathname = `uploads/${slug}/${nanoid()}.${getVideoExtension(video)}`;

      setStatus("Uploading video...");

      const blob = await upload(pathname, video, {
        access: "public",
        handleUploadUrl: `/api/blob-upload/${slug}`,
        clientPayload: JSON.stringify({ slug }),
        contentType: video.type || "video/mp4",
        multipart: true,
        onUploadProgress: ({ percentage }) => {
          setProgress(Math.max(1, Math.round(percentage)));
        },
      });

      setProgress(100);
      setStatus("Saving submission...");

      const res = await fetch(`/api/submit/${slug}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name,
          message,
          videoUrl: blob.url,
        }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(payload.error || "Upload failed. Please try again.");
      }

      setDone(true);
      form.reset();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Upload failed. Please try again.",
      );
    } finally {
      setLoading(false);
      setStatus(null);
    }
  }

  if (done) {
    return (
      <div className="mt-6 space-y-4">
        <div className="motion-pop rounded-2xl bg-green-900/40 p-4">
          Thank you! Your video has been submitted.
        </div>

        <div className="motion-rise overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 p-5 shadow-2xl shadow-pink-950/20">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-200">
            Rabbit Share
          </p>
          <h2 className="mt-3 text-2xl font-bold leading-tight">
            Make one for your own people next.
          </h2>
          <p className="mt-3 text-sm leading-6 text-neutral-300">
            Collect short videos from friends, family, teammates, or guests and
            turn them into one shareable montage.
          </p>

          <Link
            href="/create"
            className="pressable-cta cta-pulse mt-5 inline-flex rounded-full bg-pink-500 px-5 py-3 text-sm font-semibold text-white"
          >
            Try Rabbit Share
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submitVideo} className="mt-6 space-y-4">
      <input
        name="name"
        required
        placeholder="Your name"
        disabled={loading}
        className="w-full rounded-2xl bg-neutral-800 px-4 py-3 outline-none"
      />

      <textarea
        name="message"
        placeholder="Optional short message"
        disabled={loading}
        className="w-full rounded-2xl bg-neutral-800 px-4 py-3 outline-none"
      />

      <input
        name="video"
        required
        type="file"
        accept="video/*"
        disabled={loading}
        className="w-full rounded-2xl bg-neutral-800 px-4 py-3"
      />

      <label className="flex gap-3 text-sm text-neutral-300">
        <input required type="checkbox" />
        I consent to this video being included in the final montage.
      </label>

      {loading && (
        <div className="rounded-2xl border border-white/10 bg-neutral-950 p-4">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-neutral-300">
              {status || "Uploading video..."}
            </span>
            <span className="font-semibold text-pink-200">{progress}%</span>
          </div>

          <div className="mt-3 h-3 overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-pink-500 transition-[width] duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-2xl bg-red-950/70 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      )}

      <button
        disabled={loading}
        className="pressable-cta cta-pulse w-full rounded-2xl bg-pink-500 py-3 font-semibold disabled:cursor-not-allowed disabled:bg-pink-500/60"
      >
        {loading ? "Uploading..." : "Submit video"}
      </button>
    </form>
  );
}
