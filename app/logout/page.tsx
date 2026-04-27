'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFirebaseAuth } from '../lib/firebase-client';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const auth = getFirebaseAuth();
    auth.signOut().then(() => {
      localStorage.removeItem('fb-id-token');
      localStorage.removeItem('fb-user');
      document.cookie = 'fb-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      router.push('/auth');
    });
  }, [router]);

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#CCFF00', fontFamily: "'Space Mono', monospace" }}>
      LOGGING OUT...
    </div>
  );
}
