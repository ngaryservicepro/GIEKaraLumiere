/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Save, Sliders, CheckCircle, Wallet, Info } from 'lucide-react';

interface TreasuryAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLiquidity: number;
  setInitialLiquidity: (val: number) => void;
  useManualLiquidity: boolean;
  setUseManualLiquidity: (val: boolean) => void;
  manualLiquidity: number;
  setManualLiquidity: (val: number) => void;
  computedBalance: number;
}

export default function TreasuryAdjustmentModal({
  isOpen,
  onClose,
  initialLiquidity,
  setInitialLiquidity,
  useManualLiquidity,
  setUseManualLiquidity,
  manualLiquidity,
  setManualLiquidity,
  computedBalance,
}: TreasuryAdjustmentModalProps) {
  
  const [tempUseManual, setTempUseManual] = useState(useManualLiquidity);
  const [tempInitial, setTempInitial] = useState(initialLiquidity);
  const [tempManual, setTempManual] = useState(manualLiquidity);
  const [showSuccess, setShowSuccess] = useState(false);

  // Sync state when modal is opened
  useEffect(() => {
    if (isOpen) {
      setTempUseManual(useManualLiquidity);
      setTempInitial(initialLiquidity);
      setTempManual(manualLiquidity);
      setShowSuccess(false);
    }
  }, [isOpen, useManualLiquidity, initialLiquidity, manualLiquidity]);

  if (!isOpen) return null;

  const handleSave = () => {
    setUseManualLiquidity(tempUseManual);
    setInitialLiquidity(tempInitial);
    setManualLiquidity(tempManual);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#11242c] dark:bg-[#0c1b21] border border-[#22B8A7]/30 rounded-xl shadow-2xl overflow-hidden transition-all text-gray-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#22B8A7]/10 bg-[#173C4A]">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#22B8A7]" />
            <h3 className="font-bold text-sm uppercase tracking-wider text-white">Ajustement de la Trésorerie</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#22B8A7]/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {showSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-[#22B8A7] animate-bounce" />
              <p className="text-sm font-bold text-white">Solde de Trésorerie mis à jour !</p>
              <p className="text-xs text-gray-400">Les modifications ont été enregistrées localement.</p>
            </div>
          ) : (
            <>
              {/* Option Mode Toggle */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-[#22B8A7] tracking-wider block">Mode de Calcul du Solde</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTempUseManual(false)}
                    className={`p-3 rounded-lg border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      !tempUseManual 
                        ? 'border-[#22B8A7] bg-[#22B8A7]/10 text-[#22B8A7]' 
                        : 'border-gray-700 bg-transparent hover:bg-gray-800 text-gray-400'
                    }`}
                  >
                    <span>🔄 Calculé</span>
                    <span className="text-[9px] font-normal block opacity-80">Par comptabilité double</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempUseManual(true)}
                    className={`p-3 rounded-lg border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      tempUseManual 
                        ? 'border-[#22B8A7] bg-[#22B8A7]/10 text-[#22B8A7]' 
                        : 'border-gray-700 bg-transparent hover:bg-gray-800 text-gray-400'
                    }`}
                  >
                    <span>✍️ Manuel</span>
                    <span className="text-[9px] font-normal block opacity-80">Saisie d'un solde réel</span>
                  </button>
                </div>
              </div>

              {tempUseManual ? (
                /* MANUAL BALANCE FIELDS */
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-3 bg-[#e15b64]/10 border border-[#e15b64]/20 rounded-lg text-xs text-[#e15b64] flex gap-2">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    <span>Le mode manuel force l'affichage de la trésorerie à ce montant absolu, sans appliquer les débits/crédits calculés.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block">Solde Réel Actuel de la Caisse (FCFA)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={tempManual}
                        onChange={(e) => setTempManual(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#122e38] border border-gray-700 rounded-lg focus:outline-none focus:border-[#22B8A7] text-white font-bold"
                        placeholder="Ex: 2500000"
                        min="0"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-bold">FCFA</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* CALCULATED MODE FIELDS */
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-3 bg-[#22B8A7]/5 border border-[#22B8A7]/20 rounded-lg text-xs text-gray-300 flex gap-2">
                    <Info className="w-4 h-4 flex-shrink-0 text-[#22B8A7]" />
                    <span>Le solde calculé équivaut au <strong className="text-white">Solde Initial + Cotisations + Crédits - Dépenses - Budgets terminés</strong>.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block">Solde Initial d'Ouverture (FCFA)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={tempInitial}
                        onChange={(e) => setTempInitial(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#122e38] border border-gray-700 rounded-lg focus:outline-none focus:border-[#22B8A7] text-white font-bold"
                        placeholder="Ex: 2500000"
                        min="0"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-bold">FCFA</span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#122e38] border border-gray-800 rounded-lg text-xs space-y-1 text-gray-400">
                    <div className="flex justify-between">
                      <span>Solde Initial :</span>
                      <span className="font-semibold text-white">{tempInitial.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Flux comptables cumulés :</span>
                      <span className="font-semibold text-[#22B8A7]">{(computedBalance - initialLiquidity).toLocaleString()} FCFA</span>
                    </div>
                    <div className="border-t border-gray-700 my-1 pt-1 flex justify-between font-bold text-white">
                      <span>Solde Final Estimé :</span>
                      <span className="text-[#22B8A7]">{(tempInitial + (computedBalance - initialLiquidity)).toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold uppercase rounded-lg border border-gray-700 bg-transparent text-gray-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 bg-[#22B8A7] hover:bg-[#1fa192] text-white rounded-lg font-bold text-xs uppercase flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Enregistrer
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
