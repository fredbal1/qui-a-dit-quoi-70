
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorFallback from './ErrorFallback';

interface NetworkErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<any>;
}

interface NetworkErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class NetworkErrorBoundary extends React.Component<
  NetworkErrorBoundaryProps,
  NetworkErrorBoundaryState
> {
  constructor(props: NetworkErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): NetworkErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Network Error Boundary caught an error:', error, errorInfo);
    
    // Log to external service if available
    if (error.message.includes('NetworkError') || 
        error.message.includes('fetch') ||
        error.message.includes('supabase')) {
      console.error('Network/Supabase error detected:', error);
    }
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || ErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error?.message || "Erreur de connexion réseau"}
          onRetry={() => {
            this.setState({ hasError: false, error: undefined });
            window.location.reload();
          }}
        />
      );
    }

    return this.props.children;
  }
}

export default NetworkErrorBoundary;
