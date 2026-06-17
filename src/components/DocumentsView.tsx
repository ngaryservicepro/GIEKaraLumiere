/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, FileText, Upload, Download, Trash2, Shield, FolderOpen, Calendar, HelpCircle, X } from 'lucide-react';
import { ArchivalDocument } from '../types';

interface DocumentsViewProps {
  documents: ArchivalDocument[];
  addDocument: (doc: Omit<ArchivalDocument, 'id'>) => void;
  deleteDocument: (id: string) => void;
  isDarkMode: boolean;
  currentUserRole: string;
}

export default function DocumentsView({
  documents,
  addDocument,
  deleteDocument,
  isDarkMode,
  currentUserRole
}: DocumentsViewProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Upload Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ArchivalDocument['category']>('Contrat');
  const [fileContent, setFileContent] = useState('');
  const [fileSizeStr, setFileSizeStr] = useState('1.5 MB');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setName(file.name);
    setFileSizeStr((file.size / (1024 * 1024)).toFixed(2) + ' MB');

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFileContent(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert("Veuillez d'abord sélectionner un fichier à uploader.");
      return;
    }

    addDocument({
      name,
      category,
      uploadDate: new Date().toISOString().split('T')[0],
      fileSize: fileSizeStr,
      uploaderName: currentUserRole,
      fileContent: fileContent || 'data:text/plain;base64,TW9jayBmaWxl' // simple default base64 placeholder
    });

    setName('');
    setFileContent('');
    setShowUploadForm(false);
    alert(`Document "${name}" archivé de manière sécurisée.`);
  };

  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const canModify = currentUserRole !== 'Membre';
  const headingClass = isDarkMode ? 'text-white' : 'text-[#173C4A]';
  const cardBgClass = isDarkMode ? 'bg-[#122e38] border-gray-700' : 'bg-white border-gray-100';
  const textClass = isDarkMode ? 'text-gray-300' : 'text-gray-650';
  const inputClass = "w-full p-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#22B8A7] focus:outline-none";

  const categories = ['CNI', 'Contrat', 'Rapport', 'Procès-Verbal', 'Reçu'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200 dark:border-gray-800 gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${headingClass}`}>Espace National d'Archivage</h1>
          <p className={`text-sm ${textClass}`}>
            Stockage cloud chiffré des contrats d'embauche, pièces d'identité, rapports d'activité, bilans comptables et quittances de paiement.
          </p>
        </div>
        {canModify && !showUploadForm && (
          <button
            onClick={() => setShowUploadForm(true)}
            className="bg-[#22B8A7] hover:bg-[#1da091] text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-1.5 transition-colors shadow-sm"
            id="btn-trigger-upload-doc"
          >
            <Upload className="w-4 h-4" /> Archivage Fichier Secure
          </button>
        )}
      </div>

      {showUploadForm && (
        <div className={`p-6 rounded-xl border ${cardBgClass} shadow-md`}>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
            <h2 className={`font-bold text-base ${headingClass}`}>Sécuriser & Archiver un Document</h2>
            <button 
              onClick={() => setShowUploadForm(false)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-850 text-gray-500"
              id="btn-close-doc-form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Catégorie Administrative *</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value as ArchivalDocument['category'])}
                  className={inputClass}
                >
                  <option value="CNI">CNI (Pièces d'identité)</option>
                  <option value="Contrat">Contrats de travail & MAD</option>
                  <option value="Rapport">Rapports d'activités</option>
                  <option value="Procès-Verbal">Procès-verbaux de Réunions</option>
                  <option value="Reçu">Reçus de Cotisations / Factures</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Fichier physique à stocker *</label>
                <input 
                  type="file" 
                  onChange={handleFileUpload}
                  required
                  className={inputClass} 
                />
              </div>

              {name && (
                <div className="md:col-span-2 p-3 bg-[#22B8A7]/10 rounded-lg text-xs text-[#22B8A7]">
                  Fichier chargé : <strong>{name}</strong> ({fileSizeStr}) • Prêt pour le transfert sécurisé SSL.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button 
                type="button" 
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="px-5 py-2 bg-[#173C4A] hover:bg-[#12303c] text-white rounded-lg text-sm font-semibold transition-colors"
                id="btn-submit-upload-doc"
              >
                Archiver Légitimement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SEARCH AND CATEGORY FILTER TOOLBAR */}
      <div className="bg-gray-50 dark:bg-[#11262f] p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher un document par nom de fichier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-950 dark:text-white focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 text-xs bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="All">Toutes les catégories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* DOCUMENTS GRID */}
      {filteredDocs.length === 0 ? (
        <div className={`p-8 rounded-xl border text-center ${cardBgClass}`}>
          <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className={`font-semibold text-base ${headingClass}`}>Aucun document indexé</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
            {searchTerm ? "Aucun fichier d'archives ne correspond." : "Le classeur national sécurisé est vide de tout rapport."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map(doc => (
            <div 
              key={doc.id} 
              className={`p-5 rounded-xl border ${cardBgClass} flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden`}
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#173C4A]" />

              <div className="space-y-4">
                <div className="flex justify-between items-start gap-1">
                  <span className="inline-block px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {doc.category}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">#{doc.id}</span>
                </div>

                <div className="flex gap-3">
                  <div className="p-2.5 bg-[#22B8A7]/10 text-[#22B8A7] rounded-lg">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className={`font-bold text-sm tracking-tight ${headingClass} truncate`} title={doc.name}>
                      {doc.name}
                    </h3>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" /> Archivé le {new Date(doc.uploadDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-[9px] text-gray-400 uppercase font-bold">
                  Par: {doc.uploaderName} • Size: {doc.fileSize}
                </span>

                <div className="flex gap-1">
                  {doc.fileContent && (
                    <a 
                      href={doc.fileContent} 
                      download={doc.name}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-850 rounded text-[#22B8A7]"
                      title="Télécharger l'original"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                  {canModify && (
                    <button 
                      onClick={() => {
                        if (confirm(`Rayer définitivement le document "${doc.name}" des serveurs sécurisés ?`)) {
                          deleteDocument(doc.id);
                        }
                      }}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded"
                      title="Supprimer d'archivage"
                      id={`btn-deletedoc-${doc.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
