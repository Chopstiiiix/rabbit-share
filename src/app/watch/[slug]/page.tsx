import { prisma } from "@/lib/prisma";
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

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <section className="mx-auto max-w-2xl text-center">
        <p className="text-pink-300">Happy Birthday</p>

        <h1 className="mt-2 text-4xl font-bold">
          {celebration.celebrant} 🎉
        </h1>

        <p className="mt-3 text-neutral-300">
          Your friends made something special for you.
        </p>

        <video
          src={celebration.finalVideo.videoUrl}
          controls
          autoPlay
          className="mt-8 w-full rounded-3xl"
        />

        <p className="mt-6 text-sm text-neutral-400">
          Made with love by your people.
        </p>
      </section>
    </main>
  );
}
