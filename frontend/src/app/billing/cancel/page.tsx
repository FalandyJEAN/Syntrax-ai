'use client';
import Link from 'next/link';

export default function BillingCancelPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-32 px-6 flex flex-col items-center text-center">
            <h1 className="text-3xl font-bold mb-4">Payment Cancelled</h1>
            <p className="text-zinc-400 mb-8">No worries! You haven't been charged. Feel free to try again whenever you're ready.</p>
            <Link href="/billing" className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-zinc-200">
                Return to Plans
            </Link>
        </div>
    );
}
