import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, AlertCircle } from 'lucide-react';

const CORRECT_PASSWORD = 'ACI-AMOS-2026';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === CORRECT_PASSWORD) {
      // Store authentication in sessionStorage
      sessionStorage.setItem('amos-authenticated', 'true');
      onLogin();
    } else {
      setError(true);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 p-8">
        {/* Logo */}
        <div className="flex items-center justify-center">
          <img 
            src="/images/image.png" 
            alt="Logo" 
            className="h-24 object-contain drop-shadow-2xl"
          />
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            MIS Migration Project
          </h1>
          <p className="text-slate-400 text-sm">
            Plateforme de gestion de projet
          </p>
        </div>

        {/* Login Form */}
        <form 
          onSubmit={handleSubmit}
          className={`w-full max-w-sm space-y-4 ${isShaking ? 'animate-shake' : ''}`}
        >
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-slate-300 mb-2">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">Accès sécurisé</span>
            </div>

            <div className="space-y-2">
              <Input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Mot de passe"
                className={`h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 ${
                  error ? 'border-red-500 focus:border-red-500' : ''
                }`}
                autoFocus
              />
              
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Mot de passe incorrect</span>
                </div>
              )}
            </div>

            <Button 
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              Accéder à l'application
            </Button>
          </div>
        </form>

        {/* Footer */}
        <p className="text-slate-500 text-xs">
          © 2026 ACI Aviation - Tous droits réservés
        </p>
      </div>

      {/* Shake animation style */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};
