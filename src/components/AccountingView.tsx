/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  ListOrdered, 
  TrendingUp, 
  Layers, 
  Scale, 
  Calendar, 
  FileCheck, 
  Calculator,
  X
} from 'lucide-react';
import { JournalEntry, CHART_OF_ACCOUNTS, AccountCode } from '../types';
import { exportAccountingToPdf } from '../utils/pdfHelper';
import PdfImportModal from './PdfImportModal';

interface AccountingViewProps {
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  deleteJournalEntry: (id: string) => void;
  isDarkMode: boolean;
  currentUserRole: string;
}

type AccountingSubTab = 'journal' | 'grand-livre' | 'balance' | 'compte-resultat' | 'bilan';

export default function AccountingView({
  journalEntries,
  addJournalEntry,
  deleteJournalEntry,
  isDarkMode,
  currentUserRole
}: AccountingViewProps) {
  
  const [activeSubTab, setActiveSubTab] = useState<AccountingSubTab>('journal');
  const [showPostForm, setShowPostForm] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Post entry states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [ref, setRef] = useState('');
  const [label, setLabel] = useState('');
  const [accountCode, setAccountCode] = useState<AccountCode>('266');
  const [type, setType] = useState<'Débit' | 'Crédit'>('Débit');
  const [amount, setAmount] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label || amount <= 0) {
      alert("Veuillez spécifier le libellé de l'opération ainsi qu'un montant valide.");
      return;
    }

    const postedRef = ref || `EXT-${Math.floor(100000 + Math.random() * 900000)}`;

    addJournalEntry({
      date,
      ref: postedRef,
      label,
      accountCode,
      type,
      amount: Number(amount)
    });

    // Reset fields
    setLabel('');
    setRef('');
    setAmount(0);
    setShowPostForm(false);
  };

  // CALCULATIONS / AGGREGATIONS
  
  // 1. Grand Livre Calculations (grouped by account)
  const grandLivreData: { [key in AccountCode]?: { label: string, debits: number, credits: number, lines: JournalEntry[] } } = {};
  
  // Initialize ledger accounts
  Object.keys(CHART_OF_ACCOUNTS).forEach(code => {
    grandLivreData[code as AccountCode] = {
      label: CHART_OF_ACCOUNTS[code as AccountCode],
      debits: 0,
      credits: 0,
      lines: []
    };
  });

  // Aggregate journals
  journalEntries.forEach(entry => {
    const acc = grandLivreData[entry.accountCode];
    if (acc) {
      acc.lines.push(entry);
      if (entry.type === 'Débit') {
        acc.debits += entry.amount;
      } else {
        acc.credits += entry.amount;
      }
    }
  });

  // Calculate Balance (Trial balance columns)
  const balanceRows = Object.keys(CHART_OF_ACCOUNTS).map(code => {
    const accCode = code as AccountCode;
    const ledger = grandLivreData[accCode] || { debits: 0, credits: 0 };
    const debits = ledger.debits;
    const credits = ledger.credits;
    const balance = debits - credits; // positive = debit solde, negative = credit solde
    
    return {
      code: accCode,
      name: CHART_OF_ACCOUNTS[accCode],
      debitSum: debits,
      creditSum: credits,
      soldeType: balance >= 0 ? ('Débiteur' as const) : ('Créditeur' as const),
      soldeVal: Math.abs(balance)
    };
  });

  // Balance Totals
  const totalDebitsSum = balanceRows.reduce((sum, r) => sum + r.debitSum, 0);
  const totalCreditsSum = balanceRows.reduce((sum, r) => sum + r.creditSum, 0);

  // 2. Compte de Résultat (Income Statement)
  // Products/Revenues account (usually Class 7: 7616 Produits financiers)
  const productsRows = balanceRows.filter(r => r.code.startsWith('7'));
  const totalProducts = productsRows.reduce((sum, r) => sum + (r.creditSum - r.debitSum), 0); // credits minus debits for class 7

  // Expenses/Charges accounts (Class 6: 6866 Dotations, or custom charges in others)
  const expensesRows = balanceRows.filter(r => r.code.startsWith('6'));
  const totalExpenses = expensesRows.reduce((sum, r) => sum + (r.debitSum - r.creditSum), 0); // debits minus credits for class 6

  // Operations and others impacting local surplus
  const netEarnings = totalProducts - totalExpenses;

  // 3. Bilan (Balance Sheet)
  // Assets accounts (Actif): usually long term holdings/receivables class 2 & 4 (266 Apports, 4581 Opérations en commun, 4958 Charges à répartir)
  const assetCodes: AccountCode[] = ['266', '4581', '4958'];
  const liabilityCodes: AccountCode[] = ['2676', '267', '2966', '29676']; // passif: provisions, consolidated advances, distribution benefits

  const assetRows = balanceRows.filter(r => assetCodes.includes(r.code));
  const liabilityRows = balanceRows.filter(r => liabilityCodes.includes(r.code));

  const totalAssetsSum = assetRows.reduce((sum, r) => {
    // Assets are Debit balances typically
    const ledger = grandLivreData[r.code];
    return sum + (ledger ? (ledger.debits - ledger.credits) : 0);
  }, 0);

  const totalLiabilitiesSum = liabilityRows.reduce((sum, r) => {
    // Liabilities are Credit balances typically
    const ledger = grandLivreData[r.code];
    return sum + (ledger ? (ledger.credits - ledger.debits) : 0);
  }, 0);

  // Balancing adjustment
  const balancingAdjustment = totalAssetsSum - totalLiabilitiesSum;

  const canEdit = currentUserRole === 'Super Administrateur' || currentUserRole === 'Trésorier' || currentUserRole === 'Président';
  const headingClass = isDarkMode ? 'text-white' : 'text-[#173C4A]';
  const cardBgClass = isDarkMode ? 'bg-[#122e38] border-gray-700' : 'bg-white border-gray-100';
  const textClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const inputClass = "w-full p-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#22B8A7] focus:outline-none";

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between pb-4 border-b border-gray-200 dark:border-gray-800 gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${headingClass}`}>Comptabilité GIE</h1>
          <p className={`text-sm ${textClass}`}>
            Outil intelligent d'écriture à double entrée, grand livre, balance de vérification, bilan de clôture et compte de résultat.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {canEdit && !showPostForm && (
            <>
              <button 
                onClick={() => setIsImportOpen(true)}
                className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#122e38] text-gray-700 dark:text-gray-205 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                📥 Importer Facture PDF
              </button>
              
              <button
                onClick={() => exportAccountingToPdf(
                  journalEntries,
                  activeSubTab as any
                )}
                className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-[#22B8A7]/20 bg-[#22B8A7]/10 text-[#22B8A7] hover:bg-[#22B8A7]/20 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                📤 Exporter Comptes PDF
              </button>

              <button
                onClick={() => setShowPostForm(true)}
                className="bg-[#22B8A7] hover:bg-[#1fa192] text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                id="btn-add-accounting-entry"
              >
                <Plus className="w-4 h-4" /> Passer une Écriture
              </button>
            </>
          )}
        </div>
      </div>

      {/* POSTING ENTRY FORM */}
      {showPostForm && (
        <div className={`p-6 rounded-xl border ${cardBgClass} shadow-md`}>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
            <h2 className={`font-bold text-base ${headingClass}`}>Passer une Écriture Comptable (Plan SYSCOHADA)</h2>
            <button 
              onClick={() => setShowPostForm(false)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-850 text-gray-500"
              id="btn-close-accounting-form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Compte concerné (SYSCOHADA) *</label>
                <select 
                  value={accountCode} 
                  onChange={(e) => setAccountCode(e.target.value as AccountCode)}
                  className={inputClass}
                >
                  {Object.entries(CHART_OF_ACCOUNTS).map(([code, name]) => (
                    <option key={code} value={code}>{code} - {name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Type d'imputation *</label>
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value as 'Débit' | 'Crédit')}
                  className={inputClass}
                >
                  <option value="Débit">Débit (Augmentation Actif / Diminution Passif)</option>
                  <option value="Crédit">Crédit (Augmentation Passif / Augmentation Recettes)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Montant Opérationnel (FCFA) *</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="Ex: 250000"
                  required
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Libellé / Description de l'Écriture *</label>
                <input 
                  type="text" 
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Ex: Distribution des excédents ou Dotation provisions"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Référence Pièce Justificative</label>
                <input 
                  type="text" 
                  value={ref}
                  onChange={(e) => setRef(e.target.value)}
                  placeholder="Laisser vide pour auto-générer"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Date comptable</label>
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
                onClick={() => setShowPostForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="px-5 py-2 bg-[#173C4A] hover:bg-[#12303c] text-white rounded-lg text-sm font-semibold transition-colors"
                id="btn-post-entry"
              >
                Imputer l'Écriture
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-TABS NAVIGATION (Journal, Grand Livre, Balance, Compte de Résultat, Bilan) */}
      <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-800 gap-1">
        <button
          onClick={() => setActiveSubTab('journal')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all ${
            activeSubTab === 'journal' 
              ? 'border-[#22B8A7] text-[#22B8A7] bg-gray-55 dark:bg-[#132c35]' 
              : 'border-transparent text-gray-500 hover:text-[#173C4A] dark:hover:text-white'
          }`}
          id="tab-sub-journal"
        >
          <BookOpen className="w-4 h-4" /> Journal Général
        </button>
        <button
          onClick={() => setActiveSubTab('grand-livre')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all ${
            activeSubTab === 'grand-livre' 
              ? 'border-[#22B8A7] text-[#22B8A7] bg-gray-55 dark:bg-[#132c35]' 
              : 'border-transparent text-gray-500 hover:text-[#173C4A] dark:hover:text-white'
          }`}
          id="tab-sub-ledger"
        >
          <Layers className="w-4 h-4" /> Grand Livre
        </button>
        <button
          onClick={() => setActiveSubTab('balance')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all ${
            activeSubTab === 'balance' 
              ? 'border-[#22B8A7] text-[#22B8A7] bg-gray-55 dark:bg-[#132c35]' 
              : 'border-transparent text-gray-500 hover:text-[#173C4A] dark:hover:text-white'
          }`}
          id="tab-sub-balance"
        >
          <Scale className="w-4 h-4" /> Balance
        </button>
        <button
          onClick={() => setActiveSubTab('compte-resultat')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all ${
            activeSubTab === 'compte-resultat' 
              ? 'border-[#22B8A7] text-[#22B8A7] bg-gray-55 dark:bg-[#132c35]' 
              : 'border-transparent text-gray-500 hover:text-[#173C4A] dark:hover:text-white'
          }`}
          id="tab-sub-resultat"
        >
          <TrendingUp className="w-4 h-4" /> Compte Résultat
        </button>
        <button
          onClick={() => setActiveSubTab('bilan')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all ${
            activeSubTab === 'bilan' 
              ? 'border-[#22B8A7] text-[#22B8A7] bg-gray-55 dark:bg-[#132c35]' 
              : 'border-transparent text-gray-500 hover:text-[#173C4A] dark:hover:text-white'
          }`}
          id="tab-sub-bilan"
        >
          <Calculator className="w-4 h-4" /> Bilan Patrimonial
        </button>
      </div>

      {/* RENDER ACTIVE SUBTAB PANELS */}

      {/* 1. JOURNAL COMPTABLE GENERAL */}
      {activeSubTab === 'journal' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-base font-bold ${headingClass}`}>Journal Général des Opérations</h3>
            <span className="text-xs text-gray-400">Total écritures : {journalEntries.length} ligne(s)</span>
          </div>

          {journalEntries.length === 0 ? (
            <div className={`p-8 border border-dashed rounded-xl text-center ${cardBgClass} text-gray-500`}>
              Aucune écriture comptable d'ajustement saisie. Utilisez le bouton ci-dessus pour acter un mouvement.
            </div>
          ) : (
            <div className={`border rounded-xl ${cardBgClass} overflow-hidden shadow-xs`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-[#153440] text-gray-500 dark:text-gray-300 uppercase text-[10px] font-bold tracking-wider border-b border-gray-200 dark:border-gray-700">
                      <th className="p-3">Date</th>
                      <th className="p-3">Réf/Pièce</th>
                      <th className="p-3">Compte</th>
                      <th className="p-3">Libellé de l'Opération</th>
                      <th className="p-3">Débit (FCFA)</th>
                      <th className="p-3">Crédit (FCFA)</th>
                      {canEdit && <th className="p-3 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-xs">
                    {journalEntries.map(entry => (
                      <tr key={entry.id} className="hover:bg-gray-55 font-medium transition-colors">
                        <td className="p-3 whitespace-nowrap text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(entry.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="p-3 font-mono font-semibold text-gray-400">{entry.ref}</td>
                        <td className="p-3 text-[#22B8A7] font-semibold">{entry.accountCode}</td>
                        <td className="p-3 text-gray-800 dark:text-gray-300 min-w-[200px] font-bold">
                          {entry.label}
                        </td>
                        <td className="p-3 font-semibold text-emerald-600">
                          {entry.type === 'Débit' ? entry.amount.toLocaleString() : '-'}
                        </td>
                        <td className="p-3 font-semibold text-amber-600">
                          {entry.type === 'Crédit' ? entry.amount.toLocaleString() : '-'}
                        </td>
                        {canEdit && (
                          <td className="p-3 text-right">
                            <button 
                              onClick={() => {
                                if (confirm(`Supprimer cette écriture comptable définitivement du journal ?`)) {
                                  deleteJournalEntry(entry.id);
                                }
                              }}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Delete entry"
                            >
                              Supprimer
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. GRAND LIVRE */}
      {activeSubTab === 'grand-livre' && (
        <div className="space-y-6">
          <h3 className={`text-base font-bold ${headingClass}`}>Visualisation par Grands Comptes Organisés</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.keys(CHART_OF_ACCOUNTS).map(code => {
              const accCode = code as AccountCode;
              const account = grandLivreData[accCode];
              if (!account) return null;
              const diff = account.debits - account.credits;

              return (
                <div key={accCode} className={`p-4 rounded-xl border ${cardBgClass} flex flex-col justify-between`}>
                  <div>
                    <div className="flex justify-between items-start mb-2 border-b border-gray-100 dark:border-gray-800 pb-1.5">
                      <span className="font-mono font-bold text-xs bg-[#22B8A7]/10 text-[#22B8A7] px-2 py-0.5 rounded">
                        Compte {accCode}
                      </span>
                      <span className={`text-[10px] font-bold ${diff >= 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                        Solde: {Math.abs(diff).toLocaleString()} FCFA ({diff >= 0 ? 'D' : 'C'})
                      </span>
                    </div>
                    <p className={`text-xs font-bold mb-3 ${headingClass}`}>{account.label}</p>

                    <div className="space-y-1.5 max-h-32 overflow-y-auto text-[10px] text-gray-500 p-1">
                      {account.lines.length === 0 ? (
                        <p className="italic text-gray-400">Aucun enregistrement sur ce compte.</p>
                      ) : (
                        account.lines.map(line => (
                          <div key={line.id} className="flex justify-between border-b pb-0.5 border-gray-50 dark:border-gray-800">
                            <span className="truncate max-w-[120px]">{line.label}</span>
                            <span className={line.type === 'Débit' ? 'text-emerald-600' : 'text-amber-600'}>
                              {line.amount.toLocaleString()} ({line.type === 'Débit' ? 'D' : 'C'})
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 text-center text-[10px] text-gray-400">
                    <div className="border-r border-gray-100 dark:border-gray-800">
                      <p>Débiteur cumulé</p>
                      <p className="font-bold text-emerald-600">{account.debits.toLocaleString()} FCFA</p>
                    </div>
                    <div>
                      <p>Créditeur cumulé</p>
                      <p className="font-bold text-amber-600">{account.credits.toLocaleString()} FCFA</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. BALANCE COMPTABLE */}
      {activeSubTab === 'balance' && (
        <div className="space-y-4">
          <h3 className={`text-base font-bold ${headingClass}`}>Balance de Vérification des Comptes</h3>
          <div className={`border rounded-xl ${cardBgClass} overflow-hidden shadow-xs`}>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-[#153440] text-gray-500 dark:text-gray-300 uppercase text-[10px] font-bold tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <th className="p-3">Num Compte</th>
                  <th className="p-3">Intitulé SYSCOHADA</th>
                  <th className="p-3">Cumul Débit (FCFA)</th>
                  <th className="p-3">Cumul Crédit (FCFA)</th>
                  <th className="p-3">Solde Débiteur</th>
                  <th className="p-3">Solde Créditeur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 font-mono">
                {balanceRows.map(row => (
                  <tr key={row.code} className="hover:bg-gray-55">
                    <td className="p-3 font-bold text-[#22B8A7]">{row.code}</td>
                    <td className="p-3 text-gray-800 dark:text-gray-300 font-sans font-medium">{row.name}</td>
                    <td className="p-3 text-gray-500">{row.debitSum.toLocaleString()}</td>
                    <td className="p-3 text-gray-500">{row.creditSum.toLocaleString()}</td>
                    <td className="p-3 font-semibold text-emerald-600">
                      {row.soldeType === 'Débiteur' && row.soldeVal > 0 ? row.soldeVal.toLocaleString() : '-'}
                    </td>
                    <td className="p-3 font-semibold text-amber-600">
                      {row.soldeType === 'Créditeur' && row.soldeVal > 0 ? row.soldeVal.toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="bg-gray-50 dark:bg-slate-900 border-t-2 border-gray-200 dark:border-gray-700 font-bold">
                  <td className="p-3 font-sans" colSpan={2}>TOTAL BALANCE DES COMPTES</td>
                  <td className="p-3 text-emerald-600">{totalDebitsSum.toLocaleString()} FCFA</td>
                  <td className="p-3 text-amber-600">{totalCreditsSum.toLocaleString()} FCFA</td>
                  <td className="p-3 text-emerald-600" colSpan={2}>Vérification : {totalDebitsSum === totalCreditsSum ? '✅ Équilibrée' : '⚠️ Déséquilibrée'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. COMPTE DE RÉSULTAT */}
      {activeSubTab === 'compte-resultat' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-5 rounded-xl border ${cardBgClass} shadow-xs space-y-4`}>
            <h3 className="text-sm font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1">
              <Plus className="w-4 h-4 rotate-45" /> Charges & Charges Financières
            </h3>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {expensesRows.map(r => (
                <div key={r.code} className="flex justify-between text-xs py-1.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">{r.code} - {r.name}</span>
                  <span className="font-mono font-bold text-gray-800 dark:text-white">{(r.debitSum - r.creditSum).toLocaleString()} FCFA</span>
                </div>
              ))}
              {expensesRows.length === 0 && <p className="text-xs text-gray-400 italic">Aucune charge imputée aux comptes (Class 6).</p>}
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between font-bold text-sm text-rose-500">
              <span>TOTAL DU COMPTE CHARGES</span>
              <span>{totalExpenses.toLocaleString()} FCFA</span>
            </div>
          </div>

          <div className={`p-5 rounded-xl border ${cardBgClass} shadow-xs flex flex-col justify-between space-y-4`}>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#22B8A7] flex items-center gap-1">
                <Plus className="w-4 h-4" /> Produits financiers / Cotisations
              </h3>
              
              <div className="space-y-2 max-h-60 overflow-y-auto mt-4">
                {productsRows.map(r => (
                  <div key={r.code} className="flex justify-between text-xs py-1.5 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">{r.code} - {r.name}</span>
                    <span className="font-mono font-bold text-[#22B8A7]">{(r.creditSum - r.debitSum).toLocaleString()} FCFA</span>
                  </div>
                ))}
                {productsRows.length === 0 && <p className="text-xs text-gray-400 italic">Aucun produit financier collecté (Class 7).</p>}
              </div>
            </div>

            <div className="space-y-3">
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between font-bold text-sm text-[#22B8A7]">
                <span>TOTAL DES PRODUITS</span>
                <span>{totalProducts.toLocaleString()} FCFA</span>
              </div>

              {/* Surplus Result Card */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-center justify-between border">
                <div>
                  <p className="text-xs text-gray-400">RÉSULTAT NET COMPTABLE (BÉNÉFICE/PERTE)</p>
                  <p className={`text-lg font-bold ${netEarnings >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {netEarnings >= 0 ? '+' : ''}{netEarnings.toLocaleString()} FCFA
                  </p>
                </div>
                <div className={`p-2.5 rounded-full ${netEarnings >= 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                  <FileCheck className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. BILAN COMPTABLE */}
      {activeSubTab === 'bilan' && (
        <div className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-900/40 p-4 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2 max-w-2xl">
            <span>ℹ️</span>
            <p>
              Le Bilan Actif/Passif présente la photographie patrimoniale du GIE Kara Lumière. Il calcule les apports réels et charges à répartir face aux avances de trésorerie consolidables pour équilibrer la comptabilité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Actif Assets */}
            <div className={`p-5 rounded-xl border ${cardBgClass} space-y-4`}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#173C4A] dark:text-[#22B8A7] border-b pb-1">
                ACTIF (Emploi des Fonds GIE)
              </h3>
              
              <div className="space-y-2">
                {assetRows.map(r => {
                  const ledger = grandLivreData[r.code];
                  const currentBalance = ledger ? (ledger.debits - ledger.credits) : 0;
                  return (
                    <div key={r.code} className="flex justify-between text-xs py-1.5 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-600 dark:text-gray-400">{r.code} - {r.name}</span>
                      <span className="font-mono font-bold text-gray-800 dark:text-white">{currentBalance.toLocaleString()} FCFA</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t flex justify-between font-bold text-sm text-[#173C4A] dark:text-[#22B8A7]">
                <span>TOTAL ACTIF</span>
                <span>{totalAssetsSum.toLocaleString()} FCFA</span>
              </div>
            </div>

            {/* Passif Liabilities */}
            <div className={`p-5 rounded-xl border ${cardBgClass} space-y-4`}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#173C4A] dark:text-[#22B8A7] border-b pb-1">
                PASSIF (Origine des Ressources)
              </h3>
              
              <div className="space-y-2">
                {liabilityRows.map(r => {
                  const ledger = grandLivreData[r.code];
                  const currentBalance = ledger ? (ledger.credits - ledger.debits) : 0;
                  return (
                    <div key={r.code} className="flex justify-between text-xs py-1.5 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-600 dark:text-gray-400">{r.code} - {r.name}</span>
                      <span className="font-mono font-bold text-gray-800 dark:text-white">{currentBalance.toLocaleString()} FCFA</span>
                    </div>
                  );
                })}

                {/* Net Earnings addition to passif (Syscohada norm) */}
                <div className="flex justify-between text-xs py-1.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-850 p-1 rounded">
                  <span className="text-gray-600 dark:text-gray-400 italic">Report à nouveau (Résultat de l'exercice)</span>
                  <span className="font-mono font-semibold text-emerald-500">{netEarnings.toLocaleString()} FCFA</span>
                </div>
              </div>

              <div className="pt-3 border-t flex justify-between font-bold text-sm text-[#173C4A] dark:text-[#22B8A7]">
                <span>TOTAL PASSIF S/AJUSTEMENT</span>
                <span>{(totalLiabilitiesSum + netEarnings).toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <PdfImportModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
        section="comptabilite" 
        onImportComplete={(importedJournalEntries: any[]) => {
          if (Array.isArray(importedJournalEntries)) {
            importedJournalEntries.forEach(entry => addJournalEntry(entry));
          }
        }} 
      />
    </div>
  );
}
