
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

export const useGameQuestions = () => {
  const [questions, setQuestions] = useState<Tables<'questions'>[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getRandomQuestion = async (gameType: string, category?: string) => {
    try {
      setLoading(true);

      let query = supabase
        .from('questions')
        .select('*')
        .eq('game_type', gameType);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Return random question or fallback
      if (data && data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length);
        return data[randomIndex];
      }

      // Fallback questions by game type
      const fallbackQuestions = {
        'kikadi': "Quelle est votre citation inspirante préférée ?",
        'kidivrai': "Raconte-nous ton plus gros mensonge d'enfance",
        'kideja': "Qui a déjà mangé quelque chose qui était tombé par terre ?",
        'kidenous': "Qui de vous est le plus peureux ?"
      };

      return {
        id: `fallback-${gameType}`,
        text: fallbackQuestions[gameType as keyof typeof fallbackQuestions] || "Question par défaut",
        game_type: gameType,
        category: category || 'general',
        ambiance: 'fun'
      };

    } catch (err: any) {
      console.error('Error fetching question:', err);
      toast({
        title: "Erreur",
        description: "Impossible de charger la question",
        variant: "destructive"
      });
      
      // Return basic fallback
      return {
        id: 'error-fallback',
        text: "Partagez quelque chose d'intéressant sur vous !",
        game_type: gameType,
        category: 'general',
        ambiance: 'fun'
      };
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionsByType = async (gameType: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('game_type', gameType);

      if (error) {
        throw error;
      }

      setQuestions(data || []);
      return data || [];
    } catch (err: any) {
      console.error('Error fetching questions:', err);
      toast({
        title: "Erreur",
        description: "Impossible de charger les questions",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    questions,
    loading,
    getRandomQuestion,
    fetchQuestionsByType
  };
};
