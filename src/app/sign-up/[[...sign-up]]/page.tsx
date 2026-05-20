import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
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
            Create account
          </p>
          <h1 className="mt-4 text-4xl leading-tight font-bold sm:text-5xl">
            Keep every Rabbit Share event tied to you.
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-neutral-300">
            Your account becomes the organizer home for invite links,
            submissions, generated videos, and celebrant share pages.
          </p>
        </div>

        <div className="motion-pop flex justify-center">
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
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
