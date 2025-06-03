
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PlayerStats {
  level: number;
  total_xp: number;
  coins: number;
  games_played: number;
  games_won: number;
  best_streak: number;
  bluffs_successful: number;
  bluffs_detected: number;
}

export const usePlayerStats = () => {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setStats(null);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching user stats:', fetchError);
          setError(fetchError.message);
          return;
        }

        // If no stats exist, create default ones
        if (!data) {
          const defaultStats: PlayerStats = {
            level: 1,
            total_xp: 0,
            coins: 100,
            games_played: 0,
            games_won: 0,
            best_streak: 0,
            bluffs_successful: 0,
            bluffs_detected: 0
          };
          setStats(defaultStats);
        } else {
          setStats(data);
        }
      } catch (err: any) {
        console.error('Error in fetchStats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return { stats, loading, error };
};
