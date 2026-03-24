'use client';
import { useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setStatus('success');
            } else {
                // Even on error we often simulate success for security, but dev mode:
                console.error("Failed to requests reset");
                setStatus('error');
            }
        } catch (e) {
            console.error(e);
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-zinc-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                <Link href="/login" className="flex items-center gap-2 text-zinc-500 hover:text-white mb-6 text-sm transition-colors">
                    <FiArrowLeft /> Back to Login
                </Link>

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
                    <p className="text-zinc-400">Enter your email to receive a reset link.</p>
                </div>

                {status === 'success' ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-xl text-center">
                        <div className="text-emerald-400 text-4xl mb-4">📧</div>
                        <h3 className="text-white font-bold mb-2">Check your inbox</h3>
                        <p className="text-zinc-400 text-sm mb-6">
                            If an account exists for <strong>{email}</strong>, we have sent instructions to reset your password.
                        </p>
                        <button
                            onClick={() => setStatus('idle')}
                            className="text-indigo-400 hover:text-indigo-300 text-sm"
                        >
                            Try another email
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                placeholder="name@company.com"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
                        >
                            {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
