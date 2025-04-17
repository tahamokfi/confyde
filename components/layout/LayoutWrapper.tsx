'use client';

import { usePathname } from 'next/navigation';
import ClientSideLayout from '@/components/layout/ClientSideLayout';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  // Get the current pathname
  const pathname = usePathname();
  
  // Paths that should not use the ClientSideLayout
  const excludedPaths = ['/', '/auth/login', '/auth/signup', '/product'];
  
  // Check if current path should exclude the layout
  const shouldExcludeLayout = excludedPaths.includes(pathname) || pathname?.startsWith('/auth/');

  // If we're on an excluded path, don't use ClientSideLayout
  if (shouldExcludeLayout) {
    return <>{children}</>;
  }
  
  // For all other pages, wrap with ClientSideLayout
  return <ClientSideLayout>{children}</ClientSideLayout>;
} 