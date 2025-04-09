'use client';

import { useEffect, useState, ReactNode, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/ui/Navbar';
import Sidebar from '@/components/ui/Sidebar';
import Footer from '@/components/ui/Footer';

interface ClientSideLayoutProps {
  children: ReactNode;
}

// Main layout component that includes the entire app structure
export default function ClientSideLayout({ children }: ClientSideLayoutProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/login');
        return;
      }
      
      setLoading(false);
    };
    
    checkSession();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex flex-1 mt-16">
        <Sidebar />
        
        <main className="flex-1 p-5 md:p-8 overflow-y-auto">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          }>
            {children}
          </Suspense>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}

// Helper component to wrap specific content that uses useSearchParams
export function SearchParamsWrapper({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      {children}
    </Suspense>
  );
} 