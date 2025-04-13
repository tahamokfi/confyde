'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import LoginForm from '@/components/forms/LoginForm';

// Loading fallback for the suspense boundary
function LoginFormSkeleton() {
  return (
    <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md animate-pulse">
      <div className="h-8 bg-gray-200 rounded mb-6"></div>
      <div className="h-10 bg-gray-200 rounded mb-4"></div>
      <div className="h-10 bg-gray-200 rounded mb-4"></div>
      <div className="h-10 bg-gray-200 rounded mb-6"></div>
      <div className="h-12 bg-gray-200 rounded"></div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="h-16 w-16 bg-blue-500 rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-white text-xl font-bold">C</span>
            </div>
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900">Welcome back</h1>
          <p className="mt-2 text-gray-600">Please sign in to your account</p>
        </div>
        
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 