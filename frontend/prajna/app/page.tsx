"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { RiUserStarLine } from "react-icons/ri";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      {/* Navigation Bar Removed - Now Global */}

      <div className="mx-auto max-w-6xl px-6 py-16 flex-grow flex items-center">
        <section className="relative w-full overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-panel via-panel-dark to-black p-12 shadow-[var(--shadow-card)]">
          <div className="absolute inset-0 -z-10 opacity-50 blur-3xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,247,195,0.4),transparent_60%)]" />
          </div>
          <p className="text-xs uppercase tracking-[0.4em] text-accent">
            Prajna OJ
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold text-white md:text-5xl">
            A focused, coder-first arena for solving algorithmic problems.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/70">
            Browse curated problems, open the integrated compiler, and iterate
            quickly with a LeetCode-inspired workspace. Backed by a clean Django
            API.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/problems"
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-black transition hover:bg-accent-strong hover:shadow-[0_0_20px_rgba(0,255,204,0.4)] cursor-pointer"
            >
              Browse problems
            </Link>
            <Link
              href="/compiler"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-accent hover:text-accent cursor-pointer"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open compiler
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
