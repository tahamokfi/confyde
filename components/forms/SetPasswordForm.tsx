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

  // Get code from URL
  const code = searchParams.get('code');

  // Handle the session update when the component mounts
  useEffect(() => {
    const processCode = async () => {
      if (code) {
        try {
          // Exchange the code for a session - verify OTP
          console.log('Processing password reset code');
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: code,
            type: 'recovery'
          });

          if (verifyError) {
            console.error('Error verifying password reset code:', verifyError);
            setError('Invalid or expired password reset link. Please request a new one.');
          } else if (data && data.session) {
            console.log('Password reset code verified successfully');
            setPasswordUpdateAllowed(true);
          }
        } catch (err) {
          console.error('Error processing code:', err);
          setError('There was a problem processing your password reset link.');
        }
      } else {
        // Check for auth state change events
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY' && session) {
            console.log('Password recovery session established.');
            setPasswordUpdateAllowed(true);
          } else if (event === 'SIGNED_IN') {
            console.log('User already signed in.');
            setPasswordUpdateAllowed(true);
          }
        });

        // Cleanup listener on unmount
        return () => {
          authListener?.subscription.unsubscribe();
        };
      }
    };

    processCode();
  }, [code, supabase.auth]);

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
      setError('Your password reset session has expired. Please request a new reset link.');
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