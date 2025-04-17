'use client';

import Link from 'next/link';
import ProjectSelector from '@/components/ui/ProjectSelector';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Fallback component for the sidebar while searchParams load
function SidebarFallback() {
  return (
    <aside className="w-60 bg-[#0c323d] text-white min-h-screen flex flex-col justify-between">
      <div className="p-4">
        {/* Basic loading state or skeleton */}
        <div className="text-lg font-medium text-white">Loading...</div>
      </div>
    </aside>
  );
}

function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projectId, setProjectId] = useState<string | null>(null);
  const { loading, error, resetAuth } = useAuth();
  const [isTabActive, setIsTabActive] = useState(true);
  
  // Handle tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(document.visibilityState === 'visible');
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Extract project ID from URL or localStorage
  useEffect(() => {
    const urlProjectId = searchParams.get('project');
    if (urlProjectId) {
      setProjectId(urlProjectId);
      localStorage.setItem('selectedProjectId', urlProjectId);
    } else {
      const savedProjectId = localStorage.getItem('selectedProjectId');
      if (savedProjectId) {
        setProjectId(savedProjectId);
      }
    }
  }, [searchParams]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const getUrl = (baseUrl: string) => {
    return projectId ? `${baseUrl}?project=${projectId}` : baseUrl;
  };

  // Don't show loading state if tab is not active
  const showLoading = loading && isTabActive;
  
  if (showLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0c323d] mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading your dashboard...</h2>
          <p className="text-gray-600 mb-4">This should only take a moment.</p>
        </div>
      </div>
    );
  }

  // Show error state with retry button
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md mx-auto">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex flex-col space-y-2">
            <button 
              onClick={() => isTabActive && resetAuth()} 
              className="px-4 py-2 bg-[#0c323d] text-white rounded hover:bg-[#1c4653] transition-colors"
            >
              Retry
            </button>
            <button 
              onClick={handleSignOut}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
            >
              Sign Out and Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      <aside className="w-60 bg-[#0c323d] text-white min-h-screen flex flex-col justify-between">
        <div>
          {/* Sidebar */}
          <div className="p-4 border-b border-[#1c4653]">
            <div className="text-lg font-medium text-white">Confyde</div>
            <div className="mt-2">
              <ProjectSelector />
            </div>
          </div>
          
          <div className="py-2 px-4">
            <div className="text-sm uppercase text-gray-400 font-medium tracking-wider py-3">Platform</div>
            <nav className="space-y-1">
              <Link href={getUrl("/dashboard")} className="flex items-center px-0 py-2.5 text-sm hover:bg-[#1c4653] rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Dashboard
              </Link>
              <Link href={getUrl("/scenarios")} className="flex items-center px-0 py-2.5 text-sm hover:bg-[#1c4653] rounded">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                 </svg>
                Scenarios
              </Link>
              <Link href={getUrl("/portfolio-projects")} className="flex items-center px-0 py-2.5 text-sm hover:bg-[#1c4653] rounded">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                 </svg>
                Portfolio & Projects
              </Link>
              <Link href={getUrl("/study-documents")} className="flex items-center px-0 py-2.5 text-sm hover:bg-[#1c4653] rounded">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
                Study Documents
              </Link>
            </nav>
          </div>
          
          <div className="py-2 px-4 mt-4">
            <div className="text-sm uppercase text-gray-400 font-medium tracking-wider py-3">Admin</div>
            <nav className="space-y-1">
              <Link href={getUrl("/organization")} className="flex items-center px-0 py-2.5 text-sm hover:bg-[#1c4653] rounded">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                 </svg>
                Organization
              </Link>
              <Link href={getUrl("/settings")} className="flex items-center px-0 py-2.5 text-sm hover:bg-[#1c4653] rounded">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                 </svg>
                Settings
              </Link>
              <Link href={getUrl("/help")} className="flex items-center px-0 py-2.5 text-sm hover:bg-[#1c4653] rounded">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
                Help
              </Link>
            </nav>
          </div>
        </div>

        {/* Sign out button at the bottom */}
        <div className="p-4 border-t border-[#1c4653]">
          <button 
            onClick={handleSignOut} 
            className="flex items-center w-full px-0 py-2.5 text-sm text-red-400 hover:bg-[#1c4653] hover:text-red-300 rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}

// Wrap the main layout logic in a component that uses useSearchParams,
// and then wrap this component in Suspense in the exported default layout.
export default function ClientSideLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<SidebarFallback />}>
      <MainLayout>{children}</MainLayout>
    </Suspense>
  );
} 