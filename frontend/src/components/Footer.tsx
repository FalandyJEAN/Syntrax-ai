'use client';

import Link from 'next/link';
import { T } from '@/lib/i18n';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-black border-t border-white/10 pt-24 pb-12 relative overflow-hidden">
            {/* Background Gradients for Premium Feel */}
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
                    {/* Column 1: Brand & Newsletter (Span 4) */}
                    <div className="md:col-span-5 space-y-8">
                        <Link href="/" className="inline-flex items-center gap-3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500 blur opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                                <img src="/logo.png" alt="Syntrax Logo" className="w-10 h-10 object-contain relative z-10" />
                            </div>
                            <span className="font-bold text-2xl tracking-tighter text-white">Syntrax.ai</span>
                        </Link>

                        <p className="text-zinc-400 leading-relaxed max-w-sm">
                            <T>Transforming unstructured chaos into structured clarity.</T>
                        </p>

                        <div className="pt-4">
                            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider"><T>Stay Updated</T></h4>
                            <form className="flex gap-2 max-w-sm" onSubmit={(e) => e.preventDefault()}>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm w-full focus:outline-none focus:border-indigo-500/50 text-zinc-300 placeholder:text-zinc-600 transition-all"
                                />
                                <button
                                    type="submit"
                                    className="bg-white text-black px-4 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Spacer */}
                    <div className="hidden md:block md:col-span-1"></div>

                    {/* Column 2: Product */}
                    <div className="md:col-span-2">
                        <h4 className="text-white font-bold mb-6"><T>Product</T></h4>
                        <ul className="space-y-4 text-sm text-zinc-400">
                            <li><Link href="/docs/guide-extraction-ia" className="hover:text-indigo-400 transition-colors text-white font-medium">Guide: L'IA et l'Extraction</Link></li>
                            <li><Link href="/#features" className="hover:text-indigo-400 transition-colors"><T>Features</T></Link></li>
                            <li><Link href="/#pricing" className="hover:text-indigo-400 transition-colors"><T>Pricing</T></Link></li>
                            <li><Link href="/integrations" className="hover:text-indigo-400 transition-colors"><T>Integrations</T></Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Company */}
                    <div className="md:col-span-2">
                        <h4 className="text-white font-bold mb-6"><T>Company</T></h4>
                        <ul className="space-y-4 text-sm text-zinc-400">
                            <li><Link href="/about" className="hover:text-indigo-400 transition-colors"><T>About</T></Link></li>
                            <li><Link href="/blog" className="hover:text-indigo-400 transition-colors"><T>Blog</T></Link></li>
                            <li><Link href="/careers" className="hover:text-indigo-400 transition-colors"><T>Careers</T></Link></li>
                            <li><Link href="/contact" className="hover:text-indigo-400 transition-colors"><T>Contact</T></Link></li>
                            <li><Link href="/partners" className="hover:text-indigo-400 transition-colors"><T>Partners</T></Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Legal */}
                    <div className="md:col-span-2">
                        <h4 className="text-white font-bold mb-6"><T>Legal</T></h4>
                        <ul className="space-y-4 text-sm text-zinc-400">
                            <li><Link href="/legal/privacy" className="hover:text-indigo-400 transition-colors"><T>Privacy Policy</T></Link></li>
                            <li><Link href="/legal/terms" className="hover:text-indigo-400 transition-colors"><T>Terms of Service</T></Link></li>
                            <li><Link href="/legal/cookie-policy" className="hover:text-indigo-400 transition-colors"><T>Cookie Policy</T></Link></li>
                            <li><Link href="/legal/security" className="hover:text-indigo-400 transition-colors"><T>Security</T></Link></li>
                        </ul>
                    </div>
                </div>

                {/* Separator */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent mb-8"></div>

                {/* Bottom Row: Social + Copyright */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-zinc-600 text-sm">
                        © {currentYear} Syntrax.ai Inc. <T>All rights reserved.</T>
                    </div>

                    {/* Social Icons */}
                    <div className="flex items-center gap-4">
                        <a href="#" className="text-zinc-600 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                            </svg>
                        </a>
                        <a href="#" className="text-zinc-600 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                        </a>
                        <a href="#" className="text-zinc-600 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
