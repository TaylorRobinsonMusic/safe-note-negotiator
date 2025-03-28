'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import SharedLayout from '@/components/SharedLayout';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const publicPaths = ['/login', '/signup'];
    
    if (!userData && !publicPaths.includes(pathname)) {
      router.push('/login');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [router, pathname]);

  return (
    <html lang="en">
      <body className={inter.className}>
        <SharedLayout user={user}>{children}</SharedLayout>
      </body>
    </html>
  );
} 