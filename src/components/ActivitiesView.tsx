/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Calendar, DollarSign, Award, Music, X } from 'lucide-react';
import { Activity, Club } from '../types';

interface ActivitiesViewProps {
  activities: Activity[];
  clubs: Club[];
  addActivity: (act: Omit<Activity, 'id'>) => void;
  updateActivity: (id: string, act: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  isDarkMode: boolean;
  currentUserRole: string;
}

export default function ActivitiesView({
  activities,
  clubs,
  addActivity,
  updateActivity,
  deleteActivity,
  isDarkMode,
  currentUserRole
}: ActivitiesViewProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [clubId, setClubId] = useState('');
  const [budget, setBudget] = useState<number>(0);
  const [financialObjective, setFinancialObjective] = useState<number>(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<Activity['status']>('Planifiée');

  const resetForm = () => {
    setName('');
    setDescription('');
    setClubId('');
    setBudget(0);
    setFinancialObjective(0);
    setStartDate('');
    setEndDate('');
    setStatus('Planifiée');
    setEditingActivity(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !clubId) {
      alert("Veuillez renseigner le nom de l'activité ainsi que le club responsable.");
      return;
    }

    const activityData = {
      name,
      description,
      clubId,
      budget: Number(budget) || 0,
      financialObjective: Number(financialObjective) || 0,
      startDate,
      endDate,
      status
    };

    if (editingActivity) {
      updateActivity(editingActivity.id, activityData);
    } else {
      addActivity(activityData);
    }

    resetForm();
    setShowForm(false);
  };

  const handleEdit = (act: Activity) => {
    setEditingActivity(act);
    setName(act.name);
    setDescription(act.description);
    setClubId(act.clubId);
    setBudget(act.budget);
    setFinancialObjective(act.financialObjective);
    setStartDate(act.startDate);
    setEndDate(act.endDate);
    setStatus(act.status);
    setShowForm(true);
  };

  const filteredActivities = activities.filter(a => 
    `${a.name} ${a.description} ${a.status}`.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className={`text-2xl font-bold tracking-tight ${headingClass}`}>Activités & Programmes</h1>
          <p className={`text-sm ${textClass}`}>
            Enregistrer les activités musicales, de formation, sportives, budgétiser les ressources et fixer les jalons d'encaissement.
          </p>
        </div>
        {canModify && !showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-[#22B8A7] hover:bg-[#1fa192] text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-1.5 transition-colors shadow-sm"
            id="btn-add-activity"
          >
            <Plus className="w-4 h-4" /> Nouvelle Activité
          </button>
        )}
      </div>

      {showForm && (
        <div className={`p-6 rounded-xl border ${cardBgClass} shadow-md`}>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
            <h2 className={`font-bold text-base ${headingClass}`}>
              {editingActivity ? `Modifier l'activité : ${editingActivity.name}` : 'Enregistrer un Nouveau Projet d\'Activité'}
            </h2>
            <button 
              onClick={() => { setShowForm(false); resetForm(); }}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              id="btn-close-activity-form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Nom de l'Activité *</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Répétition Musicale Générale de Dakar"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Club Organisateur / Responsable *</label>
                <select 
                  value={clubId} 
                  onChange={(e) => setClubId(e.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="">Sélectionner un Club...</option>
                  {clubs.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Budget d'Investissement Prévu (FCFA)</label>
                <input 
                  type="number" 
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  placeholder="Ex: 500000"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Objectif Financier Recouvrement (FCFA) *</label>
                <input 
                  type="number" 
                  value={financialObjective}
                  onChange={(e) => setFinancialObjective(Number(e.target.value))}
                  placeholder="Ex: 1000000"
                  required
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Date de début</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Date de fin</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Statut Courant</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value as Activity['status'])}
                  className={inputClass}
                >
                  <option value="Planifiée">Planifiée</option>
                  <option value="En cours">En cours</option>
                  <option value="Terminée">Terminée</option>
                  <option value="Annulée">Annulée</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Description Détaillée</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Expliquez la programmation de cette activité administrative ou culturelle."
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
                id="btn-save-activity-submit"
              >
                {editingActivity ? 'Enregistrer les Modifications' : 'Enregistrer l\'Activité'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTER SEARCH ACTIVITY */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Chercher une de vos activités ou rassemblements par mot-clé..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#22B8A7]"
        />
      </div>

      {/* ACTIVITIES TABLE */}
      {filteredActivities.length === 0 ? (
        <div className={`p-8 rounded-xl border text-center ${cardBgClass}`}>
          <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className={`font-semibold text-base ${headingClass}`}>Aucune activité programmée</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
            Planifiez des sessions musicales collectives, compétitions ou prélèvements pour vos adhérents de GIE.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map(act => {
            const affiliatedClub = clubs.find(c => c.id === act.clubId)?.name || 'Multi-clubs';
            return (
              <div 
                key={act.id} 
                className={`p-5 rounded-xl border ${cardBgClass} flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden`}
              >
                {/* Visual Status Tag on side */}
                <div className={`absolute top-0 right-0 p-2.5 rounded-bl-xl text-[9px] font-bold uppercase text-white ${
                  act.status === 'Planifiée' ? 'bg-[#173C4A]' :
                  act.status === 'En cours' ? 'bg-[#22B8A7]' :
                  act.status === 'Terminée' ? 'bg-emerald-600' :
                  'bg-red-500'
                }`}>
                  {act.status}
                </div>

                <div className="space-y-4">
                  <div className="space-y-1 pr-14">
                    <span className="text-[10px] font-mono font-bold text-gray-400">#{act.id}</span>
                    <h3 className={`font-bold text-base tracking-tight ${headingClass} line-clamp-1`}>{act.name}</h3>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {act.description || 'Aucun détail rédigé.'}
                  </p>

                  <div className="space-y-2 text-xs border-t border-b border-gray-100 dark:border-gray-800 py-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Club responsable :</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[150px]">{affiliatedClub}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Budget prévu :</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-200">{act.budget.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Objectif financier :</span>
                      <span className="font-semibold text-[#22B8A7]">{act.financialObjective.toLocaleString()} FCFA</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#22B8A7]" />
                    <span>
                      {act.startDate ? new Date(act.startDate).toLocaleDateString('fr-FR') : 'Indéterminé'} au {act.endDate ? new Date(act.endDate).toLocaleDateString('fr-FR') : 'Indéterminé'}
                    </span>
                  </div>
                </div>

                {canModify && (
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-1.5">
                    <button 
                      onClick={() => handleEdit(act)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 hover:text-gray-700"
                      title="Modifier les détails"
                      id={`btn-editact-${act.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Rayer définitivement l'activité "${act.name}" de la plateforme ?`)) {
                          deleteActivity(act.id);
                        }
                      }}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded text-red-500"
                      title="Supprimer"
                      id={`btn-deleteact-${act.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
