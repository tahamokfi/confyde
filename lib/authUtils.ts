import { supabase } from '@/lib/supabaseClient';

/**
 * Get the current user session
 */
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { session: data.session, error: null };
  } catch (error: any) {
    return { session: null, error: error.message || 'Failed to get session' };
  }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return { user: data.user, session: data.session, error: null };
  } catch (error: any) {
    return { user: null, session: null, error: error.message || 'Failed to sign in' };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    return { error: error.message || 'Failed to sign out' };
  }
};

/**
 * Check if the user is authenticated and redirect if not
 */
export const checkAuth = async (redirectCallback: () => void) => {
  const { session, error } = await getCurrentSession();
  if (!session || error) {
    redirectCallback();
    return { authenticated: false, userId: null };
  }
  return { authenticated: true, userId: session.user.id };
}; 