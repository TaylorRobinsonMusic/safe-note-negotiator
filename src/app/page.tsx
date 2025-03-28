'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SAFENoteNegotiator from '@/components/SAFENoteNegotiator';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
    }
  }, [router]);

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;

  if (!user) {
    return null; // Return null while checking authentication
  }

  return <SAFENoteNegotiator />;
} 