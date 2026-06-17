/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, User, Key, CheckCircle, Smartphone, Award, RefreshCw, Database, Download, Upload, Info, AlertTriangle } from 'lucide-react';
import { UserRole } from '../types';

interface SecurityViewProps {
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
  isDarkMode: boolean;
  onSeedDemoData: () => void;
  onClearDemoData: () => void;
  onRestoreDatabase: (data: any) => void;
  databaseBackup: any;
  databaseStats: {
    membersCount: number;
    clubsCount: number;
    leaguesCount: number;
    contributionsCount: number;
    journalCount: number;
    employeesCount: number;
    documentsCount: number;
  };
}

export default function SecurityView({
  currentUserRole,
  setCurrentUserRole,
  isDarkMode,
  onSeedDemoData,
  onClearDemoData,
  onRestoreDatabase,
  databaseBackup,
  databaseStats
}: SecurityViewProps) {
  
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [email, setEmail] = useState('ngaryservicepro@gmail.com');
  const [showNotification, setShowNotification] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  // List of roles
  const roles: UserRole[] = [
    'Super Administrateur',
    'Président',
    'Secrétaire Général',
    'Trésorier',
    'Responsable Musicale',
    'Membre'
  ];

  const handleRoleToggle = (role: UserRole) => {
    setCurrentUserRole(role);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 2500);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'Super Administrateur': return 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 border-red-200';
      case 'Président': return 'bg-[#173C4A]/10 text-[#173C4A] dark:bg-[#173C4A]/25 dark:text-gray-200 border-[#173C4A]/30';
      case 'Secrétaire Général': return 'bg-[#22B8A7]/10 text-[#22B8A7] border-[#22B8A7]/30';
      case 'Trésorier': return 'bg-amber-100 text-amber-850 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200';
      case 'Responsable Musicale': return 'bg-pink-100 text-pink-850 dark:bg-pink-950/40 dark:text-pink-300 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200';
    }
  };

  const handleJsonExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(databaseBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `gie_kara_lumiere_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        // Simple verification that the backup contains target keys
        if (!json.members && !json.clubs && !json.leagues && !json.contributions) {
          throw new Error("Format invalide. Le fichier doit être une sauvegarde valide du GIE 221 Lumière.");
        }

        onRestoreDatabase(json);
        setImportSuccess(true);
        setImportError(null);
        setTimeout(() => setImportSuccess(false), 3000);
      } catch (err: any) {
        setImportError(err.message || "Fichier JSON corrompu ou invalide.");
        setImportSuccess(false);
      }
    };
    reader.readAsText(file);
  };

  const headingClass = isDarkMode ? 'text-white' : 'text-[#173C4A]';
  const cardBgClass = isDarkMode ? 'bg-[#122e38] border-gray-700' : 'bg-white border-gray-100';
  const textClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className={`text-2xl font-bold tracking-tight ${headingClass}`}>Sécurité & Rôles d'Accès</h1>
        <p className={`text-sm ${textClass}`}>
          Configurer les autorisations RBAC (Role-Based Access Control) et simuler la double-authentification administrative (2FA).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ROLE switcher panel (2/3 of screen) */}
        <div className={`p-6 rounded-xl border ${cardBgClass} md:col-span-2 space-y-6`}>
          <div>
            <h3 className={`font-bold text-base ${headingClass}`}>Sélecteur Dynamique de Rôle</h3>
            <p className="text-xs text-gray-400 mt-1">
              Basculez entre les différents profils hiérarchiques de la plateforme pour tester instantanément la modulation des droits opérationnels (Lecture, Écriture, Signature électronique).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {roles.map(role => (
              <div 
                key={role}
                onClick={() => handleRoleToggle(role)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  currentUserRole === role 
                    ? 'border-[#22B8A7] bg-[#22B8A7]/5' 
                    : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    currentUserRole === role ? 'bg-[#22B8A7]/20 text-[#22B8A7]' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}>
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-bold ${headingClass}`}>{role}</p>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">
                      {role === 'Super Administrateur' ? 'Accès illimité' :
                       role === 'Président' ? 'Accès global + Signature' :
                       role === 'Secrétaire Général' ? 'Fiches administratives' :
                       role === 'Trésorier' ? 'Mouvements comptables' :
                       role === 'Responsable Musicale' ? 'Agenda culturel' :
                       'Consultation seule'}
                    </p>
                  </div>
                </div>
                {currentUserRole === role && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22B8A7]" />
                )}
              </div>
            ))}
          </div>

          {showNotification && (
            <div className="p-3 bg-emerald-150 bg-emerald-50 dark:bg-[#132e29] border border-emerald-300 dark:border-emerald-800/40 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>Droits d'accès actualisés au mandat de <strong>{currentUserRole}</strong>. Le menu latéral s'est modulé.</span>
            </div>
          )}
        </div>

        {/* CONTROLS PROFILE & 2FA PANEL (1/3 of screen) */}
        <div className="space-y-6">
          <div className={`p-6 rounded-xl border ${cardBgClass} space-y-4`}>
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#22B8A7]" />
              <h3 className={`font-bold text-sm ${headingClass}`}>Double Authentification (2FA)</h3>
            </div>
            
            <p className="text-xs text-gray-400">
              Associer un numéro de mobile sénégalais pour intercepter les codes de retrait de fonds ou d'écriture comptable critique.
            </p>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-850 rounded-lg border">
              <span className="text-xs font-semibold text-gray-500">Statut 2FA</span>
              <button
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full transition-colors ${
                  twoFactorEnabled 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                    : 'bg-gray-100 text-gray-500 border-gray-300'
                }`}
              >
                {twoFactorEnabled ? 'Activé' : 'Désactivé'}
              </button>
            </div>
          </div>

          {/* DATABASE STACK BACKUP & PERSISTENCE - PORTING sama-gestion.ngary.com */}
          <div className={`p-6 rounded-xl border ${cardBgClass} space-y-4`}>
            <div className="flex items-center gap-2 text-[#22B8A7]">
              <Database className="w-5 h-5" />
              <h3 className={`font-bold text-sm ${headingClass}`}>Mémoire & Sauvegarde Globale</h3>
            </div>
            <p className="text-xs text-gray-400">
              Téléchargez l'intégralité de la base de données en format JSON pour la restaurer ultérieurement, à l'identique de notre outil de synchronisation.
            </p>

            <div className="p-3 bg-[#122e38] dark:bg-black/20 rounded-lg text-xs space-y-2 text-gray-400">
              <div className="font-semibold text-xs border-b border-gray-700 pb-1 text-white uppercase tracking-wider">État actuel du GIE :</div>
              <div className="flex justify-between">
                <span>Adhérents enregistrés :</span>
                <span className="font-bold text-white">{databaseStats.membersCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Cotisations perçues :</span>
                <span className="font-bold text-white">{databaseStats.contributionsCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Journaux Comptables :</span>
                <span className="font-bold text-white">{databaseStats.journalCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Clubs artistiques :</span>
                <span className="font-bold text-white">{databaseStats.clubsCount}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={handleJsonExport}
                className="py-2.5 px-3 bg-[#173C4A] hover:bg-[#12303c] text-white rounded-lg font-bold text-[10px] uppercase flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Exporter (.json)
              </button>

              <label className="py-2.5 px-3 bg-[#22B8A7]/10 hover:bg-[#22B8A7]/25 text-[#22B8A7] border border-[#22B8A7]/30 rounded-lg font-bold text-[10px] uppercase flex items-center justify-center gap-1 cursor-pointer transition-colors text-center">
                <Upload className="w-3.5 h-3.5" /> Importer
                <input
                  type="file"
                  accept=".json"
                  onChange={handleJsonImport}
                  className="hidden"
                />
              </label>
            </div>

            {importSuccess && (
              <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded text-[10px] font-medium flex items-center gap-1.5 animate-pulse">
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Base restituée et consolidée !</span>
              </div>
            )}

            {importError && (
              <div className="p-2 bg-red-500/15 border border-red-500/30 text-red-400 rounded text-[10px] font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{importError}</span>
              </div>
            )}
          </div>

          {/* TESTING SEED HELPER */}
          <div className={`p-6 border border-[#22B8A7]/30 bg-slate-900/60 dark:bg-black/40 text-white rounded-xl space-y-4 shadow-xs`}>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-[#22B8A7] animate-spin" style={{ animationDuration: '10s' }} />
              <h3 className="font-bold text-sm text-[#22B8A7]">Zone d'Évaluation de Démo</h3>
            </div>

            <p className="text-[11px] text-gray-300">
              Conformément à la directive, cette application démarre **strictement vide**. Si vous souhaitez l'évaluer immédiatement sans saisir manuellement les CNI, cliquez sur le bouton ci-dessous pour injecter des fiches de démonstration préremplies.
            </p>

            <button
              onClick={() => {
                onSeedDemoData();
                alert("Données d'évaluation de démonstration injectées avec succès dans le localStorage !");
              }}
              className="w-full py-2 bg-[#22B8A7] hover:bg-[#1ea091] text-white font-semibold rounded text-xs transition-colors cursor-pointer"
              id="btn-seed-data-sec"
            >
              Injecter le Set d'Évaluation GIE
            </button>
            
            <button
              onClick={() => {
                onClearDemoData();
                alert("Base de données réinitialisée à vide !");
              }}
              className="w-full py-2 border border-red-500/50 text-red-400 hover:bg-red-950/20 font-semibold rounded text-xs transition-colors cursor-pointer"
              id="btn-clear-data-sec"
            >
              Remettre à vide (Zéro Donnée)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
