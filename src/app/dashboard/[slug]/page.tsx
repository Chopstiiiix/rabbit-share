import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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

  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${slug}`;
  const watchLink = `${process.env.NEXT_PUBLIC_APP_URL}/watch/${slug}`;

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-3xl bg-neutral-900 p-6">
          <h1 className="text-3xl font-bold">{celebration.title}</h1>

          <p className="mt-4 text-neutral-300">Share this invite link:</p>

          <input
            readOnly
            value={inviteLink}
            className="mt-2 w-full rounded-2xl bg-neutral-800 px-4 py-3"
          />

          <div className="mt-5 flex gap-3">
            <Link
              href={`/invite/${slug}`}
              className="rounded-full bg-white px-5 py-3 font-semibold text-black"
            >
              Open invite page
            </Link>

            <form action={`/api/render/${slug}`} method="POST">
              <button className="rounded-full bg-pink-500 px-5 py-3 font-semibold">
                Generate final video
              </button>
            </form>
          </div>
        </div>

        <div className="rounded-3xl bg-neutral-900 p-6">
          <h2 className="text-xl font-bold">
            Submissions: {celebration.submissions.length}
          </h2>

          <div className="mt-4 space-y-4">
            {celebration.submissions.map((submission) => (
              <div
                key={submission.id}
                className="rounded-2xl bg-neutral-800 p-4"
              >
                <p className="font-semibold">{submission.name}</p>
                {submission.message && (
                  <p className="text-sm text-neutral-300">
                    {submission.message}
                  </p>
                )}

                <video
                  src={submission.videoUrl}
                  controls
                  className="mt-3 w-full rounded-xl"
                />
              </div>
            ))}
          </div>
        </div>

        {celebration.finalVideo && (
          <div className="rounded-3xl bg-neutral-900 p-6">
            <h2 className="text-xl font-bold">Final video ready</h2>

            <video
              src={celebration.finalVideo.videoUrl}
              controls
              className="mt-4 w-full rounded-xl"
            />

            <input
              readOnly
              value={watchLink}
              className="mt-4 w-full rounded-2xl bg-neutral-800 px-4 py-3"
            />

            <Link
              href={`/watch/${slug}`}
              className="mt-4 inline-flex rounded-full bg-pink-500 px-5 py-3 font-semibold"
            >
              Open celebrant link
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
