'use client';

import Link from 'next/link';
import SignupForm from '@/components/forms/SignupForm';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="h-16 w-16 bg-blue-500 rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-white text-xl font-bold">C</span>
            </div>
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900">Join Confyde</h1>
          <p className="mt-2 text-gray-600">Create an account to get started</p>
        </div>
        
        <SignupForm />
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 