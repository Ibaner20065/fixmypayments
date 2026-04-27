'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem('session_token');
    if (!session) {
      router.push('/auth');
    } else {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <p>Redirecting...</p>
    </div>
  );
}
