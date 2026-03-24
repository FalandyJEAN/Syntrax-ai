'use client';
import StaticPage from '../../components/StaticPage';

export default function About() {
    return (
        <StaticPage title="About Syntrax">
            <p>
                Syntrax is on a mission to solve the "unstructured data problem" for enterprises.
                We believe that documents—invoices, contracts, reports—are the lifeblood of business, yet they remain locked in static formats like PDF.
            </p>
            <p>
                Our team of engineers and ML researchers have built a proprietary engine that combines Computer Vision with Large Language Models to "read" documents like a human would, but at the scale of a machine.
            </p>
            <h3>Our Story</h3>
            <p>
                Founded in 2024, we started with a simple API to extract data from invoices. Today, we process millions of pages for Fortune 500 companies, enabling them to automate complex workflows that were previously impossible.
            </p>
        </StaticPage>
    );
}
