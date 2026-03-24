'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import { FiUploadCloud, FiFileText, FiCpu, FiActivity, FiClock, FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiMoreHorizontal, FiPlus } from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import { T } from '@/lib/i18n';

export default function Dashboard() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<any[]>([]);
  const [stats, setStats] = useState({ processed_count: 0, success_rate: 100, credits_remaining: 500, total_credits: 500 });
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Poll for document updates
  useEffect(() => {
    if (!session?.accessToken) return;

    const fetchDocuments = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/documents/`, {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`
          }
        });
        if (res.status === 401) return; // Session expired
        const data = await res.json();
        setDocuments(data);
      } catch (err) {
        console.error("Failed to fetch documents", err);
      }
    };

    const fetchStats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/documents/stats`, {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`
          }
        });
        if (res.status === 401) return;
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    }

    fetchDocuments();
    fetchStats();
    const interval = setInterval(() => {
      fetchDocuments();
      fetchStats();
    }, 2000); // 2s polling
    return () => clearInterval(interval);
  }, [session]);

  const handleDrag = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e: any) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // If multiple files, use batch upload
    if (files.length > 1) {
      await uploadBatch(files as File[]);
    } else {
      await uploadFile(files[0] as File);
    }
  };



  const uploadFile = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Upload with Session Token
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      // Backend now handles processing via BackgroundTasks
      // No need to manually trigger /process anymore

    } catch (err) {
      console.error(err);
      alert('Upload error: ' + err);
    } finally {
      setIsUploading(false);
    }
  };

  const uploadBatch = async (files: File[]) => {
    setIsUploading(true);
    const formData = new FormData();

    // Append all files
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/documents/upload-batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Batch upload failed');
      }

      const result = await res.json();
      console.log(`Uploaded ${result.uploaded}/${result.total} files`);
      if (result.failed > 0) {
        alert(`${result.failed} files failed to upload`);
      }

    } catch (err) {
      console.error(err);
      alert('Batch upload error: ' + err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden selection:bg-indigo-500 selection:text-white">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-black relative w-full">
        {/* Background Ambience */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto p-6 md:p-12 pb-24">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12 mt-12 md:mt-0">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-white"><T>Dashboard</T></h1>
              <p className="text-zinc-400"><T>Manage your document extraction pipeline.</T></p>
            </div>
            <div className="w-full md:w-auto">
              <button
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={isUploading || !session}
                className="w-full md:w-auto bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <FiActivity className="animate-spin text-lg" /> <T>Uploading...</T>
                  </>
                ) : (
                  <>
                    <FiPlus className="text-lg" /> <T>New Upload</T>
                  </>
                )}
              </button>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileInput}
                accept=".pdf,.png,.jpg,.jpeg"
                multiple
              />
            </div>
          </header>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <StatCard label={<T>Documents Processed</T>} value={stats.processed_count.toString()} icon={<FiFileText size={24} />} />
            <StatCard label={<T>Success Rate</T>} value={`${stats.success_rate}%`} icon={<FiCheckCircle size={24} />} />
            <StatCard label={<T>Credits Remaining</T>} value={`${stats.credits_remaining.toLocaleString()} / ${stats.total_credits.toLocaleString()}`} icon={<FiCpu size={24} />} />
          </div>

          {/* Upload Area */}
          <div
            className={`mb-12 border-2 border-dashed rounded-3xl p-12 md:p-16 text-center transition-all duration-300 group cursor-pointer relative overflow-hidden
                ${dragActive
                ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
                : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900/10 hover:bg-zinc-900/30'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center transition-all bg-zinc-900 border border-zinc-800 shadow-xl group-hover:scale-110 group-hover:border-indigo-500/30`}>
              <FiUploadCloud className="text-3xl md:text-4xl text-zinc-400 group-hover:text-indigo-400 transition-colors" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-3 text-white">Drop files here to extract</h3>
            <p className="text-zinc-500 max-w-sm mx-auto text-sm md:text-base">Support for PDF, PNG, JPG up to 10MB. Our AI will automatically detect document type.</p>
          </div>

          {/* Documents List */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                <span className="flex items-center gap-2 text-xs font-bold text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full border border-indigo-400/20 animate-pulse">
                  <FiActivity /> Live Updates
                </span>
              </div>
              <Link href="/documents" className="text-sm font-medium text-zinc-500 hover:text-indigo-400 transition-colors">
                View All &rarr;
              </Link>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-900/30 overflow-hidden backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-zinc-500 uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-5 font-bold whitespace-nowrap">Document Name</th>
                      <th className="px-6 py-5 font-bold whitespace-nowrap">Date</th>
                      <th className="px-6 py-5 font-bold whitespace-nowrap">Status</th>
                      <th className="px-6 py-5 font-bold whitespace-nowrap">Confidence</th>
                      <th className="px-6 py-5 font-bold text-right whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {documents.slice(0, 5).map((doc, i) => (
                      <tr key={doc.id || i} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4 font-medium text-zinc-200 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-lg shadow-inner text-zinc-400">
                                {doc.file_name.endsWith('.pdf') ? <FiFileText /> : <FiFileText />}
                              </div>
                              <div>
                                <div className="font-bold text-base text-white truncate max-w-[200px]" title={doc.file_name}>{doc.file_name}</div>
                                <div className="text-xs text-zinc-600 font-mono mt-0.5">{doc.id?.slice(0, 8)}...</div>
                              </div>
                            </div>
                            {doc.status === 'failed' && doc.failure_reason && (
                              <div className="text-red-400 text-xs mt-2 pl-14 bg-red-500/10 p-2 rounded border border-red-500/20 max-w-md flex items-start gap-2 whitespace-normal">
                                <FiAlertTriangle className="mt-0.5 flex-shrink-0" />
                                <span><strong>Error:</strong> {doc.failure_reason}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-zinc-500 whitespace-nowrap">
                          {doc.created_at ? new Date(doc.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={doc.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ${paramsToColor(doc.confidence_score)}`}
                                style={{ width: `${(doc.confidence_score || 0) * 100}%` }}
                              ></div>
                            </div>
                            <span className={`text-xs font-bold font-mono ${paramsToColorText(doc.confidence_score)}`}>{Math.round((doc.confidence_score || 0) * 100)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <Link href={`/documents/${doc.id}`} className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 font-bold text-xs transition-all border border-zinc-700">
                            View Analysis
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {documents.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-24 text-center text-zinc-600">
                          <div className="mb-4 text-4xl opacity-20 flex justify-center"><FiFileText size={48} /></div>
                          <p>No documents processed yet.</p>
                          <p className="text-xs mt-2">Upload your first document above.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main >
    </div >
  );
}

function StatCard({ label, value, icon }: { label: React.ReactNode, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-2xl backdrop-blur-md hover:bg-zinc-900/50 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="text-zinc-500 text-xs uppercase font-bold tracking-wider">{label}</div>
        <div className="text-xl opacity-50 text-indigo-400">{icon}</div>
      </div>
      <div className="text-3xl font-bold font-sans tracking-tight text-white">{value}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    processing: 'bg-indigo-500 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]',
    review_required: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    failed: 'bg-red-500/10 text-red-500 border-red-500/20',
    pending: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  };

  const icons: any = {
    completed: <FiCheckCircle />,
    processing: <FiActivity className="animate-spin" />,
    review_required: <FiAlertCircle />,
    failed: <FiAlertTriangle />,
    pending: <FiMoreHorizontal />
  }

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${styles[status] || styles.pending}`}>
      <span>{icons[status]}</span>
      <span className="capitalize tracking-wide">
        {status === 'processing' ? 'AI Analysis...' : status.replace('_', ' ')}
      </span>
    </span>
  );
}

function paramsToColor(score: number) {
  if (score >= 0.9) return 'bg-emerald-500';
  if (score >= 0.7) return 'bg-amber-500';
  return 'bg-red-500';
}

function paramsToColorText(score: number) {
  if (score >= 0.9) return 'text-emerald-500';
  if (score >= 0.7) return 'text-amber-500';
  return 'text-red-500';
}
