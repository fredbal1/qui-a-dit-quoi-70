
import React from 'react';
import { Loader2 } from 'lucide-react';
import GlassCard from '@/components/GlassCard';

interface GamePhaseManagerProps {
  phase: string;
  timer?: number;
  isHost: boolean;
  onAdvancePhase: () => void;
  loading: boolean;
  children: React.ReactNode;
}

const GamePhaseManager: React.FC<GamePhaseManagerProps> = ({
  phase,
  timer,
  isHost,
  onAdvancePhase,
  loading,
  children
}) => {
  return (
    <div className="space-y-6">
      {children}
      
      {/* Host Controls */}
      {isHost && phase !== 'intro' && (
        <GlassCard className="bg-blue-500/20 border-blue-300/30">
          <div className="text-center">
            <div className="text-blue-100 mb-3">
              👑 Contrôles de l'hôte
            </div>
            <button
              onClick={onAdvancePhase}
              disabled={loading}
              className="glass-button text-white border-white/30 hover:bg-white/20 px-6 py-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Avancement...
                </>
              ) : (
                'Passer à la phase suivante'
              )}
            </button>
          </div>
        </GlassCard>
      )}

      {/* Timer Display */}
      {timer !== undefined && timer > 0 && (
        <GlassCard className="text-center bg-orange-500/20 border-orange-300/30">
          <div className="text-orange-100">
            ⏱️ Temps restant: <span className="font-bold">{timer}s</span>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default GamePhaseManager;
