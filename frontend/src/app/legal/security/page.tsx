'use client';
import StaticPage from '../../../components/StaticPage';

export default function Security() {
    return (
        <StaticPage title="Security" lastUpdated="January 20, 2026">
            <p>
                Security is at the core of Syntrax. We process sensitive documents for enterprises globally, and we are committed to maintaining the highest standards of data protection.
            </p>

            <h3>Infrastructure Security</h3>
            <p>
                Our infrastructure is hosted on AWS (Amazon Web Services) in US-East-1. We utilize VPCs, private subnets, and strict security groups to isolate our environments. All data is encrypted in transit (TLS 1.2+) and at rest (AES-256).
            </p>

            <h3>Compliance</h3>
            <p>
                Syntrax is currently undergoing SOC 2 Type II audit. We are fully GDPR and CCPA compliant.
            </p>

            <h3>Data Retention</h3>
            <p>
                By default, we retain original document files for <strong>7 days (Starter)</strong> or <strong>14 days (Pro)</strong> to allow for quality assurance and debugging. After this period, files are permanently scrubbed from our servers. Extracted JSON data is kept until manually deleted.
            </p>
        </StaticPage>
    );
}
