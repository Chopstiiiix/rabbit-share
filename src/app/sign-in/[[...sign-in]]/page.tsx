import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <section className="motion-rise mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <Link
            href="/"
            className="inline-flex text-sm font-medium text-neutral-400 transition hover:text-white active:translate-y-px"
          >
            Back to home
          </Link>

          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.18em] text-pink-300">
            Organizer account
          </p>
          <h1 className="mt-4 text-4xl leading-tight font-bold sm:text-5xl">
            Sign in to manage your video collections.
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-neutral-300">
            Return to every invite, monitor submissions, generate the montage,
            and share the final watch link from one place.
          </p>
        </div>

        <div className="motion-pop flex justify-center">
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/dashboard"
            appearance={{
              elements: {
                cardBox: "shadow-2xl",
              },
            }}
          />
        </div>
      </section>
    </main>
  );
}
