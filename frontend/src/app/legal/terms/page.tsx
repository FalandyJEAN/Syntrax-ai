'use client';
import StaticPage from '../../../components/StaticPage';

export default function Terms() {
    return (
        <StaticPage title="Terms of Service" lastUpdated="January 15, 2026">
            <p>
                Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Syntrax.ai website (the "Service") operated by Syntrax Inc ("us", "we", or "our").
            </p>
            <h3>1. Acceptance of Terms</h3>
            <p>
                By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
            </p>
            <h3>2. API Usage</h3>
            <p>
                You are granted a limited, non-exclusive, non-transferable license to access and use the Syntrax API for your internal business purposes. You agree not to abuse the API or attempt to circumvent rate limits.
            </p>
            <h3>3. Credits & Payments</h3>
            <p>
                Syntrax operates on a pre-paid Credit basis. One credit corresponds to the processing of one page or document, depending on the specific API endpoint used.
            </p>
            <ul className="list-disc pl-6 mb-4 text-zinc-400">
                <li><strong>No Expiration:</strong> Purchased credits do not expire and remain in your account until used.</li>
                <li><strong>Refunds:</strong> Credits are non-refundable once purchased, except as required by applicable law.</li>
                <li><strong>Pricing Changes:</strong> We reserve the right to change the price of credit packs at any time. Old credits retain their value.</li>
            </ul>
            <h3>4. Intellectual Property</h3>
            <p>
                The Service and its original content, features and functionality are and will remain the exclusive property of Syntrax Inc and its licensors.
            </p>
        </StaticPage>
    );
}
