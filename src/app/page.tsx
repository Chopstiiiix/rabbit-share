import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-xl">
        <div className="rounded-3xl bg-neutral-900 p-8 shadow-xl">
          <p className="mb-3 text-sm text-pink-300">Birthday video maker</p>

          <h1 className="text-4xl leading-tight font-bold">
            Collect birthday wishes and turn them into one beautiful video.
          </h1>

          <p className="mt-4 text-neutral-300">
            Create a link, ask friends to upload 30-second clips, then generate
            one stitched video for the celebrant.
          </p>

          <Link
            href="/create"
            className="mt-8 inline-flex rounded-full bg-pink-500 px-6 py-3 font-semibold text-white"
          >
            Create birthday video
          </Link>
        </div>
      </section>
    </main>
  );
}
