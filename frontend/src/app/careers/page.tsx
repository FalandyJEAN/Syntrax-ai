'use client';
import StaticPage from '../../components/StaticPage';

export default function Careers() {
    return (
        <StaticPage title="Careers">
            <p className="text-xl text-zinc-400">
                Join us in building the future of document intelligence.
            </p>

            <div className="my-12 p-8 border border-zinc-800 rounded-2xl bg-zinc-900/50 text-center">
                <h3 className="text-2xl font-bold text-white mb-4">No Open Roles Currently</h3>
                <p className="text-zinc-500">
                    We are currently not hiring, but we are always looking for exceptional talent.
                    Feel free to perform a "cold outreach" at <a href="mailto:careers@syntrax.ai" className="text-indigo-400">careers@syntrax.ai</a>.
                </p>
            </div>
        </StaticPage>
    );
}
