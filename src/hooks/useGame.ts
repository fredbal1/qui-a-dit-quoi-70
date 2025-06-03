
import { useGameStore } from '@/stores/gameStore';
import { useUIStore } from '@/stores/uiStore';
import { useGameValidation } from '@/hooks/useGameValidation';

export const useGame = () => {
  const gameStore = useGameStore();
  const { addToast } = useUIStore();
  const { validateGameSettings, validateGameCode } = useGameValidation();

  const createGame = async (settings: any) => {
    // Validate settings
    if (!validateGameSettings(settings)) {
      return { success: false, error: "Paramètres de jeu invalides" };
    }

    const result = await gameStore.createGame(settings);
    
    if (result.success) {
      addToast({
        title: "Partie créée ! 🎉",
        description: `Code de la partie: ${result.gameCode}`,
      });
    } else {
      addToast({
        title: "Erreur",
        description: result.error || "Impossible de créer la partie",
        variant: "destructive"
      });
    }
    
    return result;
  };

  const joinGame = async (code: string) => {
    // Validate code
    if (!validateGameCode(code)) {
      return { success: false, error: "Code invalide" };
    }

    const result = await gameStore.joinGame(code);
    
    if (result.success) {
      addToast({
        title: "Partie rejointe ! 🎮",
        description: "Vous avez rejoint la partie avec succès",
      });
    } else {
      addToast({
        title: "Erreur",
        description: result.error || "Impossible de rejoindre la partie",
        variant: "destructive"
      });
    }
    
    return result;
  };

  const submitAnswer = async (roundId: string, content: string, isBluff: boolean = false) => {
    // Client-side validation
    if (!content.trim()) {
      addToast({
        title: "Réponse vide",
        description: "Veuillez saisir une réponse avant de valider",
        variant: "destructive"
      });
      return { success: false, error: "Réponse vide" };
    }

    if (content.length > 500) {
      addToast({
        title: "Réponse trop longue",
        description: "La réponse ne peut pas dépasser 500 caractères",
        variant: "destructive"
      });
      return { success: false, error: "Réponse trop longue" };
    }

    const result = await gameStore.submitAnswer(roundId, content, isBluff);
    
    if (result.success) {
      addToast({
        title: "Réponse envoyée ! ✅",
        description: "Votre réponse a été soumise avec succès",
      });
    } else {
      addToast({
        title: "Erreur",
        description: result.error || "Impossible d'envoyer la réponse",
        variant: "destructive"
      });
    }
    
    return result;
  };

  const submitVote = async (roundId: string, targetPlayerId: string, answerId: string, voteType: string) => {
    // Client-side validation
    if (!targetPlayerId || !answerId || !voteType) {
      addToast({
        title: "Vote incomplet",
        description: "Tous les champs du vote sont requis",
        variant: "destructive"
      });
      return { success: false, error: "Vote incomplet" };
    }

    const validVoteTypes = ['guess', 'bluff', 'truth'];
    if (!validVoteTypes.includes(voteType)) {
      addToast({
        title: "Type de vote invalide",
        description: "Le type de vote n'est pas reconnu",
        variant: "destructive"
      });
      return { success: false, error: "Type de vote invalide" };
    }

    const result = await gameStore.submitVote(roundId, targetPlayerId, answerId, voteType);
    
    if (result.success) {
      addToast({
        title: "Vote enregistré ! 🗳️",
        description: "Votre vote a été pris en compte",
      });
    } else {
      addToast({
        title: "Erreur",
        description: result.error || "Impossible d'enregistrer le vote",
        variant: "destructive"
      });
    }
    
    return result;
  };

  const advancePhase = async (gameId: string) => {
    const result = await gameStore.advancePhase(gameId);
    
    if (result.success) {
      addToast({
        title: "Phase avancée ! 🚀",
        description: `Passage à la phase: ${result.nextPhase}`,
      });
    } else {
      addToast({
        title: "Erreur",
        description: result.error || "Impossible de faire avancer la partie",
        variant: "destructive"
      });
    }
    
    return result;
  };

  return {
    // State
    gameData: gameStore.gameData,
    loading: gameStore.loading,
    error: gameStore.error,
    networkError: gameStore.networkError,
    
    // Actions
    createGame,
    joinGame,
    submitAnswer,
    submitVote,
    advancePhase,
    
    // Store actions
    setGameData: gameStore.setGameData,
    reset: gameStore.reset,
  };
};
