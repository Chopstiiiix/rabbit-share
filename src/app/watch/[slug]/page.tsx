import FinalVideoCard from "@/components/final-video-card";
import { prisma } from "@/lib/prisma";
import { getCategoryLabel } from "@/lib/celebration-categories";
import { notFound } from "next/navigation";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const celebration = await prisma.celebration.findUnique({
    where: { slug },
    include: {
      finalVideo: true,
      submissions: true,
    },
  });

  if (!celebration || !celebration.finalVideo) notFound();
  const categoryLabel = getCategoryLabel(
    celebration.category,
    celebration.customCategory,
  );
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const watchLink = `${appUrl}/watch/${slug}`;

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <section className="motion-rise mx-auto max-w-2xl text-center">
        <p className="text-pink-300">{categoryLabel}</p>

        <h1 className="mt-2 text-4xl font-bold">
          {celebration.celebrant}
        </h1>

        <p className="mt-3 text-neutral-300">
          Your friends made something special for you.
        </p>

        <div className="mt-8">
          <FinalVideoCard
            videoUrl={celebration.finalVideo.videoUrl}
            watchLink={watchLink}
            title="Final video"
            showOpenLink={false}
          />
        </div>

        <p className="mt-6 text-sm text-neutral-400">
          Made with love by your people.
        </p>
      </section>
    </main>
  );
}
