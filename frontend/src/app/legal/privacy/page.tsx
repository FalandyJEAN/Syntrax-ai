'use client';
import StaticPage from '../../../components/StaticPage';

export default function Privacy() {
    return (
        <StaticPage title="Privacy Policy" lastUpdated="January 15, 2026">
            <p>
                At Syntrax, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our document extraction services.
            </p>
            <h3>1. Information We Collect</h3>
            <p>
                We collect information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website or otherwise when you contact us.
            </p>
            <h3>2. How We Use Your Information</h3>
            <p>
                We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
            </p>
            <h3>3. Data Retention & Auto-Deletion</h3>
            <p>
                To minimize data risk, Syntrax employs an automated retention policy. Original document files (PDFs, Images) uploaded to our servers are <strong>automatically permanently deleted</strong> after a specific period:
            </p>
            <ul className="list-disc pl-6 mb-4 text-zinc-400">
                <li><strong>Starter Plan:</strong> 7 Days Retention</li>
                <li><strong>Pro Plan:</strong> 14 Days Retention</li>
                <li><strong>Enterprise:</strong> Custom Retention (up to 90 days)</li>
            </ul>
            <p>
                Extracted metadata and JSON results are retained indefinitely in your account history unless you manually delete them or close your account.
            </p>
        </StaticPage>
    );
}
