
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGameAnswers } from '@/hooks/useGameAnswers';
import { useGameVotes } from '@/hooks/useGameVotes';
import { useGamePhase } from '@/hooks/useGamePhase';
import { useRoundManagement } from '@/hooks/useRoundManagement';
import GlassCard from '@/components/GlassCard';
import GamePhaseManager from './GamePhaseManager';
import RealScoreDisplay from './RealScoreDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Brain, Users, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface KiKaDiGameProps {
  gameData: any;
  onComplete: () => void;
  currentRound: number;
  totalRounds: number;
}

const KiKaDiGame: React.FC<KiKaDiGameProps> = ({ gameData, onComplete, currentRound, totalRounds }) => {
  const { user } = useAuth();
  const { submitAnswer, loading: answerLoading } = useGameAnswers();
  const { submitVote, loading: voteLoading } = useGameVotes();
  const { advancePhase, loading: phaseLoading } = useGamePhase();
  const { completeRound } = useRoundManagement();
  const { toast } = useToast();
  const [answer, setAnswer] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [timer, setTimer] = useState(5);
  const [scoreUpdates, setScoreUpdates] = useState<{ [playerId: string]: number }>({});

  const phase = gameData.phase || 'intro';
  const isHost = gameData.host === user?.id;
  const players = gameData.game_players || [];
  const answers = gameData.answers || [];
  const votes = gameData.votes || [];
  const currentRoundData = gameData.current_round_data;
  const loading = answerLoading || voteLoading || phaseLoading;

  // Get question from Supabase
  const [question, setQuestion] = useState<string>('');

  useEffect(() => {
    const fetchQuestion = async () => {
      if (currentRoundData?.question_id) {
        // In a real implementation, you'd fetch from Supabase
        // For now, using a default question
        setQuestion("Quelle est votre citation inspirante préférée ?");
      }
    };
    fetchQuestion();
  }, [currentRoundData]);

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
    
    if (phase === 'results') {
      // Complete round and calculate real scores
      if (currentRoundData?.id) {
        const result = await completeRound(currentRoundData.id, 'kikadi');
        if (result.success) {
          setScoreUpdates(result.scoreUpdates || {});
          toast({
            title: "Scores calculés ! 🎯",
            description: "Les vrais scores ont été mis à jour",
          });
        }
      }
      onComplete();
    } else {
      const result = await advancePhase(gameData.id);
      if (!result.success) {
        toast({
          title: "Erreur",
          description: "Impossible de faire avancer la partie",
          variant: "destructive"
        });
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !currentRoundData?.id || loading) return;
    
    const result = await submitAnswer(currentRoundData.id, answer, false);
    if (result.success) {
      setAnswer('');
    }
  };

  const handleVote = async () => {
    if (!selectedAnswer || !selectedPlayer || !currentRoundData?.id || loading) return;
    
    const result = await submitVote(
      currentRoundData.id, 
      selectedPlayer, 
      selectedAnswer, 
      'guess'
    );
    
    if (result.success) {
      setSelectedAnswer('');
      setSelectedPlayer('');
    }
  };

  const hasUserAnswered = answers.some(a => a.player_id === user?.id);
  const hasUserVoted = votes.some(v => v.player_id === user?.id);

  return (
    <div className="p-4">
      <GamePhaseManager
        phase={phase}
        timer={phase === 'intro' ? timer : undefined}
        isHost={isHost}
        onAdvancePhase={handleAdvancePhase}
        loading={loading}
      >
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
          <div className="space-y-6">
            <GlassCard>
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
          </div>
        )}

        {/* Vote Phase */}
        {phase === 'vote' && (
          <div className="space-y-6">
            <GlassCard>
              <h2 className="text-2xl font-poppins font-bold text-white mb-4 text-center">
                Qui a écrit quoi ? 🤔
              </h2>
              <p className="text-white/80 text-center font-inter">
                Associez chaque réponse à son auteur
              </p>
            </GlassCard>

            {!hasUserVoted ? (
              <div className="space-y-4">
                {answers.map((answer, index) => (
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
                          onClick={() => {
                            setSelectedAnswer(answer.id);
                            setSelectedPlayer(player.user_id);
                          }}
                          className={`text-sm ${
                            selectedAnswer === answer.id && selectedPlayer === player.user_id
                              ? 'bg-white/30 border-white' 
                              : 'glass-button border-white/30'
                          } text-white`}
                        >
                          {player.profiles?.pseudo || 'Joueur'}
                        </Button>
                      ))}
                    </div>
                  </GlassCard>
                ))}

                <Button
                  onClick={handleVote}
                  disabled={!selectedAnswer || !selectedPlayer || loading}
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
          </div>
        )}

        {/* Reveal Phase */}
        {phase === 'reveal' && (
          <div className="space-y-6">
            <GlassCard>
              <h2 className="text-3xl font-poppins font-bold text-white mb-6 text-center">
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
            </GlassCard>
          </div>
        )}

        {/* Results Phase */}
        {phase === 'results' && (
          <div className="space-y-6">
            <RealScoreDisplay players={players} scoreUpdates={scoreUpdates} />
            
            <GlassCard className="text-center">
              <h3 className="text-2xl font-poppins font-bold text-white mb-4">
                Résultats de la manche ! 🏆
              </h3>
              <p className="text-white/80">
                {currentRound < totalRounds 
                  ? `Manche ${currentRound}/${totalRounds} terminée`
                  : 'Partie terminée !'
                }
              </p>
            </GlassCard>
          </div>
        )}
      </GamePhaseManager>
    </div>
  );
};

export default KiKaDiGame;
