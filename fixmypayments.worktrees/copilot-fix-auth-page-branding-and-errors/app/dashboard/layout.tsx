import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard — FixMyPayments',
  description: 'Track your spending with AI-powered classification. Disruptor dashboard.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ background: '#121212', minHeight: '100vh' }}>
      {children}
    </div>
  );
}
