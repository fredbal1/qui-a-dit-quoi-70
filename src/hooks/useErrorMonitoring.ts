
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface AppErrorEvent {
  type: 'game_action' | 'realtime' | 'auth' | 'network' | 'ui' | 'performance';
  message: string;
  context?: Record<string, any>;
  timestamp: string;
  userId?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  apiResponseTime: number;
  errorRate: number;
}

export const useErrorMonitoring = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const logError = (error: AppErrorEvent) => {
    const errorWithContext = {
      ...error,
      userId: user?.id || 'anonymous',
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timestamp: error.timestamp || new Date().toISOString(),
      severity: error.severity || 'medium'
    };

    console.error('[KIADISA Error]', errorWithContext);

    // Stockage local pour statistiques
    const errors = JSON.parse(localStorage.getItem('kiadisa_errors') || '[]');
    errors.push(errorWithContext);
    
    // Garder seulement les 50 dernières erreurs
    if (errors.length > 50) {
      errors.splice(0, errors.length - 50);
    }
    
    localStorage.setItem('kiadisa_errors', JSON.stringify(errors));

    // Notifications utilisateur intelligentes
    switch (error.type) {
      case 'network':
        if (error.severity === 'critical') {
          toast({
            title: "🌐 Connexion perdue",
            description: "Reconnexion automatique en cours...",
            variant: "destructive"
          });
        }
        break;
      case 'game_action':
        if (error.severity !== 'low') {
          toast({
            title: "🎮 Action échouée",
            description: error.message,
            variant: "destructive"
          });
        }
        break;
      case 'auth':
        toast({
          title: "🔐 Session expirée",
          description: "Veuillez vous reconnecter",
          variant: "destructive"
        });
        break;
      case 'performance':
        if (error.severity === 'high') {
          console.warn('[Performance] Dégradation détectée:', error.context);
        }
        break;
      default:
        if (error.severity === 'critical') {
          toast({
            title: "⚠️ Erreur critique",
            description: "Notre équipe a été notifiée",
            variant: "destructive"
          });
        }
    }

    // En production, envoyer à un service de monitoring
    if (process.env.NODE_ENV === 'production') {
      // Intégration Sentry future
      // Sentry.captureException(new Error(error.message), {
      //   tags: { type: error.type, severity: error.severity },
      //   extra: error.context,
      //   user: { id: user?.id }
      // });
    }
  };

  const logEvent = (eventType: string, data?: Record<string, any>) => {
    const event = {
      type: eventType,
      data,
      timestamp: new Date().toISOString(),
      userId: user?.id || 'anonymous',
      sessionId: sessionStorage.getItem('session_id') || 'unknown',
      page: window.location.pathname
    };

    console.log('[KIADISA Event]', event);

    // Stockage pour analytics
    const events = JSON.parse(localStorage.getItem('kiadisa_events') || '[]');
    events.push(event);
    
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }
    
    localStorage.setItem('kiadisa_events', JSON.stringify(events));
  };

  const logGameAction = (action: string, gameId?: string, success?: boolean) => {
    logEvent('game_action', {
      action,
      gameId,
      success,
      timestamp: new Date().toISOString()
    });
  };

  const logPerformance = (metrics: Partial<PerformanceMetrics>) => {
    const performanceEvent: AppErrorEvent = {
      type: 'performance',
      message: 'Performance metrics',
      context: metrics,
      timestamp: new Date().toISOString(),
      severity: 'low'
    };

    // Alerter si les métriques sont dégradées
    if (metrics.loadTime && metrics.loadTime > 3000) {
      performanceEvent.severity = 'high';
      performanceEvent.message = 'Temps de chargement élevé';
    }

    if (metrics.errorRate && metrics.errorRate > 0.1) {
      performanceEvent.severity = 'high';
      performanceEvent.message = 'Taux d\'erreur élevé';
    }

    logError(performanceEvent);
  };

  const getErrorStats = () => {
    const errors = JSON.parse(localStorage.getItem('kiadisa_errors') || '[]');
    const events = JSON.parse(localStorage.getItem('kiadisa_events') || '[]');
    
    return {
      totalErrors: errors.length,
      errorsByType: errors.reduce((acc: any, error: any) => {
        acc[error.type] = (acc[error.type] || 0) + 1;
        return acc;
      }, {}),
      totalEvents: events.length,
      lastErrors: errors.slice(-10)
    };
  };

  useEffect(() => {
    // Générer un ID de session pour le suivi
    if (!sessionStorage.getItem('session_id')) {
      sessionStorage.setItem('session_id', Math.random().toString(36).substring(7));
    }

    // Mesurer les performances de chargement
    const measureLoadTime = () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      if (loadTime > 0) {
        logPerformance({ loadTime });
      }
    };

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
        timestamp: new Date().toISOString(),
        severity: 'high'
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
        timestamp: new Date().toISOString(),
        severity: 'medium'
      });
    };

    // Mesurer les performances de rendu
    const measureRenderTime = () => {
      const entries = performance.getEntriesByType('measure');
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        logPerformance({ renderTime: lastEntry.duration });
      }
    };

    window.addEventListener('load', measureLoadTime);
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Mesurer périodiquement les performances
    const performanceInterval = setInterval(measureRenderTime, 30000);

    return () => {
      window.removeEventListener('load', measureLoadTime);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      clearInterval(performanceInterval);
    };
  }, [user?.id]);

  return { 
    logError, 
    logEvent, 
    logGameAction, 
    logPerformance, 
    getErrorStats 
  };
};
