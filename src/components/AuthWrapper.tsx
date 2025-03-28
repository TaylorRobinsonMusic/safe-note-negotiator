'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const user = localStorage.getItem('user');
    const publicPaths = ['/login', '/signup'];
    
    if (!user && !publicPaths.includes(pathname)) {
      router.push('/login');
    }
  }, [router, pathname]);

  return <>{children}</>;
} 