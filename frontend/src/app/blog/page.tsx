'use client';
import StaticPage from '../../components/StaticPage';

export default function Blog() {
    return (
        <StaticPage title="Syntrax Blog">
            <div className="grid grid-cols-1 gap-8 not-prose">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="group cursor-pointer">
                        <div className="h-48 bg-zinc-900 rounded-xl mb-4 border border-zinc-800 group-hover:border-indigo-500/50 transition-colors"></div>
                        <div className="text-xs text-indigo-400 font-bold mb-2">ENGINEERING</div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">How we scaled our vector database to 1 billion vectors</h3>
                        <p className="text-zinc-500 text-sm">January 20, 2026 • 5 min read</p>
                    </div>
                ))}
            </div>
        </StaticPage>
    );
}
