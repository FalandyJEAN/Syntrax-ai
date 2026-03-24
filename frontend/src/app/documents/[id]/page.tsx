'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function DocumentDetail() {
    const params = useParams();
    const [doc, setDoc] = useState<any>(null);
    const [extraction, setExtraction] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Fetch Data
    useEffect(() => {
        if (!params.id) return;

        const fetchData = async () => {
            try {
                // Fetch Metadata
                const docRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/documents/${params.id}`);
                const docData = await docRes.json();
                setDoc(docData);

                // Fetch Extraction
                const extRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/documents/${params.id}/extraction`);
                const extData = await extRes.json();
                setExtraction(extData.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [params.id]);

    // Export Logic
    const handleExport = (type: 'json' | 'csv' | 'txt') => {
        if (!doc || !extraction) return;

        const filename = doc.file_name.split('.')[0];
        let content = '';
        let mimeType = '';
        let extension = '';

        if (type === 'json') {
            content = JSON.stringify(extraction, null, 2);
            mimeType = 'application/json';
            extension = 'json';
        } else if (type === 'txt') {
            content = extraction.full_text || JSON.stringify(extraction, null, 2);
            mimeType = 'text/plain';
            extension = 'txt';
        } else if (type === 'csv') {
            // Flatten JSON for CSV
            const flatten = (obj: any, prefix = '', res: any = {}) => {
                for (const key in obj) {
                    const val = obj[key];
                    const newKey = prefix ? `${prefix}_${key}` : key;
                    if (typeof val === 'object' && val !== null) {
                        flatten(val, newKey, res);
                    } else {
                        res[newKey] = val;
                    }
                }
                return res;
            };

            const flatData = flatten(extraction.extracted_data || extraction);
            // Delete potentially huge fields from CSV to keep it clean (optional)
            delete flatData['full_text'];

            const headers = Object.keys(flatData).join(',');
            const values = Object.values(flatData).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');

            // Add BOM for Excel UTF-8 compatibility
            content = `\uFEFF${headers}\n${values}`;
            mimeType = 'text/csv;charset=utf-8';
            extension = 'csv';
        }

        // Trigger Download
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_export.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading) return <div className="text-white p-8">Loading...</div>;
    if (!doc) return <div className="text-white p-8">Document not found</div>;

    return (
        <div className="flex h-screen bg-black text-white flex-col">
            <header className="h-16 border-b border-zinc-800 flex items-center px-6 justify-between bg-zinc-950">
                <div className="flex items-center gap-4">
                    <a href="/" className="text-zinc-400 hover:text-white">← Back</a>
                    <h1 className="font-bold text-lg">{doc.file_name}</h1>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300">
                        {doc.status}
                    </span>
                </div>
                <div>
                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleExport('json')}
                            className="bg-zinc-800 text-zinc-300 px-3 py-2 rounded text-xs font-bold hover:bg-zinc-700 transition-colors border border-zinc-700"
                        >
                            JSON
                        </button>
                        <button
                            onClick={() => handleExport('csv')}
                            className="bg-zinc-800 text-zinc-300 px-3 py-2 rounded text-xs font-bold hover:bg-zinc-700 transition-colors border border-zinc-700"
                        >
                            CSV
                        </button>
                        <button
                            onClick={() => handleExport('txt')}
                            className="bg-zinc-800 text-zinc-300 px-3 py-2 rounded text-xs font-bold hover:bg-zinc-700 transition-colors border border-zinc-700"
                        >
                            TXT
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left: Document Viewer */}
                <div className="w-1/2 border-r border-zinc-800 bg-zinc-900 flex flex-col">
                    <div className="p-2 border-b border-zinc-800 text-xs text-zinc-500 uppercase font-bold tracking-wider">
                        Original Document
                    </div>
                    <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-zinc-900">
                        {/* If it's an image, show it. If PDF, embed it. */}
                        {/* If it's an image, show it. If PDF, embed it. */
                            (() => {
                                const rawUrl = doc.file_url || '';
                                // Normalize backslashes to forward slashes
                                const normalizedPath = rawUrl.replace(/\\/g, '/');
                                // Prepend backend URL if not absolute
                                const fullUrl = normalizedPath.startsWith('http')
                                    ? normalizedPath
                                    : `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/${normalizedPath}`;

                                return fullUrl.toLowerCase().endsWith('.pdf') ? (
                                    <iframe
                                        src={fullUrl}
                                        className="w-full h-full border-none"
                                        title="Document Preview"
                                    />
                                ) : (
                                    <img
                                        src={fullUrl}
                                        alt="Document"
                                        className="max-w-full shadow-2xl border border-zinc-700"
                                    />
                                );
                            })()}
                    </div>
                </div>

                {/* Right: Extraction Data */}
                <div className="w-1/2 flex flex-col bg-black">
                    <div className="p-2 border-b border-zinc-800 text-xs text-zinc-500 uppercase font-bold tracking-wider">
                        Extracted Data (JSON)
                    </div>
                    <div className="flex-1 overflow-auto p-0">
                        {extraction ? (
                            <div className="p-6 space-y-6">
                                {/* Error Message */}
                                {extraction.error_message && (
                                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
                                        <strong>Extraction Failed:</strong> {extraction.error_message}
                                    </div>
                                )}

                                {/* Header Info (Type & Summary) */}
                                {(extraction.document_type || extraction.summary) && (
                                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-3">
                                        {extraction.document_type && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Document Type</span>
                                                <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-xs border border-indigo-500/30">
                                                    {extraction.document_type}
                                                </span>
                                            </div>
                                        )}
                                        {extraction.summary && (
                                            <div>
                                                <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Summary</div>
                                                <p className="text-zinc-300 text-sm leading-relaxed">{extraction.summary}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Full Text / Transcription */}
                                {extraction.full_text && (
                                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                                        <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2">Verbatim Transcription</div>
                                        <div className="max-h-64 overflow-y-auto text-zinc-300 text-sm font-mono whitespace-pre-wrap bg-black/50 p-3 rounded border border-zinc-800">
                                            {extraction.full_text}
                                        </div>
                                    </div>
                                )}

                                {/* Main Data Fields */}
                                <div className="grid grid-cols-1 gap-4">
                                    {/* Handle both legacy flat structure and new 'extracted_data' nested structure */}
                                    {Object.entries(extraction.extracted_data || extraction).map(([key, value]) => {
                                        // Skip top-level keys we already displayed if we are in the flat fallback mode AND they are the special ones
                                        if (!extraction.extracted_data && ['document_type', 'summary', 'error_message', 'full_text'].includes(key)) return null;

                                        return (
                                            <div key={key} className="border border-zinc-800 rounded p-3 bg-zinc-900/30">
                                                <div className="text-xs text-zinc-500 uppercase mb-1">{key.replace(/_/g, " ")}</div>
                                                <div className="font-mono text-sm break-all text-emerald-400">
                                                    {typeof value === 'object' ? (
                                                        <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-sans">
                                                            {/* If it's a list (like line items), maybe render it better? For now, raw JSON is safer for 'everything' */}
                                                            {JSON.stringify(value, null, 2)}
                                                        </pre>
                                                    ) : (
                                                        String(value)
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="pt-8 border-t border-zinc-900">
                                    <div className="text-[10px] text-zinc-600 uppercase mb-2">Raw JSON Response</div>
                                    <pre className="bg-zinc-950 p-4 rounded text-[10px] text-zinc-500 overflow-auto max-h-48 scrollbar-thin scrollbar-thumb-zinc-800">
                                        {JSON.stringify(extraction, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-zinc-500">
                                No extraction data available.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function IntegrationItem({ label, color }: { label: string, color: string }) {
    return (
        <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-800 flex items-center gap-3 transition-colors group/item">
            <span className={`w-2 h-2 rounded-full ${color}`}></span>
            <span className="text-zinc-300 text-xs font-medium group-hover/item:text-white">{label}</span>
            <span className="ml-auto text-[10px] text-zinc-600 group-hover/item:text-indigo-400 opacity-0 group-hover/item:opacity-100 transition-all">Link &rarr;</span>
        </button>
    );
}
