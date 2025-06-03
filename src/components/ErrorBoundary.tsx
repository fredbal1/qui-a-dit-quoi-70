
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/GlassCard';
import AnimatedBackground from '@/components/AnimatedBackground';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[KIADISA ErrorBoundary]', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log to monitoring service in production
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(error, {
    //     contexts: { errorBoundary: errorInfo }
    //   });
    // }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <AnimatedBackground variant="game">
          <div className="min-h-screen flex items-center justify-center p-4">
            <GlassCard className="text-center max-w-md">
              <div className="text-6xl mb-4 animate-bounce">😵</div>
              <div className="flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400 mr-2" />
                <h2 className="text-xl font-poppins font-bold text-white">
                  Oups ! Une erreur s'est produite
                </h2>
              </div>
              <p className="text-white/80 font-inter mb-6">
                Ne vous inquiétez pas, notre équipe a été notifiée. 
                Vous pouvez essayer de recharger la page ou retourner à l'accueil.
              </p>
              
              <div className="space-y-3">
                <Button
                  onClick={this.handleReload}
                  className="w-full glass-button text-white border-white/30 hover:bg-white/20"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recharger la page
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="ghost"
                  className="w-full text-white hover:bg-white/10"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Retour à l'accueil
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="text-white/60 cursor-pointer text-sm">
                    Détails techniques (dev)
                  </summary>
                  <pre className="text-xs text-red-300 bg-red-900/20 p-2 rounded mt-2 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </GlassCard>
          </div>
        </AnimatedBackground>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
