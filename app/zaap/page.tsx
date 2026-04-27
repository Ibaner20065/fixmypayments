'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CardNav from '../components/CardNav';
import ZaapBuilder from '../components/ZaapBuilder';
import type { CardNavItem } from '../components/CardNav';

const navItems: CardNavItem[] = [
  {
    label: 'DASHBOARD',
    bgColor: '#000000',
    textColor: '#CCFF00',
    links: [
      { label: 'OVERVIEW', href: '/dashboard', ariaLabel: 'Dashboard Overview' },
      { label: 'TRANSACTIONS', href: '/dashboard', ariaLabel: 'All Transactions' },
      { label: 'ANALYTICS', href: '/dashboard', ariaLabel: 'Spending Analytics' },
    ],
  },
  {
    label: 'WEB3',
    bgColor: '#121212',
    textColor: '#FFFFFF',
    links: [
      { label: 'ZAAP BUNDLER', href: '/zaap', ariaLabel: 'Bundle Transactions' },
      { label: 'AML STATUS', href: '/zaap', ariaLabel: 'AML Verification' },
      { label: 'PAYMASTER', href: '/zaap', ariaLabel: 'Paymaster Config' },
    ],
  },
];

export default function ZaapPage() {
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/auth');
        }
      } catch {
        router.push('/auth');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div style={{ background: '#121212', minHeight: '100vh' }}>
      <CardNav items={navItems} />

      <div style={{ padding: '20px' }}>
        <ZaapBuilder />
      </div>
    </div>
  );
}
