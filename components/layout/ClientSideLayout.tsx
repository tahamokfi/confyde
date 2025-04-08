'use client';

import Link from 'next/link';
import ProjectSelector from '@/components/ui/ProjectSelector';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ClientSideLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

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
              <Link href="/dashboard" className="flex items-center px-0 py-2.5 text-sm hover:bg-[#1c4653] rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Dashboard
              </Link>
              <Link href="/scenarios" className="flex items-center px-0 py-2.5 text-sm hover:bg-[#1c4653] rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Scenarios
              </Link>
              <Link href="/portfolio-projects" className="flex items-center px-0 py-2.5 text-sm hover:bg-[#1c4653] rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Portfolio & Projects
              </Link>
              <Link href="/study-documents" className="flex items-center px-0 py-2.5 text-sm hover:bg-[#1c4653] rounded">
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
              <Link href="/organization" className="flex items-center px-0 py-2.5 text-sm hover:bg-[#1c4653] rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Organization
              </Link>
              <Link href="/settings" className="flex items-center px-0 py-2.5 text-sm hover:bg-[#1c4653] rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </Link>
              <Link href="/help" className="flex items-center px-0 py-2.5 text-sm hover:bg-[#1c4653] rounded">
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