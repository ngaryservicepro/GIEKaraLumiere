/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Download, Globe, User, Phone, Mail, MapPin, X } from 'lucide-react';
import { Club } from '../types';

interface ClubsViewProps {
  clubs: Club[];
  addClub: (club: Omit<Club, 'id'>) => void;
  updateClub: (id: string, club: Partial<Club>) => void;
  deleteClub: (id: string) => void;
  isDarkMode: boolean;
  currentUserRole: string;
}

export default function ClubsView({
  clubs,
  addClub,
  updateClub,
  deleteClub,
  isDarkMode,
  currentUserRole
}: ClubsViewProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [president, setPresident] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');

  const resetForm = () => {
    setName('');
    setPresident('');
    setPhone('');
    setEmail('');
    setAddress('');
    setWebsite('');
    setEditingClub(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !president) {
      alert("Veuillez remplir au moins le nom de l'association (Club) et le nom du président.");
      return;
    }

    const clubData = { name, president, phone, email, address, website };

    if (editingClub) {
      updateClub(editingClub.id, clubData);
    } else {
      addClub(clubData);
    }

    resetForm();
    setShowForm(false);
  };

  const handleEdit = (club: Club) => {
    setEditingClub(club);
    setName(club.name);
    setPresident(club.president);
    setPhone(club.phone);
    setEmail(club.email);
    setAddress(club.address);
    setWebsite(club.website);
    setShowForm(true);
  };

  const handleExportCSV = () => {
    if (clubs.length === 0) {
      alert("Aucun club à exporter.");
      return;
    }

    // construct beautiful CSV
    const headers = 'ID,Nom Club,President,Telephone,Email,Adresse,Site Internet\n';
    const rows = clubs.map(c => 
      `"${c.id}","${c.name.replace(/"/g, '""')}","${c.president.replace(/"/g, '""')}","${c.phone}","${c.email}","${c.address.replace(/"/g, '""')}","${c.website}"`
    ).join('\n');

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(headers + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `GIE_Kara_Lumiere_Clubs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredClubs = clubs.filter(c => 
    `${c.name} ${c.president} ${c.email} ${c.phone}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canModify = currentUserRole !== 'Membre';
  const headingClass = isDarkMode ? 'text-white' : 'text-[#173C4A]';
  const cardBgClass = isDarkMode ? 'bg-[#122e38] border-gray-700' : 'bg-white border-gray-100';
  const textClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const inputClass = "w-full p-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#22B8A7] focus:outline-none";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200 dark:border-gray-800 gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${headingClass}`}>Clubs Affiliés</h1>
          <p className={`text-sm ${textClass}`}>
            Gérer les différents clubs et associations sportives ou artistiques rattachés au GIE Kara Lumière.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors"
            id="btn-export-clubs"
          >
            <Download className="w-4 h-4" /> Exporter CSV
          </button>
          {canModify && !showForm && (
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="bg-[#22B8A7] hover:bg-[#1fa192] text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-1.5 transition-colors shadow-sm"
              id="btn-trigger-addclub"
            >
              <Plus className="w-4 h-4" /> Nouveau Club
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className={`p-6 rounded-xl border ${cardBgClass} shadow-md`}>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
            <h2 className={`font-bold text-base ${headingClass}`}>
              {editingClub ? `Modifier l'association : ${editingClub.name}` : 'Rattacher un Nouveau Club'}
            </h2>
            <button 
              onClick={() => { setShowForm(false); resetForm(); }}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              id="btn-close-club-form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Nom du Club *</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Club de Karaté de Fann"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Nom du Président *</label>
                <input 
                  type="text" 
                  value={president}
                  onChange={(e) => setPresident(e.target.value)}
                  placeholder="Ex: Maître Ibrahima Diallo"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Téléphone Secrétariat</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: +221 33 824 12 12"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Adresse E-mail de Contact</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: contact@karatefann.sn"
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Adresse Géographique</label>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Rue 10 prolongation face université, Dakar"
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Site internet officiel</label>
                <input 
                  type="url" 
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="Ex: https://www.karatefann.sn"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button 
                type="button" 
                onClick={() => { setShowForm(false); resetForm(); }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="px-5 py-2 bg-[#173C4A] hover:bg-[#12303c] text-white rounded-lg text-sm font-semibold transition-colors"
                id="btn-save-club"
              >
                {editingClub ? 'Enregistrer les Modifications' : 'Enregistrer le Club'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTER SEARCH CLUB */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Rechercher un club par nom, président ou téléphone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#22B8A7]"
        />
      </div>

      {/* CLUBS BENTO-GRID */}
      {filteredClubs.length === 0 ? (
        <div className={`p-8 rounded-xl border text-center ${cardBgClass}`}>
          <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className={`font-semibold text-base ${headingClass}`}>Aucun club de disponible</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
            Vous n'avez pas encore configuré de clubs. Les membres ont besoin d'au moins un club à associer dans leurs fiches CNI.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map(club => (
            <div 
              key={club.id} 
              className={`p-5 rounded-xl border ${cardBgClass} flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden`}
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#22B8A7]" />
              
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className={`font-bold text-base tracking-tight ${headingClass}`}>{club.name}</h3>
                  <span className="text-[10px] font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-400 font-bold">
                    {club.id}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#22B8A7]" />
                    <span>Président: <strong>{club.president}</strong></span>
                  </div>
                  {club.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-[#22B8A7]" />
                      <span>Tél: {club.phone}</span>
                    </div>
                  )}
                  {club.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-[#22B8A7]" />
                      <span className="truncate">{club.email}</span>
                    </div>
                  )}
                  {club.address && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#22B8A7]" />
                      <span className="truncate">{club.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                {club.website ? (
                  <a 
                    href={club.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-[#22B8A7] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Globe className="w-3.5 h-3.5" /> Site Web
                  </a>
                ) : (
                  <span className="text-xs text-gray-400 italic">Aucun site Internet</span>
                )}

                {canModify && (
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleEdit(club)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-[#173C4A] dark:text-gray-300"
                      title="Modifier les détails"
                      id={`btn-editclub-${club.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Voulez-vous dissoudre/supprimer le club "${club.name}" de la plateforme ? Tous les rattachements de membres persisteront.`)) {
                          deleteClub(club.id);
                        }
                      }}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded text-red-500"
                      title="Supprimer"
                      id={`btn-deleteclub-${club.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
