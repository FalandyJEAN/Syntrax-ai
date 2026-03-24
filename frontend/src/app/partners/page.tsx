'use client';
import StaticPage from '../../components/StaticPage';

export default function Partners() {
    return (
        <StaticPage title="Partners">
            <p>
                Syntrax partners with leading technology consultancies and ERP implementers to bring AI document processing to enterprises worldwide.
            </p>

            <h3>Technology Partners</h3>
            <ul className="list-disc pl-5 text-zinc-400 space-y-2">
                <li><strong>Salesforce</strong> - Native integration for CRM records.</li>
                <li><strong>Zapier</strong> - Connect Syntrax to 5,000+ apps.</li>
                <li><strong>Oracle NetSuite</strong> - Automated invoice processing.</li>
            </ul>

            <h3>Become a Partner</h3>
            <p>
                Are you a systems integrator or ISV? Join our partner program to unlock revenue share, dedicated support, and co-marketing opportunities.
            </p>
            <p>
                <a href="mailto:partners@syntrax.ai" className="text-indigo-400 font-bold hover:underline">Apply to Partner Program &rarr;</a>
            </p>
        </StaticPage>
    );
}
