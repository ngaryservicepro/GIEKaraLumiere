/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Shield, Map, User, X } from 'lucide-react';
import { League } from '../types';

interface LeaguesViewProps {
  leagues: League[];
  addLeague: (league: Omit<League, 'id'>) => void;
  updateLeague: (id: string, league: Partial<League>) => void;
  deleteLeague: (id: string) => void;
  isDarkMode: boolean;
  currentUserRole: string;
}

export default function LeaguesView({
  leagues,
  addLeague,
  updateLeague,
  deleteLeague,
  isDarkMode,
  currentUserRole
}: LeaguesViewProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingLeague, setEditingLeague] = useState<League | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [responsible, setResponsible] = useState('');

  const resetForm = () => {
    setName('');
    setRegion('');
    setResponsible('');
    setEditingLeague(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !region || !responsible) {
      alert("Veuillez renseigner tous les attributs requis pour créer ou modifier la ligue.");
      return;
    }

    const leagueData = { name, region, responsible };

    if (editingLeague) {
      updateLeague(editingLeague.id, leagueData);
    } else {
      addLeague(leagueData);
    }

    resetForm();
    setShowForm(false);
  };

  const handleEdit = (league: League) => {
    setEditingLeague(league);
    setName(league.name);
    setRegion(league.region);
    setResponsible(league.responsible);
    setShowForm(true);
  };

  const filteredLeagues = leagues.filter(l => 
    `${l.name} ${l.region} ${l.responsible}`.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className={`text-2xl font-bold tracking-tight ${headingClass}`}>Ligues Régionales</h1>
          <p className={`text-sm ${textClass}`}>
            Administrer les structures régionales et instances dirigeantes décentralisées du GIE.
          </p>
        </div>
        {canModify && !showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-[#22B8A7] hover:bg-[#1fa192] text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-1.5 transition-colors shadow-sm"
            id="btn-trigger-addleague"
          >
            <Plus className="w-4 h-4" /> Nouvelle Ligue
          </button>
        )}
      </div>

      {showForm && (
        <div className={`p-6 rounded-xl border ${cardBgClass} shadow-md`}>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
            <h2 className={`font-bold text-base ${headingClass}`}>
              {editingLeague ? `Modifier la ligue : ${editingLeague.name}` : 'Créer une Nouvelle Ligue Régionale'}
            </h2>
            <button 
              onClick={() => { setShowForm(false); resetForm(); }}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              id="btn-close-league-form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Nom de la Ligue *</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Ligue de Dakar"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Région Administrative *</label>
                <select 
                  value={region} 
                  onChange={(e) => setRegion(e.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="">Sélectionner une région...</option>
                  <option value="Dakar">Dakar</option>
                  <option value="Thiès">Thiès</option>
                  <option value="Saint-Louis">Saint-Louis</option>
                  <option value="Diourbel">Diourbel</option>
                  <option value="Fatick">Fatick</option>
                  <option value="Kaolack">Kaolack</option>
                  <option value="Kolda">Kolda</option>
                  <option value="Ziguinchor">Ziguinchor</option>
                  <option value="Louga">Louga</option>
                  <option value="Matam">Matam</option>
                  <option value="Kaffrine">Kaffrine</option>
                  <option value="Kedougou">Kédougou</option>
                  <option value="Sédhiou">Sédhiou</option>
                  <option value="Tambacounda">Tambacounda</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Responsable Général *</label>
                <input 
                  type="text" 
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                  placeholder="Ex: Babacar Ndiaye"
                  required
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
                id="btn-save-league"
              >
                {editingLeague ? 'Enregistrer les Modifications' : 'Créer la Ligue'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTER SEARCH LEAGUE */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Rechercher une ligue par nom de ligue, région, ou nom du responsable..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#22B8A7]"
        />
      </div>

      {/* LEAGUES LIST */}
      {filteredLeagues.length === 0 ? (
        <div className={`p-8 rounded-xl border text-center ${cardBgClass}`}>
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className={`font-semibold text-base ${headingClass}`}>Aucune ligue recensée</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
            La ligue est un élément d'identification important pour la gestion du GIE. Créez des ligues pour y affecter vos effectifs.
          </p>
        </div>
      ) : (
        <div className={`border rounded-xl ${cardBgClass} overflow-hidden shadow-xs`}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-[#153440] text-gray-500 dark:text-gray-300 uppercase text-[10px] font-bold tracking-wider border-b border-gray-200 dark:border-gray-700">
                <th className="p-3">CODE</th>
                <th className="p-3">Nom Ligue</th>
                <th className="p-3">Région Sénégal</th>
                <th className="p-3">Responsable en charge</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
              {filteredLeagues.map(l => (
                <tr key={l.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="p-3 font-mono text-xs font-bold text-[#22B8A7]">{l.id}</td>
                  <td className="p-3 font-semibold text-gray-905 dark:text-white">{l.name}</td>
                  <td className="p-3 text-xs text-gray-600 dark:text-gray-300">
                    <span className="inline-flex items-center gap-1">
                      <Map className="w-3.5 h-3.5 text-gray-400" />
                      {l.region}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-gray-600 dark:text-gray-300">
                    <span className="inline-flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      {l.responsible}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {canModify ? (
                      <div className="flex gap-1 justify-end">
                        <button 
                          onClick={() => handleEdit(l)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-[#173C4A] dark:text-gray-300"
                          title="Modifier"
                          id={`btn-editleague-${l.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm(`Écarter/supprimer définitivement la ligue "${l.name}" de l'instance ?`)) {
                              deleteLeague(l.id);
                            }
                          }}
                          className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded text-red-500"
                          title="Supprimer"
                          id={`btn-deleteleague-${l.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Lecture seule</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
