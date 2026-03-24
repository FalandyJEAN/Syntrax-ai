'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { FiCheckCircle, FiXCircle, FiClock, FiExternalLink } from 'react-icons/fi';
import { useSession } from 'next-auth/react';

export default function WebhooksPage() {
    const { data: session } = useSession();
    const [webhooks, setWebhooks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchWebhooks = async () => {
            const token = (session as any)?.accessToken;
            if (!token) return;

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/webhooks/history`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await res.json();
                if (Array.isArray(data)) {
                    setWebhooks(data);
                }
            } catch (err) {
                console.error("Failed to fetch webhooks", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (session) {
            fetchWebhooks();
            const interval = setInterval(fetchWebhooks, 5000);
            return () => clearInterval(interval);
        }
    }, [session]);

    return (
        <div className="flex h-screen bg-black text-white font-sans overflow-hidden selection:bg-indigo-500 selection:text-white">
            <Sidebar />

            <main className="flex-1 overflow-y-auto bg-black relative">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto p-12">
                    <header className="mb-12">
                        <h1 className="text-3xl font-bold mb-2">Webhook Logs</h1>
                        <p className="text-zinc-400">Monitor webhook deliveries to your configured endpoint.</p>
                    </header>

                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-zinc-400">
                                <thead className="text-xs uppercase bg-zinc-900/50 text-zinc-500 font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Document ID</th>
                                        <th className="px-6 py-4">Event</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Sent At</th>
                                        <th className="px-6 py-4">Response</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                                                Loading webhook logs...
                                            </td>
                                        </tr>
                                    ) : webhooks.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                                                No webhooks sent yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        webhooks.map((webhook: any) => (
                                            <tr key={webhook.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs text-white">
                                                    {webhook.document_id.substring(0, 8)}...
                                                </td>
                                                <td className="px-6 py-4">{webhook.event}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`
                                                        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                                                        ${webhook.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                            webhook.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                                'bg-amber-500/10 text-amber-400 border-amber-500/20'}
                                                    `}>
                                                        {webhook.status === 'success' && <FiCheckCircle />}
                                                        {webhook.status === 'failed' && <FiXCircle />}
                                                        {webhook.status === 'pending' && <FiClock />}
                                                        {webhook.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs">
                                                    {webhook.sent_at ? new Date(webhook.sent_at).toLocaleString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-xs text-zinc-500">
                                                    {webhook.response_code || 'N/A'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
