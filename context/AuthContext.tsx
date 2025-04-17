'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Session, User, SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient'; // Use the shared supabase instance

interface AuthContextType {
  supabase: SupabaseClient;
  session: Session | null;
  user: User | null;
  userId: string | null;
  companyId: string | null;
  companyName: string | null;
  loading: boolean;
  error: string | null;
  resetAuth: () => void;
  fetchCompanyInfo: (currentUserId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // No need to create a new client, use the shared instance
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyInfoLoading, setCompanyInfoLoading] = useState(false);
  const [tabActive, setTabActive] = useState(true);

  // Handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      setTabActive(isVisible);
      
      // If tab becomes visible and we have a session, silently validate without loading state
      if (isVisible && session?.user?.id) {
        const validateSession = async () => {
          try {
            // Use a silent check without showing loaders
            const { data } = await supabase.auth.getSession();
            // Only update if something changed
            if (data.session?.user?.id !== userId) {
              setSession(data.session);
              setUser(data.session?.user ?? null);
              setUserId(data.session?.user?.id ?? null);
            }
          } catch (error) {
            console.error('Silent session validation error:', error);
            // Don't show errors for silent validations
          }
        };
        validateSession();
      }
    };

    // Set up event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session, userId]);

  const fetchCompanyInfo = async (currentUserId: string) => {
    // Skip fetching if tab is not active
    if (!tabActive) {
      console.log('Skipping company info fetch - tab not active');
      return;
    }
    
    setCompanyInfoLoading(true);
    setError(null); // Clear previous errors specific to company info
    try {
      // Increase timeout for company info fetching
      const timeoutId = setTimeout(() => {
        if (companyInfoLoading) {
          console.warn('Company info fetching timed out after 15 seconds');
          setCompanyInfoLoading(false);
          setCompanyId(null);
          setCompanyName('Unknown Company');
        }
      }, 15000);
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('company_id')
        .eq('user_id', currentUserId)
        .single();

      if (userError || !userData || !userData.company_id) {
        console.warn('User profile or company ID not found.', userError);
        setCompanyId(null);
        setCompanyName('Unknown Company');
        clearTimeout(timeoutId);
        setCompanyInfoLoading(false);
        return;
      }

      setCompanyId(userData.company_id);
      
      let companyQueryCompleted = false;
      const companyQueryTimeoutId = setTimeout(() => {
        if (!companyQueryCompleted) {
          console.warn('Company name query timed out, using default value');
          setCompanyName('Unknown Company');
          companyQueryCompleted = true;
          clearTimeout(timeoutId); // Clear main timeout if name query times out
          setCompanyInfoLoading(false);
        }
      }, 5000);
      
      if (!companyQueryCompleted) {
        try {
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('name')
            .eq('id', userData.company_id)
            .single();
          
          companyQueryCompleted = true;
          clearTimeout(companyQueryTimeoutId);
            
          if (companyError || !companyData) {
            console.warn('Company name not found, using default value', companyError);
            setCompanyName('Unknown Company');
          } else {
            setCompanyName(companyData.name);
          }
        } catch (companyError) {
          companyQueryCompleted = true;
          clearTimeout(companyQueryTimeoutId);
          console.warn('Error fetching company name, using default value', companyError);
          setCompanyName('Unknown Company');
        }
      }
      
      clearTimeout(timeoutId);
    } catch (error) {
      console.error('Error fetching company info:', error);
      setCompanyId(null);
      setCompanyName('Unknown Company');
    } finally {
      setCompanyInfoLoading(false);
    }
  };

  const resetAuth = async () => {
    // Skip reset if tab is not active
    if (!tabActive) {
      console.log('Skipping auth reset - tab not active');
      return;
    }
    
    setError(null);
    setLoading(true);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setUserId(currentSession?.user?.id ?? null);
      
      if (currentSession?.user?.id) {
        // Explicitly fetch company info on reset
        await fetchCompanyInfo(currentSession.user.id);
      }
    } catch (error) {
      console.error('Error resetting auth state:', error);
      setError('Failed to refresh authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialSession = async () => {
      // Skip initial fetch if tab is not active
      if (!tabActive) {
        console.log('Skipping initial session fetch - tab not active');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const timeoutId = setTimeout(() => {
          if (loading) {
            console.warn('Auth initialization timed out after 10 seconds');
            setLoading(false);
            console.log('Continuing with partial authentication data');
          }
        }, 10000);

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setUserId(currentSession?.user?.id ?? null);
        
        if (currentSession?.user?.id) {
          // Fetch company info on initial load
          await fetchCompanyInfo(currentSession.user.id);
        } else {
          console.log('No active session found');
        }
        
        clearTimeout(timeoutId);
      } catch (error) {
        console.error('Error fetching initial session:', error);
        setSession(null);
        setUser(null);
        setUserId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        // Skip processing if tab is not active
        if (!tabActive) {
          console.log('Skipping auth state change - tab not active');
          return;
        }
        
        // Only update session/user state, don't automatically fetch company info here
        const previousUserId = userId;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setUserId(currentSession?.user?.id ?? null);

        // If the user ID changes (sign in/out), reset company info locally
        if (currentSession?.user?.id !== previousUserId) {
          setCompanyId(null);
          setCompanyName(null);
          // Fetch company info only if a new user has logged in
          if (currentSession?.user?.id) {
            await fetchCompanyInfo(currentSession.user.id);
          }
        }
        // No automatic setLoading(true) here to prevent flicker
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [tabActive]); // Add tabActive as a dependency

  const value = {
    supabase,
    session,
    user,
    userId,
    companyId,
    companyName,
    loading: tabActive ? (loading || companyInfoLoading) : false, // Only show loading if tab is active
    error: tabActive ? error : null, // Only show errors if tab is active
    resetAuth,
    fetchCompanyInfo // Expose fetchCompanyInfo if needed elsewhere
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 