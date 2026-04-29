import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FixMyPayments — AI Finance + DeFi',
  description:
    'AI-powered personal finance assistant with zkSync DeFi integration. Track spending in natural language, bundle DeFi transactions gaslessly.',
};

import { ThemeProvider } from './components/ThemeProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
