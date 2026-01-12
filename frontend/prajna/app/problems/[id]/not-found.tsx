import Link from "next/link";

export default function ProblemNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center text-white/70">
      <h2 className="text-3xl font-semibold text-white">Problem not found</h2>
      <p className="mt-4">
        We couldn’t locate that problem id. It might have been removed or not
        seeded yet.
      </p>
      <Link
        href="/problems"
        className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-black"
      >
        Return to problems
      </Link>
    </div>
  );
}

