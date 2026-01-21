import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'TripGenius - AI Travel Planner',
    description: 'Plan your perfect trip with AI-powered recommendations',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
                {children}
            </body>
        </html>
    );
}
