import { prisma } from "@/lib/prisma";
import { getCategoryLabel } from "@/lib/celebration-categories";
import AdminDashboardLink from "@/components/admin-dashboard-link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function OrganizerDashboardPage() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const celebrations = await prisma.celebration.findMany({
    where: { organizerId: userId },
    include: {
      _count: {
        select: { submissions: true },
      },
      finalVideo: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl space-y-8">
        <header className="motion-rise flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-300">
              Organizer dashboard
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight">
              My events
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="pressable-card rounded-full border border-white/10 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
            >
              New event
            </Link>
            <AdminDashboardLink />
            <UserButton />
          </div>
        </header>

        {celebrations.length === 0 ? (
          <div className="motion-rise rounded-3xl border border-white/10 bg-neutral-900 p-8">
            <h2 className="text-2xl font-bold">No events yet</h2>
            <p className="mt-3 max-w-2xl text-neutral-300">
              Choose a category, create your first invite, and it will appear
              here whenever you sign in.
            </p>
            <Link
              href="/"
              className="pressable-cta cta-pulse mt-6 inline-flex rounded-full bg-pink-500 px-5 py-3 font-semibold text-white"
            >
              Create an event
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {celebrations.map((celebration, index) => {
              const categoryLabel = getCategoryLabel(
                celebration.category,
                celebration.customCategory,
              );

              return (
                <Link
                  key={celebration.id}
                  href={`/dashboard/${celebration.slug}`}
                  className="motion-pop pressable-card rounded-2xl border border-white/10 bg-neutral-900 p-5 hover:border-pink-300/60 hover:bg-neutral-800"
                  style={{ animationDelay: `${index * 35}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-200">
                        {categoryLabel}
                      </p>
                      <h2 className="mt-2 text-xl font-bold">
                        {celebration.title}
                      </h2>
                    </div>

                    <span className="rounded-full bg-neutral-950 px-3 py-1 text-xs font-semibold text-neutral-300">
                      {celebration.finalVideo ? "Ready" : "Collecting"}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-neutral-950 p-3">
                      <p className="text-neutral-500">Submissions</p>
                      <p className="mt-1 text-lg font-bold">
                        {celebration._count.submissions}
                      </p>
                    </div>

                    <div className="rounded-lg bg-neutral-950 p-3">
                      <p className="text-neutral-500">Created</p>
                      <p className="mt-1 text-lg font-bold">
                        {celebration.createdAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
