
import React from 'react';
import { Loader2, Gamepad2, Users, Wifi } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Chargement...' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex items-center space-x-2">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-white`} />
      {text && <span className="text-white font-inter">{text}</span>}
    </div>
  );
};

interface GameLoadingProps {
  message?: string;
  variant?: 'game' | 'lobby' | 'dashboard';
}

export const GameLoading: React.FC<GameLoadingProps> = ({ 
  message = 'Chargement...',
  variant = 'game'
}) => {
  const icons = {
    game: <Gamepad2 className="w-8 h-8 text-white animate-pulse" />,
    lobby: <Users className="w-8 h-8 text-white animate-pulse" />,
    dashboard: <Wifi className="w-8 h-8 text-white animate-pulse" />
  };

  return (
    <AnimatedBackground variant={variant}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="text-center">
          <div className="mb-4 flex justify-center">
            {icons[variant]}
          </div>
          <LoadingSpinner size="lg" text={message} />
          <div className="mt-4 flex space-x-1 justify-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-white/60 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </GlassCard>
      </div>
    </AnimatedBackground>
  );
};

export const PlayerListSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <GlassCard key={i} className="animate-pulse">
        <div className="flex items-center space-x-4">
          <Skeleton className="w-12 h-12 rounded-full bg-white/20" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24 bg-white/20" />
            <Skeleton className="h-3 w-16 bg-white/10" />
          </div>
          <Skeleton className="w-16 h-6 bg-white/20" />
        </div>
      </GlassCard>
    ))}
  </div>
);

export const GameSkeleton = () => (
  <div className="space-y-6">
    <GlassCard className="animate-pulse">
      <div className="text-center space-y-4">
        <Skeleton className="h-8 w-48 mx-auto bg-white/20" />
        <Skeleton className="h-20 w-full bg-white/10" />
      </div>
    </GlassCard>
    
    <GlassCard className="animate-pulse">
      <div className="space-y-3">
        <Skeleton className="h-6 w-32 bg-white/20" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full bg-white/10" />
          ))}
        </div>
      </div>
    </GlassCard>
  </div>
);
