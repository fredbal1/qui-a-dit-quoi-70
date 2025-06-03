
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJoinGame } from '@/hooks/useJoinGame';
import AnimatedBackground from '@/components/AnimatedBackground';
import GlassCard from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Users, Check, X, Loader2 } from 'lucide-react';

const JoinGame = () => {
  const navigate = useNavigate();
  const { joinGame, loading } = useJoinGame();
  const [gameCode, setGameCode] = useState('');
  const [validationResult, setValidationResult] = useState<'valid' | 'invalid' | null>(null);

  const handleCodeChange = (value: string) => {
    const formattedCode = value.toUpperCase().slice(0, 6);
    setGameCode(formattedCode);
    setValidationResult(null);
  };

  const handleJoinGame = async () => {
    if (gameCode.length !== 6 || loading) return;
    
    const result = await joinGame(gameCode);
    
    if (result.success && result.gameCode) {
      setValidationResult('valid');
      setTimeout(() => {
        navigate(`/lobby/${result.gameCode}`);
      }, 1000);
    } else {
      setValidationResult('invalid');
    }
  };

  const getValidationIcon = () => {
    if (loading) {
      return <Loader2 className="w-5 h-5 animate-spin text-white" />;
    }
    if (validationResult === 'valid') {
      return <Check className="w-5 h-5 text-green-400" />;
    }
    if (validationResult === 'invalid') {
      return <X className="w-5 h-5 text-red-400" />;
    }
    return null;
  };

  const getValidationMessage = () => {
    if (validationResult === 'valid') {
      return <span className="text-green-400">✅ Code valide ! Connexion...</span>;
    }
    if (validationResult === 'invalid') {
      return <span className="text-red-400">❌ Code invalide ou partie inexistante</span>;
    }
    return null;
  };

  return (
    <AnimatedBackground variant="join">
      <div className="min-h-screen p-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 mr-4"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-poppins font-bold text-white">
            Rejoindre une partie
          </h1>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          {/* Code Input */}
          <GlassCard className="mb-6 animate-bounce-in">
            <div className="text-center mb-6">
              <Users className="w-16 h-16 text-white mx-auto mb-4 animate-float" />
              <h2 className="text-xl font-poppins font-semibold text-white mb-2">
                Entre le code de la partie
              </h2>
              <p className="text-white/80 font-inter">
                Demande le code à ton ami qui a créé la partie
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white font-inter">Code de partie</Label>
                <div className="relative">
                  <Input
                    value={gameCode}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    placeholder="ABCD12"
                    className="bg-white/95 border-white/50 text-gray-900 placeholder:text-gray-500 text-center text-xl font-mono tracking-widest"
                    maxLength={6}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleJoinGame();
                      }
                    }}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getValidationIcon()}
                  </div>
                </div>
              </div>

              {validationResult && (
                <div className="text-center text-sm font-inter animate-slide-up">
                  {getValidationMessage()}
                </div>
              )}

              <Button
                onClick={handleJoinGame}
                disabled={gameCode.length !== 6 || loading}
                className="w-full glass-button text-white border-white/30 hover:bg-white/20 font-poppins font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  'Rejoindre 🎮'
                )}
              </Button>
            </div>
          </GlassCard>

          {/* Invitation Feature */}
          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm font-inter mb-3">
              Pas de code ? Demande une invitation !
            </p>
            <Button
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10 font-inter"
              onClick={() => {
                // Future feature: invitation system
                console.log('Invitation feature coming soon');
              }}
            >
              📧 Recevoir une invitation
            </Button>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default JoinGame;
