'use client';
import StaticPage from '../../components/StaticPage';

export default function Contact() {
    return (
        <StaticPage title="Contact Us">
            <p>
                We'd love to hear from you. Whether you have a question about features, pricing, or need a custom enterprise solution, our team is ready to answer all your questions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12 not-prose">
                <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <h3 className="text-xl font-bold text-white mb-2">Sales</h3>
                    <p className="text-zinc-400 mb-4">For high-volume enterprise inquiries.</p>
                    <a href="mailto:sales@syntrax.ai" className="text-indigo-400 hover:underline">sales@syntrax.ai</a>
                </div>
                <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <h3 className="text-xl font-bold text-white mb-2">Support</h3>
                    <p className="text-zinc-400 mb-4">For technical assistance and API help.</p>
                    <a href="mailto:support@syntrax.ai" className="text-indigo-400 hover:underline">support@syntrax.ai</a>
                </div>
            </div>

            <h3>Office</h3>
            <p>
                123 AI Boulevard<br />
                San Francisco, CA 94105<br />
                United States
            </p>
        </StaticPage>
    );
}
