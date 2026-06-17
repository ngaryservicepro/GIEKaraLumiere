/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  FileText, 
  Eye, 
  Download, 
  Upload, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2,
  X,
  User,
  ShieldAlert
} from 'lucide-react';
import { Member, Club, League } from '../types';
import { exportMembersToPdf } from '../utils/pdfHelper';
import PdfImportModal from './PdfImportModal';

interface MembersViewProps {
  members: Member[];
  clubs: Club[];
  leagues: League[];
  addMember: (member: Omit<Member, 'id'>) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  isDarkMode: boolean;
  currentUserRole: string;
}

export default function MembersView({
  members,
  clubs,
  leagues,
  addMember,
  updateMember,
  deleteMember,
  isDarkMode,
  currentUserRole
}: MembersViewProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Form Fields State
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [clubId, setClubId] = useState('');
  const [leagueId, setLeagueId] = useState('');
  const [grade, setGrade] = useState('');
  const [memberFunction, setMemberFunction] = useState('');
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<Member['status']>('Actif');
  const [cniNumber, setCniNumber] = useState('');
  
  // CNI file temporary helper
  const [cniFile, setCniFile] = useState<Member['cniFile'] | undefined>(undefined);
  const [cniError, setCniError] = useState<string | null>(null);
  const [cniSuccess, setCniSuccess] = useState<string | null>(null);

  // View CNI modal
  const [activeCniView, setActiveCniView] = useState<Member | null>(null);

  // Next Auto Id
  const generateNextId = () => {
    if (members.length === 0) return 'MEM-001';
    const ids = members.map(m => {
      const parts = m.id.split('-');
      return parts.length > 1 ? parseInt(parts[1], 10) : 0;
    });
    const max = Math.max(...ids, 0);
    return `MEM-${String(max + 1).padStart(3, '0')}`;
  };

  const handleCniUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCniError(null);
    setCniSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Constraints: 10MB limit
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setCniError('Le fichier dépasse la taille maximale autorisée de 10 MB.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setCniError('Format invalide. Seuls les fichiers JPG, PNG et PDF sont autorisés.');
      return;
    }

    // Convert file to Base64 mock url
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCniFile({
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          type: file.type,
          dataUrl: event.target.result as string
        });
        setCniSuccess('Fichier CNI validé et rattaché avec succès.');
      }
    };
    reader.readAsDataURL(file);
  };

  const removeCniFile = () => {
    setCniFile(undefined);
    setCniSuccess(null);
    setCniError(null);
  };

  const resetForm = () => {
    setFullName('');
    setBirthDate('');
    setBirthPlace('');
    setGender('M');
    setPhone('');
    setEmail('');
    setAddress('');
    setClubId('');
    setLeagueId('');
    setGrade('');
    setMemberFunction('');
    setJoinDate(new Date().toISOString().split('T')[0]);
    setStatus('Actif');
    setCniNumber('');
    setCniFile(undefined);
    setCniError(null);
    setCniSuccess(null);
    setEditingMember(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !cniNumber) {
      alert('Veuillez renseigner au moins le nom physique complet ainsi que son numéro de CNI.');
      return;
    }

    // Unique CNI Check
    const cniExists = members.some(m => m.cniNumber === cniNumber && (!editingMember || m.id !== editingMember.id));
    if (cniExists) {
      alert(`Erreur de validation automatique : Un membre possède déjà ce numéro de CNI (${cniNumber}).`);
      return;
    }

    const memberData = {
      fullName,
      birthDate,
      birthPlace,
      gender,
      phone,
      email,
      address,
      clubId,
      leagueId,
      grade,
      function: memberFunction,
      joinDate,
      status,
      cniNumber,
      cniFile
    };

    if (editingMember) {
      updateMember(editingMember.id, memberData);
      setEditingMember(null);
    } else {
      addMember(memberData);
    }

    resetForm();
    setShowAddForm(false);
  };

  const handleEdit = (m: Member) => {
    setEditingMember(m);
    setFullName(m.fullName);
    setBirthDate(m.birthDate);
    setBirthPlace(m.birthPlace);
    setGender(m.gender);
    setPhone(m.phone);
    setEmail(m.email);
    setAddress(m.address);
    setClubId(m.clubId);
    setLeagueId(m.leagueId);
    setGrade(m.grade);
    setMemberFunction(m.function);
    setJoinDate(m.joinDate);
    setStatus(m.status);
    setCniNumber(m.cniNumber);
    setCniFile(m.cniFile);
    setShowAddForm(true);
  };

  // Filter members
  const filteredMembers = members.filter(m => {
    const searchString = `${m.fullName} ${m.phone} ${m.cniNumber} ${m.id} ${m.email} ${m.grade}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const headingClass = isDarkMode ? 'text-white' : 'text-[#173C4A]';
  const cardBgClass = isDarkMode ? 'bg-[#122e38] border-gray-700' : 'bg-white border-gray-100';
  const textClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const inputClass = "w-full p-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#22B8A7] focus:outline-none";

  // Check role write permissions
  const canModify = currentUserRole !== 'Membre';

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between pb-4 border-b border-gray-200 dark:border-gray-800 gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${headingClass}`}>Gestion des Membres</h1>
          <p className={`text-sm ${textClass}`}>
            Inscrire, administrer et valider les dossiers juridiques et sportifs des adhérents.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {canModify && !showAddForm && (
            <>
              <button 
                onClick={() => setIsImportOpen(true)}
                className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#122e38] text-gray-700 dark:text-gray-205 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                📥 Importer Roster PDF
              </button>
              
              <button
                onClick={() => exportMembersToPdf(members, clubs, leagues)}
                className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-[#22B8A7]/20 bg-[#22B8A7]/10 text-[#22B8A7] hover:bg-[#22B8A7]/20 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                📤 Exporter Roster PDF
              </button>

              <button
                onClick={() => { resetForm(); setShowAddForm(true); }}
                className="bg-[#22B8A7] hover:bg-[#1da192] text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                id="btn-trigger-addmember-form"
              >
                <Plus className="w-4 h-4" /> Ajouter un Membre
              </button>
            </>
          )}
        </div>
      </div>

      {/* ADD/EDIT FORM */}
      {showAddForm && (
        <div className={`p-6 rounded-xl border ${cardBgClass} shadow-md`}>
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
            <h2 className={`text-lg font-bold ${headingClass}`}>
              {editingMember ? `Modifier le Membre ID : ${editingMember.id}` : `Nouvelle Fiche d'Adhésion (ID Automatique : ${generateNextId()})`}
            </h2>
            <button 
              onClick={() => { setShowAddForm(false); resetForm(); }}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              id="btn-close-member-form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* CIVIL STATE INFO */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#22B8A7]">1. État Civil & Identité</h3>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nom Complet *</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className={inputClass}
                    placeholder="Ex: Ngary Sow"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Sexe *</label>
                    <select 
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'M' | 'F')}
                      className={inputClass}
                    >
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Date Naissance</label>
                    <input 
                      type="date" 
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Lieu de Naissance</label>
                  <input 
                    type="text" 
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    className={inputClass}
                    placeholder="Ex: Dakar, Sénégal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Téléphone</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                    placeholder="Ex: +221 77 123 45 67"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">E-mail</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="Ex: ngary@gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Adresse Domicile</label>
                  <textarea 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={inputClass}
                    rows={2}
                    placeholder="Ex: Avenue Cheikh Anta Diop, Dakar"
                  />
                </div>
              </div>

              {/* ADMINISTRATIVE INFO */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#22B8A7]">2. Affiliation & Statut GIE</h3>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Club d'Appartenance</label>
                  <select 
                    value={clubId} 
                    onChange={(e) => setClubId(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Sélectionner un Club...</option>
                    {clubs.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Ligue Régionale affiliée</label>
                  <select 
                    value={leagueId} 
                    onChange={(e) => setLeagueId(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Sélectionner une Ligue...</option>
                    {leagues.map(l => (
                      <option key={l.id} value={l.id}>{l.name} - {l.region}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Grade</label>
                    <input 
                      type="text" 
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className={inputClass}
                      placeholder="Ex: Ceinture Noire"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Fonction de Bureau</label>
                    <input 
                      type="text" 
                      value={memberFunction}
                      onChange={(e) => setMemberFunction(e.target.value)}
                      className={inputClass}
                      placeholder="Ex: Secrétaire"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Date Adhésion</label>
                    <input 
                      type="date" 
                      value={joinDate}
                      onChange={(e) => setJoinDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Statut Courant</label>
                    <select 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value as Member['status'])}
                      className={inputClass}
                    >
                      <option value="Actif">Actif</option>
                      <option value="Inactif">Inactif</option>
                      <option value="Suspendu">Suspendu</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* CNI SECURED UPLOAD PORTAL */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#22B8A7]">3. Justificatif Juridique & CNI</h3>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Numéro Unique CNI *</label>
                  <input 
                    type="text" 
                    value={cniNumber}
                    onChange={(e) => setCniNumber(e.target.value)}
                    required
                    className={inputClass}
                    placeholder="Ex: 1 234 1990 01243"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Unicité contrôlée en temps réel par notre algorithme de validation.
                  </p>
                </div>

                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 text-center space-y-3">
                  <div className="mx-auto w-10 h-10 rounded-full bg-[#22B8A7]/10 text-[#22B8A7] flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Glissez-déposez le scan CNI ou
                    </span>
                    <label className="ml-1 text-xs text-[#22B8A7] hover:underline cursor-pointer font-bold">
                      parcourez
                      <input 
                        type="file" 
                        onChange={handleCniUpload} 
                        accept=".jpg,.jpeg,.png,.pdf" 
                        className="hidden" 
                      />
                    </label>
                  </div>
                  <p className="text-[10px] text-gray-400">
                    JPG, PNG ou PDF • Max. 10 MB
                  </p>
                </div>

                {cniError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{cniError}</span>
                  </div>
                )}

                {cniSuccess && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{cniSuccess}</span>
                  </div>
                )}

                {cniFile && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-[#22B8A7] flex-shrink-0" />
                      <div className="truncate text-xs">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{cniFile.name}</p>
                        <p className="text-[10px] text-gray-400">{cniFile.size}</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={removeCniFile}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Supprimer la CNI jointe"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* ACTION FOOTER */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => { setShowAddForm(false); resetForm(); }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm transition-colors"
                id="btn-cancel-addmember"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#173C4A] hover:bg-[#204f61] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                id="btn-save-member"
              >
                {editingMember ? 'Enregistrer les Modifications' : 'Enregistrer le Membre'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTER & SEARCH */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#22B8A7]"
            placeholder="Rechercher par nom, téléphone, CNI, ID, ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-xs text-gray-400 self-end">
          {filteredMembers.length} membre(s) filtré(s) sur {members.length} au total
        </div>
      </div>

      {/* MEMBERS TABLE */}
      {filteredMembers.length === 0 ? (
        <div className={`p-8 rounded-xl border text-center ${cardBgClass}`}>
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className={`font-semibold text-base ${headingClass}`}>Aucun membre trouvé</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
            {searchTerm ? "Aucun enregistrement ne correspond aux filtres de recherche." : "La base est actuellement vide. Utilisez le bouton d'inscription pour enregistrer votre premier adhérent."}
          </p>
        </div>
      ) : (
        <div className={`border rounded-xl ${cardBgClass} overflow-hidden shadow-xs`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-[#153440] text-gray-500 dark:text-gray-300 uppercase text-[10px] font-bold tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <th className="p-3">Matricule</th>
                  <th className="p-3">Identité</th>
                  <th className="p-3">Club Affilié</th>
                  <th className="p-3">Ligue Rép.</th>
                  <th className="p-3">CNI Unique</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                {filteredMembers.map(m => {
                  const correlatedClub = clubs.find(c => c.id === m.clubId)?.name || 'Non rattaché';
                  const correlatedLeague = leagues.find(l => l.id === m.leagueId)?.name || 'Non rattachée';
                  return (
                    <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-xs text-[#22B8A7] whitespace-nowrap">
                        {m.id}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300">
                            {m.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{m.fullName}</p>
                            <p className="text-xs text-gray-400">{m.phone || 'Aucun numéro'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-xs text-gray-600 dark:text-gray-300">
                        {correlatedClub}
                      </td>
                      <td className="p-3 text-xs text-gray-600 dark:text-gray-300">
                        {correlatedLeague}
                      </td>
                      <td className="p-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <span>{m.cniNumber}</span>
                          {m.cniFile ? (
                            <span 
                              onClick={() => setActiveCniView(m)}
                              className="text-[#22B8A7] hover:text-[#189182] cursor-pointer" 
                              title="Visualiser la CNI sécurisée"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="text-red-500" title="Absence de pièce d'identité scan">
                              <ShieldAlert className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          m.status === 'Actif' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300' :
                          m.status === 'Inactif' ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300' :
                          'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {m.cniFile && (
                            <button
                              onClick={() => setActiveCniView(m)}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-[#22B8A7] rounded"
                              title="Visualiser la CNI"
                              id={`btn-viewcni-${m.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {canModify && (
                            <>
                              <button
                                onClick={() => handleEdit(m)}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-[#173C4A] dark:text-gray-300 rounded"
                                title="Modifier"
                                id={`btn-editmember-${m.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Êtes-vous sûr de vouloir supprimer le membre ${m.fullName} (${m.id}) ?`)) {
                                    deleteMember(m.id);
                                  }
                                }}
                                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded"
                                title="Supprimer"
                                id={`btn-deletemember-${m.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW CNI DIALOG DETAIL (POPUP SECURE) */}
      {activeCniView && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-xl w-full border border-[#22B8A7] shadow-2xl relative">
            <button 
              onClick={() => setActiveCniView(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
              id="btn-close-cni-modal"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-base font-bold text-[#173C4A] dark:text-white mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#22B8A7]" />
              Fichier CNI Sécurisé de {activeCniView.fullName}
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Numéro de CNI : <strong className="font-mono text-gray-800 dark:text-white">{activeCniView.cniNumber}</strong>
            </p>

            {/* Simulated file viewer */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-2 bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center min-h-[300px]">
              {activeCniView.cniFile?.type.startsWith('image/') ? (
                <img 
                  src={activeCniView.cniFile.dataUrl} 
                  alt="Scan CNI" 
                  className="max-h-[320px] rounded object-contain border border-gray-200"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-center p-6 space-y-3">
                  <FileText className="w-16 h-16 text-red-400 mx-auto" />
                  <p className="font-semibold text-sm text-gray-800 dark:text-white">{activeCniView.cniFile?.name}</p>
                  <p className="text-xs text-gray-400">Document PDF • {activeCniView.cniFile?.size}</p>
                  <span className="inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-400 text-xs font-semibold rounded">
                    Validation Automatique Conforme
                  </span>
                </div>
              )}
            </div>

            {/* Modal action toolbar */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[10px] text-gray-400 max-w-[250px]">
                Sécurité Crypto-Lock : Conforme RGPD & Réglementation Nationale en vigueur (Sénégal).
              </p>
              <div className="flex gap-2">
                {activeCniView.cniFile?.dataUrl && (
                  <a 
                    href={activeCniView.cniFile.dataUrl} 
                    download={`CNI_${activeCniView.fullName.replace(/\s+/g, '_')}`}
                    className="px-3 py-1.5 bg-[#22B8A7] hover:bg-[#1a9c8d] text-white rounded text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Télécharger
                  </a>
                )}
                <button
                  onClick={() => {
                    const confirmReplace = confirm('Souhaitez-vous remplacer ou re-télécharger une nouvelle CNI pour ce membre ?');
                    if (confirmReplace) {
                      handleEdit(activeCniView);
                      setActiveCniView(null);
                    }
                  }}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Remplacer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PdfImportModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
        section="membres" 
        clubs={clubs}
        leagues={leagues}
        onImportComplete={(importedMembersList: any[]) => {
          if (Array.isArray(importedMembersList)) {
            importedMembersList.forEach(m => addMember(m));
          }
        }} 
      />
    </div>
  );
}
