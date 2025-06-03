
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface AppErrorEvent {
  type: 'game_action' | 'realtime' | 'auth' | 'network' | 'ui';
  message: string;
  context?: Record<string, any>;
  timestamp: string;
  userId?: string;
}

export const useErrorMonitoring = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const logError = (error: AppErrorEvent) => {
    // Enhanced error logging with user context
    const errorWithContext = {
      ...error,
      userId: user?.id || 'anonymous',
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('[KIADISA Error]', errorWithContext);

    // Dans un environnement de production, envoyer à Sentry ou LogSnag
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(new Error(error.message), {
    //     tags: { type: error.type, userId: user?.id },
    //     extra: error.context
    //   });
    // }

    // Smart user notifications based on error type
    switch (error.type) {
      case 'network':
        toast({
          title: "🌐 Problème de connexion",
          description: "Vérifiez votre connexion internet et réessayez",
          variant: "destructive"
        });
        break;
      case 'game_action':
        toast({
          title: "🎮 Action impossible",
          description: error.message,
          variant: "destructive"
        });
        break;
      case 'auth':
        toast({
          title: "🔐 Problème d'authentification",
          description: "Veuillez vous reconnecter",
          variant: "destructive"
        });
        break;
      case 'realtime':
        toast({
          title: "📡 Connexion temps réel interrompue",
          description: "Reconnexion en cours...",
          variant: "destructive"
        });
        break;
      default:
        toast({
          title: "⚠️ Une erreur s'est produite",
          description: "Notre équipe a été notifiée",
          variant: "destructive"
        });
    }
  };

  const logEvent = (eventType: string, data?: Record<string, any>) => {
    const event = {
      type: eventType,
      data,
      timestamp: new Date().toISOString(),
      userId: user?.id || 'anonymous',
      sessionId: sessionStorage.getItem('session_id') || 'unknown'
    };

    console.log('[KIADISA Event]', event);

    // Dans un environnement de production :
    // LogSnag.track({
    //   channel: 'game-events',
    //   event: eventType,
    //   description: `User performed ${eventType}`,
    //   icon: '🎮',
    //   notify: false,
    //   tags: { ...data, userId: user?.id }
    // });
  };

  const logGameAction = (action: string, gameId?: string, success?: boolean) => {
    logEvent('game_action', {
      action,
      gameId,
      success,
      timestamp: new Date().toISOString()
    });
  };

  useEffect(() => {
    // Generate session ID for tracking
    if (!sessionStorage.getItem('session_id')) {
      sessionStorage.setItem('session_id', Math.random().toString(36).substring(7));
    }

    // Capturer les erreurs JavaScript non gérées
    const handleError = (event: ErrorEvent) => {
      logError({
        type: 'ui',
        message: event.message || 'Erreur JavaScript inconnue',
        context: { 
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        },
        timestamp: new Date().toISOString()
      });
    };

    // Capturer les promesses rejetées non gérées
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logError({
        type: 'network',
        message: 'Promise rejetée non gérée',
        context: { 
          reason: event.reason,
          stack: event.reason?.stack
        },
        timestamp: new Date().toISOString()
      });
    };

    // Capturer les erreurs de chargement de ressources
    const handleResourceError = (event: Event) => {
      const target = event.target as HTMLElement;
      logError({
        type: 'network',
        message: 'Échec de chargement de ressource',
        context: {
          tagName: target?.tagName,
          src: (target as any)?.src || (target as any)?.href
        },
        timestamp: new Date().toISOString()
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    document.addEventListener('error', handleResourceError, true);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      document.removeEventListener('error', handleResourceError, true);
    };
  }, [user?.id]);

  return { logError, logEvent, logGameAction };
};
