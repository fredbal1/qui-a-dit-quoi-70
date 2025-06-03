
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useGameData } from '@/hooks/useGameData';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { useGameActions } from '@/hooks/useGameActions';
import AnimatedBackground from '@/components/AnimatedBackground';
import KiKaDiGame from '@/components/games/KiKaDiGame';
import KiDiVraiGame from '@/components/games/KiDiVraiGame';
import KiDejaGame from '@/components/games/KiDejaGame';
import KiDeNousGame from '@/components/games/KiDeNousGame';
import GameResults from '@/components/games/GameResults';
import GlassCard from '@/components/GlassCard';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Game = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { user } = useAuth();
  const { gameData, loading, error, refetch } = useGameData(gameId || '');
  const { advancePhase } = useGameActions();
  const { toast } = useToast();

  // Set up realtime updates
  useRealtimeUpdates(gameData?.id || '', refetch);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la partie",
        variant: "destructive"
      });
      navigate('/dashboard');
      return;
    }

    // Redirect to lobby if game hasn't started
    if (gameData && gameData.status === 'waiting') {
      navigate(`/lobby/${gameId}`);
      return;
    }
  }, [navigate, user, error, gameData, gameId, toast]);

  const handleGameComplete = async () => {
    if (!gameData?.id) return;

    const result = await advancePhase(gameData.id);
    if (result.success) {
      // Game completed, redirect to results or lobby
      if (result.nextPhase === 'ended') {
        navigate('/dashboard');
      }
    }
  };

  const renderCurrentGame = () => {
    if (!gameData) return null;

    const commonProps = {
      gameData,
      onComplete: handleGameComplete,
      currentRound: gameData.current_round || 1,
      totalRounds: gameData.total_rounds || 5
    };

    // Determine which game to render based on current_game field
    switch (gameData.current_game) {
      case 'kidivrai':
        return <KiDiVraiGame {...commonProps} />;
      case 'kideja':
        return <KiDejaGame {...commonProps} />;
      case 'kidenous':
        return <KiDeNousGame {...commonProps} />;
      case 'kikadi':
      default:
        return <KiKaDiGame {...commonProps} />;
    }
  };

  if (loading) {
    return (
      <AnimatedBackground variant="game">
        <div className="min-h-screen flex items-center justify-center p-4">
          <GlassCard className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
            <p className="text-white">Chargement de la partie...</p>
          </GlassCard>
        </div>
      </AnimatedBackground>
    );
  }

  if (!gameData) {
    return (
      <AnimatedBackground variant="game">
        <div className="min-h-screen flex items-center justify-center p-4">
          <GlassCard className="text-center">
            <h2 className="text-xl font-poppins font-bold text-white mb-4">
              Partie introuvable
            </h2>
            <Button onClick={() => navigate('/dashboard')} className="glass-button">
              Retour au dashboard
            </Button>
          </GlassCard>
        </div>
      </AnimatedBackground>
    );
  }

  // Show results if game ended
  if (gameData.phase === 'ended') {
    return <GameResults scores={{}} onRestart={() => navigate('/dashboard')} />;
  }

  return (
    <AnimatedBackground variant="game">
      <div className="min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-4 relative z-20">
          <Button
            onClick={() => navigate(`/lobby/${gameId}`)}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="text-center">
            <div className="text-white font-poppins font-semibold">
              Manche {gameData.current_round}/{gameData.total_rounds}
            </div>
            <div className="text-white/80 text-sm">
              Phase: {gameData.phase}
            </div>
          </div>
          <div className="w-8" /> {/* Spacer for centering */}
        </div>

        {/* Game Content */}
        <div className="relative z-10">
          {renderCurrentGame()}
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default Game;
