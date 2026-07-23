/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Shield, 
  User, 
  Key, 
  CheckCircle, 
  Smartphone, 
  Award, 
  RefreshCw, 
  Database, 
  Download, 
  Upload, 
  Info, 
  AlertTriangle,
  History,
  Lock,
  Plus,
  Trash2,
  Mail,
  Search,
  Eye,
  EyeOff,
  Pencil,
  X,
  Save
} from 'lucide-react';
import { UserRole, AccessAccount, AuditLog } from '../types';

interface SecurityViewProps {
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
  currentUserEmail: string;
  setCurrentUserEmail: (email: string) => void;
  accessAccounts: AccessAccount[];
  setAccessAccounts: React.Dispatch<React.SetStateAction<AccessAccount[]>>;
  auditLogs: AuditLog[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>;
  logAction: (action: string, details: string, status?: 'Succès' | 'Échec') => void;
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
  currentUserEmail,
  setCurrentUserEmail,
  accessAccounts = [],
  setAccessAccounts,
  auditLogs = [],
  setAuditLogs,
  logAction,
  isDarkMode,
  onSeedDemoData,
  onClearDemoData,
  onRestoreDatabase,
  databaseBackup,
  databaseStats
}: SecurityViewProps) {
  
  // Exclusive Master Admin permission check (Ngary Sow / Super Administrateur)
  const isSuperAdmin = currentUserRole === 'Super Administrateur' || currentUserEmail.trim().toLowerCase() === 'ngaryservicepro@gmail.com';

  const [securitySection, setSecuritySection] = useState<'roles' | 'comptes' | 'logs'>('roles');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  // New access account form states
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Membre');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [accSearchTerm, setAccSearchTerm] = useState('');
  const [logSearchTerm, setLogSearchTerm] = useState('');

  // Edit account modal states
  const [editingAccount, setEditingAccount] = useState<AccessAccount | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('Membre');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);

  const handleOpenEdit = (acc: AccessAccount) => {
    if (!isSuperAdmin) {
      alert("Action refusée : Seul le Super Administrateur (Ngary Sow) est autorisé à modifier les accès et à attribuer des pouvoirs aux autres membres.");
      return;
    }
    setEditingAccount(acc);
    setEditFullName(acc.fullName);
    setEditEmail(acc.email);
    setEditRole(acc.role);
    setEditPassword(acc.password || '');
    setShowEditPassword(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    if (!isSuperAdmin) {
      alert("Action refusée : Seul le Super Administrateur (Ngary Sow) a l'exclusivité d'attribuer des pouvoirs et de modifier les identifiants.");
      return;
    }

    const cleanName = editFullName.trim();
    const cleanEmail = editEmail.trim().toLowerCase();
    const cleanPassword = editPassword.trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      alert("Veuillez renseigner tous les champs obligatoires.");
      return;
    }

    const duplicate = accessAccounts.some(
      acc => acc.id !== editingAccount.id && acc.email.trim().toLowerCase() === cleanEmail
    );

    if (duplicate) {
      alert("Un autre compte d'accès utilise déjà cette adresse e-mail.");
      return;
    }

    const updatedAcc: AccessAccount = {
      ...editingAccount,
      fullName: cleanName,
      email: cleanEmail,
      role: editRole,
      password: cleanPassword
    };

    setAccessAccounts(prev => prev.map(a => a.id === editingAccount.id ? updatedAcc : a));

    // If editing currently logged in user account, sync current email and role in active session
    if (editingAccount.email.trim().toLowerCase() === currentUserEmail.trim().toLowerCase()) {
      setCurrentUserEmail(cleanEmail);
      setCurrentUserRole(editRole);
    }

    logAction("Modification de Compte", `Mise à jour de l'accès pour "${cleanName}" (${cleanEmail}) - Rôle: ${editRole}.`, "Succès");
    
    alert(`L'accès et les pouvoirs de ${cleanName} ont été mis à jour avec succès !`);
    setEditingAccount(null);
  };

  const handleExportAccounts = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(accessAccounts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `comptes_acces_gie_kara_lumiere_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    logAction("Exportation des Comptes", "Export de la liste des comptes d'accès sous format JSON.", "Succès");
  };

  const handleImportAccounts = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target?.result as string);
        if (Array.isArray(imported) && imported.length > 0) {
          setAccessAccounts(imported);
          logAction("Importation des Comptes", `Importation réussie de ${imported.length} comptes d'accès depuis un fichier JSON.`, "Succès");
          alert(`Succès ! ${imported.length} comptes d'accès ont été importés et synchronisés avec le serveur.`);
        } else {
          alert("Le fichier JSON sélectionné ne contient pas une liste valide de comptes.");
        }
      } catch (err) {
        alert("Erreur lors de la lecture du fichier JSON. Veuillez vérifier le format du fichier.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const roles: UserRole[] = [
    'Super Administrateur',
    'Président',
    'Secrétaire Général',
    'Trésorier',
    'Responsable Musicale',
    'Membre'
  ];

  const handleRoleToggle = (role: UserRole) => {
    if (!isSuperAdmin) {
      alert("Action refusée : Seul le Super Administrateur (Ngary Sow) a le pouvoir d'attribuer des rôles et de modifier les privilèges d'accès.");
      return;
    }
    setCurrentUserRole(role);
    // Automatically match the simulated login email if it's in access accounts
    const matchingAcc = accessAccounts.find(acc => acc.role === role);
    if (matchingAcc) {
      setCurrentUserEmail(matchingAcc.email);
    }
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 2500);
    logAction("Changement de Rôle Actif", `Super Administrateur a basculé vers le profil de rôle : "${role}".`);
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateAccess = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSuperAdmin) {
      alert("Action refusée : Seul le Super Administrateur (Ngary Sow) est habilité à créer de nouveaux accès et attribuer des pouvoirs aux autres personnes.");
      return;
    }

    const cleanName = newFullName.trim();
    const cleanEmail = newEmail.trim().toLowerCase();
    const cleanPassword = newPassword.trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      alert("Veuillez renseigner tous les champs obligatoires.");
      return;
    }

    if (accessAccounts.some(acc => acc.email.trim().toLowerCase() === cleanEmail)) {
      alert("Un compte avec cette adresse email existe déjà.");
      return;
    }

    const newAcc: AccessAccount = {
      id: 'ACC-' + Math.floor(1000 + Math.random() * 9000),
      fullName: cleanName,
      email: cleanEmail,
      role: newRole,
      password: cleanPassword,
      status: 'Actif'
    };

    setAccessAccounts([...accessAccounts, newAcc]);
    logAction("Création de Compte", `Création de l'accès pour "${cleanName}" (${cleanEmail}) avec le rôle "${newRole}".`, "Succès");
    
    // Reset form
    setNewFullName('');
    setNewEmail('');
    setNewPassword('');
    setNewRole('Membre');
    alert(`Compte d'accès créé avec succès pour ${cleanName} !\n\nIdentifiants de connexion :\n- E-mail : ${cleanEmail}\n- Mot de passe : ${cleanPassword}\n- Rôle attribué : ${newRole}`);
  };

  const handleRevokeAccess = (id: string, name: string, email: string) => {
    if (!isSuperAdmin) {
      alert("Action refusée : Seul le Super Administrateur (Ngary Sow) peut révoquer des accès.");
      return;
    }

    if (email === currentUserEmail) {
      alert("Vous ne pouvez pas révoquer votre propre compte d'accès actuellement connecté.");
      return;
    }
    if (confirm(`Voulez-vous vraiment désactiver les accès de ${name} (${email}) ?`)) {
      setAccessAccounts(accessAccounts.filter(acc => acc.id !== id));
      logAction("Révocation d'Accès", `Suppression définitive du compte de "${name}" (${email}).`, "Succès");
      alert(`Accès désactivé pour ${name}.`);
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
    logAction("Sauvegarde Système", "Exportation complète de la base de données au format JSON.", "Succès");
  };

  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        if (!json.members && !json.clubs && !json.leagues && !json.contributions) {
          throw new Error("Format invalide. Le fichier doit être une sauvegarde valide du GIE Kara Lumière.");
        }

        onRestoreDatabase(json);
        setImportSuccess(true);
        setImportError(null);
        logAction("Restauration Système", "Importation et écrasement réussi de la base de données via fichier JSON.", "Succès");
        setTimeout(() => setImportSuccess(false), 3000);
      } catch (err: any) {
        setImportError(err.message || "Fichier JSON corrompu ou invalide.");
        setImportSuccess(false);
        logAction("Échec Restauration", "Une tentative d'importation de fichier JSON corrompu a échoué.", "Échec");
      }
    };
    reader.readAsText(file);
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

  const filteredAccounts = accessAccounts.filter(acc => 
    `${acc.fullName} ${acc.email} ${acc.role}`.toLowerCase().includes(accSearchTerm.toLowerCase())
  );

  const filteredLogs = auditLogs.filter(log => 
    `${log.action} ${log.details} ${log.userEmail} ${log.userRole}`.toLowerCase().includes(logSearchTerm.toLowerCase())
  );

  const headingClass = isDarkMode ? 'text-white font-display' : 'text-[#173C4A] font-display';
  const cardBgClass = isDarkMode ? 'bg-[#122e38] border-[#153a47]' : 'bg-white border-gray-100';
  const textClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const inputClass = "w-full p-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#22B8A7] focus:outline-none";

  return (
    <div className="space-y-6">
      {/* Notice Banner for Non-Super Admin */}
      {!isSuperAdmin && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-700/80 rounded-2xl flex items-start gap-3.5 text-amber-900 dark:text-amber-200 text-xs shadow-md">
          <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <p className="font-extrabold text-sm uppercase tracking-wide flex items-center gap-2">
              <span>🔒 Restriction des Pouvoirs - Super Administrateur Exclusif</span>
            </p>
            <p className="mt-1 leading-relaxed">
              Vous êtes actuellement connecté sous le profil <strong>{currentUserRole}</strong> ({currentUserEmail}). Seul le Super Administrateur (<strong>Ngary Sow - ngaryservicepro@gmail.com</strong>) détient le privilège absolu d'attribuer des pouvoirs, de créer des accès et de modifier les rôles ou mots de passe des autres membres du GIE Kara Lumière.
            </p>
          </div>
        </div>
      )}

      <div className="pb-4 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${headingClass}`}>Sécurité & Traçabilité Officielle</h1>
          <p className={`text-sm ${textClass}`}>
            Gérer les accès du bureau et des membres, créer les mots de passe et visualiser l'historique complet d'activité du GIE Kara Lumière.
          </p>
        </div>
        
        {/* Navigation buttons inside Security Area */}
        <div className="flex bg-gray-100 dark:bg-gray-800/80 p-1 rounded-lg border border-gray-200 dark:border-gray-700 w-fit">
          <button
            onClick={() => setSecuritySection('roles')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
              securitySection === 'roles' 
                ? 'bg-[#173C4A] text-white shadow-xs' 
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Rôles & Sauvegarde
          </button>
          <button
            onClick={() => setSecuritySection('comptes')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
              securitySection === 'comptes' 
                ? 'bg-[#173C4A] text-white shadow-xs' 
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> Comptes du Bureau ({accessAccounts.length})
          </button>
          <button
            onClick={() => setSecuritySection('logs')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
              securitySection === 'logs' 
                ? 'bg-[#173C4A] text-white shadow-xs' 
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" /> Historique & Traçabilité ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* RENDER VIEW SPECIFIC SECTION */}

      {securitySection === 'roles' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ROLE SWITCHER */}
          <div className={`p-6 rounded-xl border ${cardBgClass} lg:col-span-2 space-y-6`}>
            <div>
              <h3 className={`font-bold text-base ${headingClass}`}>Sélecteur de Session Active (Simulateur)</h3>
              <p className="text-xs text-gray-400 mt-1">
                Basculez entre les profils administratifs pour tester instantanément la modulation des droits. Le système s'adaptera et journalisera vos actions sous l'identité sélectionnée.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roles.map(role => (
                <div 
                  key={role}
                  onClick={() => handleRoleToggle(role)}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                    isSuperAdmin ? 'cursor-pointer hover:border-[#22B8A7]/60' : 'cursor-not-allowed opacity-80'
                  } ${
                    currentUserRole === role 
                      ? 'border-[#22B8A7] bg-[#22B8A7]/5' 
                      : 'border-gray-100 dark:border-gray-800'
                  }`}
                  title={!isSuperAdmin ? "Attribution des rôles réservée au Super Administrateur (Ngary Sow)" : `Basculer vers le rôle ${role}`}
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
                  {currentUserRole === role ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22B8A7]" />
                  ) : !isSuperAdmin ? (
                    <Lock className="w-3.5 h-3.5 text-amber-500/60" />
                  ) : null}
                </div>
              ))}
            </div>

            <div className={`p-4 rounded-lg bg-teal-50 dark:bg-[#112d36] border border-[#22B8A7]/20`}>
              <div className="flex gap-2.5 text-xs">
                <Info className="w-4 h-4 text-[#22B8A7] shrink-0 mt-0.5" />
                <div className="text-gray-600 dark:text-gray-300">
                  <p className="font-bold">Session d'état active :</p>
                  <p className="font-mono mt-0.5">Identifiant email : <span className="text-[#22B8A7] font-bold">{currentUserEmail}</span> | Rôle : <span className="font-bold">{currentUserRole}</span></p>
                </div>
              </div>
            </div>

            {showNotification && (
              <div className="p-3 bg-emerald-50 dark:bg-[#132e29] border border-emerald-300 dark:border-emerald-800/40 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span>Droits d'accès actualisés au mandat de <strong>{currentUserRole}</strong>. Le menu s'est modulé.</span>
              </div>
            )}
          </div>

          {/* BACKUP & 2FA COLUMN */}
          <div className="space-y-6">
            <div className={`p-6 rounded-xl border ${cardBgClass} space-y-4`}>
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#22B8A7]" />
                <h3 className={`font-bold text-sm ${headingClass}`}>Double Authentification (2FA)</h3>
              </div>
              
              <p className="text-xs text-gray-500">
                Associer un numéro de mobile sénégalais pour intercepter les codes de validation des PV signés ou écritures SYSCOHADA d'importance majeure.
              </p>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-850 rounded-lg border">
                <span className="text-xs font-semibold text-gray-500">Statut 2FA</span>
                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    logAction("Toggle 2FA", `La protection par double-facteur a été ${!twoFactorEnabled ? 'Activée' : 'Désactivée'}.`);
                  }}
                  className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full transition-colors cursor-pointer ${
                    twoFactorEnabled 
                      ? 'bg-emerald-100 text-emerald-850 border-emerald-300' 
                      : 'bg-gray-100 text-gray-500 border-gray-300'
                  }`}
                >
                  {twoFactorEnabled ? 'Activé' : 'Désactivé'}
                </button>
              </div>
            </div>

            {/* SAVE SECTION */}
            <div className={`p-6 rounded-xl border ${cardBgClass} space-y-4`}>
              <div className="flex items-center gap-2 text-[#22B8A7]">
                <Database className="w-5 h-5" />
                <h3 className={`font-bold text-sm ${headingClass}`}>Sauvegarde & Restauration</h3>
              </div>
              <p className="text-xs text-gray-400">
                Téléchargez un cliché exact instantané de vos structures au format JSON d'archive.
              </p>

              <div className="p-3 bg-[#122e38] dark:bg-black/25 rounded-lg text-xs space-y-2 text-gray-400">
                <div className="font-semibold text-xs border-b border-gray-700 pb-1 text-white uppercase tracking-wider">État GIE :</div>
                <div className="flex justify-between">
                  <span>Adhérents :</span>
                  <span className="font-bold text-white">{databaseStats.membersCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pièces Journaux :</span>
                  <span className="font-bold text-white">{databaseStats.journalCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Comptes Actifs :</span>
                  <span className="font-bold text-white">{accessAccounts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Traces Historique :</span>
                  <span className="font-bold text-white">{auditLogs.length}</span>
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
                  <span>Base restituée et consolidée (Comptes & Logs inclus) !</span>
                </div>
              )}

              {importError && (
                <div className="p-2 bg-red-500/15 border border-red-500/30 text-red-400 rounded text-[10px] font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{importError}</span>
                </div>
              )}
            </div>

            {/* DEMO DATA INDEPENDENT CONTROL PANEL */}
            <div className={`p-6 border border-[#22B8A7]/30 bg-slate-900/60 dark:bg-black/40 text-white rounded-xl space-y-4 shadow-xs`}>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#22B8A7]" />
                <h3 className="font-bold text-sm text-[#22B8A7]">Évaluation rapide</h3>
              </div>

              <p className="text-[11px] text-gray-300">
                Vous pouvez injecter instantanément des fichiers de démonstration du GIE Kara Lumière pour tester les fonctionnalités à vide.
              </p>

              <button
                onClick={() => {
                  onSeedDemoData();
                  alert("Données de test injectées !");
                }}
                className="w-full py-2 bg-[#22B8A7] hover:bg-[#1ea091] text-white font-semibold rounded text-xs transition-colors cursor-pointer"
              >
                Injecter le set de Démo GIE
              </button>
              
              <button
                onClick={() => {
                  onClearDemoData();
                  alert("Base de données remise à zéro !");
                }}
                className="w-full py-2 border border-red-500/40 text-red-400 hover:bg-red-950/20 font-semibold rounded text-xs transition-colors cursor-pointer"
              >
                Rétablir base vide (Reset)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER ACCESS & PASSWORD CREATION SECTION */}
      {securitySection === 'comptes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CREATE ACCESS FORM */}
          <div className={`p-6 rounded-xl border ${cardBgClass} space-y-4 h-fit`}>
            <div className="flex items-center gap-2 text-[#22B8A7] border-b pb-2">
              <Plus className="w-4 h-4" />
              <h3 className={`font-bold text-sm ${headingClass}`}>Créer un Accès Bureau / Membre</h3>
            </div>
            
            <form onSubmit={handleCreateAccess} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Nom complet du titulaire *</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="Ex: El Hadji Malick"
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Email / Identifiant de connexion *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Ex: malick@karalumiere.sn"
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Rôle administratif & Privilèges *</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className={inputClass}
                >
                  {roles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Créer le mot de passe d'accès *</label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Saisissez un mot de passe robuste"
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!isSuperAdmin}
                className={`w-full py-2.5 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm ${
                  isSuperAdmin 
                    ? 'bg-[#22B8A7] hover:bg-[#1ea091] text-white cursor-pointer' 
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Lock className="w-3.5 h-3.5" /> {isSuperAdmin ? "Enregistrer les Accès & Pouvoirs" : "Réservé au Super Administrateur (Ngary Sow)"}
              </button>
            </form>
          </div>

          {/* LIST OF ACCESSIBLE ACCOUNTS */}
          <div className={`p-6 rounded-xl border ${cardBgClass} lg:col-span-2 space-y-4`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`font-bold text-sm ${headingClass}`}>Registres des Identifiants & Moteur d'Accès</h3>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-emerald-500/30">
                    <Database className="w-3 h-3" /> Sync Serveur Actif
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Mots de passe et rôles enregistrés de façon permanente sur le serveur.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportAccounts}
                  title="Télécharger une sauvegarde JSON de tous les comptes"
                  className="px-2.5 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-gray-300 dark:border-gray-700"
                >
                  <Download className="w-3.5 h-3.5 text-[#22B8A7]" /> Exporter (JSON)
                </button>

                <label
                  title="Importer une sauvegarde JSON de comptes"
                  className="px-2.5 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-gray-300 dark:border-gray-700"
                >
                  <Upload className="w-3.5 h-3.5 text-[#22B8A7]" /> Importer (JSON)
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportAccounts}
                    className="hidden"
                  />
                </label>

                <div className="relative w-full sm:w-48">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={accSearchTerm}
                    onChange={(e) => setAccSearchTerm(e.target.value)}
                    className="w-full pl-8 p-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-950 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {filteredAccounts.length === 0 ? (
                <p className="text-center py-8 text-xs text-gray-400 italic">Aucun compte d'accès ne répond aux critères de filtrage.</p>
              ) : (
                filteredAccounts.map(acc => (
                  <div key={acc.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/40 dark:bg-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${getRoleBadgeColor(acc.role)}`}>
                          {acc.role}
                        </span>
                        {acc.email === currentUserEmail && (
                          <span className="text-[9px] bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 px-1.5 py-0.5 rounded font-bold uppercase border border-sky-300/30">Connecté</span>
                        )}
                        <span className="text-[10px] text-gray-400 font-mono font-bold">ID: {acc.id}</span>
                      </div>
                      <h4 className={`font-bold text-sm ${headingClass}`}>{acc.fullName}</h4>
                      <p className="text-xs text-[#22B8A7] font-semibold">{acc.email}</p>
                    </div>

                    <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0">
                      {/* Password visibility area */}
                      <div className="flex items-center gap-1.5 text-xs font-mono">
                        <span className="text-gray-400 font-bold text-[10px] uppercase">Clé d'Accès :</span>
                        <span className="font-semibold px-2 py-0.5 rounded bg-gray-200/55 dark:bg-gray-850 border text-gray-800 dark:text-gray-200">
                          {showPassword[acc.id] ? (acc.password || '•••••') : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(acc.id)}
                          className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                          title="Afficher/Masquer"
                        >
                          {showPassword[acc.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSuperAdmin ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(acc)}
                              className="text-[10px] text-[#22B8A7] hover:text-[#1ea091] hover:bg-[#22B8A7]/10 transition-colors flex items-center gap-1 py-1 px-2 rounded font-semibold cursor-pointer border border-[#22B8A7]/30"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Modifier
                            </button>

                            {acc.email !== currentUserEmail && (
                              <button
                                type="button"
                                onClick={() => handleRevokeAccess(acc.id, acc.fullName, acc.email)}
                                className="text-[10px] text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors flex items-center gap-1 py-1 px-2 hover:bg-red-500/10 rounded font-semibold cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Révoquer
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded font-mono font-semibold flex items-center gap-1 border border-amber-300/40">
                            <Lock className="w-3 h-3" /> Modifications réservées au Super Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* EDIT ACCESS ACCOUNT MODAL */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl ${cardBgClass} space-y-4 relative`}>
            <div className="flex items-center justify-between border-b pb-3 border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 text-[#22B8A7]">
                <Pencil className="w-5 h-5" />
                <h3 className={`font-bold text-base ${headingClass}`}>Modifier l'Accès</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingAccount(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Nom complet *</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">E-mail / Identifiant de connexion *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Rôle administratif *</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className={inputClass}
                >
                  {roles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Mot de passe / Clé d'accès *</label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    required
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className={`${inputClass} pl-9 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#22B8A7] hover:bg-[#1ea091] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE AUDIT LOGS / TRACEABILITY HISTORY */}
      {securitySection === 'logs' && (
        <div className={`p-6 rounded-xl border ${cardBgClass} space-y-4`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className={`font-bold text-base ${headingClass}`}>Carnet de Traces et d'Audit (Régime de Traçabilité)</h3>
              <p className="text-xs text-gray-400 mt-1">
                Aperçu inaltérable en temps réel de tous les événements d'adhésion, d'écriture SYSCOHADA, de signature et de modification sur le serveur du GIE.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filtrer l'historique d'audit..."
                  value={logSearchTerm}
                  onChange={(e) => setLogSearchTerm(e.target.value)}
                  className="w-full pl-8 p-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-950 dark:text-white"
                />
              </div>

              <button
                onClick={() => {
                  if (confirm("Supprimer l'intégralité du carnet de traces de manière définitive ?")) {
                    setAuditLogs([]);
                    logAction("Purge du Journal", "L'utilisateur a vidé intégralement le registre de traçabilité des logs.");
                    alert("Registre d'audit vidé.");
                  }
                }}
                className="px-3 py-1.5 text-xs font-semibold hover:bg-red-500/10 text-red-500 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
              >
                Vider l'historique
              </button>
            </div>
          </div>

          {/* AUDIT LOG TABLE/LIST */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden border border-gray-150 dark:border-gray-800 rounded-lg max-h-[500px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-left text-xs">
                  <thead className="bg-[#122e38] dark:bg-[#153a47] text-gray-150 uppercase text-[9px] font-bold tracking-wider sticky top-0">
                    <tr>
                      <th className="p-3">Horodatage / Date</th>
                      <th className="p-3">Utilisateur (Email)</th>
                      <th className="p-3">Rôle Mandataire</th>
                      <th className="p-3">Action Exécutée</th>
                      <th className="p-3">Détails de l'Opération (Preuve)</th>
                      <th className="p-3 text-center">Résultat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white/40 dark:bg-black/5">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-xs text-gray-400 italic">
                          Aucun log d'action enregistré dans l'historique pour l'instant.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-100/40 dark:hover:bg-gray-800/10 transition-colors">
                          <td className="p-3 whitespace-nowrap font-mono text-[10px] text-gray-500">{log.timestamp}</td>
                          <td className="p-3 font-semibold text-gray-700 dark:text-gray-300">{log.userEmail}</td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-slate-100 dark:bg-gray-800 dark:text-gray-300">
                              {log.userRole}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-[#22B8A7]">{log.action}</td>
                          <td className="p-3 text-gray-600 dark:text-gray-400 leading-normal max-w-sm">{log.details}</td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              log.status === 'Succès' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
