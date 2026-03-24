'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
    FiChevronRight, FiSearch,
    FiHash, FiTerminal, FiCode, FiZap, FiShield, FiAlertCircle, FiCheckCircle, FiCpu
} from 'react-icons/fi';
import DocsLayout from '../../../components/DocsLayout';
import { T } from '@/lib/i18n';

export default function DocumentationPage() {
    const [activeSection, setActiveSection] = useState('intro');

    // Scroll spy logic
    useEffect(() => {
        const handleScroll = () => {
            // Find the main scroll container (DocsLayout main)
            const main = document.querySelector('main');
            if (!main) return;

            const sections = ['intro', 'quickstart', 'api-auth', 'api-endpoints', 'webhooks', 'errors'];
            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    // 150px offset for sticky header
                    if (rect.top >= 0 && rect.top <= 300) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };
        const main = document.querySelector('main');
        if (main) {
            main.addEventListener('scroll', handleScroll);
            return () => main.removeEventListener('scroll', handleScroll);
        }
    }, []);

    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(id);
        }
    };

    // Sidebar Content Definition
    const sidebarContent = (
        <>
            <div className="mb-6 relative group">
                <FiSearch className="absolute left-3 top-2.5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                    type="text"
                    placeholder="Search docs..."
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-600"
                />
            </div>

            <NavGroup title={<T>Getting Started</T>}>
                <NavItem active={activeSection === 'intro'} onClick={() => scrollTo('intro')} label={<T>Introduction</T>} />
                <NavItem active={activeSection === 'quickstart'} onClick={() => scrollTo('quickstart')} label={<T>Quickstart</T>} />
            </NavGroup>

            <NavGroup title={<T>API Reference</T>}>
                <NavItem active={activeSection === 'api-auth'} onClick={() => scrollTo('api-auth')} label={<T>Authentication</T>} />
                <NavItem active={activeSection === 'api-endpoints'} onClick={() => scrollTo('api-endpoints')} label={<T>Endpoints</T>} />
                <NavItem active={activeSection === 'errors'} onClick={() => scrollTo('errors')} label={<T>Error Codes</T>} />
            </NavGroup>

            <NavGroup title={<T>Event Engine</T>}>
                <NavItem active={activeSection === 'webhooks'} onClick={() => scrollTo('webhooks')} label={<T>Webhooks & Security</T>} />
            </NavGroup>
        </>
    );

    return (
        <DocsLayout sidebarContent={sidebarContent}>
            <article className="prose prose-invert prose-zinc max-w-none">

                {/* HERO SECTION */}
                <section id="intro" className="mb-20 scroll-mt-32">
                    <div className="relative mb-10">
                        <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-4 tracking-wide">
                            <T>DEVELOPER GUIDE v1.2.0</T>
                        </span>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                            Syntrax <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Docs</span>
                        </h1>
                        <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl">
                            <T>The enterprise-grade engine for unstructured data extraction. Transform any PDF, Image, or Scanned Document into type-safe JSON with 99.9% accuracy.</T>
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose mb-12">
                        <QuickLink
                            title={<T>Quickstart Guide</T>}
                            desc={<T>Send your first document in &lt; 2 minutes.</T>}
                            icon={<FiZap />}
                            onClick={() => scrollTo('quickstart')}
                        />
                        <QuickLink
                            title={<T>API Ref</T>}
                            desc={<T>Detailed endpoint documentation.</T>}
                            icon={<FiCode />}
                            onClick={() => scrollTo('api-endpoints')}
                        />
                    </div>

                    {/* Feature Highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose">
                        <FeatureBadge icon={<FiCpu />} title={<T>LLM Powered</T>} desc={<T>GPT-4o & Claude 3.5 Sonnet Engine</T>} />
                        <FeatureBadge icon={<FiShield />} title={<T>SOC2 Compliant</T>} desc={<T>End-to-end encryption & Audit Logs</T>} />
                        <FeatureBadge icon={<FiTerminal />} title={<T>Dev First</T>} desc={<T>Webhooks, SDKs, and CLI tools</T>} />
                    </div>
                </section>

                <hr className="border-white/5 my-16" />

                {/* QUICKSTART */}
                <section id="quickstart" className="mb-20 scroll-mt-32">
                    <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><FiZap size={24} /></div>
                        <T>Quickstart</T>
                    </h2>
                    <p className="text-zinc-400 mb-8"><T>Follow these steps to integrate Syntrax into your application.</T></p>

                    <div className="space-y-12">
                        <Step
                            number="01"
                            title={<T>Get your API Key</T>}
                            content={<span>Navigate to the <Link href="/integrations" className="text-indigo-400 font-medium hover:underline">Integrations Hub</Link> to generate a new API Key. Keep this key secure.</span>}
                        />
                        <Step
                            number="02"
                            title={<T>Upload a Document</T>}
                            content={
                                <div>
                                    <p className="mb-4"><T>Use the API to upload a PDF or Image. processing starts immediately.</T></p>
                                    <CodeBlock title="BASH" language="bash">
                                        {`curl -X POST https://api.syntrax.ai/v1/documents/upload \\
  -H "X-API-Key: sk_live_..." \\
  -F "file=@invoice_2024.pdf"`}
                                    </CodeBlock>
                                </div>
                            }
                        />
                        <Step
                            number="03"
                            title={<T>Poll or Listen</T>}
                            content={<span>The process is asynchronous. You can either poll <code>GET /documents/:id</code> or, preferably, listen for the <code>document.completed</code> webhook.</span>}
                        />
                    </div>
                </section>

                <hr className="border-white/5 my-16" />

                {/* API AUTHENTICATION */}
                <section id="api-auth" className="mb-20 scroll-mt-32">
                    <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><FiShield size={24} /></div>
                        <T>Authentication</T>
                    </h2>
                    <p className="text-zinc-400 mb-6">
                        Syntrax uses API keys to allow access to the API. You can register a new Syntrax API key at our <Link href="/integrations" className="text-indigo-400 hover:underline">developer portal</Link>.
                    </p>

                    <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-lg mb-8">
                        <div className="flex gap-3">
                            <FiAlertCircle className="text-amber-500 shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-200">
                                <strong>Security Notice:</strong> Your API keys carry many privileges, so be sure to keep them secure! Do not share mock secret API keys in publicly accessible areas such as GitHub, client-side code, and so forth.
                            </div>
                        </div>
                    </div>

                    <p className="text-zinc-400 mb-4">
                        Authentication to the API is performed via the <code className="text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded text-sm font-mono">X-API-Key</code> header.
                    </p>
                </section>

                {/* API ENDPOINTS */}
                <section id="api-endpoints" className="mb-20 scroll-mt-32">
                    <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><FiCode size={24} /></div>
                        <T>Endpoints</T>
                    </h2>

                    {/* Endpoint: Upload */}
                    <div className="mb-12">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="px-3 py-1 bg-indigo-500 text-white font-bold text-xs rounded uppercase tracking-wider">POST</span>
                            <code className="text-lg text-white font-mono">/v1/documents/upload</code>
                        </div>
                        <p className="text-zinc-400 mb-4"><T>Upload a file for processing. Supports PDF, PNG, JPG (max 20MB).</T></p>

                        <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-2"><T>Response</T></h4>
                        <CodeBlock title="200 OK" language="json">
                            {`{
  "id": "doc_8f921a0c...",
  "filename": "invoice_2024.pdf",
  "status": "processing",
  "uploaded_at": "2026-01-20T19:30:00Z"
}`}
                        </CodeBlock>
                    </div>

                    {/* Endpoint: Get All */}
                    <div className="mb-12">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="px-3 py-1 bg-sky-500 text-white font-bold text-xs rounded uppercase tracking-wider">GET</span>
                            <code className="text-lg text-white font-mono">/v1/documents</code>
                        </div>
                        <p className="text-zinc-400 mb-4"><T>Retrieve a list of processed documents.</T></p>
                    </div>

                    {/* Data Retention Policy */}
                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-6 mb-12">
                        <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                            <FiShield className="text-emerald-400" />
                            <T>Data Retention & Privacy</T>
                        </h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            <T>To ensure data privacy and reduce storage costs, Syntrax implements a strict retention policy. Original documents (PDF/Images) are automatically deleted from our servers after the retention period (7 days for Starter, 14 days for Pro).</T>
                        </p>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <FiCheckCircle className="text-emerald-500" />
                            <T>Extracted JSON data is kept indefinitely unless manually deleted.</T>
                        </div>
                    </div>
                </section>


                {/* WEBHOOKS */}
                <section id="webhooks" className="mb-20 scroll-mt-32">
                    <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400"><FiHash size={24} /></div>
                        <T>Webhooks</T>
                    </h2>
                    <p className="text-zinc-400 mb-6">
                        <T>Listen for events on your server so you can automatically trigger reactions. Secure your webhooks by verifying the signature.</T>
                    </p>

                    <h3 className="text-xl font-bold text-white mb-4"><T>Verifying Signatures</T></h3>
                    <p className="text-zinc-400 mb-4">
                        Syntrax signs all webhook events using a hash-based message authentication code (HMAC) with SHA-256.
                        The signature is included in the <code className="text-pink-300 font-mono">X-Syntrax-Signature</code> header.
                    </p>

                    <CodeBlock title="Node.js Verification Example" language="javascript">
                        {`const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return signature === digest;
}`}
                    </CodeBlock>
                </section>

                {/* ERRORS */}
                <section id="errors" className="mb-20 scroll-mt-32">
                    <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg text-red-400"><FiAlertCircle size={24} /></div>
                        <T>Errors</T>
                    </h2>
                    <p className="text-zinc-400 mb-8">
                        <T>Syntrax uses conventional HTTP response codes to indicate the success or failure of an API request.</T>
                    </p>

                    <div className="overflow-hidden rounded-xl border border-zinc-800">
                        <table className="w-full text-left text-sm text-zinc-400">
                            <thead className="bg-zinc-900/50 text-zinc-200">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Code</th>
                                    <th className="px-6 py-4 font-bold">Meaning</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                <tr>
                                    <td className="px-6 py-4 font-mono text-white">200 OK</td>
                                    <td className="px-6 py-4">Everything worked as expected.</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-mono text-white">400 Bad Request</td>
                                    <td className="px-6 py-4">The request was unacceptable (e.g. missing file).</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-mono text-white">401 Unauthorized</td>
                                    <td className="px-6 py-4">No valid API key provided.</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-mono text-white">422 Unprocessable</td>
                                    <td className="px-6 py-4">The file type is not supported or corrupted.</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-mono text-white">500 Server Error</td>
                                    <td className="px-6 py-4">Something went wrong on our end.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

            </article>
        </DocsLayout>
    );
}


