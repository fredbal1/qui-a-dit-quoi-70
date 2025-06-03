
import { useToast } from '@/hooks/use-toast';

interface GameSettings {
  mode: string;
  ambiance: string;
  miniGames: string[];
  totalRounds: number;
  twoPlayersOnly: boolean;
}

export const useGameValidation = () => {
  const { toast } = useToast();

  const validateGameSettings = (settings: GameSettings): boolean => {
    // Validation du mode
    const validModes = ['classique', 'bluff', 'duel', 'couple'];
    if (!validModes.includes(settings.mode)) {
      toast({
        title: "Mode invalide",
        description: "Veuillez sélectionner un mode de jeu valide",
        variant: "destructive"
      });
      return false;
    }

    // Validation de l'ambiance
    const validAmbiances = ['safe', 'intime', 'nofilter'];
    if (!validAmbiances.includes(settings.ambiance)) {
      toast({
        title: "Ambiance invalide",
        description: "Veuillez sélectionner une ambiance valide",
        variant: "destructive"
      });
      return false;
    }

    // Validation des mini-jeux
    const validMiniGames = ['kikadi', 'kidivrai', 'kideja', 'kidenous'];
    if (settings.miniGames.length === 0) {
      toast({
        title: "Aucun mini-jeu sélectionné",
        description: "Veuillez sélectionner au moins un mini-jeu",
        variant: "destructive"
      });
      return false;
    }

    if (!settings.miniGames.every(game => validMiniGames.includes(game))) {
      toast({
        title: "Mini-jeu invalide",
        description: "Un ou plusieurs mini-jeux sélectionnés sont invalides",
        variant: "destructive"
      });
      return false;
    }

    // Validation du nombre de rounds
    if (settings.totalRounds < 3 || settings.totalRounds > 15) {
      toast({
        title: "Nombre de manches invalide",
        description: "Le nombre de manches doit être entre 3 et 15",
        variant: "destructive"
      });
      return false;
    }

    // Validation mode 2 joueurs
    if (settings.twoPlayersOnly) {
      const twoPlayerModes = ['duel', 'couple'];
      if (!twoPlayerModes.includes(settings.mode)) {
        toast({
          title: "Mode incompatible",
          description: "Mode 2 joueurs activé mais mode sélectionné incompatible",
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const validateGameCode = (code: string): boolean => {
    if (!code || code.length !== 6) {
      toast({
        title: "Code invalide",
        description: "Le code de partie doit contenir 6 caractères",
        variant: "destructive"
      });
      return false;
    }

    if (!/^[A-Z0-9]+$/.test(code)) {
      toast({
        title: "Code invalide",
        description: "Le code ne doit contenir que des lettres majuscules et des chiffres",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  return {
    validateGameSettings,
    validateGameCode
  };
};
