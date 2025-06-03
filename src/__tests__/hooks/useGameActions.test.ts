
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGameCreation } from '@/hooks/useGameCreation';
import { useGameAnswers } from '@/hooks/useGameAnswers';
import { useGameVotes } from '@/hooks/useGameVotes';
import { useGamePhase } from '@/hooks/useGamePhase';

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn()
  },
  from: vi.fn(() => ({
    insert: vi.fn(() => ({ error: null })),
    update: vi.fn(() => ({ error: null })),
    select: vi.fn(() => ({ 
      eq: vi.fn(() => ({ 
        single: vi.fn(() => ({ data: { host: 'user-123', phase: 'intro' }, error: null }))
      }))
    })),
    upsert: vi.fn(() => ({ error: null }))
  }))
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('Game Action Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } }
    });
  });

  describe('useGameAnswers', () => {
    it('should submit answer successfully', async () => {
      const { result } = renderHook(() => useGameAnswers());

      const response = await result.current.submitAnswer('round-123', 'Ma réponse', false);

      expect(response.success).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('answers');
    });
  });

  describe('useGameVotes', () => {
    it('should submit vote with upsert', async () => {
      const { result } = renderHook(() => useGameVotes());

      const response = await result.current.submitVote('round-123', 'player-456', 'answer-789', 'bluff');

      expect(response.success).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('votes');
    });
  });

  describe('useGamePhase', () => {
    it('should advance phase only if user is host', async () => {
      const { result } = renderHook(() => useGamePhase());

      const response = await result.current.advancePhase('game-123');

      expect(response.success).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('games');
    });
  });

  describe('useGameCreation', () => {
    it('should create game and add host as player', async () => {
      const { result } = renderHook(() => useGameCreation());

      // Mock specific behavior for createGame test
      const mockFromForCreateGame = vi.fn()
        .mockReturnValueOnce({
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({ 
                data: { id: 'game-123', code: 'ABC123' }, 
                error: null 
              }))
            }))
          }))
        })
        .mockReturnValueOnce({
          insert: vi.fn(() => ({ error: null }))
        });

      mockSupabase.from = mockFromForCreateGame;

      const response = await result.current.createGame({ totalRounds: 5 });

      expect(response.success).toBe(true);
      expect(response.gameCode).toBeTruthy();
    });
  });
});
