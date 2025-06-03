
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import GlassCard from '@/components/GlassCard';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = false 
}) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      // Check for guest mode as fallback
      const guestData = localStorage.getItem('kiadisa_user');
      if (!guestData) {
        navigate('/auth');
      }
    }
  }, [user, loading, requireAuth, navigate]);

  if (loading) {
    return (
      <AnimatedBackground variant="auth">
        <div className="min-h-screen flex items-center justify-center p-4">
          <GlassCard className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
            <p className="text-white">Vérification de l'authentification...</p>
          </GlassCard>
        </div>
      </AnimatedBackground>
    );
  }

  // Allow access if not requiring auth, or if user is authenticated, or guest mode
  const guestData = localStorage.getItem('kiadisa_user');
  const hasAccess = !requireAuth || user || guestData;

  if (!hasAccess) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
};

export default ProtectedRoute;
