'use client';

import Sidebar from '../../components/Sidebar';
import { FiCheck, FiCpu, FiHardDrive, FiZap, FiLoader } from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function BillingPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState<string | null>(null); // 'starter' | 'pro' | null

    const handleCheckout = async (packId: 'starter' | 'pro') => {
        setLoading(packId);
        try {
            // Use NextAuth session token instead of localStorage
            const token = session?.accessToken;
            if (!token) {
                alert('You must be logged in to purchase.');
                setLoading(null);
                return;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/payments/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ pack_id: packId })
            });

            const data = await res.json();
            if (res.ok && data.url) {
                window.location.href = data.url;
            } else {
                alert('Checkout failed: ' + (data.detail || 'Unknown error'));
                setLoading(null);
            }
        } catch (e) {
            console.error(e);
            alert('Network error');
            setLoading(null);
        }
    };

    return (
        <div className="flex h-screen bg-black text-white font-sans overflow-hidden selection:bg-indigo-500 selection:text-white">
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-black relative w-full md:w-auto">
                {/* Background Ambience */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="max-w-5xl mx-auto p-6 md:p-12 pb-24">
                    <header className="mb-12 mt-12 md:mt-0">
                        <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
                        <p className="text-zinc-400">Manage your plan, payment methods, and invoices.</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        {/* Credit Balance Card */}
                        <div className="md:col-span-2 relative overflow-hidden rounded-3xl p-8 border border-white/10 bg-gradient-to-br from-indigo-900/20 to-zinc-900/50 backdrop-blur-xl">
                            <div className="absolute top-0 right-0 p-8 opacity-20">
                                <FiCpu size={120} />
                            </div>
                            <div className="relative z-10">
                                <div className="text-sm text-indigo-400 font-bold uppercase tracking-wider mb-2">Available Credits</div>
                                <h2 className="text-6xl font-bold mb-4 text-white">
                                    {session?.user?.credits !== undefined ? session.user.credits : '...'}
                                </h2>
                                <div className="flex items-baseline gap-2 mb-6">
                                    <span className="text-zinc-500">Credits never expire</span>
                                </div>

                                <div className="flex flex-col md:flex-row gap-4 mt-8">
                                    <button
                                        onClick={() => handleCheckout('starter')}
                                        disabled={!!loading}
                                        className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2 justify-center disabled:opacity-50"
                                    >
                                        {loading === 'starter' ? <FiLoader className="animate-spin" /> : <FiZap className="text-indigo-600" />}
                                        Buy Starter Pack (50€)
                                    </button>
                                    <button
                                        onClick={() => handleCheckout('pro')}
                                        disabled={!!loading}
                                        className="px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center gap-2 justify-center shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                                    >
                                        {loading === 'pro' ? <FiLoader className="animate-spin" /> : <FiHardDrive />}
                                        Buy Pro Pack (400€)
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Usage Card / Status */}
                        <div className="rounded-3xl p-8 border border-white/10 bg-zinc-900/30 backdrop-blur-xl flex flex-col justify-center">
                            <h3 className="text-lg font-bold mb-6 text-white">Account Status</h3>

                            <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-zinc-400 flex items-center gap-2"><FiCpu /> Plan Type</span>
                                    <span className="text-white font-mono font-bold text-emerald-400 capitalize">{session?.user?.role || 'User'}</span>
                                </div>
                                <div className="text-xs text-zinc-500 mt-1">
                                    Upgrade to Enterprise for lower rates.
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-zinc-400 flex items-center gap-2"><FiHardDrive /> Email</span>
                                    <span className="text-white font-mono text-xs truncate max-w-[150px]">{session?.user?.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Invoice History */}
                    <section>
                        <h3 className="text-xl font-bold mb-6 text-white">Invoice History</h3>
                        <div className="rounded-2xl border border-white/10 bg-zinc-900/30 overflow-hidden p-8 text-center text-zinc-500">
                            No invoices found.
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
