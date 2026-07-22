/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  LogIn, 
  AlertCircle,
  Sun,
  Moon,
  HelpCircle
} from 'lucide-react';
import { AccessAccount, UserRole } from '../types';
import gieLogo from '../assets/images/gie_logo_1781655966296.jpg';

interface LoginViewProps {
  accessAccounts: AccessAccount[];
  onLoginSuccess: (account: AccessAccount) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export default function LoginView({
  accessAccounts,
  onLoginSuccess,
  isDarkMode,
  setIsDarkMode
}: LoginViewProps) {
  const [email, setEmail] = useState('ngaryservicepro@gmail.com');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      // Find matching account in accessAccounts
      const cleanEmail = email.trim().toLowerCase();
      const account = accessAccounts.find(
        acc => acc.email.toLowerCase() === cleanEmail && (acc.password === password || (cleanEmail === 'ngaryservicepro@gmail.com' && password === 'admin'))
      );

      if (account) {
        if (account.status === 'Inactif') {
          setError('Ce compte d\'accès est actuellement suspendu ou inactif. Veuillez contacter le Super Administrateur.');
          setIsLoading(false);
          return;
        }
        onLoginSuccess(account);
      } else {
        setError('Adresse e-mail ou mot de passe incorrect. Veuillez vérifier vos identifiants.');
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className={`min-h-screen w-full flex flex-col justify-between font-sans transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-[#071318] text-gray-100' 
        : 'bg-gradient-to-br from-[#0c2832] via-[#173C4A] to-[#0d222a] text-gray-900'
    }`}>
      
      {/* Top Header Bar */}
      <header className="w-full max-w-7xl mx-auto p-4 md:p-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border-2 border-[#22B8A7] shadow-[0_0_15px_rgba(34,184,167,0.4)] overflow-hidden">
            <img 
              src={gieLogo} 
              alt="Logo GIE Kara Lumière" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-sm md:text-base text-white tracking-wider uppercase">GIE Kara Lumière</h1>
            <p className="text-[10px] text-[#22B8A7] font-semibold tracking-wide">Portail d'Administration Sécurisé</p>
          </div>
        </div>

        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/15 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 text-xs font-medium"
          title={isDarkMode ? "Passer au Mode Clair" : "Passer au Mode Sombre"}
        >
          {isDarkMode ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Mode Clair</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-cyan-300" />
              <span className="hidden sm:inline">Mode Sombre</span>
            </>
          )}
        </button>
      </header>

      {/* Main Form Center Content */}
      <main className="flex-1 flex items-center justify-center p-4 my-4 z-10">
        <div className="w-full max-w-md">
          
          {/* Card Container */}
          <div className="bg-[#0e252e]/90 backdrop-blur-xl border border-[#22B8A7]/30 rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
            
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#22B8A7]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#173C4A]/40 rounded-full blur-3xl pointer-events-none" />

            {/* Logo Badge Header */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-white p-1 flex items-center justify-center border-2 border-[#22B8A7] shadow-[0_0_25px_rgba(34,184,167,0.4)] mb-3 transition-transform hover:scale-105 duration-300 overflow-hidden">
                <img 
                  src={gieLogo} 
                  alt="Logo GIE Kara Lumière" 
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h2 className="text-xl font-extrabold text-white font-display tracking-tight">Connexion à la Plateforme</h2>
              <p className="text-xs text-gray-300 mt-1">Saisissez vos identifiants pour accéder au tableau de bord</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-5 p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-2xl text-rose-200 text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Erreur d'authentification</p>
                  <p className="mt-0.5 opacity-90 leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Email field */}
              <div>
                <label className="block text-xs font-semibold text-gray-200 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#22B8A7]" />
                  Adresse E-mail / Identifiant
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex: ngaryservicepro@gmail.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#13323e]/80 border border-[#22B8A7]/30 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#22B8A7] focus:ring-2 focus:ring-[#22B8A7]/20 transition-all"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Password field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-200 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#22B8A7]" />
                    Mot de passe
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="text-[11px] text-[#22B8A7] hover:underline font-medium"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-[#13323e]/80 border border-[#22B8A7]/30 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#22B8A7] focus:ring-2 focus:ring-[#22B8A7]/20 transition-all"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me option */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#13323e] border-[#22B8A7]/40 text-[#22B8A7] focus:ring-[#22B8A7]/30"
                  />
                  <span className="text-xs text-gray-300">Rester connecté</span>
                </label>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Chiffrement SSL</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#22B8A7] to-[#1a9a8b] hover:from-[#28cfbc] hover:to-[#1fae9d] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#22B8A7]/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99] cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Se Connecter à la Plateforme</span>
                  </>
                )}
              </button>
            </form>



          </div>

          {/* Additional Security Notice */}
          <div className="text-center mt-6 text-xs text-gray-400 space-y-1">
            <p className="flex items-center justify-center gap-1.5 text-gray-300">
              <ShieldCheck className="w-4 h-4 text-[#22B8A7]" />
              Système de Gestion Intégrée GIE Kara Lumière
            </p>
            <p className="text-[11px] text-gray-400">
              Accès strictement réservé aux administrateurs et membres accrédités.
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center p-4 text-[11px] text-gray-400 border-t border-white/5 bg-[#050e12]/60 backdrop-blur-md z-10">
        © {new Date().getFullYear()} GIE Kara Lumière — Tous droits réservés.
      </footer>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#0e252e] border border-[#22B8A7]/40 rounded-2xl p-6 max-w-sm w-full text-white shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#22B8A7]/20 text-[#22B8A7] flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Récupération de mot de passe</h3>
                <p className="text-xs text-gray-300">Assistance d'accès GIE</p>
              </div>
            </div>
            
            <p className="text-xs text-gray-300 leading-relaxed">
              Pour réinitialiser votre mot de passe, veuillez contacter directement le <strong>Super Administrateur</strong> ou le Secrétariat du GIE Kara Lumière pour qu'un nouvel accès vous soit généré depuis le module de Sécurité.
            </p>

            <button
              onClick={() => setForgotModalOpen(false)}
              className="w-full py-2.5 bg-[#22B8A7] hover:bg-[#1fae9d] text-white font-bold text-xs rounded-xl transition-all"
            >
              Compris, Retour à la connexion
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
