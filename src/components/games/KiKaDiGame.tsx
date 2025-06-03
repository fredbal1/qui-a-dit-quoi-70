
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGameActions } from '@/hooks/useGameActions';
import GlassCard from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Brain, Users, ArrowRight, Trophy, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface KiKaDiGameProps {
  gameData: any;
  onComplete: () => void;
  currentRound: number;
  totalRounds: number;
}

const KiKaDiGame: React.FC<KiKaDiGameProps> = ({ gameData, onComplete, currentRound, totalRounds }) => {
  const { user } = useAuth();
  const { submitAnswer, submitVote, advancePhase, loading } = useGameActions();
  const { toast } = useToast();
  const [answer, setAnswer] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [timer, setTimer] = useState(5);

  const phase = gameData.phase || 'intro';
  const isHost = gameData.host === user?.id;
  const players = gameData.game_players || [];
  const answers = gameData.answers || [];
  const votes = gameData.votes || [];
  const currentRoundData = gameData.current_round_data;

  const question = currentRoundData?.question_id || "Quelle est votre citation inspirante préférée ?";

  useEffect(() => {
    if (phase === 'intro' && timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    } else if (phase === 'intro' && timer === 0 && isHost) {
      handleAdvancePhase();
    }
  }, [phase, timer, isHost]);

  const handleAdvancePhase = async () => {
    if (!isHost || loading) return;
    
    const result = await advancePhase(gameData.id);
    if (!result.success) {
      toast({
        title: "Erreur",
        description: "Impossible de faire avancer la partie",
        variant: "destructive"
      });
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !currentRoundData?.id || loading) return;
    
    const result = await submitAnswer(currentRoundData.id, answer, false);
    if (result.success) {
      setAnswer('');
      toast({
        title: "Réponse envoyée ! ✅",
        description: "Attendez que les autres joueurs répondent",
      });
    }
  };

  const handleVote = async () => {
    if (!selectedPlayer || !currentRoundData?.id || loading) return;
    
    // Find the answer to vote for
    const targetAnswer = answers.find(a => a.player_id === selectedPlayer);
    if (!targetAnswer) return;

    const result = await submitVote(
      currentRoundData.id, 
      selectedPlayer, 
      targetAnswer.id, 
      'guess'
    );
    
    if (result.success) {
      setSelectedPlayer('');
      toast({
        title: "Vote enregistré ! 🗳️",
        description: "Attendez les autres votes",
      });
    }
  };

  const hasUserAnswered = answers.some(a => a.player_id === user?.id);
  const hasUserVoted = votes.some(v => v.player_id === user?.id);

  return (
    <div className="p-4 space-y-6">
      {/* Intro Phase */}
      {phase === 'intro' && (
        <div className="text-center animate-bounce-in">
          <div className="mb-6">
            <Brain className="w-20 h-20 text-white mx-auto mb-4 animate-float" />
            <h1 className="text-4xl font-poppins font-bold text-white mb-2">
              KiKaDi 🧠
            </h1>
            <p className="text-white/80 font-inter text-lg">
              Devinez qui a écrit quoi !
            </p>
          </div>
          
          <GlassCard className="mb-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-white mb-2">{timer}</div>
              <p className="text-white/80">La partie commence dans...</p>
            </div>
          </GlassCard>

          <div className="space-y-2">
            <div className="text-white/60">📝 Écrivez votre réponse</div>
            <div className="text-white/60">🤔 Devinez qui a écrit quoi</div>
            <div className="text-white/60">🎯 Marquez des points si vous trouvez</div>
          </div>
        </div>
      )}

      {/* Answer Phase */}
      {phase === 'answer' && (
        <div className="animate-slide-up">
          <GlassCard className="mb-6">
            <h2 className="text-2xl font-poppins font-bold text-white mb-4 text-center">
              Question 📝
            </h2>
            <div className="glass-card bg-white/10 p-4 rounded-xl mb-6">
              <p className="text-white text-lg font-inter text-center">
                {question}
              </p>
            </div>
          </GlassCard>

          {!hasUserAnswered ? (
            <GlassCard>
              <div className="space-y-4">
                <Label className="text-white font-poppins font-semibold">
                  Votre réponse
                </Label>
                <Input
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Écrivez votre citation inspirante..."
                  className="glass-card border-white/30 text-white placeholder:text-white/60"
                />
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!answer.trim() || loading}
                  className="w-full glass-button text-white border-white/30 hover:bg-white/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      Valider ma réponse <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </GlassCard>
          ) : (
            <GlassCard>
              <div className="text-center text-white">
                <div className="text-2xl mb-2">✅</div>
                <p>Réponse envoyée ! Attendez les autres joueurs...</p>
              </div>
            </GlassCard>
          )}

          {isHost && answers.length >= players.length && (
            <Button
              onClick={handleAdvancePhase}
              disabled={loading}
              className="w-full mt-4 glass-button text-white border-white/30 hover:bg-white/20"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Passage au vote...
                </>
              ) : (
                'Passer au vote'
              )}
            </Button>
          )}
        </div>
      )}

      {/* Vote Phase */}
      {phase === 'vote' && (
        <div className="animate-slide-up">
          <GlassCard className="mb-6">
            <h2 className="text-2xl font-poppins font-bold text-white mb-4 text-center">
              Qui a écrit quoi ? 🤔
            </h2>
            <p className="text-white/80 text-center font-inter">
              Associez chaque réponse à son auteur
            </p>
          </GlassCard>

          {!hasUserVoted ? (
            <div className="space-y-4">
              {answers.map((answer, index) => {
                const author = players.find(p => p.user_id === answer.player_id);
                
                return (
                  <GlassCard key={answer.id} className="animate-bounce-in" 
                            style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="mb-4">
                      <p className="text-white font-inter italic">
                        "{answer.content}"
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {players.map((player) => (
                        <Button
                          key={player.user_id}
                          onClick={() => setSelectedPlayer(player.user_id)}
                          className={`text-sm ${
                            selectedPlayer === player.user_id
                              ? 'bg-white/30 border-white' 
                              : 'glass-button border-white/30'
                          } text-white`}
                        >
                          {player.profiles?.pseudo || 'Joueur'}
                        </Button>
                      ))}
                    </div>
                  </GlassCard>
                );
              })}

              <Button
                onClick={handleVote}
                disabled={!selectedPlayer || loading}
                className="w-full mt-6 glass-button text-white border-white/30 hover:bg-white/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Vote en cours...
                  </>
                ) : (
                  <>
                    Confirmer mes choix <Users className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          ) : (
            <GlassCard>
              <div className="text-center text-white">
                <div className="text-2xl mb-2">🗳️</div>
                <p>Vote enregistré ! Attendez les autres joueurs...</p>
              </div>
            </GlassCard>
          )}

          {isHost && votes.length >= players.length && (
            <Button
              onClick={handleAdvancePhase}
              disabled={loading}
              className="w-full mt-4 glass-button text-white border-white/30 hover:bg-white/20"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Révélation...
                </>
              ) : (
                'Révéler les résultats'
              )}
            </Button>
          )}
        </div>
      )}

      {/* Reveal Phase */}
      {phase === 'reveal' && (
        <div className="text-center animate-bounce-in">
          <GlassCard>
            <h2 className="text-3xl font-poppins font-bold text-white mb-6">
              Révélation ! 😲
            </h2>
            
            <div className="space-y-4">
              {answers.map((answer, index) => {
                const author = players.find(p => p.user_id === answer.player_id);
                
                return (
                  <div key={answer.id} 
                       className="glass-card bg-white/10 p-4 rounded-xl animate-slide-up"
                       style={{ animationDelay: `${index * 0.5}s` }}>
                    <p className="text-white font-inter italic mb-2">
                      "{answer.content}"
                    </p>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-white/80">écrit par</span>
                      <div className="text-2xl">{author?.profiles?.avatar || '👤'}</div>
                      <span className="font-poppins font-bold text-white">
                        {author?.profiles?.pseudo || 'Joueur'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {isHost && (
              <Button
                onClick={handleAdvancePhase}
                disabled={loading}
                className="w-full mt-6 glass-button text-white border-white/30 hover:bg-white/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Calcul des scores...
                  </>
                ) : (
                  'Voir les scores'
                )}
              </Button>
            )}
          </GlassCard>
        </div>
      )}

      {/* Result Phase */}
      {phase === 'results' && (
        <div className="text-center animate-bounce-in">
          <GlassCard>
            <Trophy className="w-16 h-16 text-yellow-300 mx-auto mb-4 animate-bounce" />
            <h2 className="text-3xl font-poppins font-bold text-white mb-4">
              Résultats de la manche ! 🏆
            </h2>
            
            <div className="space-y-3 mb-6">
              {players.map((player, index) => (
                <div key={player.user_id} 
                     className="flex justify-between items-center glass-card bg-white/10 p-3 rounded-xl">
                  <span className="text-white font-poppins">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} {player.profiles?.pseudo || 'Joueur'}
                  </span>
                  <span className="text-yellow-300 font-bold">
                    +{Math.floor(Math.random() * 3) + 1} pts
                  </span>
                </div>
              ))}
            </div>

            {isHost && (
              <Button
                onClick={onComplete}
                disabled={loading}
                className="w-full glass-button text-white border-white/30 hover:bg-white/20 text-lg py-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 w-6 h-6 animate-spin" />
                    Prochaine manche...
                  </>
                ) : (
                  currentRound < totalRounds ? 'Manche suivante' : 'Voir les résultats finaux'
                )} 🚀
              </Button>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default KiKaDiGame;
