/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { 
  Users, 
  Briefcase, 
  Plus, 
  FileText, 
  Printer, 
  Wrench, 
  Trash2, 
  ShieldAlert,
  X
} from 'lucide-react';
import { Employee } from '../types';
import { 
  generateContractText, 
  generateMADText, 
  generateITCharter, 
  generateConfidentialityText 
} from '../utils/docsTemplates';

interface HumanResourcesViewProps {
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  deleteEmployee: (id: string) => void;
  isDarkMode: boolean;
  currentUserRole: string;
}

type DocType = 'contrat' | 'mad' | 'charte' | 'confidentialite';

export default function HumanResourcesView({
  employees,
  addEmployee,
  deleteEmployee,
  isDarkMode,
  currentUserRole
}: HumanResourcesViewProps) {
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Document generation helper states
  const [activeGenDocType, setActiveGenDocType] = useState<DocType | null>(null);
  const [generatedDocText, setGeneratedDocText] = useState<string | null>(null);

  // Add form states
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [contractType, setContractType] = useState<Employee['contractType']>('Bénévole');
  const [startDate, setStartDate] = useState('');
  const [salary, setSalary] = useState<number>(0);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const resetForm = () => {
    setFullName('');
    setPosition('');
    setContractType('Bénévole');
    setStartDate('');
    setSalary(0);
    setEmail('');
    setPhone('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !position) {
      alert("Veuillez renseigner le nom complet et la désignation de l'intervenant.");
      return;
    }
    if (salary < 0) {
      alert("Le montant des indemnités ne peut pas être inférieur à 0.");
      return;
    }

    addEmployee({
      fullName,
      position,
      contractType,
      startDate,
      salary: Number(salary),
      email,
      phone
    });

    resetForm();
    setShowAddForm(false);
    alert(`Fiche collaborateur enregistrée pour ${fullName}.`);
  };

  const handleGenerateDoc = (emp: Employee, type: DocType) => {
    setSelectedEmployee(emp);
    setActiveGenDocType(type);

    let docCompiled = '';
    if (type === 'contrat') {
      docCompiled = generateContractText(emp);
    } else if (type === 'mad') {
      docCompiled = generateMADText(emp);
    } else if (type === 'charte') {
      docCompiled = generateITCharter();
    } else {
      docCompiled = generateConfidentialityText(emp);
    }

    setGeneratedDocText(docCompiled);
  };

  const currentMonthExpensesSum = employees.reduce((sum, e) => sum + e.salary, 0);

  const canModify = currentUserRole === 'Super Administrateur' || currentUserRole === 'Secrétaire Général' || currentUserRole === 'Président';
  const headingClass = isDarkMode ? 'text-white' : 'text-[#173C4A]';
  const cardBgClass = isDarkMode ? 'bg-[#122e38] border-gray-700' : 'bg-white border-gray-100';
  const textClass = isDarkMode ? 'text-gray-300' : 'text-gray-650';
  const inputClass = "w-full p-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#22B8A7] focus:outline-none";

  return (
    <div className="space-y-6">
      {/* Header section with GIE Non-salaried policy explanation banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200 dark:border-gray-800 gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${headingClass}`}>Collaborateurs & Prestataires</h1>
          <p className={`text-sm ${textClass}`}>
            Gestion des bénévoles, stagiaires, intervenants et prestataires de services du groupement. Édition de contrats d'honoraires, d'engagements de confidentialité et de fiches d'indemnisation.
          </p>
        </div>
        {canModify && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-[#22B8A7] hover:bg-[#1fa192] text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            id="btn-add-employee"
          >
            <Plus className="w-4 h-4" /> Enregistrer un Collaborateur
          </button>
        )}
      </div>

      {/* GIE Statutory warning notice */}
      <div className="bg-[#173C4A]/10 border border-[#173C4A]/20 p-4 rounded-xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-[#22B8A7] shrink-0 mt-0.5" />
        <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
          <p className="font-bold uppercase text-[#22B8A7]">ℹ️ Information Statutaire du GIE</p>
          <p>
            Conformément aux statuts enregistrés du <strong className="text-white">GIE 221 Lumière</strong>, le groupement est constitué de membres rattachés et ne dispose pas de salariés permanents sous contrat de travail standard. Le pilotage opérationnel s'appuie exclusivement sur des <strong>bénévoles</strong>, des <strong>collaborateurs partenaires (Mise à disposition)</strong> et des <strong>prestataires de services externes</strong> facturant des honoraires.
          </p>
        </div>
      </div>

      {/* METRIC ON TOP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={`p-4 rounded-xl border ${cardBgClass} flex items-center justify-between`}>
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">👥 Intervenants recensés</span>
            <div className="text-2xl font-bold text-[#173C4A] dark:text-[#22B8A7] mt-1">{employees.length} collaborateur(s)</div>
          </div>
          <div className="p-3 bg-teal-50 dark:bg-teal-950/20 text-[#22B8A7] rounded-lg">
            <Users className="w-6 h-6" />
          </div>
        </div>
        <div className={`p-4 rounded-xl border ${cardBgClass} flex items-center justify-between`}>
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">💰 Budget mensuel d'indemnités & d'honoraires</span>
            <div className="text-2xl font-bold text-gray-850 dark:text-white mt-1">{currentMonthExpensesSum.toLocaleString()} FCFA</div>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-lg">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* REGISTER FORM */}
      {showAddForm && (
        <div className={`p-6 rounded-xl border ${cardBgClass} shadow-md`}>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
            <h2 className={`font-bold text-base ${headingClass}`}>Enregistrer une Fiche Collaborateur</h2>
            <button 
              onClick={() => { setShowAddForm(false); resetForm(); }}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-850 text-gray-500 cursor-pointer"
              id="btn-close-rh-form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Nom complet *</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Seynabou Ndiaye"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Rôle / Désignation de la mission *</label>
                <input 
                  type="text" 
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Ex: Expert Comptable / Secrétaire d'Accueil"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Statut d'engagement *</label>
                <select 
                  value={contractType} 
                  onChange={(e) => setContractType(e.target.value as Employee['contractType'])}
                  className={inputClass}
                >
                  <option value="Bénévole">Bénévole (Engagement gratuit / défraiement libre)</option>
                  <option value="Prestataire">Prestataire de service (Facturation d'honoraires)</option>
                  <option value="Stagiaire">Stagiaire (Gratification académique)</option>
                  <option value="MAD">MAD (Personnel de club mis à disposition)</option>
                  <option value="Consultant">Consultant Externe (Honoraires d'expertise)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 font-mono">Indemnités / Honoraires mensuels (FCFA)</label>
                <input 
                  type="number" 
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value))}
                  placeholder="Ex: 150000 (0 si bénévole pur)"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Date d'effet de l'engagement</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">E-mail de communication</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: seynabou@company.com"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button 
                type="button" 
                onClick={() => { setShowAddForm(false); resetForm(); }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm cursor-pointer"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="px-5 py-2 bg-[#173C4A] hover:bg-[#12303c] text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                id="btn-save-employee-submit"
              >
                Valider l'Intégration
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EMPLOYEES GRID WITH DOCUMENT GENERATION ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* EMPLOYEES INDEX CARD */}
        <div className="lg:col-span-2 space-y-4">
          {employees.length === 0 ? (
            <div className={`p-8 border rounded-xl text-center ${cardBgClass} text-gray-500`}>
              Aucun bénévole, prestataire ou personnel mis à disposition enregistré. Utilisez le bouton ci-dessus pour ajouter des fiches.
            </div>
          ) : (
            employees.map(emp => (
              <div key={emp.id} className={`p-5 rounded-xl border ${cardBgClass} flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#22B8A7] transition-all`}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-[#22B8A7]/10 dark:bg-[#22B8A7]/20 px-2 py-0.5 rounded text-[#22B8A7] font-bold">
                      {emp.contractType}
                    </span>
                    <h3 className={`font-bold text-sm ${headingClass}`}>{emp.fullName}</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <p>Mission : <strong className="text-gray-700 dark:text-gray-200">{emp.position}</strong></p>
                    <p>Honoraires/Frais : <strong className="text-gray-700 dark:text-gray-200">{emp.salary.toLocaleString()} FCFA</strong></p>
                    <p className="col-span-2">Date d'effet : {emp.startDate ? new Date(emp.startDate).toLocaleDateString('fr-FR') : 'Non définie'}</p>
                  </div>
                </div>

                {/* Automation triggers */}
                <div className="flex flex-wrap gap-1.5 self-start sm:self-center">
                  <button 
                    onClick={() => handleGenerateDoc(emp, 'contrat')}
                    className="px-2.5 py-1 bg-[#173C4A] hover:bg-[#204f61] text-white rounded text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    Contrat/Convention
                  </button>
                  <button 
                    onClick={() => handleGenerateDoc(emp, 'mad')}
                    className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    Convention MAD
                  </button>
                  <button 
                    onClick={() => handleGenerateDoc(emp, 'confidentialite')}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    Engagement Confidentialité
                  </button>
                  <button 
                    onClick={() => handleGenerateDoc(emp, 'charte')}
                    className="px-2.5 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    Charte Sécurité
                  </button>
                  {canModify && (
                    <button 
                      onClick={() => {
                        if (confirm(`Rompre et écarter définitivement la fiche de l'intervenant ${emp.fullName} ?`)) {
                          deleteEmployee(emp.id);
                        }
                      }}
                      className="p-1 px-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded text-xs cursor-pointer transition-colors"
                      title="Supprimer la fiche"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* DYNAMIC DOCUMENT GENERATOR PREVIEW CARD */}
        <div className="lg:col-span-1">
          {generatedDocText ? (
            <div className="p-6 bg-amber-50 border border-amber-300 rounded-xl space-y-4 text-gray-900 shadow-md">
              <div className="flex justify-between items-center border-b border-amber-200 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-700" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    Générateur GIE 221
                  </span>
                </div>
                <button 
                  onClick={() => setGeneratedDocText(null)}
                  className="p-1 rounded-full hover:bg-amber-100 text-amber-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Legal Text view */}
              <div className="font-mono text-[10px] whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto bg-white border border-amber-200 p-4 rounded shadow-inner select-all">
                {generatedDocText}
              </div>

              <p className="text-[9px] text-amber-700 italic">
                Ce document respecte les directives relatives à la gestion financière sans salariat du GIE 221 Lumière.
              </p>

              {/* PDF Print simulation */}
              <button 
                onClick={() => window.print()}
                className="w-full py-2 bg-amber-600 text-white hover:bg-amber-700 font-semibold rounded text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimer ou Sauvegarder
              </button>
            </div>
          ) : (
            <div className={`p-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-center ${textClass}`}>
              <Wrench className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-xs font-semibold">Générateur intelligent inactif</p>
              <p className="text-[11px] text-gray-400 mt-1">Cliquez sur un collaborateur à gauche pour charger et éditer sa convention, son contrat de prestation ou sa charte de sécurité sous-jacente.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
