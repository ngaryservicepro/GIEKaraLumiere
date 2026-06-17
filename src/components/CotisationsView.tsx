/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Search, CheckCircle, Coins, CreditCard, Trash2, Calendar, User, ShoppingBag, X } from 'lucide-react';
import { Contribution, Member, Activity } from '../types';

interface CotisationsViewProps {
  contributions: Contribution[];
  members: Member[];
  activities: Activity[];
  addContribution: (contrib: Omit<Contribution, 'id'>) => void;
  deleteContribution: (id: string) => void;
  isDarkMode: boolean;
  currentUserRole: string;
}

export default function CotisationsView({
  contributions,
  members,
  activities,
  addContribution,
  deleteContribution,
  isDarkMode,
  currentUserRole
}: CotisationsViewProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [activityId, setActivityId] = useState('');
  const [memberId, setMemberId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<Contribution['paymentMethod']>('Wave');

  // Trigger automated wave/OM reference generation
  const generateReference = (method: string) => {
    const prefixes = {
      Wave: 'WV-',
      'Orange Money': 'OM-',
      'Free Money': 'FM-',
      Espèces: 'ESP-',
      'Virement bancaire': 'VIR-',
      'Carte bancaire': 'CB-'
    };
    const prefix = prefixes[method as keyof typeof prefixes] || 'TX-';
    return prefix + Math.floor(100000 + Math.random() * 900000);
  };

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as Contribution['paymentMethod'];
    setPaymentMethod(val);
    setReference(generateReference(val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityId || !memberId || amount <= 0) {
      alert("Veuillez sélectionner l'activité rattachée, le membre cotisant, et inscrire un montant positif supérieur à zéro.");
      return;
    }

    const contributionData = {
      activityId,
      memberId,
      amount: Number(amount),
      date,
      reference: reference || generateReference(paymentMethod),
      paymentMethod
    };

    addContribution(contributionData);

    // reset fields
    setActivityId('');
    setMemberId('');
    setAmount(0);
    setDate(new Date().toISOString().split('T')[0]);
    setReference('');
    setPaymentMethod('Wave');
    setShowForm(false);
  };

  const filteredContributions = contributions.filter(c => {
    const memberName = members.find(m => m.id === c.memberId)?.fullName || '';
    const activityName = activities.find(a => a.id === c.activityId)?.name || '';
    const searchString = `${memberName} ${activityName} ${c.reference} ${c.paymentMethod}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const canModify = currentUserRole !== 'Membre';
  const headingClass = isDarkMode ? 'text-white' : 'text-[#173C4A]';
  const cardBgClass = isDarkMode ? 'bg-[#122e38] border-gray-700' : 'bg-white border-gray-100';
  const textClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const inputClass = "w-full p-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#22B8A7] focus:outline-none";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200 dark:border-gray-800 gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${headingClass}`}>Recouvrements / Cotisations</h1>
          <p className={`text-sm ${textClass}`}>
            Enregistrer les versements mensuels ou exceptionnels des membres et générer les reçus comptabilisés en temps réel.
          </p>
        </div>
        {canModify && !showForm && (
          <button
            onClick={() => {
              setReference(generateReference(paymentMethod));
              setShowForm(true);
            }}
            className="bg-[#22B8A7] hover:bg-[#1fa192] text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-1.5 transition-colors shadow-sm"
            id="btn-trigger-addcotisation"
          >
            <Plus className="w-4 h-4" /> Encaisser une Cotisation
          </button>
        )}
      </div>

      {showForm && (
        <div className={`p-6 rounded-xl border ${cardBgClass} shadow-md`}>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
            <h2 className={`font-bold text-base ${headingClass}`}>Enregistrement d'un Encaissement en Direct</h2>
            <button 
              onClick={() => setShowForm(false)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              id="btn-close-cotisation-form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Activité ou Événement de Rattachement *</label>
                <select 
                  value={activityId} 
                  onChange={(e) => setActivityId(e.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="">Sélectionner l'activité correspondante...</option>
                  {activities.map(a => (
                    <option key={a.id} value={a.id}>{a.name} (Objectif: {a.financialObjective.toLocaleString()} FCFA)</option>
                  ))}
                  {activities.length === 0 && <option value="standard">Cotisation Générale de Fonctionnement Standard</option>}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Membre Cotisant *</label>
                <select 
                  value={memberId} 
                  onChange={(e) => setMemberId(e.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="">Sélectionner le membre cotisant...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.id} - {m.fullName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Montant Encaissé (FCFA) *</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="Ex: 10000"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Moyen de Paiement *</label>
                <select 
                  value={paymentMethod} 
                  onChange={handleMethodChange}
                  className={inputClass}
                >
                  <option value="Wave">Wave</option>
                  <option value="Orange Money">Orange Money</option>
                  <option value="Free Money">Free Money</option>
                  <option value="Espèces">Espèces</option>
                  <option value="Virement bancaire">Virement bancaire</option>
                  <option value="Carte bancaire">Carte bancaire</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 font-mono">Référence Unique de Transaction</label>
                <input 
                  type="text" 
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Générée automatiquement ou code Wave/OM"
                  className={`${inputClass} font-mono font-bold text-xs text-[#22B8A7]`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Date d'Encaissement</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="px-5 py-2 bg-[#173C4A] hover:bg-[#12303c] text-white rounded-lg text-sm font-semibold transition-colors"
                id="btn-save-cotisation"
              >
                Encaisser & Valider
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTER SEARCH COTISATIONS */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Rechercher par membre, activité, référence Wave/OM ou moyen de paiement..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#22B8A7]"
        />
      </div>

      {/* COTISATIONS LIST */}
      {filteredContributions.length === 0 ? (
        <div className={`p-8 rounded-xl border text-center ${cardBgClass}`}>
          <Coins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className={`font-semibold text-base ${headingClass}`}>Aucune cotisation enregistrée</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
            Les membres n'ont effectué aucun versement pour le moment.
          </p>
        </div>
      ) : (
        <div className={`border rounded-xl ${cardBgClass} overflow-hidden shadow-xs`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-[#153440] text-gray-500 dark:text-gray-300 uppercase text-[10px] font-bold tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <th className="p-3">Num. Réf</th>
                  <th className="p-3">Cotisant (Membre)</th>
                  <th className="p-3">Activité / Destination</th>
                  <th className="p-3">Montant Versé</th>
                  <th className="p-3">Moyen</th>
                  <th className="p-3">Date</th>
                  {canModify && <th className="p-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                {filteredContributions.map(c => {
                  const correlatedMember = members.find(m => m.id === c.memberId);
                  const correlatedActivity = activities.find(a => a.id === c.activityId);
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="p-3 font-mono text-xs font-bold text-[#22B8A7]">{c.reference}</td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-150 bg-[#173C4A]/10 text-[#173C4A] dark:text-[#22B8A7] flex items-center justify-center text-xs font-bold">
                            {correlatedMember ? correlatedMember.fullName.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{correlatedMember?.fullName || 'Membre Supprimé'}</p>
                            <p className="text-[10px] text-gray-400">{c.memberId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-xs text-gray-600 dark:text-gray-300 max-w-[200px] truncate" title={correlatedActivity?.name}>
                        {correlatedActivity?.name || 'Versement Général'}
                      </td>
                      <td className="p-3 font-bold text-[#173C4A] dark:text-white">
                        {c.amount.toLocaleString()} FCFA
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#22B8A7]">
                          <CreditCard className="w-3.5 h-3.5" />
                          {c.paymentMethod}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(c.date).toLocaleDateString('fr-FR')}
                      </td>
                      {canModify && (
                        <td className="p-3 text-right">
                          <button 
                            onClick={() => {
                              if (confirm(`Rembourser/annuler la transaction de cotisation ${c.reference} d'un montant de ${c.amount} FCFA ?`)) {
                                deleteContribution(c.id);
                              }
                            }}
                            className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded text-red-500"
                            title="Annuler/Supprimer ce versement"
                            id={`btn-deletecot-${c.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
