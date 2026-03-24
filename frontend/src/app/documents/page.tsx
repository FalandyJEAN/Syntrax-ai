'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import { FiSearch, FiFileText, FiCheckCircle, FiAlertCircle, FiClock, FiMoreHorizontal, FiDownload } from 'react-icons/fi';
import { T } from '@/lib/i18n';
import { useSession } from 'next-auth/react';

export default function DocumentsPage() {
    const { data: session } = useSession();
    const [documents, setDocuments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Poll for document updates
    useEffect(() => {
        const fetchDocuments = async () => {
            const token = (session as any)?.accessToken;
            if (!token) return;

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/documents/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await res.json();

                // Ensure data is an array, otherwise default to empty
                if (Array.isArray(data)) {
                    setDocuments(data);
                } else {
                    console.error("API returned non-array:", data);
                    setDocuments([]);
                }
            } catch (err) {
                console.error("Failed to fetch documents", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (session) {
            fetchDocuments();
            const interval = setInterval(fetchDocuments, 2000);
            return () => clearInterval(interval);
        }
    }, [session]);

    const filteredDocuments = documents.filter(doc =>
        doc.file_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-black text-white font-sans overflow-hidden selection:bg-indigo-500 selection:text-white">
            <Sidebar />

            <main className="flex-1 overflow-y-auto bg-black relative w-full">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto p-6 md:p-12 pb-24">

                    <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 text-white"><T>Documents</T></h1>
                            <p className="text-zinc-400"><T>View and manage your extracted files.</T></p>
                        </div>

                        <div className="relative w-full md:w-64">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search documents..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-zinc-400">
                                <thead className="text-xs uppercase bg-zinc-900/50 text-zinc-500 font-semibold">
                                    <tr>
                                        <th className="px-6 py-4 whitespace-nowrap"><T>File Name</T></th>
                                        <th className="px-6 py-4 whitespace-nowrap"><T>Status</T></th>
                                        <th className="px-6 py-4 whitespace-nowrap"><T>Uploaded</T></th>
                                        <th className="px-6 py-4 text-right whitespace-nowrap"><T>Actions</T></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                                                Loading documents...
                                            </td>
                                        </tr>
                                    ) : filteredDocuments.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                                                No documents found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredDocuments.map((doc: any) => (
                                            <tr key={doc.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4 font-medium text-white flex items-center gap-3 whitespace-nowrap">
                                                    <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-400">
                                                        <FiFileText />
                                                    </div>
                                                    {doc.file_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`
                                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                                ${doc.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                            doc.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                                'bg-amber-500/10 text-amber-400 border-amber-500/20'} // processing
                            `}>
                                                        {doc.status === 'completed' && <FiCheckCircle />}
                                                        {doc.status === 'failed' && <FiAlertCircle />}
                                                        {doc.status === 'processing' && <FiClock className="animate-spin-slow" />}
                                                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">
                                                    {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <Link
                                                        href={`/documents/${doc.id}`}
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-black text-xs font-bold rounded hover:bg-zinc-200 transition-colors"
                                                    >
                                                        <T>View Details</T>
                                                    </Link>
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
