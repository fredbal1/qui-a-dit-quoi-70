
import React from 'react';
import { Trophy, TrendingUp } from 'lucide-react';
import GlassCard from '@/components/GlassCard';

interface Player {
  user_id: string;
  score: number;
  profiles?: {
    pseudo: string;
    avatar: string;
  };
}

interface RealScoreDisplayProps {
  players: Player[];
  scoreUpdates?: { [playerId: string]: number };
}

const RealScoreDisplay: React.FC<RealScoreDisplayProps> = ({ players, scoreUpdates }) => {
  const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <GlassCard>
      <div className="flex items-center justify-center mb-4">
        <Trophy className="w-6 h-6 text-yellow-300 mr-2" />
        <h3 className="text-xl font-poppins font-bold text-white">Scores actuels</h3>
      </div>
      
      <div className="space-y-3">
        {sortedPlayers.map((player, index) => {
          const pointsGained = scoreUpdates?.[player.user_id] || 0;
          const position = index + 1;
          const positionEmoji = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '🏅';
          
          return (
            <div
              key={player.user_id}
              className={`flex justify-between items-center p-3 rounded-xl ${
                position === 1 ? 'bg-yellow-500/20 border border-yellow-300/30' :
                position === 2 ? 'bg-gray-500/20 border border-gray-300/30' :
                position === 3 ? 'bg-orange-500/20 border border-orange-300/30' :
                'bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{positionEmoji}</span>
                <span className="text-3xl">{player.profiles?.avatar || '🎮'}</span>
                <span className="font-poppins font-semibold text-white">
                  {player.profiles?.pseudo || 'Joueur'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-white">
                  {player.score || 0} pts
                </span>
                {pointsGained > 0 && (
                  <div className="flex items-center text-green-300 text-sm">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +{pointsGained}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

export default RealScoreDisplay;
