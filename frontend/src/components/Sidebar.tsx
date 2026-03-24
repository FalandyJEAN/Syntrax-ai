'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiFileText, FiCreditCard, FiSettings, FiLogOut, FiMenu, FiX, FiShare2 } from 'react-icons/fi';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={toggleMenu}
                className="md:hidden fixed top-4 left-4 z-50 bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-white hover:bg-zinc-800 transition-colors"
            >
                {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-white/10 flex flex-col p-6 transition-transform duration-300 ease-in-out
                md:relative md:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Glow effect */}
                <div className="absolute top-0 left-0 w-full h-40 bg-indigo-500/10 blur-[60px] -z-10 pointer-events-none"></div>

                <Link href="/" className="flex items-center gap-3 mb-10 px-2 opacity-90 hover:opacity-100 transition-opacity">
                    <img src="/logo.png" alt="Syntrax Logo" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-lg tracking-tight text-white">Syntrax.ai</span>
                </Link>

                <nav className="flex-1 space-y-2">
                    <NavItem
                        href="/dashboard"
                        icon={<FiHome size={20} />}
                        label="Dashboard"
                        active={pathname === '/dashboard'}
                        onClick={() => setIsOpen(false)}
                    />
                    <NavItem
                        href="/documents"
                        icon={<FiFileText size={20} />}
                        label="Documents"
                        active={pathname.startsWith('/documents')}
                        onClick={() => setIsOpen(false)}
                    />
                    <NavItem
                        href="/integrations"
                        icon={<FiShare2 size={20} />}
                        label="Integrations"
                        active={pathname === '/integrations'}
                        onClick={() => setIsOpen(false)}
                    />
                    <NavItem
                        href="/billing"
                        icon={<FiCreditCard size={20} />}
                        label="Billing"
                        active={pathname === '/billing'}
                        onClick={() => setIsOpen(false)}
                    />
                    <NavItem
                        href="/settings"
                        icon={<FiSettings size={20} />}
                        label="Settings"
                        active={pathname === '/settings'}
                        onClick={() => setIsOpen(false)}
                    />
                </nav>

                <div className="mt-auto pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 px-2 mb-6">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold shadow-lg shadow-indigo-500/20 text-white">
                            {session?.user?.full_name?.charAt(0) || session?.user?.email?.charAt(0) || "U"}
                        </div>
                        <div className="text-sm overflow-hidden text-zinc-300">
                            <div className="font-medium truncate text-white">{session?.user?.full_name || "User"}</div>
                            <div className="text-zinc-500 text-xs truncate">{session?.user?.email}</div>
                        </div>
                    </div>

                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all w-full text-sm font-medium"
                    >
                        <FiLogOut size={16} />
                        Sign Out
                    </button>

                    {/* Admin Link - Only visible if role is admin */}
                    {session?.user?.role === 'admin' && (
                        <Link href="/admin" className="block mt-6 text-[10px] text-zinc-700 hover:text-indigo-400 uppercase font-bold tracking-widest text-center transition-colors">
                            Admin View
                        </Link>
                    )}
                </div>
            </aside>
        </>
    );
}

function NavItem({ href, icon, label, active, onClick }: { href: string, icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                ${active
                    ? 'bg-indigo-600/10 text-indigo-400 font-bold border border-indigo-600/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'}
            `}
        >
            <span className={`transition-transform group-hover:scale-110 ${active ? 'opacity-100' : 'opacity-70'}`}>
                {icon}
            </span>
            {label}
        </Link>
    );
}