// --- Sub Components ---

function NavGroup({ title, children }: { title: React.ReactNode, children: React.ReactNode }) {
    return (
        <div className="mb-8">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 px-3">{title}</h4>
            <ul className="space-y-1 border-l border-white/5 ml-3 pl-2">
                {children}
            </ul>
        </div>
    )
}

function NavItem({ label, active, onClick }: { label: React.ReactNode, active: boolean, onClick: () => void }) {
    return (
        <li>
            <button
                onClick={onClick}
                className={`
                    w-full text-left px-3 py-1.5 rounded-md text-sm transition-all duration-200
                    ${active ? 'text-indigo-400 bg-indigo-500/10 font-medium translate-x-1' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'}
                `}
            >
                {label}
            </button>
        </li>
    )
}

function QuickLink({ title, desc, icon, onClick }: { title: React.ReactNode, desc: React.ReactNode, icon: any, onClick?: () => void }) {
    return (
        <div onClick={onClick} className="border border-white/10 rounded-xl p-5 hover:border-indigo-500/50 hover:bg-white/[0.02] transition-colors cursor-pointer group bg-zinc-900/20">
            <div className="text-indigo-400 mb-3 text-2xl group-hover:scale-110 transition-transform origin-left">{icon}</div>
            <h3 className="font-bold text-white mb-2 flex items-center gap-2 text-lg">
                {title} <FiChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500 text-sm" />
            </h3>
            <div className="text-sm text-zinc-500">{desc}</div>
        </div>
    )
}

