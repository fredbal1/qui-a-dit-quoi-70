
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const authStore = useAuthStore();
  const { addToast } = useUIStore();

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        authStore.setUser(session.user);
        
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          authStore.setProfile(profile);
        }
      }
      
      authStore.setInitialized(true);
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          authStore.setUser(session.user);
          
          // Fetch profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profile) {
            authStore.setProfile(profile);
          }
        } else if (event === 'SIGNED_OUT') {
          authStore.setUser(null);
          authStore.setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await authStore.signIn(email, password);
    
    if (result.success) {
      addToast({
        title: "Connexion réussie ! 🎉",
        description: "Bon retour parmi nous !",
      });
    } else {
      addToast({
        title: "Erreur de connexion",
        description: result.error || "Identifiants incorrects",
        variant: "destructive"
      });
    }
    
    return result;
  };

  const signUp = async (email: string, password: string, pseudo: string, avatar: string) => {
    const result = await authStore.signUp(email, password, pseudo, avatar);
    
    if (result.success) {
      addToast({
        title: "Compte créé ! 🎊",
        description: "Vérifiez votre email pour confirmer votre compte",
      });
    } else {
      addToast({
        title: "Erreur d'inscription",
        description: result.error || "Impossible de créer le compte",
        variant: "destructive"
      });
    }
    
    return result;
  };

  const signOut = async () => {
    await authStore.signOut();
    addToast({
      title: "Déconnexion réussie",
      description: "À bientôt !",
    });
  };

  return {
    // State
    user: authStore.user,
    profile: authStore.profile,
    loading: authStore.loading,
    initialized: authStore.initialized,
    
    // Actions
    signIn,
    signUp,
    signOut,
  };
};
