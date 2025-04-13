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

  useEffect(() => {
    const fetchInitialSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setUserId(currentSession?.user?.id ?? null);
        if (currentSession?.user?.id) {
          await fetchCompanyInfo(currentSession.user.id);
        }
      } catch (error) {
        console.error('Error fetching initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setUserId(currentSession?.user?.id ?? null);
        setCompanyId(null); // Reset company info on auth change
        setCompanyName(null);
        if (currentSession?.user?.id) {
          setLoading(true); // Show loading while fetching new company info
          await fetchCompanyInfo(currentSession.user.id);
          setLoading(false);
        } else {
          setLoading(false); // No user, stop loading
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []); // No dependency on supabase since it's now imported

  const fetchCompanyInfo = async (currentUserId: string) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('company_id')
        .eq('user_id', currentUserId)
        .single();

      if (userError || !userData) {
        console.warn('User profile or company ID not found.', userError);
        setCompanyId(null);
        setCompanyName(null);
        return;
      }

      setCompanyId(userData.company_id);

      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('name')
        .eq('id', userData.company_id)
        .single();

      if (companyError || !companyData) {
        console.warn('Company name not found.', companyError);
        setCompanyName('Unknown Company');
      } else {
        setCompanyName(companyData.name);
      }
    } catch (error) {
      console.error('Error fetching company info:', error);
      setCompanyId(null);
      setCompanyName(null);
    }
  };

  const value = {
    supabase,
    session,
    user,
    userId,
    companyId,
    companyName,
    loading,
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