import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAdmin: false,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkAdminRole(session.user.id).then((isAdmin) => {
          setAuthState({
            user: session.user,
            session,
            isLoading: false,
            isAdmin,
          });
        });
      } else {
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          isAdmin: false,
        });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const isAdmin = await checkAdminRole(session.user.id);
          setAuthState({
            user: session.user,
            session,
            isLoading: false,
            isAdmin,
          });
        } else {
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isAdmin: false,
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin',
      });
      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }
      return data === true;
    } catch (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }

    // Check if user is admin
    if (data.user) {
      const isAdmin = await checkAdminRole(data.user.id);
      if (!isAdmin) {
        await supabase.auth.signOut();
        throw new Error('Accès non autorisé. Vous devez être administrateur.');
      }
    }

    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  return {
    ...authState,
    signIn,
    signOut,
  };
};
