
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateGame from "./pages/CreateGame";
import JoinGame from "./pages/JoinGame";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requireAuth={false}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create" 
            element={
              <ProtectedRoute requireAuth={false}>
                <CreateGame />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/join" 
            element={
              <ProtectedRoute requireAuth={false}>
                <JoinGame />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lobby/:gameId" 
            element={
              <ProtectedRoute requireAuth={false}>
                <Lobby />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/game/:gameId" 
            element={
              <ProtectedRoute requireAuth={false}>
                <Game />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
