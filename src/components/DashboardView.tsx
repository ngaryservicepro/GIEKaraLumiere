/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Users, 
  Coins, 
  Percent, 
  Home, 
  Calendar, 
  Music, 
  Wallet, 
  Activity as ActivityIcon, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle, 
  Info,
  Clock,
  MapPin
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { Member, Club, League, Meeting, Activity, Contribution } from '../types';

interface DashboardViewProps {
  members: Member[];
  clubs: Club[];
  leagues: League[];
  meetings: Meeting[];
  activities: Activity[];
  contributions: Contribution[];
  treasuryBalance: number;
  isDarkMode: boolean;
  onNavigate: (tab: string) => void;
  setSelectedMeeting: (meeting: Meeting | null) => void;
}

export default function DashboardView({
  members,
  clubs,
  leagues,
  meetings,
  activities,
  contributions,
  treasuryBalance,
  isDarkMode,
  onNavigate,
  setSelectedMeeting
}: DashboardViewProps) {
  
  // Dynamic metrics
  const totalMembers = members.length;
  const totalClubs = clubs.length;
  const totalLeagues = leagues.length;
  const scheduledMeetings = meetings.filter(m => m.status === 'Planifiée').length;
  const ongoingMeetings = meetings.filter(m => m.status === 'En cours').length;
  const activeActivitiesCount = activities.filter(a => a.status === 'En cours').length;
  
  // Outstanding contributions
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthContributions = contributions.filter(c => {
    const d = new Date(c.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const currentMonthTotal = currentMonthContributions.reduce((sum, c) => sum + c.amount, 0);

  // Recovery rate calculates total collected dues vs sum of target budget objectives
  const totalBudgetObjective = activities.reduce((sum, a) => sum + (a.financialObjective || 0), 0);
  const totalCollectedDues = contributions.reduce((sum, c) => sum + c.amount, 0);
  
  const recoveryRate = totalBudgetObjective > 0 
    ? Math.round((totalCollectedDues / totalBudgetObjective) * 100) 
    : 0;

  // Next meeting widget
  const nextMeeting = meetings
    .filter(m => m.status === 'Planifiée')
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())[0];

  // Colors:
  const PRIMARY_COLOR = '#173C4A'; // Bleu nuit
  const ACCENT_COLOR = '#22B8A7'; // Vert turquoise
  const COLORS_PALETTE = ['#22B8A7', '#173C4A', '#F5AF19', '#E15B64', '#8E44AD', '#3498DB'];

  // RECHARTS DATA
  // 1. Dues Evolution (Monthly Grouped)
  const monthlyDuesMap: { [key: string]: number } = {};
  contributions.forEach(c => {
    try {
      const monthLabel = new Date(c.date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      monthlyDuesMap[monthLabel] = (monthlyDuesMap[monthLabel] || 0) + c.amount;
    } catch (e) {}
  });
  const duesChartData = Object.keys(monthlyDuesMap).map(m => ({
    name: m,
    Montant: monthlyDuesMap[m]
  }));

  // 2. Division by Club
  const clubDistributionMap: { [key: string]: number } = {};
  members.forEach(m => {
    const club = clubs.find(c => c.id === m.clubId)?.name || 'Hors Club / Autre';
    clubDistributionMap[club] = (clubDistributionMap[club] || 0) + 1;
  });
  const clubPieData = Object.keys(clubDistributionMap).map(k => ({
    name: k,
    value: clubDistributionMap[k]
  }));

  // 3. Division by League
  const leagueDistributionMap: { [key: string]: number } = {};
  members.forEach(m => {
    const league = leagues.find(l => l.id === m.leagueId)?.name || 'Non Affilié';
    leagueDistributionMap[league] = (leagueDistributionMap[league] || 0) + 1;
  });
  const leagueBarData = Object.keys(leagueDistributionMap).map(k => ({
    name: k,
    Membres: leagueDistributionMap[k]
  }));

  // 4. Profitable Activities
  const activityRevenueMap: { [key: string]: number } = {};
  contributions.forEach(c => {
    const activityName = activities.find(a => a.id === c.activityId)?.name || 'Cotisation Standard';
    activityRevenueMap[activityName] = (activityRevenueMap[activityName] || 0) + c.amount;
  });
  const activityChartData = Object.keys(activityRevenueMap).map(k => ({
    name: k.length > 15 ? k.substring(0, 15) + '...' : k,
    Recettes: activityRevenueMap[k]
  }));

  // Theme support
  const textClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const headingClass = isDarkMode ? 'text-white font-display' : 'text-[#173C4A] font-display';
  const cardBgClass = 'glass-panel shadow-[0_4px_20px_rgba(23,60,74,0.02)] hover:shadow-[0_8px_30px_rgba(34,184,167,0.08)] transition-all duration-300';

  const formatCurrency = (val: number) => {
    return val.toLocaleString('fr-FR') + ' FCFA';
  };

  return (
    <div className="space-y-6">
      {/* Dynamic welcome message */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${headingClass}`}>Tableau de Bord</h1>
          <p className={`text-sm ${textClass}`}>
            Bienvenue sur la console intelligente du GIE Kara Lumier.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 mr-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            Mode Synchrone Connecté
          </span>
          <span className="text-xs text-gray-400 font-mono">
            Mis à jour : {new Date().toLocaleDateString('fr-FR')} {new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
          </span>
        </div>
      </div>

      {/* KPI GRID (8 cards requested) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Active Members */}
        <div className={`p-4 rounded-xl border ${cardBgClass} shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5`}>
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest dark:text-gray-400">
              👥 Membres Actifs
            </span>
            <div className="text-2xl font-bold text-[#173C4A] dark:text-[#22B8A7] mt-1">
              {totalMembers}
            </div>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-500 font-medium flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +100%
              </span>
              Depuis le lancement
            </p>
          </div>
          <div className="p-3 bg-[#173C4A]/10 text-[#173C4A] dark:bg-[#22B8A7]/10 dark:text-[#22B8A7] rounded-lg">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2 : Collected Dues */}
        <div className={`p-4 rounded-xl border ${cardBgClass} shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5`}>
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest dark:text-gray-400">
              💰 Cotisations Encaissées
            </span>
            <div className={`text-xl font-bold mt-1 overflow-hidden tracking-tight text-[#173C4A] dark:text-[#22B8A7]`}>
              {formatCurrency(totalCollectedDues)}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Ce mois : {formatCurrency(currentMonthTotal)}
            </p>
          </div>
          <div className="p-3 bg-[#22B8A7]/10 text-[#22B8A7] rounded-lg">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3 : Recovery Rate */}
        <div className={`p-4 rounded-xl border ${cardBgClass} shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5`}>
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest dark:text-gray-400">
              📈 Taux de Recouvrement
            </span>
            <div className="text-2xl font-bold text-[#173C4A] dark:text-[#22B8A7] mt-1">
              {recoveryRate}%
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-[#22B8A7] h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(recoveryRate, 100)}%` }} 
              />
            </div>
          </div>
          <div className="p-3 bg-[#173C4A]/10 text-[#173C4A] dark:bg-[#22B8A7]/10 dark:text-[#22B8A7] rounded-lg">
            <Percent className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4 : Affiliated Clubs */}
        <div className={`p-4 rounded-xl border ${cardBgClass} shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5`}>
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest dark:text-gray-400">
              🏛 Clubs Affiliés
            </span>
            <div className="text-2xl font-bold text-[#173C4A] dark:text-[#22B8A7] mt-1">
              {totalClubs}
            </div>
            <p className="text-xs text-gray-400 mt-1 hover:underline cursor-pointer" onClick={() => onNavigate('clubs')}>
              Gérer les associations →
            </p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 rounded-lg">
            <Home className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 5 : Scheduled Meetings */}
        <div className={`p-4 rounded-xl border ${cardBgClass} shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5`}>
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest dark:text-gray-400">
              📅 Réunions Programmées
            </span>
            <div className="text-2xl font-bold text-[#173C4A] dark:text-[#22B8A7] mt-1">
              {scheduledMeetings}
            </div>
            <p className="text-xs text-yellow-500 mt-1 flex items-center gap-1 font-semibold">
              <Clock className="w-3 h-3" /> {ongoingMeetings} en cours
            </p>
          </div>
          <div className="p-3 bg-[#22B8A7]/10 text-[#22B8A7] rounded-lg">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 6 : Musical Activities */}
        <div className={`p-4 rounded-xl border ${cardBgClass} shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5`}>
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest dark:text-gray-400">
              🎵 Activités Musicales
            </span>
            <div className="text-2xl font-bold text-[#173C4A] dark:text-[#22B8A7] mt-1">
              {activities.length}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Programmes de répétition
            </p>
          </div>
          <div className="p-3 bg-pink-50 dark:bg-pink-950/30 text-pink-500 rounded-lg">
            <Music className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 7 : Treasury Balance */}
        <div className={`p-4 rounded-xl border ${cardBgClass} shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5`}>
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest dark:text-gray-400">
              💵 Solde Trésorerie
            </span>
            <div className="text-xl font-bold text-[#173C4A] dark:text-[#22B8A7] mt-1">
              {formatCurrency(treasuryBalance)}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Fonds de réserve réels
            </p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-lg">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 8 : Ongoing Activities */}
        <div className={`p-4 rounded-xl border ${cardBgClass} shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5`}>
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest dark:text-gray-400">
              📊 Activités en Cours
            </span>
            <div className="text-2xl font-bold text-[#173C4A] dark:text-[#22B8A7] mt-1">
              {activeActivitiesCount}
            </div>
            <p className="text-xs text-emerald-500 font-medium mt-1">
              Sur les rails opérationnels
            </p>
          </div>
          <div className="p-3 bg-[#22B8A7]/10 text-[#22B8A7] rounded-lg">
            <ActivityIcon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* CHARTS LAYER */}
      <h2 className={`text-lg font-bold tracking-tight mt-6 ${headingClass}`}>Analyses Graphiques Interactives</h2>
      
      {members.length === 0 && contributions.length === 0 ? (
        // Start Strictly Empty layout with informative warning
        <div className={`p-8 rounded-xl border text-center ${cardBgClass}`}>
          <div className="max-w-md mx-auto py-6">
            <Info className="w-12 h-12 text-[#22B8A7] mx-auto mb-4 animate-bounce" />
            <h3 className={`font-semibold text-lg ${headingClass}`}>Base de Données Vierge au Démarrage</h3>
            <p className={`text-sm ${textClass} mt-2`}>
              Aucune donnée de démonstration n'est chargée de base, conformément à votre cahier des charges.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => onNavigate('members')} 
                className="w-full sm:w-auto px-4 py-2 bg-[#22B8A7] hover:bg-[#1f9f90] text-white rounded-lg font-medium text-sm transition-colors"
                id="btn-add-val-dash"
              >
                + Ajouter des Membres
              </button>
              <button 
                onClick={() => onNavigate('security')} 
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm transition-colors"
                id="btn-seed-data-dash"
              >
                Générer un Set de Démo
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Evolution of dues */}
          <div className={`p-4 rounded-xl border ${cardBgClass} shadow-xs`}>
            <h3 className={`text-sm font-semibold mb-4 tracking-tight ${headingClass}`}>
              📈 Évolution Temporelle des Cotisations
            </h3>
            <div className="h-64">
              {duesChartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  Aucun encaissement enregistré.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={duesChartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" stroke={isDarkMode ? '#9ca3af' : '#4b5563'} fontSize={11} />
                    <YAxis stroke={isDarkMode ? '#9ca3af' : '#4b5563'} fontSize={11} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1a2238' : '#fff',
                        borderColor: '#22B8A7',
                        color: isDarkMode ? '#fff' : '#000'
                      }} 
                    />
                    <Legend />
                    <Line type="monotone" dataKey="Montant" name="Cotisations (FCFA)" stroke="#22B8A7" strokeWidth={3} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Chart 2: Division by Club */}
          <div className={`p-4 rounded-xl border ${cardBgClass} shadow-xs`}>
            <h3 className={`text-sm font-semibold mb-4 tracking-tight ${headingClass}`}>
              📊 Répartition Administrative par Club Affilié
            </h3>
            <div className="h-64 flex items-center justify-center">
              {clubPieData.length === 0 ? (
                <div className="text-xs text-gray-400">Aucun membre affilié trouvé.</div>
              ) : (
                <div className="w-full h-full flex flex-col sm:flex-row items-center justify-around">
                  <div className="w-1/2 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={clubPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {clubPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS_PALETTE[index % COLORS_PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-1/2 max-h-60 overflow-y-auto text-xs space-y-1 p-2">
                    {clubPieData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <span 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: COLORS_PALETTE[index % COLORS_PALETTE.length] }} 
                        />
                        <span className="truncate max-w-[120px] font-medium text-gray-600 dark:text-gray-300">
                          {entry.name}
                        </span>
                        <span className="text-gray-400">({entry.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chart 3: Division by league */}
          <div className={`p-4 rounded-xl border ${cardBgClass} shadow-xs`}>
            <h3 className={`text-sm font-semibold mb-4 tracking-tight ${headingClass}`}>
              🏛 Effectifs par Ligue Régionale
            </h3>
            <div className="h-64">
              {leagueBarData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  Aucune ligue ou membre configuré.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leagueBarData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" stroke={isDarkMode ? '#9ca3af' : '#4b5563'} fontSize={11} />
                    <YAxis stroke={isDarkMode ? '#9ca3af' : '#4b5563'} fontSize={11} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1a2238' : '#fff',
                        borderColor: '#22B8A7'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="Membres" fill="#173C4A" name="Effectif" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Chart 4: Profitable activities (Activités les plus rentables) */}
          <div className={`p-4 rounded-xl border ${cardBgClass} shadow-xs`}>
            <h3 className={`text-sm font-semibold mb-4 tracking-tight ${headingClass}`}>
              🎵 Rentabilité & Recettes par Activité/Cotisation
            </h3>
            <div className="h-64">
              {activityChartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  Aucun encaissement sur activités comptabilisé.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityChartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" stroke={isDarkMode ? '#9ca3af' : '#4b5563'} fontSize={11} />
                    <YAxis stroke={isDarkMode ? '#9ca3af' : '#4b5563'} fontSize={11} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1a2238' : '#fff',
                        borderColor: '#22B8A7'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="Recettes" fill="#22B8A7" name="Prélèvements (FCFA)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}

      {/* NEXT MEETING WIDGET */}
      <div className="mt-6">
        <h3 className={`text-lg font-bold tracking-tight mb-4 ${headingClass}`}>📅 Prochaine Réunion</h3>
        {nextMeeting ? (
          <div className={`p-6 rounded-xl border ${cardBgClass} shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4`}>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                  {nextMeeting.status}
                </span>
                <h4 className={`text-base font-semibold ${headingClass}`}>{nextMeeting.title}</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#22B8A7]" />
                  <span>Date: {new Date(nextMeeting.date).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#22B8A7]" />
                  <span>Heure: {nextMeeting.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#22B8A7]" />
                  <span>Lieu: {nextMeeting.location}</span>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                Organisateur : {nextMeeting.organizer} | Participants : {nextMeeting.participants.length} membres invités
              </div>
            </div>
            <div>
              <button 
                onClick={() => {
                  setSelectedMeeting(nextMeeting);
                  onNavigate('meetings');
                }}
                className="px-4 py-2 bg-[#173C4A] hover:bg-[#204f61] text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                id="btn-view-next-meet-dash"
              >
                Voir les détails
              </button>
            </div>
          </div>
        ) : (
          <div className={`p-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-center ${textClass}`}>
            <p className="text-sm">Aucune réunion de planifiée pour le moment.</p>
            <button 
              onClick={() => onNavigate('meetings')}
              className="mt-3 px-3 py-1.5 bg-[#173C4A] text-white hover:bg-[#12303c] rounded-lg text-xs transition-colors"
              id="btn-plan-meet-dash"
            >
              + Planifier une Réunion
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
