import { prisma } from "@/lib/prisma";
import { importLegacyDuplicateSubmissions } from "@/lib/legacy-celebrations";
import AdminDashboardLink from "@/components/admin-dashboard-link";
import FinalVideoCard from "@/components/final-video-card";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import InviteLinkActions from "./invite-link-actions";
import SubmissionVideoPreview from "./submission-video-preview";

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ render?: string; renderError?: string }>;
}) {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const { slug } = await params;

  const celebration = await prisma.celebration.findUnique({
    where: { slug },
    include: {
      submissions: {
        orderBy: { createdAt: "asc" },
      },
      finalVideo: true,
    },
  });

  if (!celebration) notFound();
  if (celebration.organizerId && celebration.organizerId !== userId) {
    notFound();
  }

  await importLegacyDuplicateSubmissions(celebration);

  const refreshedCelebration = await prisma.celebration.findUnique({
    where: { slug },
    include: {
      submissions: {
        orderBy: { createdAt: "asc" },
      },
      finalVideo: true,
    },
  });

  if (!refreshedCelebration) notFound();

  const { render, renderError } = await searchParams;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const inviteLink = `${appUrl}/invite/${slug}`;
  const watchLink = `${appUrl}/watch/${slug}`;

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-2xl space-y-6">
        <header className="motion-rise flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="pressable-card rounded-full border border-white/10 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
            >
              My events
            </Link>
            <AdminDashboardLink />
          </div>
          <UserButton />
        </header>

        <div className="motion-rise rounded-3xl bg-neutral-900 p-6">
          <h1 className="text-3xl font-bold">{refreshedCelebration.title}</h1>

          <p className="mt-4 text-neutral-300">Share this invite link:</p>

          <InviteLinkActions inviteLink={inviteLink} />

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link
              href={`/invite/${slug}`}
              className="pressable-cta inline-flex min-h-14 items-center justify-center rounded-[22px] bg-white px-5 py-3 text-center text-sm font-semibold leading-tight text-black sm:text-base"
            >
              Open invite page
            </Link>

            <form action={`/api/render/${slug}`} method="POST" className="min-w-0">
              <button className="pressable-cta cta-pulse inline-flex min-h-14 w-full items-center justify-center rounded-[22px] bg-pink-500 px-5 py-3 text-center text-sm font-semibold leading-tight text-white sm:text-base">
                Generate final video
              </button>
            </form>
          </div>
        </div>

        {render === "success" && (
          <p className="motion-pop rounded-2xl border border-green-400/20 bg-green-950/60 px-4 py-3 text-sm text-green-100">
            Final video generated. The celebrant watch link is ready below.
          </p>
        )}

        {renderError && (
          <p className="motion-pop rounded-2xl border border-red-400/20 bg-red-950/70 px-4 py-3 text-sm text-red-100">
            {renderError}
          </p>
        )}

        <div className="motion-rise rounded-3xl bg-neutral-900 p-6">
          <h2 className="text-xl font-bold">
            Submissions: {refreshedCelebration.submissions.length}
          </h2>

          <div className="mt-4 space-y-4">
            {refreshedCelebration.submissions.map((submission, index) => (
              <SubmissionVideoPreview
                key={submission.id}
                name={submission.name}
                message={submission.message}
                videoUrl={submission.videoUrl}
                index={index}
              />
            ))}
          </div>
        </div>

        {refreshedCelebration.finalVideo && (
          <FinalVideoCard
            videoUrl={refreshedCelebration.finalVideo.videoUrl}
            watchLink={watchLink}
          />
        )}
      </section>
    </main>
  );
}
