
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRetryOperation } from '@/hooks/useRetryOperation';
import { useGameValidation } from '@/hooks/useGameValidation';
import { useErrorMonitoring } from '@/hooks/useErrorMonitoring';

export const useGameCreation = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { executeWithRetry } = useRetryOperation();
  const { validateGameSettings } = useGameValidation();
  const { logError, logGameAction } = useErrorMonitoring();

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
    createGame,
    loading
  };
};
