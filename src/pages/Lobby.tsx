
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useGameData } from '@/hooks/useGameData';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { useGameActions } from '@/hooks/useGameActions';
import AnimatedBackground from '@/components/AnimatedBackground';
import GlassCard from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Crown, Users, Copy, Play, Share, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Lobby = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { user } = useAuth();
  const { gameData, loading, error, refetch } = useGameData(gameId || '');
  const { advancePhase, loading: actionLoading } = useGameActions();
  const { toast } = useToast();

  const floatingEmojis = ['🎉', '🎮', '🎲', '🎪', '⭐', '🚀', '💫', '🎭'];
  const [currentEmoji, setCurrentEmoji] = useState(0);

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

    // Rotate floating emojis
    const interval = setInterval(() => {
      setCurrentEmoji((prev) => (prev + 1) % floatingEmojis.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [navigate, user, error, toast]);

  const copyGameCode = () => {
    if (gameId) {
      navigator.clipboard.writeText(gameId);
      toast({
        title: "Code copié ! 📋",
        description: "Partage-le avec tes amis pour qu'ils rejoignent",
      });
    }
  };

  const shareGame = () => {
    if (navigator.share && gameId) {
      navigator.share({
        title: 'KIADISA - Rejoins ma partie !',
        text: `Salut ! Rejoins ma partie KIADISA avec le code : ${gameId}`,
        url: window.location.href,
      });
    } else {
      copyGameCode();
    }
  };

  const startGame = async () => {
    if (!gameData?.id || !isHost || actionLoading) return;

    const result = await advancePhase(gameData.id);
    if (result.success) {
      navigate(`/game/${gameId}`);
    }
  };

  const waitingMessages = [
    "🎭 En attente des autres joueurs...",
    "🎪 Préparez-vous à découvrir vos secrets !",
    "🎲 La partie va bientôt commencer...",
    "🎮 Qui sera le maître du bluff ?"
  ];

  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % waitingMessages.length);
    }, 3000);

    return () => clearInterval(messageInterval);
  }, []);

  if (loading) {
    return (
      <AnimatedBackground variant="lobby">
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
      <AnimatedBackground variant="lobby">
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

  const isHost = gameData.host === user?.id;
  const players = gameData.game_players || [];
  const canStart = players.length >= 2; // Minimum 2 players to start

  return (
    <AnimatedBackground variant="lobby">
      <div className="min-h-screen p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 mr-4"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-poppins font-bold text-white">
              Salon d'attente
            </h1>
          </div>
          <Badge className="glass-card text-white border-white/30 font-mono tracking-wider">
            {gameData.code}
          </Badge>
        </div>

        {/* Game Code */}
        <GlassCard className="mb-6 text-center animate-bounce-in">
          <h2 className="text-lg font-poppins font-semibold text-white mb-3">
            Code de la partie
          </h2>
          <div className="text-3xl font-mono font-bold text-white mb-4 tracking-widest">
            {gameData.code}
          </div>
          <div className="flex space-x-3 justify-center">
            <Button
              onClick={copyGameCode}
              className="bg-white/20 border-white/50 text-white hover:bg-white/30 hover:scale-105 transition-all duration-200"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copier
            </Button>
            <Button
              onClick={shareGame}
              className="bg-white/20 border-white/50 text-white hover:bg-white/30 hover:scale-105 transition-all duration-200"
            >
              <Share className="w-4 h-4 mr-2" />
              Partager
            </Button>
          </div>
        </GlassCard>

        {/* Players List */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-poppins font-semibold text-white flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Joueurs ({players.length}/8)
            </h2>
            <div className="text-4xl animate-bounce">
              {floatingEmojis[currentEmoji]}
            </div>
          </div>

          <div className="space-y-3">
            {players.map((player, index) => (
              <GlassCard 
                key={player.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl animate-float"
                         style={{ animationDelay: `${index * 0.5}s` }}>
                      {player.profiles?.avatar || '🎮'}
                    </div>
                    <div>
                      <h3 className="font-poppins font-semibold text-white flex items-center">
                        {player.profiles?.pseudo || 'Joueur'}
                        {player.is_host && (
                          <Crown className="ml-2 w-4 h-4 text-yellow-300" />
                        )}
                      </h3>
                      <p className="text-white/80 text-sm font-inter">
                        {player.is_host ? 'Créateur de la partie' : 'Joueur'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm font-inter">En ligne</span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Waiting Message */}
        <GlassCard className="mb-6 text-center animate-pulse-glow">
          <div className="text-white font-inter">
            {waitingMessages[currentMessage]}
          </div>
        </GlassCard>

        {/* Start Game Button (Host Only) */}
        {isHost && (
          <Button
            onClick={startGame}
            disabled={!canStart || actionLoading}
            className="w-full glass-button text-white border-white/30 hover:bg-white/20 text-lg py-6 font-poppins font-semibold animate-pulse-glow"
          >
            {actionLoading ? (
              <>
                <Loader2 className="mr-3 w-6 h-6 animate-spin" />
                Démarrage...
              </>
            ) : (
              <>
                <Play className="mr-3 w-6 h-6" />
                {canStart ? 'Commencer la partie ! 🚀' : `Attendez ${2 - players.length} joueur(s) de plus`}
              </>
            )}
          </Button>
        )}

        {/* Non-host message */}
        {!isHost && (
          <GlassCard className="text-center bg-blue-500/20 border-blue-300/30">
            <p className="text-blue-100 font-inter">
              👑 Seul le créateur de la partie peut la lancer
            </p>
          </GlassCard>
        )}

        {/* Minimum players warning */}
        {isHost && !canStart && (
          <GlassCard className="mt-4 text-center bg-orange-500/20 border-orange-300/30">
            <p className="text-orange-100 font-inter">
              ⚠️ Il faut au minimum 2 joueurs pour commencer
            </p>
          </GlassCard>
        )}
      </div>
    </AnimatedBackground>
  );
};

export default Lobby;
