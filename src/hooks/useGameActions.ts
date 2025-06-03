
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRetryOperation } from '@/hooks/useRetryOperation';
import { useGameValidation } from '@/hooks/useGameValidation';
import { useErrorMonitoring } from '@/hooks/useErrorMonitoring';

export const useGameActions = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { executeWithRetry } = useRetryOperation();
  const { validateGameSettings } = useGameValidation();
  const { logError, logGameAction } = useErrorMonitoring();

  const submitAnswer = async (roundId: string, content: string, isBluff: boolean = false) => {
    try {
      setLoading(true);
      logGameAction('submit_answer', roundId);

      // Validation côté client
      if (!content.trim()) {
        toast({
          title: "Réponse vide",
          description: "Veuillez saisir une réponse avant de valider",
          variant: "destructive"
        });
        return { success: false, error: "Réponse vide" };
      }

      if (content.length > 500) {
        toast({
          title: "Réponse trop longue",
          description: "La réponse ne peut pas dépasser 500 caractères",
          variant: "destructive"
        });
        return { success: false, error: "Réponse trop longue" };
      }

      const operation = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Utilisateur non connecté');
        }

        const { error } = await supabase
          .from('answers')
          .insert({
            player_id: user.id,
            round_id: roundId,
            content: content.trim(),
            is_bluff: isBluff,
            timestamp: new Date().toISOString()
          });

        if (error) throw error;
        return true;
      };

      const result = await executeWithRetry(operation, { maxRetries: 2 });
      
      if (result.success) {
        toast({
          title: "Réponse envoyée ! ✅",
          description: "Votre réponse a été soumise avec succès",
        });
        logGameAction('submit_answer', roundId, true);
      } else {
        logError({
          type: 'game_action',
          message: `Échec envoi réponse: ${result.error}`,
          context: { roundId, contentLength: content.length },
          timestamp: new Date().toISOString()
        });
      }

      return result;
    } catch (err: any) {
      logError({
        type: 'game_action',
        message: `Erreur submit answer: ${err.message}`,
        context: { roundId },
        timestamp: new Date().toISOString()
      });
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const submitVote = async (
    roundId: string, 
    targetPlayerId: string, 
    answerId: string, 
    voteType: string
  ) => {
    try {
      setLoading(true);
      logGameAction('submit_vote', roundId);

      // Validation côté client
      if (!targetPlayerId || !answerId || !voteType) {
        toast({
          title: "Vote incomplet",
          description: "Tous les champs du vote sont requis",
          variant: "destructive"
        });
        return { success: false, error: "Vote incomplet" };
      }

      const validVoteTypes = ['guess', 'bluff', 'truth'];
      if (!validVoteTypes.includes(voteType)) {
        toast({
          title: "Type de vote invalide",
          description: "Le type de vote n'est pas reconnu",
          variant: "destructive"
        });
        return { success: false, error: "Type de vote invalide" };
      }

      const operation = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Utilisateur non connecté');
        }

        const { error } = await supabase
          .from('votes')
          .upsert({
            player_id: user.id,
            round_id: roundId,
            target_player_id: targetPlayerId,
            answer_id: answerId,
            vote_type: voteType,
            timestamp: new Date().toISOString()
          }, {
            onConflict: 'player_id,round_id'
          });

        if (error) throw error;
        return true;
      };

      const result = await executeWithRetry(operation, { maxRetries: 2 });
      
      if (result.success) {
        toast({
          title: "Vote enregistré ! 🗳️",
          description: "Votre vote a été pris en compte",
        });
        logGameAction('submit_vote', roundId, true);
      } else {
        logError({
          type: 'game_action',
          message: `Échec envoi vote: ${result.error}`,
          context: { roundId, voteType },
          timestamp: new Date().toISOString()
        });
      }

      return result;
    } catch (err: any) {
      logError({
        type: 'game_action',
        message: `Erreur submit vote: ${err.message}`,
        context: { roundId, voteType },
        timestamp: new Date().toISOString()
      });
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const advancePhase = async (gameId: string) => {
    try {
      setLoading(true);
      logGameAction('advance_phase', gameId);

      const operation = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Utilisateur non connecté');
        }

        // Vérification que l'utilisateur est l'hôte
        const { data: gameData, error: gameError } = await supabase
          .from('games')
          .select('host, phase, current_round, total_rounds')
          .eq('id', gameId)
          .single();

        if (gameError) throw gameError;

        if (gameData.host !== user.id) {
          throw new Error('Seul le créateur peut faire avancer la partie');
        }

        // Logique de progression des phases
        const phaseOrder = ['intro', 'answer', 'vote', 'reveal', 'results'];
        const currentPhaseIndex = phaseOrder.indexOf(gameData.phase || 'intro');
        
        let nextPhase: string;
        let nextRound = gameData.current_round;

        if (currentPhaseIndex === phaseOrder.length - 1) {
          if (gameData.current_round && gameData.current_round < (gameData.total_rounds || 5)) {
            nextPhase = 'intro';
            nextRound = (gameData.current_round || 1) + 1;
          } else {
            nextPhase = 'ended';
          }
        } else {
          nextPhase = phaseOrder[currentPhaseIndex + 1];
        }

        const updateData: any = { phase: nextPhase };
        if (nextRound !== gameData.current_round) {
          updateData.current_round = nextRound;
        }

        const { error: updateError } = await supabase
          .from('games')
          .update(updateData)
          .eq('id', gameId);

        if (updateError) throw updateError;

        return { nextPhase };
      };

      const result = await executeWithRetry(operation, { maxRetries: 1 });
      
      if (result.success) {
        toast({
          title: "Phase avancée ! 🚀",
          description: `Passage à la phase: ${result.data?.nextPhase}`,
        });
        logGameAction('advance_phase', gameId, true);
        return { success: true, nextPhase: result.data?.nextPhase };
      } else {
        logError({
          type: 'game_action',
          message: `Échec avancement phase: ${result.error}`,
          context: { gameId },
          timestamp: new Date().toISOString()
        });
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      logError({
        type: 'game_action',
        message: `Erreur advance phase: ${err.message}`,
        context: { gameId },
        timestamp: new Date().toISOString()
      });
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const createGame = async (settings: any = {}) => {
    try {
      setLoading(true);
      logGameAction('create_game');

      // Validation côté client
      if (!validateGameSettings(settings)) {
        return { success: false, error: "Paramètres de jeu invalides" };
      }

      const operation = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Utilisateur non connecté');
        }

        // Génération sécurisée du code de partie
        const generateGameCode = () => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let result = '';
          for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return result;
        };

        let gameCode = generateGameCode();
        let attempts = 0;
        const maxAttempts = 10;

        // Vérifier que le code n'existe pas déjà
        while (attempts < maxAttempts) {
          const { data: existingGame } = await supabase
            .from('games')
            .select('id')
            .eq('code', gameCode)
            .maybeSingle();

          if (!existingGame) break;
          
          gameCode = generateGameCode();
          attempts++;
        }

        if (attempts === maxAttempts) {
          throw new Error('Impossible de générer un code unique');
        }

        // Créer la partie
        const { data: gameData, error: gameError } = await supabase
          .from('games')
          .insert({
            code: gameCode,
            host: user.id,
            settings: settings,
            status: 'waiting',
            current_round: 1,
            total_rounds: settings.totalRounds || 5,
            phase: 'intro'
          })
          .select()
          .single();

        if (gameError) throw gameError;

        // Ajouter l'hôte comme premier joueur
        const { error: playerError } = await supabase
          .from('game_players')
          .insert({
            game_id: gameData.id,
            user_id: user.id,
            is_host: true,
            score: 0,
            coins: 0,
            level: 1,
            xp: 0
          });

        if (playerError) throw playerError;

        return { gameCode, gameId: gameData.id };
      };

      const result = await executeWithRetry(operation, { maxRetries: 2 });
      
      if (result.success) {
        toast({
          title: "Partie créée ! 🎉",
          description: `Code de la partie: ${result.data?.gameCode}`,
        });
        logGameAction('create_game', result.data?.gameId, true);
        return { 
          success: true, 
          gameCode: result.data?.gameCode, 
          gameId: result.data?.gameId 
        };
      } else {
        logError({
          type: 'game_action',
          message: `Échec création partie: ${result.error}`,
          context: { settings },
          timestamp: new Date().toISOString()
        });
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      logError({
        type: 'game_action',
        message: `Erreur create game: ${err.message}`,
        context: { settings },
        timestamp: new Date().toISOString()
      });
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    submitAnswer,
    submitVote,
    advancePhase,
    createGame,
    loading
  };
};
