
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useGameData } from '@/hooks/useGameData';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { useGameActions } from '@/hooks/useGameActions';
import { useErrorMonitoring } from '@/hooks/useErrorMonitoring';
import AnimatedBackground from '@/components/AnimatedBackground';
import KiKaDiGame from '@/components/games/KiKaDiGame';
import KiDiVraiGame from '@/components/games/KiDiVraiGame';
import KiDejaGame from '@/components/games/KiDejaGame';
import KiDeNousGame from '@/components/games/KiDeNousGame';
import GameResults from '@/components/games/GameResults';
import { GameLoading } from '@/components/LoadingStates';
import GlassCard from '@/components/GlassCard';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Game = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { user } = useAuth();
  const { gameData, loading, error, refetch } = useGameData(gameId || '');
  const { advancePhase } = useGameActions();
  const { toast } = useToast();
  const { logError, logGameAction } = useErrorMonitoring();

  // Set up realtime updates
  useRealtimeUpdates(gameData?.id || '', refetch);

  useEffect(() => {
    if (!user) {
      logError({
        type: 'auth',
        message: 'User not authenticated in game page',
        context: { gameId },
        timestamp: new Date().toISOString()
      });
      navigate('/auth');
      return;
    }

    if (error) {
      logError({
        type: 'game_action',
        message: 'Failed to load game data',
        context: { gameId, error: error.message },
        timestamp: new Date().toISOString()
      });
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
      logGameAction('redirect_to_lobby', gameId, true);
      navigate(`/lobby/${gameId}`);
      return;
    }

    // Log successful game page load
    if (gameData) {
      logGameAction('game_page_loaded', gameId, true);
    }
  }, [navigate, user, error, gameData, gameId, toast, logError, logGameAction]);

  const handleGameComplete = async () => {
    if (!gameData?.id) return;

    try {
      logGameAction('advance_phase_attempt', gameData.id);
      const result = await advancePhase(gameData.id);
      
      if (result.success) {
        logGameAction('advance_phase_success', gameData.id, true);
        // Game completed, redirect to results or lobby
        if (result.nextPhase === 'ended') {
          navigate('/dashboard');
        }
      } else {
        logError({
          type: 'game_action',
          message: 'Failed to advance game phase',
          context: { gameId: gameData.id, error: result.error },
          timestamp: new Date().toISOString()
        });
      }
    } catch (err: any) {
      logError({
        type: 'game_action',
        message: 'Error advancing game phase',
        context: { gameId: gameData.id, error: err.message },
        timestamp: new Date().toISOString()
      });
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

  // Helper function to prepare scores for GameResults
  const prepareScores = () => {
    if (!gameData?.game_players) {
      return { player1: 0, player2: 0, player3: 0 };
    }

    // Sort players by score and map to the expected format
    const sortedPlayers = [...gameData.game_players]
      .sort((a, b) => (b.score || 0) - (a.score || 0));

    return {
      player1: sortedPlayers[0]?.score || 0,
      player2: sortedPlayers[1]?.score || 0,
      player3: sortedPlayers[2]?.score || 0
    };
  };

  if (loading) {
    return <GameLoading message="Chargement de la partie..." variant="game" />;
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
    return <GameResults scores={prepareScores()} onRestart={() => navigate('/dashboard')} />;
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
