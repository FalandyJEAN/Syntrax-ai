'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FiMenu, FiX, FiGithub } from 'react-icons/fi';
import { LanguageSwitcher } from '@/lib/i18n';

interface DocsLayoutProps {
    children: React.ReactNode;
    sidebarContent: React.ReactNode;
}

export default function DocsLayout({ children, sidebarContent }: DocsLayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#0F1117] text-zinc-300 font-sans overflow-hidden">

            {/* Mobile Topbar */}
            <header className="md:hidden fixed top-0 w-full z-50 bg-[#0F1117]/90 backdrop-blur border-b border-white/5 h-16 flex items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 font-bold text-white">
                    <img src="/logo.png" alt="Logo" className="w-6 h-6" />
                    Syntrax<span className="text-indigo-400">Docs</span>
                </Link>
                <div className="flex items-center gap-3">
                    <LanguageSwitcher position="top" />
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-zinc-400">
                        {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-[2px] z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-40 w-[280px] bg-[#0F1117] border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl shadow-indigo-500/10' : '-translate-x-full'}
      `}>
                <div className="h-16 flex items-center px-6 border-b border-white/5">
                    <Link href="/" className="flex items-center gap-2 font-bold text-white tracking-tight">
                        <img src="/logo.png" alt="Logo" className="w-6 h-6" />
                        Syntrax.ai
                    </Link>
                </div>

                {/* Custom Sidebar Content (Nav Tree) */}
                <div
                    className="flex-1 overflow-y-auto px-4 py-6 space-y-6"
                    onClick={(e) => {
                        // Close mobile menu when a link/button is clicked, but not when typing in search
                        if ((e.target as HTMLElement).tagName !== 'INPUT') {
                            setIsMobileMenuOpen(false);
                        }
                    }}
                >
                    {sidebarContent}
                </div>

                <div className="p-4 border-t border-white/5 text-xs text-zinc-500 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <span>v1.2.0</span>
                        <a href="#" className="hover:text-white flex items-center gap-1"><FiGithub /> GitHub</a>
                    </div>
                    <div className="hidden md:block">
                        <LanguageSwitcher position="top" />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative scroll-smooth pt-16 md:pt-0">
                <div className="max-w-4xl mx-auto px-6 md:px-12 py-12 min-h-screen">
                    {children}

                    {/* Standard Docs Footer */}
                    <div className="mt-20 pt-8 border-t border-white/5 text-center text-zinc-600 text-sm">
                        <p>Documentation built for Syntrax.ai</p>
                    </div>
                </div>
            </main>

        </div>
    );
}
