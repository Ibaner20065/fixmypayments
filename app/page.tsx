'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if logged in
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          router.push('/dashboard');
        } else {
          router.push('/auth');
        }
      } catch {
        router.push('/auth');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#121212',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          fontFamily: 'Space Mono',
          color: '#CCFF00',
          fontSize: '14px',
          textTransform: 'uppercase',
        }}
      >
        LOADING...
      </div>
    </div>
  );
}
