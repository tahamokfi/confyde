'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleStringChange } from '@/lib/formUtils';
import { signInWithEmail } from '@/lib/authUtils';
import { supabase } from '@/lib/supabaseClient';

export default function LoginForm() {
  const router = useRouter();
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
      // Use our auth utility function for sign in
      const { user, session, error: signInError } = await signInWithEmail(email, password);

      if (signInError || !user) {
        setError(signInError || 'Failed to login');
        setLoading(false);
        return;
      }

      console.log("Signed in successfully:", user.id);

      // Get user's company details directly from Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (userError) {
        throw new Error(userError.message);
      }

      // Get company name
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('name')
        .eq('id', userData.company_id)
        .single();
        
      if (companyError) {
        throw new Error(companyError.message);
      }

      // Verify company match
      if (companyData.name === company) {
        router.push('/dashboard');
      } else {
        setError('You do not have access to the selected company');
        // Sign out user if company doesn't match
        await supabase.auth.signOut();
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || 'An error occurred during login');
      
      // Sign out if there was an error
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.error("Error signing out:", signOutError);
      }
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