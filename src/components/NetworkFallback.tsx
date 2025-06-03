
import React from 'react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/GlassCard';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

interface NetworkFallbackProps {
  onRetry: () => void;
  message?: string;
  retrying?: boolean;
}

const NetworkFallback: React.FC<NetworkFallbackProps> = ({ 
  onRetry, 
  message = "Problème de connexion réseau",
  retrying = false 
}) => {
  return (
    <GlassCard className="text-center max-w-md mx-auto bg-red-500/20 border-red-300/30">
      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-2 text-red-300">
          <WifiOff className="w-6 h-6" />
          <AlertCircle className="w-6 h-6" />
        </div>
        
        <div>
          <h3 className="text-lg font-poppins font-semibold text-white mb-2">
            Connexion interrompue
          </h3>
          <p className="text-white/80 font-inter text-sm">
            {message}
          </p>
        </div>

        <Button
          onClick={onRetry}
          disabled={retrying}
          className="glass-button text-white border-white/30 hover:bg-white/20"
        >
          {retrying ? (
            <>
              <RefreshCw className="mr-2 w-4 h-4 animate-spin" />
              Reconnexion...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 w-4 h-4" />
              Réessayer
            </>
          )}
        </Button>

        <p className="text-white/60 text-xs">
          Vérifiez votre connexion internet
        </p>
      </div>
    </GlassCard>
  );
};

export default NetworkFallback;
