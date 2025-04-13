'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // Import useAuth hook

export default function SetPasswordForm() {
  const router = useRouter();
  const { supabase, user: authUser } = useAuth(); // Use the auth context
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [passwordUpdateAllowed, setPasswordUpdateAllowed] = useState(false);
  const [authStatus, setAuthStatus] = useState('checking'); // 'checking', 'authenticated', 'no_session', 'error'

  useEffect(() => {
    const setupAuth = async () => {
      setAuthStatus('checking');
      try {
        console.log('SetPasswordForm: Setting up auth listener...');
        
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          console.log('SetPasswordForm: Auth state change event:', event);
          
          if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
            console.log('SetPasswordForm: Auth success:', event);
            setPasswordUpdateAllowed(true);
            setAuthStatus('authenticated');
          } else if (event === 'SIGNED_OUT') {
            console.log('SetPasswordForm: Signed out.');
            setPasswordUpdateAllowed(false);
            setAuthStatus('no_session');
            setError('Your session has expired. Please request a new password reset link.');
          }
        });

        // Initial check
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log('SetPasswordForm: Existing session found.');
          setPasswordUpdateAllowed(true);
          setAuthStatus('authenticated');
        } else {
          // If no initial session, we might rely on the listener for PASSWORD_RECOVERY
          console.log('SetPasswordForm: No existing session, waiting for event.');
          // Set a timeout to prevent infinite checking state if the event never comes
          const timer = setTimeout(() => {
            if (authStatus === 'checking') {
              console.log('SetPasswordForm: Timeout reached, assuming no valid session.');
              setAuthStatus('no_session');
              setError('Could not verify password reset link. It might be invalid or expired.');
            }
          }, 5000); // 5 seconds timeout
          
          // Cleanup timeout as well
          return () => {
            clearTimeout(timer);
            console.log('SetPasswordForm: Cleaning up auth listener');
            authListener?.subscription.unsubscribe();
          };
        }

        return () => {
          console.log('SetPasswordForm: Cleaning up auth listener');
          authListener?.subscription.unsubscribe();
        };
      } catch (err) {
        console.error('SetPasswordForm: Error setting up auth:', err);
        setError('There was a problem verifying your request.');
        setAuthStatus('error');
      }
    };

    setupAuth();
  }, [supabase.auth, authStatus]); // Re-run if authStatus changes from checking

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
      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({ password });
      
      if (updateError) {
        throw updateError;
      }
      
      // Get current user details (needed for ensureUserProfile)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // This shouldn't happen if updateUser succeeded, but check just in case
        throw new Error('Could not retrieve user information after password update.');
      }
      
      // Ensure user has a profile in the users table
      const { success, error: profileError } = await ensureUserProfile(
        user.id, 
        user.email || ''
      );
      
      if (!success && profileError) {
        console.warn('Password updated, but failed to ensure user profile:', profileError);
        // Potentially display a different success message or log this more visibly
      }
      
      setSuccessMessage('Password has been updated successfully');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: any) {
      console.error("Error updating password:", err);
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  // UI Rendering based on authStatus
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

  if (!passwordUpdateAllowed || authStatus === 'error' || authStatus === 'no_session') {
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

  // Render the form only if authenticated and allowed
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