"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRightIcon, CheckCircle2Icon, SparklesIcon, UsersIcon } from "lucide-react";
import { JobSearchBar } from "@/app/features/jobs/components/job-search-bar";

export function HeroSearch() {
  return (
    <section className="relative py-8 sm:py-12 pb-4 sm:pb-6">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white dark:bg-slate-900 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-brand shadow-sm shadow-slate-900/5 dark:shadow-black/20">
              <SparklesIcon className="size-4" />
              Built for modern hiring
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-950 dark:text-white leading-tight">
              A premium job platform for ambitious candidates and high-growth employers.
            </h1>

            <p className="mt-4 max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-7">
              Discover curated openings, save polished applications, and connect faster with hiring
              teams.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
              <Link
                href="/jobs"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/15 transition hover:bg-brand-dark"
              >
                Browse Jobs
                <ArrowRightIcon className="size-4" />
              </Link>
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-brand/40 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                Sign Up Free
              </Link>
            </div>

            <div className="mt-7 grid gap-2 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Jobs live
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">12,500+</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Companies hiring
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">2,100+</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Avg time to hire
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">14 days</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="flex items-center"
          >
            <div className="w-full rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.18)] p-6 sm:p-7 dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)]">
              <p className="text-sm uppercase tracking-[0.24em] text-brand mb-3">
                Search the latest roles
              </p>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                <JobSearchBar />
              </div>

              <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <CheckCircle2Icon className="size-5 text-brand mt-1" />
                  <p>Curated roles from top companies.</p>
                </div>
                <div className="flex items-start gap-3">
                  <UsersIcon className="size-5 text-brand mt-1" />
                  <p>Professional application tools built in.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
