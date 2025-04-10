'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import SetPasswordForm from '@/components/forms/SetPasswordForm';

export default function SetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="h-16 w-16 bg-blue-500 rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-white text-xl font-bold">C</span>
            </div>
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900">Set Your Password</h1>
          <p className="mt-2 text-gray-600">Create a password for your account</p>
        </div>
        
        <Suspense fallback={
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center">
            <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        }>
          <SetPasswordForm />
        </Suspense>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already set your password?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 