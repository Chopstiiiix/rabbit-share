import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import AdminDashboardLink from "@/components/admin-dashboard-link";
import { getCategoryBySlug } from "@/lib/celebration-categories";
import CreateCelebrationForm from "./create-celebration-form";

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const selectedCategory = getCategoryBySlug(category);
  const pageTitle =
    selectedCategory.slug === "other"
      ? "Start a custom video collection."
      : `Start a ${selectedCategory.label.toLowerCase()} video collection.`;

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-xl">
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex text-sm font-medium text-neutral-400 transition hover:text-white active:translate-y-px"
          >
            Back to home
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="pressable-card rounded-full border border-white/10 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
            >
              My events
            </Link>
            <AdminDashboardLink />
            <UserButton />
          </div>
        </header>

        <div className="motion-rise mt-6 rounded-lg bg-neutral-900 p-8 shadow-xl">
          <p className="mb-3 text-sm text-pink-300">Create an invite</p>

          <h1 className="text-4xl leading-tight font-bold">
            {pageTitle}
          </h1>

          <p className="mt-4 text-neutral-300">
            Name the celebrant, choose an optional submission date, and get a
            shareable invite link for friends to submit their clips.
          </p>

          <div className="motion-pop">
            <CreateCelebrationForm selectedCategory={selectedCategory} />
          </div>
        </div>
      </section>
    </main>
  );
}
