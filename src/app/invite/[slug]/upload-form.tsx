"use client";

import { type FormEvent, useState } from "react";

export default function UploadForm({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submitVideo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await fetch(`/api/submit/${slug}`, {
      method: "POST",
      body: formData,
    });

    setLoading(false);

    if (res.ok) {
      setDone(true);
      form.reset();
    } else {
      alert("Upload failed. Please try again.");
    }
  }

  if (done) {
    return (
      <div className="mt-6 rounded-2xl bg-green-900/40 p-4">
        Thank you! Your birthday video has been submitted.
      </div>
    );
  }

  return (
    <form onSubmit={submitVideo} className="mt-6 space-y-4">
      <input
        name="name"
        required
        placeholder="Your name"
        className="w-full rounded-2xl bg-neutral-800 px-4 py-3 outline-none"
      />

      <textarea
        name="message"
        placeholder="Optional short message"
        className="w-full rounded-2xl bg-neutral-800 px-4 py-3 outline-none"
      />

      <input
        name="video"
        required
        type="file"
        accept="video/*"
        className="w-full rounded-2xl bg-neutral-800 px-4 py-3"
      />

      <label className="flex gap-3 text-sm text-neutral-300">
        <input required type="checkbox" />
        I consent to this video being included in the birthday montage.
      </label>

      <button
        disabled={loading}
        className="w-full rounded-2xl bg-pink-500 py-3 font-semibold"
      >
        {loading ? "Uploading..." : "Submit video"}
      </button>
    </form>
  );
}
