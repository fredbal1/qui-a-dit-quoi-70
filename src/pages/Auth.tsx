import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AnimatedBackground from '@/components/AnimatedBackground';
import GlassCard from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Lock, UserPlus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { toast } = useToast();
  
  const [pseudo, setPseudo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  const handleSignIn = async () => {
    if (!email || !password) return;
    
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: "Erreur de connexion",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Connexion réussie ! 🎉",
          description: "Bienvenue dans KIADISA"
        });
      }
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!pseudo || !email || !password) return;
    
    setLoading(true);
    try {
      const { error } = await signUp(email, password, pseudo);
      if (error) {
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Inscription réussie ! 🎉",
          description: "Vérifiez votre email pour confirmer votre compte"
        });
      }
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    // Keep guest functionality as fallback
    if (pseudo.trim()) {
      localStorage.setItem('kiadisa_user', JSON.stringify({
        pseudo: pseudo.trim(),
        isGuest: true,
        avatar: '🎮'
      }));
      navigate('/dashboard');
    }
  };

  const getRandomAvatar = () => {
    const avatars = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎸', '🎺'];
    return avatars[Math.floor(Math.random() * avatars.length)];
  };

  if (authLoading) {
    return (
      <AnimatedBackground variant="auth">
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <GlassCard className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
            <p className="text-white">Chargement...</p>
          </GlassCard>
        </div>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground variant="auth">
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8 animate-bounce-in">
            <h1 className="text-4xl font-poppins font-bold text-white mb-2">
              Rejoins KIADISA
            </h1>
            <p className="text-white/80 font-inter">
              Connecte-toi pour jouer avec tes amis !
            </p>
          </div>

          {/* Auth Form */}
          <GlassCard className="animate-slide-up">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-3 glass-card border-white/20">
                <TabsTrigger value="signin" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
                  Connexion
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
                  Inscription
                </TabsTrigger>
                <TabsTrigger value="guest" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
                  Invité
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-white font-inter">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-600 z-10" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="ton.email@example.com"
                      className="pl-10 bg-white/95 border-white/50 text-gray-900 placeholder:text-gray-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-white font-inter">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-600 z-10" />
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-white/95 border-white/50 text-gray-900 placeholder:text-gray-500"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleSignIn}
                  disabled={!email || !password || loading}
                  className="w-full glass-button text-white border-white/30 hover:bg-white/20"
                >
                  {loading ? (
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  ) : (
                    <User className="mr-2 w-4 h-4" />
                  )}
                  Se connecter
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="signup-pseudo" className="text-white font-inter">Pseudo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-600 z-10" />
                    <Input
                      id="signup-pseudo"
                      placeholder="TonPseudo"
                      className="pl-10 bg-white/95 border-white/50 text-gray-900 placeholder:text-gray-500"
                      value={pseudo}
                      onChange={(e) => setPseudo(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-white font-inter">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-600 z-10" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="ton.email@example.com"
                      className="pl-10 bg-white/95 border-white/50 text-gray-900 placeholder:text-gray-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-white font-inter">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-600 z-10" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-white/95 border-white/50 text-gray-900 placeholder:text-gray-500"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      onKeyPress={(e) => e.key === 'Enter' && handleSignUp()}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleSignUp}
                  disabled={!pseudo || !email || !password || loading}
                  className="w-full glass-button text-white border-white/30 hover:bg-white/20"
                >
                  {loading ? (
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="mr-2 w-4 h-4" />
                  )}
                  Créer mon compte
                </Button>
              </TabsContent>

              <TabsContent value="guest" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="guest-pseudo" className="text-white font-inter">Pseudo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-600 z-10" />
                    <Input
                      id="guest-pseudo"
                      placeholder="TonPseudo"
                      className="pl-10 bg-white/95 border-white/50 text-gray-900 placeholder:text-gray-500"
                      value={pseudo}
                      onChange={(e) => setPseudo(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="glass-card bg-yellow-500/20 border-yellow-300/30 p-3 rounded-2xl">
                  <p className="text-yellow-100 text-sm font-inter text-center">
                    🔒 Tes stats ne seront pas sauvegardées
                  </p>
                </div>
                <Button 
                  onClick={handleGuest}
                  className="w-full glass-button text-white border-white/30 hover:bg-white/20"
                  disabled={!pseudo.trim()}
                >
                  <span className="mr-2">{getRandomAvatar()}</span>
                  Jouer en invité
                </Button>
              </TabsContent>
            </Tabs>
          </GlassCard>

          {/* Back Button */}
          <div className="text-center mt-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              ← Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default Auth;
