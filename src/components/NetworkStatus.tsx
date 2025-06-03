
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useErrorMonitoring } from '@/hooks/useErrorMonitoring';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showAlert, setShowAlert] = useState(false);
  const { logError } = useErrorMonitoring();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowAlert(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowAlert(true);
      logError({
        type: 'network',
        message: 'Connexion internet perdue',
        timestamp: new Date().toISOString()
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Auto-hide alert after being back online
    if (isOnline && showAlert) {
      const timer = setTimeout(() => setShowAlert(false), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline, showAlert, logError]);

  if (!showAlert && isOnline) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Alert variant={isOnline ? "default" : "destructive"} className="glass-card border-red-500/30">
        <div className="flex items-center">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-400" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-400" />
          )}
          <AlertDescription className="ml-2 text-white">
            {isOnline 
              ? "🎉 Connexion rétablie !" 
              : "📡 Pas de connexion internet"
            }
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
};

export default NetworkStatus;
