'use client';

import Sidebar from '../../components/Sidebar';
import { FiUser, FiBell, FiLock, FiCode, FiCopy, FiRefreshCw } from 'react-icons/fi';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
    const [apiKey, setApiKey] = useState('Loading...');
    const [webhookUrl, setWebhookUrl] = useState('');
    const [webhookActive, setWebhookActive] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch API Key
        fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/admin/integrations/apikey`)
            .then(res => res.json())
            .then(data => setApiKey(data.key))
            .catch(err => console.error("Failed to load API key", err));

        // Fetch Webhook Config
        fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/admin/integrations/webhook`)
            .then(res => res.json())
            .then(data => {
                setWebhookUrl(data.url);
                setWebhookActive(data.active);
            })
            .catch(err => console.error("Failed to load webhook", err));
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(apiKey);
        alert("API Key copied!");
    };

    const regenerateKey = async () => {
        if (!confirm("Are you sure? This will invalidate the old key.")) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/admin/integrations/apikey/regenerate`, { method: 'POST' });
            const data = await res.json();
            setApiKey(data.key);
            alert("New API Key generated");
        } catch (e) {
            alert("Failed to regenerate key");
        }
    };

    const saveWebhook = async () => {
        setLoading(true);
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/admin/integrations/webhook`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: webhookUrl, active: webhookActive })
            });
            alert("Webhook settings saved");
        } catch (e) {
            alert("Failed to save webhook");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-black text-white font-sans overflow-hidden selection:bg-indigo-500 selection:text-white">
            <Sidebar />

            <main className="flex-1 overflow-y-auto bg-black relative">
                {/* Background Ambience */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="max-w-4xl mx-auto p-12">
                    <header className="mb-12">
                        <h1 className="text-3xl font-bold mb-2">Settings</h1>
                        <p className="text-zinc-400">Manage your account preferences and security.</p>
                    </header>

                    <div className="space-y-6">
                        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400"><FiUser /></div>
                                <div>
                                    <h3 className="font-bold text-lg">Profile Information</h3>
                                    <p className="text-sm text-zinc-500">Update your photo and personal details.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" value="John Doe" className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300" readOnly />
                                <input type="email" value="client@syntrax.ai" className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300" readOnly />
                            </div>
                        </div>

                        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400"><FiBell /></div>
                                <div>
                                    <h3 className="font-bold text-lg">Notifications</h3>
                                    <p className="text-sm text-zinc-500">Choose what we email you about.</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-indigo-500" readOnly />
                                    <span className="text-sm text-zinc-300">Email me when extraction is complete</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-indigo-500" readOnly />
                                    <span className="text-sm text-zinc-300">Email me about billing updates</span>
                                </label>
                            </div>
                        </div>

                    </div>

                    {/* Developer Settings */}
                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400"><FiCode /></div>
                            <div>
                                <h3 className="font-bold text-lg">Developer Settings</h3>
                                <p className="text-sm text-zinc-500">Manage your API keys and Webhooks.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* API Key */}
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Secret API Key</label>
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm font-mono text-zinc-300 truncate">
                                        {apiKey}
                                    </div>
                                    <button onClick={copyToClipboard} className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white transition-colors" title="Copy">
                                        <FiCopy />
                                    </button>
                                    <button onClick={regenerateKey} className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg border border-red-500/20 transition-colors" title="Regenerate">
                                        <FiRefreshCw />
                                    </button>
                                </div>
                                <p className="text-xs text-zinc-500 mt-2">Do not share this key. Use it to authenticate requests from your backend.</p>
                            </div>

                            {/* Webhook */}
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Webhook URL</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={webhookUrl}
                                        onChange={(e) => setWebhookUrl(e.target.value)}
                                        placeholder="https://your-api.com/webhooks/syntrax"
                                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                    <button
                                        onClick={saveWebhook}
                                        disabled={loading}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors text-sm"
                                    >
                                        {loading ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                                <p className="text-xs text-zinc-500 mt-2">We will send a POST request to this URL when a document is processed.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 opacity-50">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400"><FiLock /></div>
                            <div>
                                <h3 className="font-bold text-lg">Security (Coming Soon)</h3>
                                <p className="text-sm text-zinc-500">Two-factor authentication and password management.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
