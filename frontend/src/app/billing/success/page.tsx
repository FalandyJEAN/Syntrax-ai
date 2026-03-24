'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: session, update } = useSession();
    const sessionId = searchParams.get('session_id');
    const isSimulated = searchParams.get('simulated') === 'true';

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying payment...');

    useEffect(() => {
        if (!sessionId) {
            setStatus('error');
            setMessage('No session ID found.');
            return;
        }

        const verifyPayment = async () => {
            // If it's a simulated payment (Option 2), we manually trigger the credit addition
            if (isSimulated || sessionId.includes('mock')) {
                try {
                    // Use session token
                    const token = session?.accessToken;
                    if (!token) {
                        // Wait a bit or error? 
                        // Session might be loading, but useEffect depends on it?
                        // Actually we should depend on session
                        return;
                    }

                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/payments/simulate-success`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ session_id: sessionId })
                    });

                    if (res.ok) {
                        setStatus('success');
                        await update(); // Update session to reflect new credits
                    } else {
                        setStatus('error');
                        setMessage('Simulation failed.');
                    }
                } catch (e) {
                    setStatus('error');
                    setMessage('Network error during simulation.');
                }
            } else {
                // Real Stripe Payment
                // The Webhook handles the credits. We just show success.
                // Optionally we could poll an endpoint to see if credits updated.
                setStatus('success');
                setTimeout(() => update(), 2000); // Try to update session
            }
        };

        verifyPayment();
    }, [sessionId, isSimulated, update, session]);

    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-bold text-white">Finalizing your purchase...</h2>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <FiAlertCircle className="w-20 h-20 text-red-500 mb-6" />
                <h1 className="text-3xl font-bold text-white mb-2">Something went wrong</h1>
                <p className="text-zinc-400 mb-8">{message}</p>
                <Link href="/billing" className="bg-zinc-800 text-white px-6 py-3 rounded-lg hover:bg-zinc-700">
                    Return to Billing
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-in fade-in zoom-in duration-500">
            <FiCheckCircle className="w-24 h-24 text-emerald-500 mb-6" />
            <h1 className="text-4xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-xl text-zinc-400 mb-8">Your credits have been added to your account.</p>
            <div className="flex gap-4">
                <Link href="/dashboard" className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
                    Go to Dashboard
                </Link>
                <Link href="/documents" className="bg-zinc-800 text-white px-8 py-3 rounded-full font-bold hover:bg-zinc-700 transition-colors">
                    Upload Documents
                </Link>
            </div>
        </div>
    );
}

export default function BillingSuccessPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-24 px-6">
            <Suspense fallback={<div>Loading...</div>}>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
