'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

// Component that handles the redirect logic
function RedirectHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // For Supabase password reset, the auth hash is in the URL fragment (#access_token=...)
    // or a code parameter. We need to handle both cases.
    const code = searchParams.get('code');
    
    if (code) {
      console.log('Password reset code detected, redirecting to set-password page');
      
      // Check if we're in a browser environment (needed for accessing window)
      if (typeof window !== 'undefined') {
        // Preserve the hash fragment if it exists
        const fullUrl = window.location.href;
        const hasHash = fullUrl.includes('#');
        
        // If there's a hash fragment, pass the entire URL to the set-password page
        // This is important because Supabase auth stores recovery tokens in the hash
        if (hasHash) {
          const hash = fullUrl.split('#')[1];
          router.push(`/auth/set-password#${hash}`);
        } else {
          // Otherwise just pass the code as a parameter
          router.push(`/auth/set-password?code=${code}`);
        }
      } else {
        // Fallback for SSR
        router.push(`/auth/set-password?code=${code}`);
      }
      return;
    }
    
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        router.push('/dashboard');
      } else {
        setLoading(false);
      }
    };
    
    checkUser();
  }, [router, searchParams]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return null;
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simpler loading state management for the whole page
    setLoading(false);
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white">
      {/* Suspense boundary for the redirect handler */}
      <Suspense fallback={
        <div className="flex items-center justify-center h-16">
          <div className="w-6 h-6 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      }>
        <RedirectHandler />
      </Suspense>
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-[#0c323d]">Confyde AI</span>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/auth/login"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#0c323d] hover:text-blue-800"
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0c323d] hover:bg-[#1c4653]"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero section */}
      <main>
        <div className="relative">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="relative shadow-xl sm:rounded-2xl sm:overflow-hidden">
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0c323d] to-[#1c4653] mix-blend-multiply"></div>
              </div>
              <div className="relative px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
                <h1 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                  <span className="block text-white">Accelerate Clinical Trials</span>
                  <span className="block text-blue-200 mt-2">with Confydence AI</span>
                </h1>
                <p className="mt-6 max-w-lg mx-auto text-center text-xl text-white sm:max-w-3xl">
                  Streamline cross-functional clinical trial design with proprietary technology, 
                  reducing risk and increasing confidence in investment decisions.
                </p>
                <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                  <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
                    <Link
                      href="/auth/signup"
                      className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-[#0c323d] bg-white hover:bg-gray-100 sm:px-8"
                    >
                      Get started
                    </Link>
                    <a
                      href="#features"
                      className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-500 bg-opacity-60 hover:bg-opacity-70 sm:px-8"
                    >
                      Learn more
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features section */}
        <div id="features" className="py-16 bg-gray-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Proprietary AI Solutions</h2>
              <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
                Replace Repetitive Manual Tasks
              </p>
              <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
                Our platform eliminates inefficiencies in clinical trial design with cutting-edge technology.
              </p>
            </div>

            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {/* Feature 1 */}
                <div className="pt-6">
                  <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-md">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2.5 2.0 01-2-2z" />
                          </svg>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Unified Data Sources</h3>
                      <p className="mt-5 text-base text-gray-500">
                        Access all your clinical trial data in one central location, eliminating silos and reducing errors.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="pt-6">
                  <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-md">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Time & Cost Savings</h3>
                      <p className="mt-5 text-base text-gray-500">
                        Reduces investment risk with automated workflows that save time and minimize error.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="pt-6">
                  <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-md">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Reduce Investment Risk</h3>
                      <p className="mt-5 text-base text-gray-500">
                        Make informed investment decisions with AI-powered tools.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              <span className="block">Ready to transform your clinical trial design?</span>
              <span className="block text-blue-600">Start using Confyde today.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#0c323d] hover:bg-[#1c4653]"
                >
                  Get started
                </Link>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-[#0c323d] bg-white hover:bg-gray-50"
                >
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <div className="text-white text-2xl font-bold">Confyde</div>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Contact Us</h3>
                  <ul className="mt-4 space-y-4">
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">About</h3>
                  <ul className="mt-4 space-y-4">
                   </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-700 pt-8">
            <p className="text-base text-gray-400 xl:text-center">
              &copy; 2025 Confyde. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 