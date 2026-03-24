'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiEye, FiEyeOff } from 'react-icons/fi';

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setErrorMsg("Passwords do not match");
            return;
        }

        if (!token) {
            setErrorMsg("Invalid or missing token.");
            return;
        }

        setStatus('loading');
        setErrorMsg('');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, new_password: password }),
            });

            if (res.ok) {
                setStatus('success');
                setTimeout(() => router.push('/login'), 3000);
            } else {
                const data = await res.json();
                setErrorMsg(data.detail || "Failed to reset password. Token might be expired.");
                setStatus('error');
            }
        } catch (e) {
            setErrorMsg("Connection error.");
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-xl text-center max-w-md w-full">
                <div className="text-emerald-400 text-4xl mb-4">🎉</div>
                <h3 className="text-white font-bold mb-2">Password Reset Successful!</h3>
                <p className="text-zinc-400 text-sm mb-6">
                    You can now log in with your new password.
                </p>
                <Link href="/login" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg transition-colors font-medium">
                    Go to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md bg-zinc-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-white mb-2">Set New Password</h1>
                <p className="text-zinc-400">Create a strong password for your account.</p>
            </div>

            {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg mb-6 text-center">
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">New Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/50 border border-zinc-700 rounded-lg pl-4 pr-10 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Confirm Password</label>
                    <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
                >
                    {status === 'loading' ? 'Resetting...' : 'Reset Password'}
                </button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[100px] pointer-events-none"></div>
            <Suspense fallback={<div className="text-white">Loading...</div>}>
                <ResetPasswordContent />
            </Suspense>
        </div>
    );
}
