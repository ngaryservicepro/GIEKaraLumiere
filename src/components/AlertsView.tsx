/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Bell, Info, ShieldAlert, CheckCircle2, AlertTriangle, Eye, Trash2 } from 'lucide-react';
import { IntelligentAlert } from '../types';

interface AlertsViewProps {
  alerts: IntelligentAlert[];
  markAsRead: (id: string) => void;
  clearAlert: (id: string) => void;
  isDarkMode: boolean;
}

export default function AlertsView({
  alerts,
  markAsRead,
  clearAlert,
  isDarkMode
}: AlertsViewProps) {
  
  const headingClass = isDarkMode ? 'text-white' : 'text-[#173C4A]';
  const cardBgClass = isDarkMode ? 'bg-[#122e38] border-gray-700' : 'bg-white border-gray-100';
  const textClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${headingClass}`}>Alertes Intelligentes</h1>
          <p className={`text-sm ${textClass}`}>
            Rapports de dysfonctionnement automatique, rappels juridiques et dépassements de budgets opérationnels.
          </p>
        </div>
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[#22B8A7]/10 text-[#22B8A7]">
          {alerts.filter(a => !a.isRead).length} non lue(s)
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className={`p-8 rounded-xl border text-center ${cardBgClass} text-gray-500`}>
          <CheckCircle2 className="w-12 h-12 text-[#22B8A7] mx-auto mb-3" />
          <p className="font-semibold text-sm">Félicitations, aucun incident détecté</p>
          <p className="text-xs text-gray-400 mt-1">Tous les indicateurs financiers, administratifs et de recrutements sont au vert.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map(alert => (
            <div 
              key={alert.id} 
              className={`p-4 rounded-xl border ${cardBgClass} flex items-start gap-4 transition-all ${
                !alert.isRead ? 'ring-1 ring-[#22B8A7] bg-teal-50/5 dark:bg-[#132d36]' : 'opacity-80'
              }`}
            >
              {/* Alert Icons based on type */}
              <div className="flex-shrink-0 pt-0.5">
                {alert.type === 'danger' && <ShieldAlert className="w-5 h-5 text-red-500" />}
                {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                {alert.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                {alert.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              </div>

              {/* Alert text */}
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start gap-1">
                  <h4 className={`text-sm font-bold ${headingClass}`}>{alert.title}</h4>
                  <span className="text-[9px] text-gray-400 font-mono">{new Date(alert.date).toLocaleDateString('fr-FR')}</span>
                </div>
                <p className={`text-xs ${textClass}`}>{alert.message}</p>
              </div>

              {/* Action buttons */}
              <div className="flex-shrink-0 flex gap-2">
                {!alert.isRead && (
                  <button 
                    onClick={() => markAsRead(alert.id)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-[#22B8A7] hover:text-[#199d90]"
                    title="Marquer comme lu"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={() => clearAlert(alert.id)}
                  className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded text-red-500"
                  title="Supprimer l'alerte"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
