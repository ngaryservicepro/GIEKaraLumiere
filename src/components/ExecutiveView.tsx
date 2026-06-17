/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Edit, Trash2, Shield, User, Power, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { ExecutivePosition } from '../types';

interface ExecutiveViewProps {
  positions: ExecutivePosition[];
  addPosition: (pos: Omit<ExecutivePosition, 'id' | 'isDefault'>) => void;
  updatePosition: (id: string, pos: Partial<ExecutivePosition>) => void;
  deletePosition: (id: string) => void;
  isDarkMode: boolean;
  currentUserRole: string;
}

export default function ExecutiveView({
  positions,
  addPosition,
  updatePosition,
  deletePosition,
  isDarkMode,
  currentUserRole
}: ExecutiveViewProps) {
  
  const [showForm, setShowForm] = useState(false);
  const [editingPos, setEditingPos] = useState<ExecutivePosition | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [holderName, setHolderName] = useState('');
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setTitle('');
    setHolderName('');
    setIsActive(true);
    setEditingPos(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !holderName) {
      alert("Veuillez spécifier le titre du poste ainsi que le nom du titulaire.");
      return;
    }

    if (editingPos) {
      updatePosition(editingPos.id, { title, holderName, isActive });
    } else {
      addPosition({ title, holderName, isActive });
    }

    resetForm();
    setShowForm(false);
  };

  const handleEdit = (pos: ExecutivePosition) => {
    setEditingPos(pos);
    setTitle(pos.title);
    setHolderName(pos.holderName);
    setIsActive(pos.isActive);
    setShowForm(true);
  };

  const canModify = currentUserRole === 'Super Administrateur' || currentUserRole === 'Président';
  const headingClass = isDarkMode ? 'text-white' : 'text-[#173C4A]';
  const cardBgClass = isDarkMode ? 'bg-[#122e38] border-gray-700' : 'bg-white border-gray-100';
  const textClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const inputClass = "w-full p-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#22B8A7] focus:outline-none";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200 dark:border-gray-800 gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${headingClass}`}>Bureau Exécutif</h1>
          <p className={`text-sm ${textClass}`}>
            Organe directeur du GIE. Administrez les postes officiels et de direction ainsi que leurs titulaires.
          </p>
        </div>
        {canModify && !showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-[#22B8A7] hover:bg-[#1fa192] text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-1.5 transition-colors shadow-sm"
            id="btn-add-post-exec"
          >
            <Plus className="w-4 h-4" /> Créer un Poste Dynamique
          </button>
        )}
      </div>

      {showForm && (
        <div className={`p-6 rounded-xl border ${cardBgClass} shadow-md`}>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
            <h2 className={`font-bold text-base ${headingClass}`}>
              {editingPos ? `Modifier le poste : ${editingPos.title}` : 'Créer un Nouveau Poste au Bureau'}
            </h2>
            <button 
              onClick={() => { setShowForm(false); resetForm(); }}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              id="btn-close-exec-form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Intitulé du Poste *</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Responsable Communication"
                  disabled={editingPos?.isDefault} // default positions cannot change title
                  required
                  className={`${inputClass} disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Nom Complet du Titulaire *</label>
                <input 
                  type="text" 
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  placeholder="Ex: Mme Mariama Ba"
                  required
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="block text-xs font-semibold text-gray-500 mb-1">État opérationnel</span>
                <label className="inline-flex items-center gap-2 cursor-pointer mt-2">
                  <input 
                    type="checkbox" 
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-gray-300 text-[#22B8A7] focus:ring-[#22B8A7]"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Poste actif et fonctionnel</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-150 dark:border-gray-750">
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
                id="btn-save-exec-pos"
              >
                {editingPos ? 'Sauvegarder' : 'Créer le Poste'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EXECUTIVE MATRIX GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {positions.map(pos => (
          <div 
            key={pos.id} 
            className={`p-5 rounded-xl border ${cardBgClass} flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden ${
              !pos.isActive ? 'opacity-60 bg-gray-50 dark:bg-gray-900 border-dashed' : ''
            }`}
          >
            {/* Color strip for structure */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${
              pos.isDefault ? 'bg-[#173C4A]' : 'bg-[#22B8A7]'
            }`} />

            <div className="pt-2 space-y-4">
              <div className="flex items-start justify-between gap-1">
                <div>
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mb-1 ${
                    pos.isDefault ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' : 'bg-teal-50 dark:bg-teal-950/40 text-[#22B8A7]'
                  }`}>
                    {pos.isDefault ? 'Poste Statutaire' : 'Poste Additionnel'}
                  </span>
                  <h3 className={`font-bold text-sm tracking-tight ${headingClass} leading-tight`}>{pos.title}</h3>
                </div>
                <span className={`p-1.5 rounded-full ${pos.isActive ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                  {pos.isActive ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                </span>
              </div>

              {/* Holder Profile */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#173C4A]/10 text-[#173C4A] dark:bg-[#22B8A7]/10 dark:text-[#22B8A7] flex items-center justify-center font-bold text-sm">
                  {pos.holderName ? pos.holderName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Titulaire</p>
                  <p className="text-sm font-bold text-gray-950 dark:text-white truncate">{pos.holderName || "Vacant"}</p>
                </div>
              </div>
            </div>

            {/* Admin trigger tools */}
            <div className="mt-6 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className={`text-[10px] font-semibold ${pos.isActive ? 'text-emerald-500' : 'text-gray-400'}`}>
                ● {pos.isActive ? 'En mandat' : 'Désactivé'}
              </span>

              {canModify && (
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => handleEdit(pos)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-850 rounded text-gray-600 dark:text-gray-400"
                    title="Modifier les détails"
                    id={`btn-editexec-${pos.id}`}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  
                  {/* Turn on/off position status */}
                  <button
                    onClick={() => {
                      updatePosition(pos.id, { isActive: !pos.isActive });
                    }}
                    className={`p-1 rounded ${pos.isActive ? 'hover:bg-amber-55 hover:text-amber-500 text-gray-400' : 'hover:bg-emerald-55 hover:text-emerald-500 text-gray-400'}`}
                    title={pos.isActive ? "Deactivate" : "Activate"}
                    id={`btn-stateexec-${pos.id}`}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>

                  {!pos.isDefault && (
                    <button 
                      onClick={() => {
                        if (confirm(`Rayer définitivement le poste "${pos.title}" de la structure administrative du GIE ?`)) {
                          deletePosition(pos.id);
                        }
                      }}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded"
                      title="Supprimer"
                      id={`btn-deleteexec-${pos.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