function FeatureBadge({ icon, title, desc }: { icon: any, title: React.ReactNode, desc: React.ReactNode }) {
    return (
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <div className="text-zinc-400 mb-2">{icon}</div>
            <div className="font-bold text-white text-sm mb-0.5">{title}</div>
            <div className="text-xs text-zinc-500">{desc}</div>
        </div>
    )
}

function Step({ number, title, content }: { number: string, title: React.ReactNode, content: React.ReactNode }) {
    return (
        <div className="flex gap-6">
            <div className="shrink-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center font-bold text-indigo-400 z-10 relative">
                    {number}
                </div>
                <div className="w-px h-full bg-zinc-800 -mt-2 mb-[-3rem] last:hidden"></div>
            </div>
            <div className="pb-12">
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <div className="text-zinc-400 text-base leading-relaxed">{content}</div>
            </div>
        </div>
    )
}

function CodeBlock({ title, children, language }: { title?: string, children: string, language: string }) {
    return (
        <div className="rounded-xl overflow-hidden border border-zinc-800 bg-[#0d0e12] my-4 shadow-2xl">
            {title && (
                <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{title}</span>
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                    </div>
                </div>
            )}
            <div className="relative group">
                <div className="p-5 overflow-x-auto text-sm font-mono text-indigo-100 leading-relaxed">
                    <pre><code>{children}</code></pre>
                </div>
            </div>
        </div>
    )
}
