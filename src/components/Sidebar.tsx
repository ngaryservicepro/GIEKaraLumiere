/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BarChart, 
  Users, 
  Home, 
  Shield, 
  Calendar, 
  Coins, 
  Layers, 
  Wallet, 
  FolderOpen, 
  Briefcase, 
  Bell, 
  Award, 
  Sun, 
  Moon, 
  Lock,
  Compass,
  ChevronsLeft,
  Menu
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUserRole: UserRole;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  alertsCount: number;
  isMobileOpen?: boolean;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentUserRole,
  isDarkMode,
  setIsDarkMode,
  alertsCount,
  isMobileOpen = false
}: SidebarProps) {
  
  // Navigation Menu definition with corresponding icon and minimum role requirements
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: BarChart },
    { id: 'members', label: 'Gestion Membres', icon: Users },
    { id: 'clubs', label: 'Clubs Affiliés', icon: Home },
    { id: 'leagues', label: 'Ligues Régionales', icon: Compass },
    { id: 'executive', label: 'Bureau Exécutif', icon: Award },
    { id: 'meetings', label: 'Réunions & PV', icon: Calendar },
    { id: 'activities', label: 'Activités GIE', icon: Layers },
    { id: 'cotisations', label: 'Cotisations', icon: Coins },
    { id: 'accounting', label: 'Comptabilité', icon: Layers },
    { id: 'treasury', label: 'Trésorerie', icon: Wallet },
    { id: 'documents', label: 'Archivage Sec', icon: FolderOpen },
    { id: 'rh', label: 'Ressources Humaines', icon: Briefcase },
    { id: 'alerts', label: 'Alertes', icon: Bell, badge: alertsCount > 0 ? alertsCount : undefined },
    { id: 'security', label: 'Sécurité & Droits', icon: Shield },
  ];

  return (
    <aside 
      className={`w-64 bg-[#173C4A] text-white flex flex-col justify-between border-r border-[#22B8A7]/20 flex-shrink-0 h-screen fixed top-0 z-50 shadow-2xl transition-all duration-300 ease-in-out print:hidden overflow-y-auto ${isMobileOpen ? 'left-0' : '-left-64 lg:left-0'}`}
      id="main-sidebar"
    >
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#22B8A7]/10 flex flex-col items-center text-center space-y-2 bg-[#0e252e]">
          <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center border border-[#22B8A7] shadow-[0_0_15px_rgba(34,184,167,0.3)] mb-1 transition-transform hover:scale-105 duration-300 overflow-hidden">
            <img 
              src="/src/assets/images/gie_logo_1781655966296.jpg" 
              alt="Logo GIE 221 Lumière" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-xs tracking-wider uppercase text-white">GIE 221 Lumière</h2>
            <p className="text-[9px] text-[#22B8A7] font-semibold tracking-widest font-mono mt-0.5">PORTAIL DE GESTION</p>
          </div>
        </div>

        {/* Dynamic Navigation list */}
        <nav className="p-3.5 space-y-1.5 overflow-y-auto flex-1 max-h-[calc(100vh-230px)]">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold rounded-lg transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#22B8A7] text-white shadow-[0_4px_12px_rgba(34,184,167,0.25)] scale-[1.02] border-l-4 border-white' 
                    : 'text-gray-300 hover:bg-[#204a5a]/60 hover:text-white hover:translate-x-1'
                }`}
                id={`btn-nav-${item.id}`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 flex-shrink-0 transition-transform ${isActive ? 'scale-110 opacity-100 text-white' : 'opacity-70 group-hover:opacity-100'}`} />
                  <span className="truncate max-w-[130px] font-sans tracking-wide">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="bg-rose-500 text-white font-extrabold font-mono text-[9px] px-1.5 py-0.2 rounded-full shadow-xs">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Role details & Theme Switcher on Bottom */}
      <div className="p-4 border-t border-[#22B8A7]/10 bg-[#0c222a] space-y-3">
        
        {/* Dynamic Logged in User state with role */}
        <div className="flex items-center gap-2.5 p-2.5 bg-[#173C4A]/40 rounded-xl border border-[#22B8A7]/10 shadow-inner">
          <div className="w-8 h-8 rounded-lg bg-[#22B8A7] flex items-center justify-center font-display font-extrabold text-sm text-white shadow-xs">
            {currentUserRole.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-[#22B8A7] font-bold uppercase tracking-widest font-mono">Périmètre Mandat</p>
            <p className="text-[11px] font-display font-bold text-white truncate max-w-[125px]">{currentUserRole}</p>
          </div>
        </div>

        {/* Theme and system utilities */}
        <div className="flex items-center justify-between text-gray-400 text-[10px]">
          <span className="font-mono text-gray-500 font-semibold tracking-wide">V0.9.4 Beta</span>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1.5 hover:bg-[#173C4A] hover:text-white rounded-lg transition-all duration-300 hover:scale-105"
            title={isDarkMode ? "Passer au Mode Clair" : "Passer au Mode Sombre"}
            id="btn-toggle-dark-sidebar"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
