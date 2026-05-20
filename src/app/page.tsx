import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import AdminDashboardLink from "@/components/admin-dashboard-link";
import {
  CELEBRATION_CATEGORIES,
  categoryGroups,
} from "@/lib/celebration-categories";

export default async function Home() {
  const { userId } = await auth();

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <nav className="motion-rise mb-8 flex items-center justify-between gap-4">
          <Link href="/" className="text-lg font-bold text-white">
            Rabbit Share
          </Link>

          <div className="flex items-center gap-3">
            {userId ? (
              <>
                <Link
                  href="/dashboard"
                  className="pressable-card rounded-full border border-white/10 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  My events
                </Link>
                <AdminDashboardLink />
                <UserButton />
              </>
            ) : (
              <Link
                href="/sign-in"
                className="pressable-card rounded-full border border-white/10 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Sign in
              </Link>
            )}
          </div>
        </nav>

        <div className="motion-rise grid gap-8 border-b border-white/10 pb-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-300">
              Group video maker
            </p>

            <h1 className="mt-4 max-w-3xl text-4xl leading-tight font-bold sm:text-5xl">
              Collect video messages for any moment worth sharing.
            </h1>
          </div>

          <p className="max-w-2xl text-lg leading-8 text-neutral-300">
            Choose the occasion first, then create a shareable invite where
            friends, family, or teammates can submit short clips for one final
            montage.
          </p>
        </div>

        <div className="mt-8 space-y-10">
          {categoryGroups.map((group, groupIndex) => (
            <section
              key={group}
              className="motion-rise"
              style={{ animationDelay: `${groupIndex * 55}ms` }}
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-white">{group}</h2>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {CELEBRATION_CATEGORIES.filter(
                  (category) => category.group === group,
                ).map((category, categoryIndex) => (
                  <Link
                    key={category.slug}
                    href={`/create?category=${category.slug}`}
                    className="motion-pop pressable-card group rounded-lg border border-white/10 bg-neutral-900 p-4 hover:border-pink-300/60 hover:bg-neutral-800"
                    style={{
                      animationDelay: `${groupIndex * 45 + categoryIndex * 18}ms`,
                    }}
                  >
                    <span className="text-base font-semibold text-white">
                      {category.label}
                    </span>
                    <span className="mt-2 block text-sm leading-6 text-neutral-400 group-hover:text-neutral-200">
                      {category.description}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
