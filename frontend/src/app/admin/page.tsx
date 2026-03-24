'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiActivity, FiServer, FiUsers, FiDollarSign, FiRefreshCw, FiCpu, FiAlertCircle, FiTerminal, FiSearch, FiClock, FiMenu, FiX } from 'react-icons/fi';
import { LanguageSwitcher } from '@/lib/i18n';

// Types matching backend response
interface KpiStats {
  total_organizations: number;
  total_documents: number;
  success_rate: number;
  estimated_mrr: number;
  avg_processing_time: number;
}

interface Organization {
  id: string;
  name: string;
  plan: string;
  document_count: number;
  status: string;
}

interface SystemLog {
  time: string;
  level: string;
  message: string;
  color?: string;
}

interface DashboardData {
  stats: KpiStats;
  organizations: Organization[];
  recent_logs: SystemLog[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/admin/dashboard`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const refresh = () => setRefreshTrigger(prev => prev + 1);

  if (!data && loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white font-sans gap-4">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="animate-pulse text-zinc-400 text-sm">Loading System Data...</p>
    </div>
  );

  const stats = data?.stats || { total_organizations: 0, total_documents: 0, success_rate: 0, estimated_mrr: 0, avg_processing_time: 0 };
  const logs = data?.recent_logs || [];
  const orgs = data?.organizations || [];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500 selection:text-white pb-20">

      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none"></div>

      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur opacity-40 group-hover:opacity-60 transition-opacity rounded-full"></div>
            <img src="/logo.png" alt="Syntrax Logo" className="w-8 h-8 object-contain relative z-10" />
          </div>
          <span className="font-bold text-lg tracking-tight">Syntrax <span className="text-zinc-500 font-medium">Admin</span></span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            System Operational
          </div>
          <LanguageSwitcher />
          <button onClick={refresh} className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all" title="Refresh Data">
            <FiRefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <div className="w-9 h-9 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 p-[1px]">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-xs font-bold">SA</div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-6 md:p-8 space-y-8 relative z-10">

        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Overview</h1>
            <p className="text-zinc-400">Real-time monitoring of your application's health and performance.</p>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-sm text-zinc-500">Last updated</div>
            <div className="font-mono text-xs text-zinc-300">{new Date().toLocaleTimeString()}</div>
          </div>
        </div>

        {/* KPI Grid - Ultra Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatCard
            label="Total Documents"
            value={stats.total_documents.toLocaleString()}
            icon={<FiServer size={24} />}
            trend="+12% this week"
            trendUp={true}
            color="indigo"
          />
          <StatCard
            label="Success Rate"
            value={`${stats.success_rate}%`}
            icon={<FiActivity size={24} />}
            trend="Stable"
            trendUp={true}
            color="emerald"
          />
          <StatCard
            label="Active Tenants"
            value={stats.total_organizations.toString()}
            icon={<FiUsers size={24} />}
            trend="+1 new today"
            trendUp={true}
            color="violet"
          />
          <StatCard
            label="Est. Monthly Revenue"
            value={`$${stats.estimated_mrr.toLocaleString()}`}
            icon={<FiDollarSign size={24} />}
            trend="Based on usage"
            trendUp={true}
            color="amber"
          />
          <StatCard
            label="Avg. Latency"
            value={`${stats.avg_processing_time}s`}
            icon={<FiClock size={24} />}
            trend="-0.3s improvement"
            trendUp={true}
            color="rose"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content: Tenants & Chart */}
          <div className="lg:col-span-2 space-y-8">

            {/* Traffic Visualization */}
            <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <FiCpu className="text-indigo-400" /> Processing Volume
                  </h3>
                  <p className="text-sm text-zinc-500">Requests per second over last 24h</p>
                </div>
                <div className="flex gap-4 text-xs font-medium">
                  <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Success</span>
                  <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> Error</span>
                </div>
              </div>

              <div className="h-48 md:h-64 flex items-end justify-between gap-1 md:gap-2">
                {[...Array(30)].map((_, i) => {
                  const height = Math.floor(Math.random() * 70) + 10;
                  const isError = Math.random() > 0.85;
                  return (
                    <div
                      key={i}
                      className={`w-full rounded-t-sm transition-all hover:opacity-100 opacity-70 ${isError ? 'bg-red-500/50 hover:bg-red-500' : 'bg-indigo-500/50 hover:bg-indigo-500'}`}
                      style={{ height: `${height}%` }}
                    ></div>
                  );
                })}
              </div>
            </div>

            {/* Tenants Table */}
            <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden">
              <div className="p-6 md:p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <FiUsers className="text-violet-400" /> Recent Organizations
                </h3>
                <div className="relative w-full sm:w-auto">
                  <FiSearch className="absolute left-3 top-3 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search tenants..."
                    className="w-full sm:w-64 bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/[0.02] text-zinc-500 font-medium">
                    <tr>
                      <th className="px-6 py-4 md:pl-8">Organization</th>
                      <th className="px-6 py-4">Current Plan</th>
                      <th className="px-6 py-4 text-right">Documents Used</th>
                      <th className="px-6 py-4 md:pr-8 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orgs.length > 0 ? orgs.map((org) => (
                      <tr key={org.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 md:pl-8">
                          <div className="font-bold text-white">{org.name}</div>
                          <div className="text-xs text-zinc-500 font-mono">{org.id.substring(0, 8)}...</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {org.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-zinc-300">{org.document_count.toLocaleString()}</td>
                        <td className="px-6 py-4 md:pr-8 text-right">
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">No organizations found yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Sidebar: System Logs & Health */}
          <div className="space-y-8">

            {/* System Logs */}
            <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden flex flex-col h-[500px]">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <h3 className="font-bold flex items-center gap-2 text-sm text-zinc-300">
                  <FiTerminal /> System Logs
                </h3>
                <span className="text-[10px] text-zinc-500 bg-white/5 px-2 py-1 rounded">Live Stream</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs scrollbar-thin scrollbar-thumb-zinc-700">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-3 items-start group hover:bg-white/[0.02] p-1 rounded transition-colors">
                    <span className="text-zinc-600 shrink-0 select-none">{log.time}</span>
                    <span className={`font-bold shrink-0 ${log.level === 'ERROR' ? 'text-red-400' : 'text-blue-400'}`}>{log.level}</span>
                    <span className="text-zinc-400 break-all leading-relaxed">{log.message}</span>
                  </div>
                ))}
                <div className="flex gap-2 items-center text-zinc-700 animate-pulse pl-1">
                  <span>_</span>
                </div>
              </div>
            </div>

            {/* Cluster Health */}
            <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-8">
              <h3 className="font-bold mb-6 flex items-center gap-2">
                <FiActivity className="text-amber-400" /> Infrastructure
              </h3>
              <div className="space-y-6">
                <ResourceBar label="CPU Load (US-East)" percent={42} color="bg-indigo-500" />
                <ResourceBar label="Memory Usage" percent={68} color="bg-violet-500" />
                <ResourceBar label="Storage (S3)" percent={24} color="bg-emerald-500" />
                <ResourceBar label="OpenRouter API Limit" percent={12} color="bg-amber-500" />
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, trend, trendUp, color }: { label: string, value: string, icon: any, trend: string, trendUp: boolean, color: string }) {
  // Map simplified color names to Tailwind classes
  const colors: any = {
    indigo: { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    violet: { text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
    amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    rose: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  }
  const theme = colors[color] || colors.indigo;

  return (
    <div className={`
            bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 
            hover:border-white/10 transition-all duration-300 group hover:-translate-y-1
        `}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${theme.bg} ${theme.text} ${theme.border} border`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <h4 className="text-zinc-500 text-sm font-medium mb-1">{label}</h4>
        <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
      </div>
    </div>
  )
}

function ResourceBar({ label, percent, color }: { label: string, percent: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-medium mb-2">
        <span className="text-zinc-400">{label}</span>
        <span className="text-white">{percent}%</span>
      </div>
      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  )
}
