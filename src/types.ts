/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Roles for the security and permissions system
export type UserRole = 
  | 'Super Administrateur' 
  | 'Président' 
  | 'Secrétaire Général' 
  | 'Trésorier' 
  | 'Responsable Musicale' 
  | 'Membre';

// Member representation
export interface Member {
  id: string; // Automated: MEM-001, MEM-002...
  photo?: string; // Data URL or placeholder
  fullName: string;
  birthDate: string;
  birthPlace: string;
  gender: 'M' | 'F';
  phone: string;
  email: string;
  address: string;
  clubId: string;
  leagueId: string;
  grade: string;
  function: string;
  joinDate: string;
  status: 'Actif' | 'Inactif' | 'Suspendu';
  cniNumber: string; // Unique CNI number
  cniFile?: {
    name: string;
    size: string;
    type: string;
    dataUrl: string;
  };
}

// Club representation
export interface Club {
  id: string;
  name: string;
  president: string;
  phone: string;
  email: string;
  address: string;
  website: string;
}

// League representation
export interface League {
  id: string;
  name: string;
  region: string;
  responsible: string;
}

// Executive Position representation
export interface ExecutivePosition {
  id: string;
  title: string;
  holderName: string; // assigned member name or custom
  isActive: boolean;
  isDefault: boolean; // Président, SG, Trésorier, Responsable Musicale
}

// Meeting representation
export interface ActionItem {
  id: string;
  description: string;
  responsible: string;
  dueDate: string;
}

export interface MeetingReport {
  attendees: string[]; // member names
  decisions: string[];
  resolutions: string[];
  actions: ActionItem[];
  presidentSigned: boolean;
  sgSigned: boolean;
  signDate?: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  participants: string[]; // member IDs or custom list
  agenda: string;
  status: 'Planifiée' | 'En cours' | 'Terminée' | 'Annulée';
  report?: MeetingReport;
}

// Activity representation
export interface Activity {
  id: string;
  name: string;
  description: string;
  clubId: string; // responsible club
  budget: number;
  financialObjective: number;
  startDate: string;
  endDate: string;
  status: 'Planifiée' | 'En cours' | 'Terminée' | 'Annulée';
}

// Contributions / Cotisations
export interface Contribution {
  id: string;
  activityId: string;
  memberId: string;
  amount: number;
  date: string;
  reference: string;
  paymentMethod: 'Espèces' | 'Wave' | 'Orange Money' | 'Free Money' | 'Virement bancaire' | 'Carte bancaire';
}

// Chart of Accounts (Plan Comptable)
export const CHART_OF_ACCOUNTS = {
  '266': 'Apports',
  '2676': 'Avances consolidables',
  '4581': 'Opérations en commun',
  '267': 'Distribution bénéfices',
  '7616': 'Produits financiers',
  '6866': 'Dotations',
  '2966': 'Dépréciations',
  '29676': 'Provisions',
  '4958': 'Charges à répartir'
} as const;

export type AccountCode = keyof typeof CHART_OF_ACCOUNTS;

// Accounting Journal Entry
export interface JournalEntry {
  id: string;
  date: string;
  ref: string;
  label: string;
  accountCode: AccountCode;
  type: 'Débit' | 'Crédit';
  amount: number;
}

// Human Resources definition - Non-salaried GIE Collaborators & Providers
export interface Employee {
  id: string;
  fullName: string;
  position: string;
  contractType: 'Prestataire' | 'Bénévole' | 'Stagiaire' | 'MAD' | 'Consultant';
  startDate: string;
  endDate?: string;
  salary: number; // Indemnités / Honoraires (FCFA)
  email: string;
  phone: string;
}

export interface ArchivalDocument {
  id: string;
  name: string;
  category: 'CNI' | 'Contrat' | 'Rapport' | 'Procès-Verbal' | 'Reçu';
  uploadDate: string;
  fileSize: string;
  uploaderName: string;
  fileContent?: string; // Base64 or mock content placeholder
}

export interface IntelligentAlert {
  id: string;
  type: 'warning' | 'info' | 'danger' | 'success';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}
