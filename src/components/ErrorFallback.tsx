
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from './AnimatedBackground';
import GlassCard from './GlassCard';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

interface ErrorFallbackProps {
  error?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error = "Une erreur inattendue s'est produite", 
  onRetry,
  showRetry = true 
}) => {
  const navigate = useNavigate();

  return (
    <AnimatedBackground variant="game">
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-poppins font-bold text-white mb-4">
            Oups ! 😅
          </h2>
          <p className="text-white/80 font-inter mb-6">
            {error}
          </p>
          
          <div className="space-y-3">
            {showRetry && onRetry && (
              <Button
                onClick={onRetry}
                className="w-full glass-button text-white border-white/30 hover:bg-white/20"
              >
                <RotateCcw className="mr-2 w-4 h-4" />
                Réessayer
              </Button>
            )}
            
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full glass-button text-white border-white/30 hover:bg-white/20"
            >
              <Home className="mr-2 w-4 h-4" />
              Retour à l'accueil
            </Button>
          </div>
          
          <p className="text-white/60 text-sm mt-4">
            Si le problème persiste, contactez le support.
          </p>
        </GlassCard>
      </div>
    </AnimatedBackground>
  );
};

export default ErrorFallback;
