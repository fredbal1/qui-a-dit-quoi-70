
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerStats } from '@/hooks/usePlayerStats';
import AnimatedBackground from '@/components/AnimatedBackground';
import GlassCard from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Gamepad2, 
  UserPlus, 
  ShoppingBag, 
  BarChart3, 
  Settings, 
  Lightbulb,
  LogOut,
  Crown,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { stats, loading: statsLoading } = usePlayerStats();
  const { toast } = useToast();
  const [currentTip, setCurrentTip] = useState(0);

  const tips = [
    "💡 Bluffer avec subtilité te fera gagner plus de points !",
    "🎯 Observe bien les réactions de tes amis pendant les révélations",
    "🏆 Plus tu joues, plus tu débloques d'avatars et de titres",
    "🤝 Invite tes amis pour des parties encore plus fun !",
    "🎲 Chaque mini-jeu a sa stratégie, maîtrise-les tous !"
  ];

  useEffect(() => {
    // Redirect to auth if not authenticated
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    // Rotate tips every 5 seconds
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [navigate, user, authLoading]);

  const handleLogout = async () => {
    try {
      await signOut();
      // Clear any guest data as well
      localStorage.removeItem('kiadisa_user');
      navigate('/');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de se déconnecter",
        variant: "destructive"
      });
    }
  };

  // Show loading while auth or stats are loading
  if (authLoading || statsLoading) {
    return (
      <AnimatedBackground variant="dashboard">
        <div className="min-h-screen flex items-center justify-center p-4">
          <GlassCard className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
            <p className="text-white">Chargement de votre profil...</p>
          </GlassCard>
        </div>
      </AnimatedBackground>
    );
  }

  // Return early if no user
  if (!user) return null;

  // Get user data from localStorage as fallback for guests
  const guestData = localStorage.getItem('kiadisa_user');
  const isGuest = !user && guestData;
  const userData = isGuest ? JSON.parse(guestData) : null;

  // Use stats from Supabase or fallback to defaults
  const userLevel = stats?.level || 1;
  const userXP = stats?.total_xp || 0;
  const userCoins = stats?.coins || 0;
  const userPseudo = user?.user_metadata?.pseudo || userData?.pseudo || user?.email?.split('@')[0] || 'Joueur';
  const userAvatar = user?.user_metadata?.avatar || userData?.avatar || '🎮';
  
  const xpToNextLevel = userLevel * 200; // Simple formula
  const xpProgress = Math.min((userXP / xpToNextLevel) * 100, 100);

  const actions = [
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: "Créer une partie",
      description: "Lance un nouveau jeu",
      action: () => navigate('/create'),
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <UserPlus className="w-8 h-8" />,
      title: "Rejoindre",
      description: "Rejoins tes amis",
      action: () => navigate('/join'),
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: "Boutique",
      description: "Avatars & titres",
      action: () => {
        toast({
          title: "Bientôt disponible ! 🚧",
          description: "La boutique arrive dans une prochaine mise à jour",
        });
      },
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Stats",
      description: "Tes performances",
      action: () => {
        toast({
          title: "Statistiques 📊",
          description: `Niveau ${userLevel} • ${userXP} XP • ${userCoins} pièces`,
        });
      },
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "Réglages",
      description: "Personnalise ton jeu",
      action: () => {
        toast({
          title: "Bientôt disponible ! ⚙️",
          description: "Les réglages arrivent dans une prochaine mise à jour",
        });
      },
      color: "from-slate-500 to-gray-500"
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Aide",
      description: "Règles du jeu",
      action: () => {
        toast({
          title: "Aide & Règles 📖",
          description: "Consultez les règles dans les paramètres",
        });
      },
      color: "from-yellow-500 to-amber-500"
    }
  ];

  return (
    <AnimatedBackground variant="dashboard">
      <div className="min-h-screen p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4">
            <div className="text-4xl animate-bounce">{userAvatar}</div>
            <div>
              <h1 className="text-2xl font-poppins font-bold text-white flex items-center">
                {userPseudo}
                {userLevel >= 10 && <Crown className="ml-2 w-5 h-5 text-yellow-300" />}
              </h1>
              <p className="text-white/80 font-inter">
                {isGuest ? 'Joueur Invité' : 'Maître du Bluff'} • Niveau {userLevel}
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* XP Progress */}
        <GlassCard className="mb-6 animate-slide-up">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-inter font-medium">Expérience</span>
            <span className="text-white/80 text-sm">{userXP} / {xpToNextLevel} XP</span>
          </div>
          <Progress value={xpProgress} className="h-3 bg-white/20" />
        </GlassCard>

        {/* Actions Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {actions.map((action, index) => (
            <GlassCard
              key={index}
              hover
              onClick={action.action}
              className="text-center cursor-pointer animate-bounce-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`mx-auto mb-3 w-12 h-12 rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center text-white`}>
                {action.icon}
              </div>
              <h3 className="font-poppins font-semibold text-white mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-white/80 font-inter">
                {action.description}
              </p>
            </GlassCard>
          ))}
        </div>

        {/* Rotating Tips */}
        <GlassCard className="animate-pulse-glow">
          <div className="flex items-center space-x-3">
            <Lightbulb className="w-6 h-6 text-yellow-300 flex-shrink-0 animate-pulse" />
            <p className="text-white font-inter text-sm leading-relaxed">
              {tips[currentTip]}
            </p>
          </div>
        </GlassCard>

        {/* Guest Warning */}
        {isGuest && (
          <GlassCard className="mt-4 bg-yellow-500/20 border-yellow-300/30">
            <div className="text-center">
              <p className="text-yellow-100 text-sm font-inter mb-2">
                🔒 Mode invité : tes stats ne sont pas sauvegardées
              </p>
              <Button
                onClick={() => navigate('/auth')}
                className="bg-white/20 border-white/50 text-white hover:bg-white/30 text-xs px-4 py-1"
              >
                Créer un compte
              </Button>
            </div>
          </GlassCard>
        )}
      </div>
    </AnimatedBackground>
  );
};

export default Dashboard;
