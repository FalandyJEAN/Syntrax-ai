'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ApiKeysPage() {
    const [keys, setKeys] = useState<{ id: string; name: string; key: string; created: string }[]>([
        { id: '1', name: 'Production Key', key: 'sk_live_...', created: '2024-12-01' },
        { id: '2', name: 'Test Key', key: 'sk_test_...', created: '2025-01-10' },
    ]);

    const generateKey = () => {
        const newKey = {
            id: Math.random().toString(36).substr(2, 9),
            name: `New Key ${keys.length + 1}`,
            key: `sk_live_${Math.random().toString(36).substr(2, 18)}`,
            created: new Date().toISOString().split('T')[0],
        };
        setKeys([...keys, newKey]);
    };

    return (
        <div className="flex h-screen bg-black text-white font-sans">
            <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col p-6">
                <Link href="/" className="flex items-center gap-3 mb-10 px-2 hover:opacity-80 transition-opacity">
                    <img src="/logo.png" alt="Syntrax Logo" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-lg tracking-tight">Syntrax.ai</span>
                </Link>
                <nav className="flex-1 space-y-2">
                    <NavItem label="Dashboard" icon="📊" href="/dashboard" />
                    <NavItem label="Documents" icon="📁" href="/dashboard" />
                    <NavItem active label="API Keys" icon="🔑" href="/api-keys" />
                    <NavItem label="Settings" icon="⚙️" href="/settings" />
                </nav>
            </aside>

            <main className="flex-1 p-12">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">API Keys</h1>
                        <p className="text-zinc-400">Manage your API keys for external access.</p>
                    </div>
                    <button
                        onClick={generateKey}
                        className="bg-white text-black px-6 py-2.5 rounded-full font-bold hover:bg-zinc-200 transition-colors"
                    >
                        + Create New Key
                    </button>
                </header>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-950/30 text-zinc-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Name</th>
                                <th className="px-6 py-4 font-medium">Key Token</th>
                                <th className="px-6 py-4 font-medium">Created</th>
                                <th className="px-6 py-4 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {keys.map((k) => (
                                <tr key={k.id} className="group hover:bg-zinc-900/50">
                                    <td className="px-6 py-4 font-medium text-zinc-200">{k.name}</td>
                                    <td className="px-6 py-4 font-mono text-zinc-400">{k.key}</td>
                                    <td className="px-6 py-4 text-zinc-500">{k.created}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-wider">Revoke</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}

function NavItem({ label, active = false, href = "#", icon }: { label: string, active?: boolean, href?: string, icon?: string }) {
    return (
        <Link href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${active ? 'bg-indigo-500/10 text-indigo-400 font-medium' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
            <span className="opacity-70">{icon}</span>
            {label}
        </Link>
    )
}
