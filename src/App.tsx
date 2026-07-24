/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Member, 
  Club, 
  League, 
  ExecutivePosition, 
  Meeting, 
  Activity, 
  Contribution, 
  JournalEntry, 
  Employee, 
  ArchivalDocument, 
  IntelligentAlert,
  UserRole,
  AccessAccount,
  AuditLog
} from './types';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import MembersView from './components/MembersView';
import ClubsView from './components/ClubsView';
import LeaguesView from './components/LeaguesView';
import ExecutiveView from './components/ExecutiveView';
import MeetingsView from './components/MeetingsView';
import ActivitiesView from './components/ActivitiesView';
import CotisationsView from './components/CotisationsView';
import AccountingView from './components/AccountingView';
import TreasuryView from './components/TreasuryView';
import DocumentsView from './components/DocumentsView';
import HumanResourcesView from './components/HumanResourcesView';
import AlertsView from './components/AlertsView';
import SecurityView from './components/SecurityView';
import LoginView from './components/LoginView';
import gieLogo from './assets/images/gie_logo_1781655966296.jpg';
import { subscribeCollection, saveDocItem, deleteDocItem, syncCollection } from './lib/firebase';

export default function App() {
  
  // PRIMARY STATES LOADED FROM LOCALSTORAGE WITH DEFAULT FALLBACK (Vide au premier démarrage)
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('kl_members');
    return saved ? JSON.parse(saved) : [];
  });

  const [clubs, setClubs] = useState<Club[]>(() => {
    const saved = localStorage.getItem('kl_clubs');
    return saved ? JSON.parse(saved) : [];
  });

  const [leagues, setLeagues] = useState<League[]>(() => {
    const saved = localStorage.getItem('kl_leagues');
    return saved ? JSON.parse(saved) : [];
  });

  const [positions, setPositions] = useState<ExecutivePosition[]>(() => {
    const saved = localStorage.getItem('kl_positions');
    // Ensure statutory positions are default if vacant or newly created
    if (saved) return JSON.parse(saved);
    return [
      { id: 'POS-1', title: 'Président', holderName: '', isActive: true, isDefault: true },
      { id: 'POS-2', title: 'Secrétaire Général', holderName: '', isActive: true, isDefault: true },
      { id: 'POS-3', title: 'Trésorier', holderName: '', isActive: true, isDefault: true },
      { id: 'POS-4', title: 'Responsable Musicale', holderName: '', isActive: true, isDefault: true }
    ];
  });

  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const saved = localStorage.getItem('kl_meetings');
    return saved ? JSON.parse(saved) : [];
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem('kl_activities');
    return saved ? JSON.parse(saved) : [];
  });

  const [contributions, setContributions] = useState<Contribution[]>(() => {
    const saved = localStorage.getItem('kl_contributions');
    return saved ? JSON.parse(saved) : [];
  });

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('kl_journals');
    return saved ? JSON.parse(saved) : [];
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('kl_employees');
    return saved ? JSON.parse(saved) : [];
  });

  const [documents, setDocuments] = useState<ArchivalDocument[]>(() => {
    const saved = localStorage.getItem('kl_documents');
    return saved ? JSON.parse(saved) : [];
  });

  const [alerts, setAlerts] = useState<IntelligentAlert[]>(() => {
    const saved = localStorage.getItem('kl_alerts');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('kl_is_authenticated') === 'true';
  });

  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('kl_user_role');
    return (saved as UserRole) || 'Super Administrateur';
  });

  const [currentUserEmail, setCurrentUserEmail] = useState<string>(() => {
    return localStorage.getItem('kl_user_email') || 'ngaryservicepro@gmail.com';
  });

  const [accessAccounts, setAccessAccounts] = useState<AccessAccount[]>(() => {
    const defaultAccounts: AccessAccount[] = [
      { id: 'ACC-001', fullName: "Aliou Cissé", email: "ngaryservicepro@gmail.com", role: "Super Administrateur", password: "admin", status: "Actif" },
      { id: 'ACC-002', fullName: "Racine Sy", email: "racinesy1990@gmail.com", role: "Membre", password: "123456789@", status: "Actif" },
      { id: 'ACC-003', fullName: "Souleymane Faye", email: "president@karalumiere.sn", role: "Président", password: "pres", status: "Actif" },
      { id: 'ACC-004', fullName: "Babacar Ndiaye", email: "sg@karalumiere.sn", role: "Secrétaire Général", password: "sg", status: "Actif" },
      { id: 'ACC-005', fullName: "Fatou Diome", email: "musique@karalumiere.sn", role: "Responsable Musicale", password: "musique", status: "Actif" },
      { id: 'ACC-006', fullName: "Seynabou Ndiaye", email: "seynabou@karalumiere.sn", role: "Membre", password: "membre", status: "Actif" }
    ];

    const saved = localStorage.getItem('kl_access_accounts');
    if (!saved) return defaultAccounts;

    try {
      const parsed: AccessAccount[] = JSON.parse(saved);
      const merged = parsed.map(acc => 
        acc.email.trim().toLowerCase() === "ngaryservicepro@gmail.com" 
          ? { ...acc, fullName: "Aliou Cissé" } 
          : acc
      );
      defaultAccounts.forEach(defAcc => {
        if (!merged.some(acc => acc.email.trim().toLowerCase() === defAcc.email.trim().toLowerCase())) {
          merged.push(defAcc);
        }
      });
      return merged;
    } catch {
      return defaultAccounts;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('kl_audit_logs');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'LOG-001', timestamp: new Date().toISOString(), userEmail: 'ngaryservicepro@gmail.com', userRole: 'Super Administrateur', action: 'Initialisation Système', details: 'Démarrage initial du portail d\'administration GIE Kara Lumière', status: 'Succès' }
    ];
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('kl_dark_mode') === 'true';
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // New Treasury Settings States
  const [initialLiquidity, setInitialLiquidity] = useState<number>(() => {
    const saved = localStorage.getItem('kl_initial_liquidity');
    return saved ? Number(saved) : 2500000;
  });

  const [useManualLiquidity, setUseManualLiquidity] = useState<boolean>(() => {
    return localStorage.getItem('kl_use_manual_liquidity') === 'true';
  });

  const [manualLiquidity, setManualLiquidity] = useState<number>(() => {
    const saved = localStorage.getItem('kl_manual_liquidity');
    return saved ? Number(saved) : 2500000;
  });

  // STORAGE WRITERS
  useEffect(() => {
    localStorage.setItem('kl_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('kl_clubs', JSON.stringify(clubs));
  }, [clubs]);

  useEffect(() => {
    localStorage.setItem('kl_leagues', JSON.stringify(leagues));
  }, [leagues]);

  useEffect(() => {
    localStorage.setItem('kl_positions', JSON.stringify(positions));
  }, [positions]);

  useEffect(() => {
    localStorage.setItem('kl_meetings', JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem('kl_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('kl_contributions', JSON.stringify(contributions));
  }, [contributions]);

  useEffect(() => {
    localStorage.setItem('kl_journals', JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem('kl_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('kl_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('kl_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('kl_user_role', currentUserRole);
  }, [currentUserRole]);

  // Initial fetch full application data from backend server
  useEffect(() => {
    fetch('/api/app-data')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          handleRestoreDatabase(res.data);
        }
      })
      .catch(err => console.log('Error fetching app data:', err));

    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.accounts) && data.accounts.length > 0) {
          setAccessAccounts(data.accounts);
          localStorage.setItem('kl_access_accounts', JSON.stringify(data.accounts));
        }
      })
      .catch(err => console.log('Server accounts fetch fallback:', err));
  }, []);

  // Sync state to backend server for persistence across browsers
  useEffect(() => {
    const appData = {
      members,
      clubs,
      leagues,
      positions,
      meetings,
      activities,
      contributions,
      journalEntries,
      employees,
      documents,
      alerts,
      accessAccounts,
      auditLogs,
      initialLiquidity,
      useManualLiquidity,
      manualLiquidity
    };

    fetch('/api/app-data/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: appData })
    }).catch(err => console.log('App data server sync error:', err));
  }, [
    members, clubs, leagues, positions, meetings, activities,
    contributions, journalEntries, employees, documents, alerts,
    accessAccounts, auditLogs, initialLiquidity, useManualLiquidity, manualLiquidity
  ]);

  // Real-time Firestore Subscriptions across all browsers & devices
  useEffect(() => {
    const defaultAccounts: AccessAccount[] = [
      { id: 'ACC-001', fullName: "Aliou Cissé", email: "ngaryservicepro@gmail.com", role: "Super Administrateur", password: "admin", status: "Actif" },
      { id: 'ACC-002', fullName: "Racine Sy", email: "racinesy1990@gmail.com", role: "Membre", password: "123456789@", status: "Actif" },
      { id: 'ACC-003', fullName: "Souleymane Faye", email: "president@karalumiere.sn", role: "Président", password: "pres", status: "Actif" },
      { id: 'ACC-004', fullName: "Babacar Ndiaye", email: "sg@karalumiere.sn", role: "Secrétaire Général", password: "sg", status: "Actif" },
      { id: 'ACC-005', fullName: "Fatou Diome", email: "musique@karalumiere.sn", role: "Responsable Musicale", password: "musique", status: "Actif" },
      { id: 'ACC-006', fullName: "Seynabou Ndiaye", email: "seynabou@karalumiere.sn", role: "Membre", password: "membre", status: "Actif" }
    ];

    const unsubMembers = subscribeCollection<Member>('members', (data) => { if (data && data.length > 0) setMembers(data); }, members);
    const unsubClubs = subscribeCollection<Club>('clubs', (data) => { if (data && data.length > 0) setClubs(data); }, clubs);
    const unsubLeagues = subscribeCollection<League>('leagues', (data) => { if (data && data.length > 0) setLeagues(data); }, leagues);
    const unsubPositions = subscribeCollection<ExecutivePosition>('positions', (data) => { if (data && data.length > 0) setPositions(data); }, positions);
    const unsubMeetings = subscribeCollection<Meeting>('meetings', (data) => { if (data && data.length > 0) setMeetings(data); }, meetings);
    const unsubActivities = subscribeCollection<Activity>('activities', (data) => { if (data && data.length > 0) setActivities(data); }, activities);
    const unsubContributions = subscribeCollection<Contribution>('contributions', (data) => { if (data && data.length > 0) setContributions(data); }, contributions);
    const unsubJournals = subscribeCollection<JournalEntry>('journals', (data) => { if (data && data.length > 0) setJournalEntries(data); }, journalEntries);
    const unsubEmployees = subscribeCollection<Employee>('employees', (data) => { if (data && data.length > 0) setEmployees(data); }, employees);
    const unsubDocuments = subscribeCollection<ArchivalDocument>('documents', (data) => { if (data && data.length > 0) setDocuments(data); }, documents);
    const unsubAlerts = subscribeCollection<IntelligentAlert>('alerts', (data) => { if (data && data.length > 0) setAlerts(data); }, alerts);
    const unsubAccounts = subscribeCollection<AccessAccount>('accounts', (data) => { if (data && data.length > 0) setAccessAccounts(data); }, accessAccounts.length > 0 ? accessAccounts : defaultAccounts);
    const unsubLogs = subscribeCollection<AuditLog>('auditLogs', (data) => { if (data && data.length > 0) setAuditLogs(data); }, auditLogs);

    return () => {
      unsubMembers();
      unsubClubs();
      unsubLeagues();
      unsubPositions();
      unsubMeetings();
      unsubActivities();
      unsubContributions();
      unsubJournals();
      unsubEmployees();
      unsubDocuments();
      unsubAlerts();
      unsubAccounts();
      unsubLogs();
    };
  }, []);

  useEffect(() => {
    // Initial fetch from backend server
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.accounts) && data.accounts.length > 0) {
          setAccessAccounts(data.accounts);
          localStorage.setItem('kl_access_accounts', JSON.stringify(data.accounts));
        }
      })
      .catch(err => console.log('Server accounts fetch fallback:', err));
  }, []);

  useEffect(() => {
    localStorage.setItem('kl_access_accounts', JSON.stringify(accessAccounts));
    syncCollection('accounts', accessAccounts);
    // Permanent backend sync
    fetch('/api/accounts/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accounts: accessAccounts })
    }).catch(err => console.log('Accounts server sync fallback:', err));
  }, [accessAccounts]);

  useEffect(() => {
    localStorage.setItem('kl_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('kl_dark_mode', String(isDarkMode));
    // Apply class to index HTML element
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLoginSuccess = (account: AccessAccount) => {
    setIsAuthenticated(true);
    setCurrentUserRole(account.role);
    setCurrentUserEmail(account.email);
    localStorage.setItem('kl_is_authenticated', 'true');
    localStorage.setItem('kl_user_role', account.role);
    localStorage.setItem('kl_user_email', account.email);
    logAction("Connexion Utilisateur", `Connexion réussie de ${account.fullName} (${account.role})`);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('kl_is_authenticated');
    logAction("Déconnexion Utilisateur", `Déconnexion de l'utilisateur ${currentUserEmail}`);
  };

  useEffect(() => {
    localStorage.setItem('kl_initial_liquidity', String(initialLiquidity));
  }, [initialLiquidity]);

  useEffect(() => {
    localStorage.setItem('kl_use_manual_liquidity', String(useManualLiquidity));
  }, [useManualLiquidity]);

  useEffect(() => {
    localStorage.setItem('kl_manual_liquidity', String(manualLiquidity));
  }, [manualLiquidity]);

  useEffect(() => {
    localStorage.setItem('kl_user_email', currentUserEmail);
  }, [currentUserEmail]);

  useEffect(() => {
    localStorage.setItem('kl_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // BULK DATABASE BACKUP COMPACTION & RESTORE HANDLER
  const handleRestoreDatabase = (data: any) => {
    if (!data) return;
    if (Array.isArray(data.members)) { setMembers(data.members); syncCollection('members', data.members); }
    if (Array.isArray(data.clubs)) { setClubs(data.clubs); syncCollection('clubs', data.clubs); }
    if (Array.isArray(data.leagues)) { setLeagues(data.leagues); syncCollection('leagues', data.leagues); }
    if (Array.isArray(data.positions)) { setPositions(data.positions); syncCollection('positions', data.positions); }
    if (Array.isArray(data.meetings)) { setMeetings(data.meetings); syncCollection('meetings', data.meetings); }
    if (Array.isArray(data.activities)) { setActivities(data.activities); syncCollection('activities', data.activities); }
    if (Array.isArray(data.contributions)) { setContributions(data.contributions); syncCollection('contributions', data.contributions); }
    if (Array.isArray(data.journalEntries)) { setJournalEntries(data.journalEntries); syncCollection('journals', data.journalEntries); }
    if (Array.isArray(data.employees)) { setEmployees(data.employees); syncCollection('employees', data.employees); }
    if (Array.isArray(data.documents)) { setDocuments(data.documents); syncCollection('documents', data.documents); }
    if (Array.isArray(data.alerts)) { setAlerts(data.alerts); syncCollection('alerts', data.alerts); }
    if (Array.isArray(data.accessAccounts)) { setAccessAccounts(data.accessAccounts); syncCollection('accounts', data.accessAccounts); }
    if (Array.isArray(data.auditLogs)) { setAuditLogs(data.auditLogs); syncCollection('auditLogs', data.auditLogs); }
    
    if (typeof data.initialLiquidity === 'number') setInitialLiquidity(data.initialLiquidity);
    if (typeof data.useManualLiquidity === 'boolean') setUseManualLiquidity(data.useManualLiquidity);
    if (typeof data.manualLiquidity === 'number') setManualLiquidity(data.manualLiquidity);
  };

  // TREASURY DYNAMIC CALCULATION METHOD
  const totalInboundContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
  const totalOutboundBudgets = activities.filter(a => a.status === 'Terminée' || a.status === 'En cours').reduce((sum, a) => sum + a.budget, 0);
  const totalJournalDebitsExpenses = journalEntries.filter(je => je.type === 'Débit').reduce((sum, je) => sum + je.amount, 0);
  const totalJournalCreditsRevenues = journalEntries.filter(je => je.type === 'Crédit').reduce((sum, je) => sum + je.amount, 0);
  
  const computedBalance = initialLiquidity + totalInboundContributions + totalJournalCreditsRevenues - totalOutboundBudgets - totalJournalDebitsExpenses;
  const treasuryBalance = useManualLiquidity ? manualLiquidity : computedBalance;

  const logAction = (action: string, details: string, status: 'Succès' | 'Échec' = 'Succès') => {
    const newLog: AuditLog = {
      id: 'LOG-' + Math.floor(100000 + Math.random() * 900000),
      timestamp: new Date().toISOString(),
      userEmail: currentUserEmail,
      userRole: currentUserRole,
      action,
      details,
      status
    };
    setAuditLogs(prev => [newLog, ...prev]);
    saveDocItem('auditLogs', newLog);
  };

  // SYSTEM MUTATOR HANDLERS
  const addMember = (mData: Omit<Member, 'id'>) => {
    const nextId = 'MEM-' + String(members.length + 1).padStart(3, '0');
    const newItem: Member = { id: nextId, ...mData };
    setMembers(prev => [...prev, newItem]);
    saveDocItem('members', newItem);
    logAction("Enregistrement Adhérent", `Création du membre de club "${mData.fullName}" sous l'identifiant ${nextId}.`);
  };

  const updateMember = (id: string, mData: Partial<Member>) => {
    const updated = members.map(m => m.id === id ? { ...m, ...mData } : m);
    setMembers(updated);
    const target = updated.find(m => m.id === id);
    if (target) saveDocItem('members', target);
    const mName = target?.fullName || id;
    logAction("Modification Adhérent", `Mise à jour des coordonnées administratives de "${mName}".`);
  };

  const deleteMember = (id: string) => {
    const mName = members.find(m => m.id === id)?.fullName || id;
    setMembers(prev => prev.filter(m => m.id !== id));
    deleteDocItem('members', id);
    logAction("Suppression Adhérent", `Retrait définitif de "${mName}" de la base de données.`);
  };

  const addClub = (cData: Omit<Club, 'id'>) => {
    const id = 'CLUB-' + Math.floor(100 + Math.random() * 900);
    const newItem: Club = { id, ...cData };
    setClubs(prev => [...prev, newItem]);
    saveDocItem('clubs', newItem);
    logAction("Affiliation Club", `Ajout du club ou association "${cData.name}" au GIE.`);
  };

  const updateClub = (id: string, cData: Partial<Club>) => {
    const updated = clubs.map(c => c.id === id ? { ...c, ...cData } : c);
    setClubs(updated);
    const target = updated.find(c => c.id === id);
    if (target) saveDocItem('clubs', target);
    const cName = target?.name || id;
    logAction("Modification Club", `Fiche du club "${cName}" mise à jour.`);
  };

  const deleteClub = (id: string) => {
    const cName = clubs.find(c => c.id === id)?.name || id;
    setClubs(prev => prev.filter(c => c.id !== id));
    deleteDocItem('clubs', id);
    logAction("Désaffiliation Club", `Retrait définitif du club "${cName}".`);
  };

  const addLeague = (lData: Omit<League, 'id'>) => {
    const id = 'LIG-' + Math.floor(100 + Math.random() * 900);
    const newItem: League = { id, ...lData };
    setLeagues(prev => [...prev, newItem]);
    saveDocItem('leagues', newItem);
    logAction("Affiliation Ligue", `Création de la ligue régionale "${lData.name}" (${lData.region}).`);
  };

  const updateLeague = (id: string, lData: Partial<League>) => {
    const updated = leagues.map(l => l.id === id ? { ...l, ...lData } : l);
    setLeagues(updated);
    const target = updated.find(l => l.id === id);
    if (target) saveDocItem('leagues', target);
    const lName = target?.name || id;
    logAction("Modification Ligue", `Mise à jour pour la ligue "${lName}".`);
  };

  const deleteLeague = (id: string) => {
    const lName = leagues.find(l => l.id === id)?.name || id;
    setLeagues(prev => prev.filter(l => l.id !== id));
    deleteDocItem('leagues', id);
    logAction("Suppression Ligue", `Retrait de la ligue "${lName}".`);
  };

  const addPosition = (pData: Omit<ExecutivePosition, 'id' | 'isDefault'>) => {
    const id = 'POS-' + (positions.length + 1);
    const newItem: ExecutivePosition = { id, isDefault: false, ...pData };
    setPositions(prev => [...prev, newItem]);
    saveDocItem('positions', newItem);
    logAction("Création de Poste", `Ajout d'un mandat honorifique "${pData.title}" attribué à "${pData.holderName}".`);
  };

  const updatePosition = (id: string, pData: Partial<ExecutivePosition>) => {
    const updated = positions.map(p => p.id === id ? { ...p, ...pData } : p);
    setPositions(updated);
    const target = updated.find(p => p.id === id);
    if (target) saveDocItem('positions', target);
    const title = target?.title || id;
    logAction("Modification Mandat", `Mise à jour pour le rôle exécutif de "${title}".`);
  };

  const deletePosition = (id: string) => {
    const title = positions.find(p => p.id === id)?.title || id;
    setPositions(prev => prev.filter(p => p.id !== id));
    deleteDocItem('positions', id);
    logAction("Suppression Mandat", `Retrait du poste de membre du bureau: "${title}".`);
  };

  const addMeeting = (meet: Omit<Meeting, 'id'>) => {
    const id = 'AGO-' + Math.floor(1000 + Math.random() * 9000);
    const newItem: Meeting = { id, ...meet };
    setMeetings(prev => [newItem, ...prev]);
    saveDocItem('meetings', newItem);
    logAction("Planification Réunion", `Création de la séance de travail / PV "${meet.title}" prévue pour le ${meet.date}.`);
  };

  const updateMeeting = (id: string, meet: Partial<Meeting>) => {
    const updated = meetings.map(m => m.id === id ? { ...m, ...meet } as Meeting : m);
    setMeetings(updated);
    const target = updated.find(m => m.id === id);
    if (target) saveDocItem('meetings', target);
    const mTitle = target?.title || id;
    logAction("Mise à jour Réunion / Signature PV", `Modifications / Enregistrement des signatures pour la réunion "${mTitle}".`);
  };

  const deleteMeeting = (id: string) => {
    const mTitle = meetings.find(m => m.id === id)?.title || id;
    setMeetings(prev => prev.filter(m => m.id !== id));
    deleteDocItem('meetings', id);
    logAction("Suppression Réunion", `Retrait de la réunion "${mTitle}".`);
  };

  const addActivity = (act: Omit<Activity, 'id'>) => {
    const id = 'ACT-' + Math.floor(1000 + Math.random() * 9000);
    const newItem: Activity = { id, ...act };
    setActivities(prev => [newItem, ...prev]);
    saveDocItem('activities', newItem);
    logAction("Création d'Activité", `Programmation de l'activité "${act.name}" dotée d'un budget de ${act.budget.toLocaleString()} FCFA.`);
  };

  const updateActivity = (id: string, act: Partial<Activity>) => {
    const updated = activities.map(a => a.id === id ? { ...a, ...act } as Activity : a);
    setActivities(updated);
    const target = updated.find(a => a.id === id);
    if (target) saveDocItem('activities', target);
    const aName = target?.name || id;
    logAction("Modification d'Activité", `Mise à jour de l'activité "${aName}".`);
  };

  const deleteActivity = (id: string) => {
    const aName = activities.find(a => a.id === id)?.name || id;
    setActivities(prev => prev.filter(a => a.id !== id));
    deleteDocItem('activities', id);
    logAction("Suppression d'Activité", `Retrait de l'activité "${aName}".`);
  };

  const addContribution = (contrib: Omit<Contribution, 'id'>) => {
    const id = 'TX-' + Math.floor(100000 + Math.random() * 900000);
    const newItem: Contribution = { id, ...contrib };
    setContributions(prev => [newItem, ...prev]);
    saveDocItem('contributions', newItem);

    const memName = members.find(m => m.id === contrib.memberId)?.fullName || 'Adhérent';
    // Push corresponding smart accounting double entry automatically for transparency!
    addJournalEntry({
      date: contrib.date,
      ref: contrib.reference,
      label: `Cotisation reçue de ${memName}`,
      accountCode: '7616', // products/revenues
      type: 'Crédit',
      amount: contrib.amount
    });
    logAction("Perception Cotisation", `Paiement de ${contrib.amount.toLocaleString()} FCFA reçu de "${memName}" par ${contrib.paymentMethod} (Réf: ${contrib.reference}).`);
  };

  const deleteContribution = (id: string) => {
    const cObj = contributions.find(c => c.id === id);
    const amountStr = cObj ? `${cObj.amount.toLocaleString()} FCFA` : '';
    setContributions(prev => prev.filter(c => c.id !== id));
    deleteDocItem('contributions', id);
    logAction("Annulation Cotisation", `Suppression du reçu de cotisation ID: ${id} (${amountStr}).`);
  };

  const addJournalEntry = (je: Omit<JournalEntry, 'id'>) => {
    const id = 'JE-' + Math.floor(10000 + Math.random() * 90000);
    const newItem: JournalEntry = { id, ...je };
    setJournalEntries(prev => [newItem, ...prev]);
    saveDocItem('journals', newItem);
    logAction("Saisie Comptable", `Nouvel enregistrement comptable [${je.type} - Compte ${je.accountCode}]: "${je.label}" d'un montant de ${je.amount.toLocaleString()} FCFA.`);
  };

  const deleteJournalEntry = (id: string) => {
    const jeName = journalEntries.find(je => je.id === id)?.label || id;
    setJournalEntries(prev => prev.filter(je => je.id !== id));
    deleteDocItem('journals', id);
    logAction("Annulation Comptable", `Retrait de l'écriture comptable : "${jeName}".`);
  };

  const addEmployee = (emp: Omit<Employee, 'id'>) => {
    const id = 'EMP-' + String(employees.length + 1).padStart(3, '0');
    const newItem: Employee = { id, ...emp };
    setEmployees(prev => [...prev, newItem]);
    saveDocItem('employees', newItem);
    logAction("Enregistrement Collaborateur", `Création de la fiche de collaboration administrative pour "${emp.fullName}" (${emp.contractType}).`);
  };

  const deleteEmployee = (id: string) => {
    const empName = employees.find(e => e.id === id)?.fullName || id;
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    deleteDocItem('employees', id);
    logAction("Retrait Collaborateur", `Suppression de la fiche de collaboration de "${empName}".`);
  };

  const addDocument = (docItem: Omit<ArchivalDocument, 'id'>) => {
    const id = 'DOC-' + Math.floor(1000 + Math.random() * 9000);
    const newItem: ArchivalDocument = { id, ...docItem };
    setDocuments(prev => [newItem, ...prev]);
    saveDocItem('documents', newItem);
    logAction("Archivage Document", `Dépôt sécurisé du document "${docItem.name}" dans la section coffre-fort.`);
  };

  const deleteDocument = (id: string) => {
    const docName = documents.find(d => d.id === id)?.name || id;
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    deleteDocItem('documents', id);
    logAction("Destruction Archives", `Révocation et suppression définitive de l'archive "${docName}".`);
  };

  // Mark status alerts
  const markAsRead = (alertId: string) => {
    setAlerts(alerts.map(a => a.id === alertId ? { ...a, isRead: true } : a));
  };

  const clearAlert = (alertId: string) => {
    setAlerts(alerts.filter(a => a.id !== alertId));
  };

  // SEED THE SYSTEM DEMO DATA helper
  const handleSeedDemoData = () => {
    // 1. Clubs
    const sampleClubs: Club[] = [
      { id: 'CLUB-101', name: "ASC Jeanne d'Arc de Dakar", president: "Maitre Babacar Diallo", phone: "+221 33 824 15 15", email: "jeannedarc@dakar.sn", address: "Plateau, Dakar", website: "https://www.jeannedarc.sn" },
      { id: 'CLUB-102', name: "Association Musique de Guédiawaye", president: "Mme Sokhna Ndiaye", phone: "+221 77 123 45 45", email: "guediawaye.singers@outlook.com", address: "Hamo 4, Guédiawaye", website: "" }
    ];

    // 2. Leagues
    const sampleLeagues: League[] = [
      { id: 'LIG-201', name: "Ligue Régionale de Dakar", region: "Dakar", responsible: "M. Ibrahima Wade" },
      { id: 'LIG-202', name: "Ligue Intercommunale de Thiès", region: "Thiès", responsible: "Mme Khady Touré" }
    ];

    // 3. Members
    const sampleMembers: Member[] = [
      { id: 'MEM-001', fullName: "Ngary Sow", birthDate: "1994-06-12", birthPlace: "Dakar", gender: 'M', phone: "+221 77 654 32 10", email: "ngary.sow@gmail.com", address: "Fann Résidence, Dakar", clubId: "CLUB-101", leagueId: "LIG-201", grade: "Ceinture Noire 2e Dan", function: "Trésorier Adjoint", joinDate: "2024-01-10", status: "Actif", cniNumber: "1 123 1994 00012", profession: "Comptable d'Entreprise", educationLevel: "Master en Sciences de Gestion", maritalStatus: "Marié(e)", photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80" },
      { id: 'MEM-002', fullName: "Fatou Diome", birthDate: "1991-03-24", birthPlace: "Kaolack", gender: 'F', phone: "+221 77 567 12 12", email: "diome.fatou@gmail.com", address: "Mermoz, Dakar", clubId: "CLUB-102", leagueId: "LIG-201", grade: "Soprano Principal", function: "Directrice Chorale", joinDate: "2024-02-15", status: "Actif", cniNumber: "2 123 1991 00024", profession: "Professeure d'Éducation Musicale", educationLevel: "Licence de Musicologie", maritalStatus: "Célibataire", photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80" },
      { id: 'MEM-003', fullName: "Babacar Ndiaye", birthDate: "1988-11-05", birthPlace: "Saint-Louis", gender: 'M', phone: "+221 77 345 67 89", email: "babacar.ndiaye@yahoo.fr", address: "Sacre Coeur, Dakar", clubId: "CLUB-101", leagueId: "LIG-201", grade: "Arbitre Fédéral", function: "Secrétaire Adjoint", joinDate: "2024-01-20", status: "Actif", cniNumber: "1 123 1988 00036", profession: "Consultant Système d'Information", educationLevel: "Ingénieur en Informatique", maritalStatus: "Marié(e)", photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80" }
    ];

    // 4. Executive positions
    const samplePositions: ExecutivePosition[] = [
      { id: 'POS-1', title: 'Président', holderName: 'Souleymane Faye', isActive: true, isDefault: true },
      { id: 'POS-2', title: 'Secrétaire Général', holderName: 'Babacar Ndiaye', isActive: true, isDefault: true },
      { id: 'POS-3', title: 'Trésorier', holderName: 'Ngary Sow', isActive: true, isDefault: true },
      { id: 'POS-4', title: 'Responsable Musicale', holderName: 'Fatou Diome', isActive: true, isDefault: true }
    ];

    // 5. Meetings
    const sampleMeetings: Meeting[] = [
      { 
        id: 'AGO-4001', 
        title: "AGO de Préparation Opérationnelle", 
        date: "2026-06-25", 
        time: "10:00", 
        location: "Siège Social Dakar", 
        organizer: "Secrétariat Général", 
        participants: ["Ngary Sow", "Fatou Diome", "Babacar Ndiaye"], 
        agenda: "Examen des charges, cotisations du mois, et programmations des répétitions", 
        status: "Planifiée" 
      }
    ];

    // 6. Activities
    const sampleActivities: Activity[] = [
      { id: 'ACT-5001', name: "Concert de Gala Kara Lumier", description: "Récital lyrique annuel au Grand Théâtre National de Dakar.", clubId: "CLUB-102", budget: 1500000, financialObjective: 2500000, startDate: "2026-06-20", endDate: "2026-06-21", status: "En cours" },
      { id: 'ACT-5002', name: "Tournoi des Ceintures Noires Dakar", description: "Coupe de Ligue en partenariat avec la fédération sénégalaise.", clubId: "CLUB-101", budget: 850000, financialObjective: 1200000, startDate: "2026-07-05", endDate: "2026-07-06", status: "Planifiée" }
    ];

    // 7. Contributions
    const sampleContributions: Contribution[] = [
      { id: 'TX-6001', activityId: "ACT-5001", memberId: "MEM-001", amount: 250000, date: "2026-06-15", reference: "WV-875691", paymentMethod: "Wave" },
      { id: 'TX-6002', activityId: "ACT-5001", memberId: "MEM-002", amount: 150000, date: "2026-06-16", reference: "OM-443210", paymentMethod: "Orange Money" }
    ];

    // 8. Journal
    const sampleJournals: JournalEntry[] = [
      { id: 'JE-7001', date: "2026-06-10", ref: "APP-001", label: "Apports de subvention de démarrage", accountCode: '266', type: "Débit", amount: 500000 },
      { id: 'JE-7002', date: "2026-06-12", ref: "OM-443210", label: "Cotisation reçue de Fatou Diome", accountCode: "7616", type: "Crédit", amount: 150000 }
    ];

    // 9. Staff
    const sampleEmployees: Employee[] = [
      { id: 'EMP-001', fullName: "Seynabou Ndiaye", position: "Assistant Secrétaire Générale", contractType: "Prestataire", startDate: "2025-01-05", salary: 180000, email: "seynabou@karalumier.sn", phone: "+221 77 452 10 10" },
      { id: 'EMP-002', fullName: "Fallou Fall", position: "Régisseur principal d'instruments", contractType: "Bénévole", startDate: "2025-03-20", salary: 120500, email: "fallou.fall@karalumier.sn", phone: "+221 77 821 00 22" }
    ];

    // 10. Documents
    const sampleDocuments: ArchivalDocument[] = [
      { id: 'DOC-8001', name: "Statuts_GIE_Kara_Lumier.pdf", category: "Contrat", uploadDate: "2024-01-10", fileSize: "2.1 MB", uploaderName: "Super Administrateur" }
    ];

    // 11. Alerts
    const sampleAlerts: IntelligentAlert[] = [
      { id: 'ALT-9001', type: 'warning', title: "Assemblée générale imminente", message: "La réunion AGO de Préparation Opérationnelle aura lieu dans quelques jours. Préparez la feuille d'émargement électronique.", date: "2026-06-16", isRead: false }
    ];

    setClubs(sampleClubs);
    setLeagues(sampleLeagues);
    setMembers(sampleMembers);
    setPositions(samplePositions);
    setMeetings(sampleMeetings);
    setActivities(sampleActivities);
    setContributions(sampleContributions);
    setJournalEntries(sampleJournals);
    setEmployees(sampleEmployees);
    setDocuments(sampleDocuments);
    setAlerts(sampleAlerts);
  };

  const handleClearDemoData = () => {
    localStorage.clear();
    setClubs([]);
    setLeagues([]);
    setMembers([]);
    setPositions([
      { id: 'POS-1', title: 'Président', holderName: '', isActive: true, isDefault: true },
      { id: 'POS-2', title: 'Secrétaire Général', holderName: '', isActive: true, isDefault: true },
      { id: 'POS-3', title: 'Trésorier', holderName: '', isActive: true, isDefault: true },
      { id: 'POS-4', title: 'Responsable Musicale', holderName: '', isActive: true, isDefault: true }
    ]);
    setMeetings([]);
    setActivities([]);
    setContributions([]);
    setJournalEntries([]);
    setEmployees([]);
    setDocuments([]);
    setAlerts([]);
  };

  const isSuperAdmin = currentUserRole === 'Super Administrateur' || currentUserEmail.trim().toLowerCase() === 'ngaryservicepro@gmail.com';
  const restrictedTabs = ['documents', 'rh', 'alerts', 'security'];

  useEffect(() => {
    if (!isSuperAdmin && restrictedTabs.includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [isSuperAdmin, activeTab]);

  if (!isAuthenticated) {
    return (
      <LoginView 
        accessAccounts={accessAccounts}
        onLoginSuccess={handleLoginSuccess}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row text-gray-900 dark:text-gray-100 ${isDarkMode ? 'bg-[#0a181d]' : 'bg-[#F5F7FA]'}`}>
      
      {/* Mobile Sticky Navbar */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-[#173C4A] text-white border-b border-[#22B8A7]/20 sticky top-0 z-45 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-[#22B8A7] shadow-sm overflow-hidden">
            <img 
               src={gieLogo} 
               alt="Logo GIE Kara Lumière" 
               className="w-full h-full object-cover"
               referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="font-display font-extrabold text-[13px] tracking-wider uppercase text-white">GIE Kara Lumière</h2>
        </div>
        
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 px-2.5 rounded-lg bg-[#204a5a]/60 active:scale-95 text-[#22B8A7] transition-all"
          aria-label="Toggle Navigation Menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </header>

      {/* SIDEBAR FIXED LAYOUT (Width 64 / 16rem) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setMobileMenuOpen(false); // Auto close mobile menu after selection
        }}
        currentUserRole={currentUserRole}
        currentUserEmail={currentUserEmail}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        alertsCount={alerts.filter(a => !a.isRead).length}
        isMobileOpen={mobileMenuOpen}
        onLogout={handleLogout}
      />

      {/* Underlay Backdrop click to close menu on mobile */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-[#0e252e]/50 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* CORE VIEWPORT CONTENT WRAPPER */}
      <main className="flex-1 lg:ml-64 p-4 md:p-8 transition-all relative overflow-hidden" id="workspace-viewport">
        {activeTab === 'dashboard' && (
          <DashboardView 
            members={members} 
            clubs={clubs} 
            leagues={leagues}
            meetings={meetings}
            activities={activities}
            contributions={contributions}
            treasuryBalance={treasuryBalance}
            isDarkMode={isDarkMode}
            onNavigate={setActiveTab}
            setSelectedMeeting={setSelectedMeeting}
            alerts={alerts}
            setAlerts={setAlerts}
            initialLiquidity={initialLiquidity}
            setInitialLiquidity={setInitialLiquidity}
            useManualLiquidity={useManualLiquidity}
            setUseManualLiquidity={setUseManualLiquidity}
            manualLiquidity={manualLiquidity}
            setManualLiquidity={setManualLiquidity}
            computedBalance={computedBalance}
          />
        )}

        {activeTab === 'members' && (
          <MembersView 
            members={members} 
            clubs={clubs} 
            leagues={leagues}
            addMember={addMember}
            updateMember={updateMember}
            deleteMember={deleteMember}
            isDarkMode={isDarkMode}
            currentUserRole={currentUserRole}
          />
        )}

        {activeTab === 'clubs' && (
          <ClubsView 
            clubs={clubs}
            addClub={addClub}
            updateClub={updateClub}
            deleteClub={deleteClub}
            isDarkMode={isDarkMode}
            currentUserRole={currentUserRole}
          />
        )}

        {activeTab === 'leagues' && (
          <LeaguesView 
            leagues={leagues}
            addLeague={addLeague}
            updateLeague={updateLeague}
            deleteLeague={deleteLeague}
            isDarkMode={isDarkMode}
            currentUserRole={currentUserRole}
          />
        )}

        {activeTab === 'executive' && (
          <ExecutiveView 
            positions={positions}
            addPosition={addPosition}
            updatePosition={updatePosition}
            deletePosition={deletePosition}
            isDarkMode={isDarkMode}
            currentUserRole={currentUserRole}
          />
        )}

        {activeTab === 'meetings' && (
          <MeetingsView 
            meetings={meetings}
            members={members}
            addMeeting={addMeeting}
            updateMeeting={updateMeeting}
            deleteMeeting={deleteMeeting}
            isDarkMode={isDarkMode}
            currentUserRole={currentUserRole}
            selectedMeeting={selectedMeeting}
            setSelectedMeeting={setSelectedMeeting}
          />
        )}

        {activeTab === 'activities' && (
          <ActivitiesView 
            activities={activities}
            clubs={clubs}
            addActivity={addActivity}
            updateActivity={updateActivity}
            deleteActivity={deleteActivity}
            isDarkMode={isDarkMode}
            currentUserRole={currentUserRole}
          />
        )}

        {activeTab === 'cotisations' && (
          <CotisationsView 
            contributions={contributions}
            members={members}
            activities={activities}
            addContribution={addContribution}
            deleteContribution={deleteContribution}
            isDarkMode={isDarkMode}
            currentUserRole={currentUserRole}
          />
        )}

        {activeTab === 'accounting' && (
          <AccountingView 
            journalEntries={journalEntries}
            addJournalEntry={addJournalEntry}
            deleteJournalEntry={deleteJournalEntry}
            isDarkMode={isDarkMode}
            currentUserRole={currentUserRole}
          />
        )}

        {activeTab === 'treasury' && (
          <TreasuryView 
            contributions={contributions}
            activities={activities}
            treasuryBalance={treasuryBalance}
            isDarkMode={isDarkMode}
            initialLiquidity={initialLiquidity}
            setInitialLiquidity={setInitialLiquidity}
            useManualLiquidity={useManualLiquidity}
            setUseManualLiquidity={setUseManualLiquidity}
            manualLiquidity={manualLiquidity}
            setManualLiquidity={setManualLiquidity}
            computedBalance={computedBalance}
          />
        )}

        {activeTab === 'documents' && isSuperAdmin && (
          <DocumentsView 
            documents={documents}
            addDocument={addDocument}
            deleteDocument={deleteDocument}
            isDarkMode={isDarkMode}
            currentUserRole={currentUserRole}
          />
        )}

        {activeTab === 'rh' && isSuperAdmin && (
          <HumanResourcesView 
            employees={employees}
            addEmployee={addEmployee}
            deleteEmployee={deleteEmployee}
            isDarkMode={isDarkMode}
            currentUserRole={currentUserRole}
          />
        )}

        {activeTab === 'alerts' && isSuperAdmin && (
          <AlertsView 
            alerts={alerts}
            markAsRead={markAsRead}
            clearAlert={clearAlert}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'security' && isSuperAdmin && (
          <SecurityView 
            currentUserRole={currentUserRole} 
            setCurrentUserRole={setCurrentUserRole}
            currentUserEmail={currentUserEmail}
            setCurrentUserEmail={setCurrentUserEmail}
            accessAccounts={accessAccounts}
            setAccessAccounts={setAccessAccounts}
            auditLogs={auditLogs}
            setAuditLogs={setAuditLogs}
            logAction={logAction}
            isDarkMode={isDarkMode}
            onSeedDemoData={handleSeedDemoData}
            onClearDemoData={handleClearDemoData}
            onRestoreDatabase={handleRestoreDatabase}
            databaseBackup={{ members, clubs, leagues, positions, meetings, activities, contributions, journalEntries, employees, documents, alerts, initialLiquidity, useManualLiquidity, manualLiquidity, accessAccounts, auditLogs }}
            databaseStats={{
              membersCount: members.length,
              clubsCount: clubs.length,
              leaguesCount: leagues.length,
              contributionsCount: contributions.length,
              journalCount: journalEntries.length,
              employeesCount: employees.length,
              documentsCount: documents.length
            }}
          />
        )}
      </main>

    </div>
  );
}
