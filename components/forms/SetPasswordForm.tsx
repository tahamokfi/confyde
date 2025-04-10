'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [passwordUpdateAllowed, setPasswordUpdateAllowed] = useState(false);
  const [authStatus, setAuthStatus] = useState('checking');

  // Handle the session update when the component mounts
  useEffect(() => {
    const setupAuth = async () => {
      try {
        // Let Supabase handle the auth state automatically
        // It will process the hash fragment or recovery token
        console.log('Setting up auth listener...');
        
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          console.log('Auth state change event:', event);
          
          if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
            console.log('Auth success:', event);
            setPasswordUpdateAllowed(true);
            setAuthStatus('authenticated');
          } else if (event === 'SIGNED_OUT') {
            setPasswordUpdateAllowed(false);
            setAuthStatus('signed_out');
          }
        });

        // Check if we already have a session
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log('Existing session found');
          setPasswordUpdateAllowed(true);
          setAuthStatus('authenticated');
        } else {
          console.log('No existing session');
          setAuthStatus('no_session');
        }

        // Cleanup listener on unmount
        return () => {
          console.log('Cleaning up auth listener');
          authListener?.subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Error setting up auth:', err);
        setError('There was a problem setting up authentication.');
        setAuthStatus('error');
      }
    };

    setupAuth();
  }, [supabase.auth]);

  // Check if user profile exists and create if it doesn't
  const ensureUserProfile = async (userId: string, userEmail: string) => {
    // First check if user profile exists
    const { data: existingProfiles, error: profileCheckError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId);
      
    if (profileCheckError) {
      console.error('Error checking for existing profile:', profileCheckError);
      return { success: false, error: profileCheckError };
    }
    
    // If profile exists, no need to create a new one
    if (existingProfiles && existingProfiles.length > 0) {
      console.log('User profile already exists');
      return { success: true };
    }
    
    // Get the default company
    const { data: defaultCompany, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('name', 'Confyde Test')
      .single();
      
    if (companyError || !defaultCompany) {
      console.error('Error fetching default company:', companyError);
      return { success: false, error: companyError || new Error('Default company not found') };
    }
    
    // Create the user profile
    const { error: insertError } = await supabase
      .from('users')
      .insert([
        {
          user_id: userId,
          email: userEmail,
          company_id: defaultCompany.id
        }
      ]);
      
    if (insertError) {
      console.error('Error creating user profile:', insertError);
      return { success: false, error: insertError };
    }
    
    console.log('Created new user profile');
    return { success: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    
    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!passwordUpdateAllowed) {
      setError('Unable to update password. Please request a new password reset link.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Update the user's password - Supabase knows who the user is via the active session
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        throw error;
      }
      
      // Get current user details
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Unable to get current user information');
      }
      
      // Ensure user has a profile in the users table
      const { success, error: profileError } = await ensureUserProfile(
        user.id, 
        user.email || ''
      );
      
      if (!success && profileError) {
        console.warn('Failed to create user profile:', profileError);
        // Continue anyway - password was updated successfully
      }
      
      setSuccessMessage('Password has been updated successfully');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  // Show appropriate message based on auth status
  if (authStatus === 'checking') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-6">
          <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-center text-gray-500">Verifying your session...</p>
      </div>
    );
  }

  if (authStatus === 'error' || authStatus === 'no_session') {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error || 'Invalid or expired password reset link. Please request a new one.'}
        </div>
        <div className="flex justify-center">
          <a
            href="/auth/forgot-password"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Request New Link
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {successMessage}
        </div>
      )}
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          New Password
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <div className="mt-1">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
        >
          {loading ? 'Setting Password...' : 'Set Password'}
        </button>
      </div>
    </form>
  );
} 