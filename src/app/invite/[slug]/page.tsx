import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import UploadForm from "./upload-form";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const celebration = await prisma.celebration.findUnique({
    where: { slug },
  });

  if (!celebration) notFound();

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <section className="mx-auto max-w-md rounded-3xl bg-neutral-900 p-6">
        <p className="text-pink-300">You&apos;re invited</p>

        <h1 className="mt-2 text-3xl font-bold">
          Send a birthday wish for {celebration.celebrant}
        </h1>

        <p className="mt-3 text-neutral-300">
          Upload a short video message. Try to keep it around 30 seconds.
        </p>

        <UploadForm slug={slug} />
      </section>
    </main>
  );
}
