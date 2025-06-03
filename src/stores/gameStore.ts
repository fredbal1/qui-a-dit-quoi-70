
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';

interface Player {
  user_id: string;
  score: number;
  is_host: boolean;
  profiles?: {
    pseudo: string;
    avatar: string;
  };
}

interface GameData {
  id: string;
  code: string;
  host: string;
  status: string;
  phase: string;
  current_round: number;
  total_rounds: number;
  settings: any;
  game_players: Player[];
  answers?: any[];
  votes?: any[];
  current_round_data?: any;
}

interface GameState {
  // State
  gameData: GameData | null;
  loading: boolean;
  error: string | null;
  networkError: boolean;
  
  // Actions
  setGameData: (data: GameData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setNetworkError: (error: boolean) => void;
  
  // Game Actions
  createGame: (settings: any) => Promise<{ success: boolean; gameCode?: string; gameId?: string; error?: string }>;
  joinGame: (code: string) => Promise<{ success: boolean; error?: string }>;
  submitAnswer: (roundId: string, content: string, isBluff?: boolean) => Promise<{ success: boolean; error?: string }>;
  submitVote: (roundId: string, targetPlayerId: string, answerId: string, voteType: string) => Promise<{ success: boolean; error?: string }>;
  advancePhase: (gameId: string) => Promise<{ success: boolean; nextPhase?: string; error?: string }>;
  
  // Utility
  reset: () => void;
}

const initialState = {
  gameData: null,
  loading: false,
  error: null,
  networkError: false,
};

export const useGameStore = create<GameState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Basic state setters
      setGameData: (data) => set({ gameData: data }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setNetworkError: (error) => set({ networkError: error }),

      // Game creation
      createGame: async (settings) => {
        set({ loading: true, error: null, networkError: false });
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error('Utilisateur non connecté');
          }

          // Generate unique game code
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

          // Check code uniqueness
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

          // Create game
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

          // Add host as first player
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

          set({ loading: false });
          return { success: true, gameCode, gameId: gameData.id };
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.message,
            networkError: error.message.includes('NetworkError') || error.message.includes('fetch')
          });
          return { success: false, error: error.message };
        }
      },

      // Join game
      joinGame: async (code) => {
        set({ loading: true, error: null, networkError: false });
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error('Utilisateur non connecté');
          }

          // Find game by code
          const { data: game, error: gameError } = await supabase
            .from('games')
            .select('*')
            .eq('code', code.toUpperCase())
            .eq('status', 'waiting')
            .single();

          if (gameError || !game) {
            throw new Error('Partie introuvable ou déjà commencée');
          }

          // Check if already joined
          const { data: existingPlayer } = await supabase
            .from('game_players')
            .select('id')
            .eq('game_id', game.id)
            .eq('user_id', user.id)
            .maybeSingle();

          if (!existingPlayer) {
            // Add player to game
            const { error: joinError } = await supabase
              .from('game_players')
              .insert({
                game_id: game.id,
                user_id: user.id,
                is_host: false,
                score: 0,
                coins: 0,
                level: 1,
                xp: 0
              });

            if (joinError) throw joinError;
          }

          set({ loading: false });
          return { success: true };
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.message,
            networkError: error.message.includes('NetworkError') || error.message.includes('fetch')
          });
          return { success: false, error: error.message };
        }
      },

      // Submit answer
      submitAnswer: async (roundId, content, isBluff = false) => {
        set({ loading: true, error: null });
        
        try {
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

          set({ loading: false });
          return { success: true };
        } catch (error: any) {
          set({ loading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      // Submit vote
      submitVote: async (roundId, targetPlayerId, answerId, voteType) => {
        set({ loading: true, error: null });
        
        try {
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

          set({ loading: false });
          return { success: true };
        } catch (error: any) {
          set({ loading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      // Advance phase
      advancePhase: async (gameId) => {
        set({ loading: true, error: null });
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error('Utilisateur non connecté');
          }

          // Check if user is host
          const { data: gameData, error: gameError } = await supabase
            .from('games')
            .select('host, phase, current_round, total_rounds')
            .eq('id', gameId)
            .single();

          if (gameError) throw gameError;

          if (gameData.host !== user.id) {
            throw new Error('Seul le créateur peut faire avancer la partie');
          }

          // Phase progression logic
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

          set({ loading: false });
          return { success: true, nextPhase };
        } catch (error: any) {
          set({ loading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      reset: () => set(initialState),
    }),
    {
      name: 'game-store',
    }
  )
);
