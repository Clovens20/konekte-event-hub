import { useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
}

// Cache pour le rôle admin (évite les appels RPC répétés)
const adminRoleCache = new Map<string, { isAdmin: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAdmin: false,
  });
  const isCheckingRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      if (session?.user) {
        checkAdminRole(session.user.id).then((isAdmin) => {
          if (!mounted) return;
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
        if (!mounted) return;
        
        if (session?.user) {
          // Invalider le cache lors d'un changement d'auth
          adminRoleCache.delete(session.user.id);
          const isAdmin = await checkAdminRole(session.user.id);
          if (!mounted) return;
          setAuthState({
            user: session.user,
            session,
            isLoading: false,
            isAdmin,
          });
        } else {
          // Nettoyer le cache lors de la déconnexion
          adminRoleCache.clear();
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isAdmin: false,
          });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const checkAdminRole = async (userId: string): Promise<boolean> => {
    // Vérifier le cache d'abord
    const cached = adminRoleCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.isAdmin;
    }

    // Éviter les appels simultanés pour le même utilisateur
    if (isCheckingRef.current) {
      // Attendre un peu et réessayer avec le cache
      await new Promise(resolve => setTimeout(resolve, 100));
      const cachedRetry = adminRoleCache.get(userId);
      if (cachedRetry) {
        return cachedRetry.isAdmin;
      }
    }

    isCheckingRef.current = true;
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin',
      });
      if (error) {
        console.error('Error checking admin role:', error);
        isCheckingRef.current = false;
        return false;
      }
      const isAdmin = data === true;
      
      // Mettre en cache le résultat
      adminRoleCache.set(userId, { isAdmin, timestamp: Date.now() });
      isCheckingRef.current = false;
      return isAdmin;
    } catch (error) {
      console.error('Error checking admin role:', error);
      isCheckingRef.current = false;
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
    // Nettoyer le cache lors de la déconnexion
    adminRoleCache.clear();
  };

  return {
    ...authState,
    signIn,
    signOut,
  };
};
