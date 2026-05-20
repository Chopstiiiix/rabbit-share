"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { type CelebrationCategory } from "@/lib/celebration-categories";

type CreateCelebrationResponse = {
  slug?: string;
  error?: string;
};

export default function CreateCelebrationForm({
  selectedCategory,
}: {
  selectedCategory: CelebrationCategory;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isOther = selectedCategory.slug === "other";

  async function createCelebration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const celebrant = String(formData.get("celebrant") || "").trim();
    const deadline = String(formData.get("deadline") || "").trim();
    const customCategory = String(formData.get("customCategory") || "").trim();

    if (!celebrant) {
      setError("Add the celebrant name to create the invite.");
      setLoading(false);
      return;
    }

    if (isOther && !customCategory) {
      setError("Name the celebration category to create the invite.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/celebrations", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          category: selectedCategory.slug,
          customCategory,
          celebrant,
          deadline,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as
        CreateCelebrationResponse;

      if (!response.ok || !payload.slug) {
        throw new Error(payload.error || "Unable to create this celebration.");
      }

      router.push(`/dashboard/${payload.slug}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create this celebration.",
      );
      setLoading(false);
    }
  }

  return (
    <form onSubmit={createCelebration} className="mt-6 space-y-4">
      <input type="hidden" name="category" value={selectedCategory.slug} />

      <div className="motion-pop rounded-lg border border-white/10 bg-neutral-950 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Selected category
        </p>
        <p className="mt-1 text-lg font-semibold text-white">
          {selectedCategory.label}
        </p>
        <p className="mt-1 text-sm leading-6 text-neutral-400">
          {selectedCategory.description}
        </p>
      </div>

      {isOther && (
        <div>
          <label
            htmlFor="customCategory"
            className="block text-sm font-medium text-neutral-200"
          >
            Category name
          </label>
          <input
            id="customCategory"
            name="customCategory"
            required
            placeholder="Award night, reunion, launch party..."
            className="mt-2 w-full rounded-lg bg-neutral-800 px-4 py-3 text-white outline-none ring-1 ring-white/10 transition focus:ring-pink-400"
          />
        </div>
      )}

      <div>
        <label
          htmlFor="celebrant"
          className="block text-sm font-medium text-neutral-200"
        >
          Celebrant name
        </label>
        <input
          id="celebrant"
          name="celebrant"
          required
          placeholder="Maya"
          autoComplete="name"
          className="mt-2 w-full rounded-lg bg-neutral-800 px-4 py-3 text-white outline-none ring-1 ring-white/10 transition focus:ring-pink-400"
        />
      </div>

      <div>
        <label
          htmlFor="deadline"
          className="block text-sm font-medium text-neutral-200"
        >
          Submission date
        </label>
        <input
          id="deadline"
          name="deadline"
          type="date"
          className="mt-2 w-full rounded-lg bg-neutral-800 px-4 py-3 text-white outline-none ring-1 ring-white/10 transition focus:ring-pink-400"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-950/70 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      )}

      <button
        disabled={loading}
        className="pressable-cta cta-pulse w-full rounded-lg bg-pink-500 px-5 py-3 font-semibold text-white hover:bg-pink-400 disabled:cursor-not-allowed disabled:bg-pink-500/60"
      >
        {loading ? "Creating..." : "Create invite link"}
      </button>
    </form>
  );
}
