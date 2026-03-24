'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import {
    FiShare2, FiGlobe, FiKey, FiCheckCircle, FiCopy, FiRefreshCw, FiExternalLink,
    FiX, FiDatabase, FiSlack, FiLayers, FiSettings
} from 'react-icons/fi';

const CONNECTOR_URLS: Record<string, string> = {
    "Salesforce": "https://login.salesforce.com/",
    "Odoo": "https://www.odoo.com/signin",
    "Zoho": "https://www.zoho.com/books/login/",
    "QuickBooks": "https://qbo.intuit.com/login",
    "Zapier": "https://zapier.com/app/zaps",
    "Slack": "https://api.slack.com/apps",
    "Dynamics 365": "https://home.dynamics.com/",
    "MongoDB": "https://account.mongodb.com/account/login"
};

export default function IntegrationsPage() {
    const [webhookUrl, setWebhookUrl] = useState('');
    const [apiKey, setApiKey] = useState('Loading...');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Modal State
    const [activeConnector, setActiveConnector] = useState<{ name: string, color: string, type: string } | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const whRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/admin/integrations/webhook`);
                const whData = await whRes.json();
                setWebhookUrl(whData.url);

                const keyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/admin/integrations/apikey`);
                const keyData = await keyRes.json();
                setApiKey(keyData.key);
            } catch (err) {
                console.error("Failed to load integrations config", err);
            }
        };
        fetchConfig();
    }, []);

    const saveWebhook = async () => {
        setIsLoading(true);
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/admin/integrations/webhook`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: webhookUrl, active: true }),
            });
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (err) {
            alert("Failed to save webhook");
        } finally {
            setIsLoading(false);
        }
    };

    const regenerateKey = async () => {
        if (!confirm("Are you sure? This will invalidate the old key.")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/admin/integrations/apikey/regenerate`, { method: 'POST' });
            const data = await res.json();
            setApiKey(data.key);
        } catch (err) {
            alert("Failed to regenerate key");
        }
    }

    return (
        <div className="flex h-screen bg-black text-white font-sans overflow-hidden selection:bg-indigo-500 selection:text-white">
            <Sidebar />

            <main className="flex-1 overflow-y-auto bg-black relative w-full">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="max-w-5xl mx-auto p-6 md:p-12 pb-24">
                    <header className="mb-12">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                                <FiShare2 size={24} />
                            </div>
                            <h1 className="text-3xl font-bold text-white">Integrations Hub</h1>
                        </div>
                        <p className="text-zinc-400 max-w-2xl">Connect Syntrax.ai to your existing workflow. Push validated data directly to your ERP or CRM.</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                        {/* Webhook Configuration */}
                        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-8 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <FiGlobe className="text-cyan-400" size={24} />
                                <h2 className="text-xl font-bold">Universal Webhook</h2>
                            </div>
                            <p className="text-sm text-zinc-500 mb-6">
                                We'll POST the JSON payload to this URL whenever a document is completed. Compatible with Zapier, Make, n8n, and custom backends.
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Payload URL</label>
                                    <input
                                        type="text"
                                        value={webhookUrl}
                                        onChange={(e) => setWebhookUrl(e.target.value)}
                                        placeholder="https://api.your-system.com/webhook/..."
                                        className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono text-sm"
                                    />
                                </div>
                                <button
                                    onClick={saveWebhook}
                                    disabled={isLoading}
                                    className={`
                                        w-full py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2
                                        ${isSaved ? 'bg-emerald-500 text-white' : 'bg-white text-black hover:bg-zinc-200'}
                                    `}
                                >
                                    {isSaved ? <><FiCheckCircle /> Saved Successfully</> : "Save Configuration"}
                                </button>
                            </div>
                        </div>

                        {/* API Access */}
                        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-8 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <FiKey className="text-amber-400" size={24} />
                                <h2 className="text-xl font-bold">API Access</h2>
                            </div>
                            <p className="text-sm text-zinc-500 mb-6">
                                Use this <strong>Secret Key</strong> to authenticate your backend. Pass it in the <code className="text-amber-400">X-API-Key</code> header to upload documents programmatically.
                            </p>
                            <div className="bg-black/50 border border-zinc-800 rounded-lg p-4 mb-6 relative group">
                                <code className="text-zinc-300 font-mono text-xs break-all">{apiKey}</code>
                                <button
                                    onClick={() => navigator.clipboard.writeText(apiKey)}
                                    className="absolute top-3 right-3 text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Copy to clipboard"
                                >
                                    <FiCopy />
                                </button>
                            </div>
                            <button onClick={regenerateKey} className="text-xs text-zinc-500 hover:text-red-400 flex items-center gap-2 transition-colors">
                                <FiRefreshCw /> Regenerate API Key
                            </button>
                        </div>
                    </div>

                    {/* Connectors Grid */}
                    <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                        <FiLayers className="text-indigo-500" /> Native Connectors
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <ConnectorCard
                            name="Salesforce" color="bg-[#00A1E0]" type="CRM"
                            onClick={() => setActiveConnector({ name: "Salesforce", color: "bg-[#00A1E0]", type: "CRM" })}
                        />
                        <ConnectorCard
                            name="Odoo ERP" color="bg-[#714B67]" type="ERP"
                            onClick={() => setActiveConnector({ name: "Odoo", color: "bg-[#714B67]", type: "ERP" })}
                        />
                        <ConnectorCard
                            name="Zoho Books" color="bg-[#F2B63E]" type="Accounting"
                            onClick={() => setActiveConnector({ name: "Zoho", color: "bg-[#F2B63E]", type: "Accounting" })}
                        />
                        <ConnectorCard
                            name="QuickBooks" color="bg-[#2CA01C]" type="Accounting"
                            onClick={() => setActiveConnector({ name: "QuickBooks", color: "bg-[#2CA01C]", type: "Accounting" })}
                        />
                        <ConnectorCard
                            name="Zapier" color="bg-[#FF4F00]" type="Automation"
                            onClick={() => setActiveConnector({ name: "Zapier", color: "bg-[#FF4F00]", type: "Automation" })}
                        />
                        <ConnectorCard
                            name="Slack" color="bg-[#4A154B]" type="Notification"
                            onClick={() => setActiveConnector({ name: "Slack", color: "bg-[#4A154B]", type: "Notification" })}
                        />
                        <ConnectorCard
                            name="Microsoft Dynamics" color="bg-[#002050]" type="ERP"
                            onClick={() => setActiveConnector({ name: "Dynamics 365", color: "bg-[#002050]", type: "ERP" })}
                        />
                        <ConnectorCard
                            name="MongoDB" color="bg-[#47A248]" type="Database"
                            onClick={() => setActiveConnector({ name: "MongoDB", color: "bg-[#47A248]", type: "Database" })}
                        />
                    </div>
                </div>

                {/* Integration Modal */}
                {activeConnector && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setActiveConnector(null)}></div>
                        <div className="relative bg-zinc-900 border border-zinc-700 w-full max-w-lg rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                            <button onClick={() => setActiveConnector(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
                                <FiX size={24} />
                            </button>

                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-12 h-12 rounded-xl ${activeConnector.color} flex items-center justify-center shadow-lg`}>
                                    <FiSettings className="text-white/50" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Connect {activeConnector.name}</h3>
                                    <p className="text-sm text-zinc-400">Native Integration via Webhook</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                                    <p className="text-sm text-indigo-200 leading-relaxed">
                                        <strong>Ready to connect:</strong> Syntrax uses a standardized JSON payload that {activeConnector.name} can ingest natively.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-zinc-300 uppercase">Step 1: Set Destination</h4>
                                    <p className="text-sm text-zinc-400">
                                        In {activeConnector.name}, create a standard <strong>Incoming Webhook</strong> or Automation Flow.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-zinc-300 uppercase">Step 2: Configure Syntrax</h4>
                                    <p className="text-sm text-zinc-400">
                                        Paste the URL provided by {activeConnector.name} into the <strong>Universal Webhook</strong> field on this page.
                                    </p>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        onClick={() => setActiveConnector(null)}
                                        className="flex-1 bg-white text-black font-bold py-3 rounded-lg hover:bg-zinc-200 transition-colors"
                                    >
                                        I Understand
                                    </button>
                                    <a
                                        href={CONNECTOR_URLS[activeConnector.name] || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 border border-zinc-700 text-zinc-300 font-bold py-3 rounded-lg hover:bg-zinc-800 transition-colors text-center flex items-center justify-center gap-2"
                                    >
                                        Open {activeConnector.name} <FiExternalLink />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function ConnectorCard({ name, color, type, onClick }: { name: string, color: string, type: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="text-left bg-zinc-900 border border-zinc-800 p-4 rounded-xl hover:border-zinc-600 hover:bg-zinc-900/80 transition-all group flex flex-col h-full"
        >
            <div className="flex items-center justify-between mb-4 w-full">
                <div className={`w-8 h-8 rounded-lg ${color} shadow-lg shadow-${color}/20`}></div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded bg-zinc-950">{type}</span>
            </div>
            <h4 className="font-bold text-zinc-200 mb-1 group-hover:text-white transition-colors">{name}</h4>
            <div className="text-xs text-zinc-500 group-hover:text-indigo-400 transition-colors flex items-center gap-1 mt-auto">
                Configure <FiSettings size={10} />
            </div>
        </button>
    )
}
