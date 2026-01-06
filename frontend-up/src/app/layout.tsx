// ============================================
// ROOT LAYOUT
// ============================================

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Ticket Management System',
    description: 'SAP Ticketing Platform - Manage your support tickets efficiently',
    keywords: ['tickets', 'SAP', 'support', 'management', 'helpdesk'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} antialiased`}>
                <Providers>
                    {children}
                </Providers>
      </body>
    </html>
  );
}
