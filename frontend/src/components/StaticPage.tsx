'use client';

import React from 'react';
import Link from 'next/link';
import { FiChevronLeft } from 'react-icons/fi';
import { LanguageSwitcher, T } from '@/lib/i18n';

export default function StaticPage({ title, lastUpdated, children }: { title: string, lastUpdated?: string, children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-indigo-500 selection:text-white">

            {/* Navbar Placeholder (or Back Button) */}
            <header className="h-20 border-b border-white/5 flex items-center justify-between px-4 md:px-12 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white transition-colors">
                    <FiChevronLeft /> <T>Back to Home</T>
                </Link>
                <LanguageSwitcher />
            </header>

            <main className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-20">
                <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">{title}</h1>

                {lastUpdated && (
                    <p className="text-zinc-500 text-sm mb-12">Last updated: {lastUpdated}</p>
                )}

                <div className="prose prose-invert prose-indigo prose-lg max-w-none">
                    {children}
                </div>
            </main>

            <footer className="border-t border-white/5 py-12 text-center text-zinc-600 text-sm">
                &copy; {new Date().getFullYear()} Syntrax.ai Inc.
            </footer>
        </div>
    );
}
