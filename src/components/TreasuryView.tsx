/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Percent, 
  DollarSign, 
  Coins, 
  PiggyBank, 
  Lightbulb, 
  Briefcase 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar 
} from 'recharts';
import { Contribution, Activity } from '../types';
import TreasuryAdjustmentModal from './TreasuryAdjustmentModal';

interface TreasuryViewProps {
  contributions: Contribution[];
  activities: Activity[];
  treasuryBalance: number;
  isDarkMode: boolean;
  initialLiquidity: number;
  setInitialLiquidity: (val: number) => void;
  useManualLiquidity: boolean;
  setUseManualLiquidity: (val: boolean) => void;
  manualLiquidity: number;
  setManualLiquidity: (val: number) => void;
  computedBalance: number;
}

type PeriodType = 'Mensuel' | 'Trimestriel' | 'Annuel';

export default function TreasuryView({
  contributions,
  activities,
  treasuryBalance,
  isDarkMode,
  initialLiquidity,
  setInitialLiquidity,
  useManualLiquidity,
  setUseManualLiquidity,
  manualLiquidity,
  setManualLiquidity,
  computedBalance,
}: TreasuryViewProps) {
  
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('Mensuel');
  const [isTreasuryModalOpen, setIsTreasuryModalOpen] = useState(false);

  // Recettes cumulées (All collected dues)
  const totalRevenues = contributions.reduce((sum, c) => sum + c.amount, 0);

  // Dépenses cumulées (Total active activity budgets or expenses)
  const totalExpenses = activities.reduce((sum, a) => sum + a.budget, 0);

  // Prévisions (Future targets from outstanding activity financial objectives)
  const totalForecasts = activities.reduce((sum, a) => sum + (a.financialObjective - (contributions.filter(c => c.activityId === a.id).reduce((s, ct) => s + ct.amount, 0))), 0);

  // Mock charts data according to selection
  const monthlyData = [
    { name: 'Jan', Recettes: totalRevenues * 0.1, Depenses: totalExpenses * 0.08, Solde: (totalRevenues * 0.1) - (totalExpenses * 0.08) },
    { name: 'Fév', Recettes: totalRevenues * 0.15, Depenses: totalExpenses * 0.12, Solde: (totalRevenues * 0.15) - (totalExpenses * 0.12) },
    { name: 'Mar', Recettes: totalRevenues * 0.22, Depenses: totalExpenses * 0.18, Solde: (totalRevenues * 0.22) - (totalExpenses * 0.18) },
    { name: 'Avr', Recettes: totalRevenues * 0.35, Depenses: totalExpenses * 0.22, Solde: (totalRevenues * 0.35) - (totalExpenses * 0.22) },
    { name: 'Mai', Recettes: totalRevenues * 0.65, Depenses: totalExpenses * 0.45, Solde: (totalRevenues * 0.65) - (totalExpenses * 0.45) },
    { name: 'Juin', Recettes: totalRevenues, Depenses: totalExpenses, Solde: totalRevenues - totalExpenses },
  ];

  const quarterlyData = [
    { name: 'T1', Recettes: totalRevenues * 0.3, Depenses: totalExpenses * 0.25, Solde: (totalRevenues * 0.3) - (totalExpenses * 0.25) },
    { name: 'T2', Recettes: totalRevenues * 0.7, Depenses: totalExpenses * 0.6, Solde: (totalRevenues * 0.7) - (totalExpenses * 0.6) },
    { name: 'T3', Recettes: totalRevenues * 0.9, Depenses: totalExpenses * 0.85, Solde: (totalRevenues * 0.9) - (totalExpenses * 0.85) },
    { name: 'T4', Recettes: totalRevenues, Depenses: totalExpenses, Solde: totalRevenues - totalExpenses },
  ];

  const annualData = [
    { name: '2024', Recettes: totalRevenues * 0.6, Depenses: totalExpenses * 0.5, Solde: (totalRevenues * 0.6) - (totalExpenses * 0.5) },
    { name: '2025', Recettes: totalRevenues * 0.8, Depenses: totalExpenses * 0.75, Solde: (totalRevenues * 0.8) - (totalExpenses * 0.75) },
    { name: '2026 (En cours)', Recettes: totalRevenues, Depenses: totalExpenses, Solde: totalRevenues - totalExpenses },
  ];

  const getActiveChartData = () => {
    if (selectedPeriod === 'Mensuel') return monthlyData;
    if (selectedPeriod === 'Trimestriel') return quarterlyData;
    return annualData;
  };

  const headingClass = isDarkMode ? 'text-white' : 'text-[#173C4A]';
  const cardBgClass = isDarkMode ? 'bg-[#122e38] border-gray-700' : 'bg-white border-gray-100';
  const textClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className={`text-2xl font-bold tracking-tight ${headingClass}`}>Suivi de la Trésorerie</h1>
        <p className={`text-sm ${textClass}`}>
          Visualiser la santé financière globale, surveiller les décaissements et anticiper les flux budgétaires du GIE.
        </p>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Real Balance */}
        <div 
          onClick={() => setIsTreasuryModalOpen(true)}
          className={`p-4 rounded-xl border ${cardBgClass} flex items-center justify-between cursor-pointer hover:-translate-y-0.5 transition-transform group`}
          title="Cliquez pour ajuster le solde initial ou fixer la trésorerie manuellement"
        >
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">💵 Solde Trésorerie Réel</span>
              <span className="text-[9px] text-[#22B8A7] font-bold opacity-0 group-hover:opacity-100 transition-opacity">(Ajuster)</span>
            </div>
            <div className={`text-xl font-bold mt-1 text-[#173C4A] dark:text-[#22B8A7]`}>
              {treasuryBalance.toLocaleString()} FCFA
            </div>
            <p className="text-[10px] text-emerald-500 mt-0.5 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> {useManualLiquidity ? 'Valeur brute fixée' : 'Comptabilité double active'}
            </p>
          </div>
          <div className="p-2.5 bg-[#22B8A7]/10 text-[#22B8A7] rounded-lg group-hover:bg-[#22B8A7]/15 group-hover:text-[#22B8A7] transition-all">
            <PiggyBank className="w-6 h-6" />
          </div>
        </div>

        {/* Expenses */}
        <div className={`p-4 rounded-xl border ${cardBgClass} flex items-center justify-between`}>
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider md:max-w-xs block">📉 Dépenses Clôturées</span>
            <div className="text-xl font-bold mt-1 text-red-500">
              {totalExpenses.toLocaleString()} FCFA
            </div>
            <p className="text-[10px] text-red-400 mt-1 font-semibold flex items-center gap-0.5">
              <ArrowDownRight className="w-3.5 h-3.5" /> Décaissements d'activités
            </p>
          </div>
          <div className="p-2.5 bg-red-100 text-red-600 rounded-lg dark:bg-red-950/20">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>

        {/* Revenues */}
        <div className={`p-4 rounded-xl border ${cardBgClass} flex items-center justify-between`}>
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">📈 Recettes Perçues</span>
            <div className="text-xl font-bold mt-1 text-[#22B8A7]">
              {totalRevenues.toLocaleString()} FCFA
            </div>
            <p className="text-[10px] text-emerald-400 mt-1 font-semibold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> Cotisations approuvées
            </p>
          </div>
          <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-lg dark:bg-emerald-950/20">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        {/* Forecasts */}
        <div className={`p-4 rounded-xl border ${cardBgClass} flex items-center justify-between`}>
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">📊 Flux Prévisionnels</span>
            <div className="text-xl font-bold mt-1 text-purple-500">
              {Math.max(0, totalForecasts).toLocaleString()} FCFA
            </div>
            <p className="text-[10px] text-purple-400 mt-1 font-semibold">
              Cotisations restantes à recouvrer
            </p>
          </div>
          <div className="p-2.5 bg-purple-100 text-purple-600 rounded-lg dark:bg-purple-950/20">
            <Lightbulb className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* TREASURY PERIOD TREND CHART */}
      <div className={`p-6 rounded-xl border ${cardBgClass} shadow-xs space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4 border-gray-100 dark:border-gray-800">
          <div>
            <h3 className={`text-base font-bold ${headingClass}`}>Courbe d'Évolution Économique Constatée</h3>
            <p className="text-xs text-gray-400">Croisement des flux de cotisations (Recettes) face aux budgets opérationnels (Dépenses).</p>
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg self-start">
            {(['Mensuel', 'Trimestriel', 'Annuel'] as PeriodType[]).map(p => (
              <button
                key={p}
                onClick={() => setSelectedPeriod(p)}
                className={`px-3 py-1 text-xs rounded-md transition-all font-semibold ${
                  selectedPeriod === p 
                    ? 'bg-[#22B8A7] text-white' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="h-80">
          {totalRevenues === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-xs text-gray-400">
              <TrendingUp className="w-8 h-8 text-gray-300 mb-2" />
              <span>Graphe inactif. Enregistrez des cotisations pour moduler les courbes.</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getActiveChartData()}>
                <defs>
                  <linearGradient id="colorRecettes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22B8A7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#22B8A7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDepenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E15B64" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#E15B64" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" stroke={isDarkMode ? '#9ca3af' : '#4b5563'} fontSize={11} />
                <YAxis stroke={isDarkMode ? '#9ca3af' : '#4b5563'} fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#11222b' : '#fff',
                    borderColor: '#22B8A7'
                  }} 
                />
                <Legend />
                <Area type="monotone" dataKey="Recettes" name="Recettes (FCFA)" stroke="#22B8A7" strokeWidth={3} fillOpacity={1} fill="url(#colorRecettes)" />
                <Area type="monotone" dataKey="Depenses" name="Dépenses (FCFA)" stroke="#E15B64" strokeWidth={2} fillOpacity={1} fill="url(#colorDepenses)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <TreasuryAdjustmentModal
        isOpen={isTreasuryModalOpen}
        onClose={() => setIsTreasuryModalOpen(false)}
        initialLiquidity={initialLiquidity}
        setInitialLiquidity={setInitialLiquidity}
        useManualLiquidity={useManualLiquidity}
        setUseManualLiquidity={setUseManualLiquidity}
        manualLiquidity={manualLiquidity}
        setManualLiquidity={setManualLiquidity}
        computedBalance={computedBalance}
      />
    </div>
  );
}
