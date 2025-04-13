'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { handleStringChange } from '@/lib/formUtils';
import { useAuth } from '@/context/AuthContext'; // Import useAuth hook

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase, user: authUser, companyId: authCompanyId, companyName: authCompanyName } = useAuth(); // Use the auth context
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('Confyde Test');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Sign in using Supabase client from context
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message || 'Failed to login');
        setLoading(false);
        return;
      }

      // No need to fetch profile/company info here, AuthProvider handles it
      // Wait for AuthProvider to update state after successful login
      // The redirect logic is now handled by middleware or AuthProvider effect
      console.log("Login successful, waiting for redirect...");
      
      // Optionally, you can check for a redirect parameter from middleware
      const redirectedFrom = searchParams.get('redirectedFrom');
      if (redirectedFrom) {
        router.push(redirectedFrom);
      } else {
        router.push('/dashboard'); // Default redirect
      }

    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || 'An error occurred during login');
      // No need to manually sign out on error here, as the session likely wasn't fully established
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Log in to your account</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => handleStringChange(e, setEmail)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => handleStringChange(e, setPassword)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="mt-1 text-right">
            <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
              Forgot password?
            </Link>
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
            Company
          </label>
          <select
            id="company"
            value={company}
            onChange={(e) => handleStringChange(e, setCompany)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            // You might want to fetch available companies dynamically later
          >
            <option value="Confyde Test">Confyde Test</option>
          </select>
        </div>
        
        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </div>
  );
} 