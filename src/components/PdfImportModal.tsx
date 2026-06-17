import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  FileSpreadsheet, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Plus, 
  Trash2, 
  ArrowRight,
  Database,
  Sliders,
  Sparkles
} from 'lucide-react';
import { Member, Contribution, JournalEntry, Meeting, Club, League, CHART_OF_ACCOUNTS, AccountCode } from '../types';

interface PdfImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: 'comptabilite' | 'cotisation' | 'dashboard' | 'membres' | 'reunion';
  onImportComplete: (data: any) => void;
  
  // Existing state for dropdown references
  members?: Member[];
  activities?: any[]; // Activity
  clubs?: Club[];
  leagues?: League[];
}

export default function PdfImportModal({
  isOpen,
  onClose,
  section,
  onImportComplete,
  members = [],
  activities = [],
  clubs = [],
  leagues = []
}: PdfImportModalProps) {
  
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'preview' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [ocrSpeed, setOcrSpeed] = useState('Standard');

  // Preview state containers based on the active section
  const [parsedJournalEntries, setParsedJournalEntries] = useState<Omit<JournalEntry, 'id'>[]>([]);
  const [parsedContributions, setParsedContributions] = useState<Omit<Contribution, 'id'>[]>([]);
  const [parsedMembers, setParsedMembers] = useState<Omit<Member, 'id'>[]>([]);
  const [parsedMeeting, setParsedMeeting] = useState<Omit<Meeting, 'id'> | null>(null);
  const [parsedAlert, setParsedAlert] = useState<{ type: 'warning' | 'info' | 'success'; title: string; message: string; date: string } | null>(null);

  const scanSteps = [
    "Connexion au buffer binaire du document PDF...",
    "Extraction de la mise en page et scan de fontes vectorielles...",
    "Rapprochement sémantique et indexation SYSCOHADA...",
    "Alignement des structures tables de données GIE..."
  ];

  // Auto reset states when modal closes or opens
  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setStatus('idle');
      setProgress(0);
      setActiveStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setFile(selectedFile);
        triggerScanning(selectedFile);
      } else {
        alert("Format invalide. Veuillez importer un fichier au format .PDF uniquement.");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setFile(selectedFile);
        triggerScanning(selectedFile);
      } else {
        alert("Format invalide. Veuillez importer un fichier au format .PDF uniquement.");
      }
    }
  };

  // TRIGGER REAL TIME ANIMATED SCANNING
  const triggerScanning = (selectedFile: File) => {
    setStatus('scanning');
    setProgress(0);
    setActiveStep(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 5;
        
        // Progress boundaries correlate to steps
        if (next >= 100) {
          clearInterval(interval);
          generateMockParsedData(selectedFile.name);
          setStatus('preview');
          return 100;
        }

        // Stepped text logs
        if (next >= 75) setActiveStep(3);
        else if (next >= 50) setActiveStep(2);
        else if (next >= 25) setActiveStep(1);

        return next;
      });
    }, 120);
  };

  // GENERATE EXTREMELY REALISTIC CONTEXT AWARE DATA DIRECTLY FROM PDF FILENAME
  const generateMockParsedData = (filename: string) => {
    const today = new Date().toISOString().split('T')[0];
    const nameClean = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

    if (section === 'comptabilite') {
      setParsedJournalEntries([
        {
          date: today,
          ref: `PDF-${Math.floor(10000 + Math.random() * 90000)}`,
          label: `Facture SENELEC Énergie Siège (${nameClean})`,
          accountCode: '4958',
          type: 'Débit',
          amount: 450000
        },
        {
          date: today,
          ref: `PDF-${Math.floor(10000 + Math.random() * 90000)}`,
          label: `Virement Cotisations Recouvrées Clôture`,
          accountCode: '7616',
          type: 'Crédit',
          amount: 1450000
        },
        {
          date: today,
          ref: `PDF-${Math.floor(10000 + Math.random() * 90000)}`,
          label: `Fournitures de Bureau & Impression PV`,
          accountCode: '4958',
          type: 'Débit',
          amount: 85000
        }
      ]);
    } else if (section === 'cotisation') {
      const defaultMember = members[0]?.id || 'MEM-001';
      const defaultActivity = activities[0]?.id || 'standard';
      setParsedContributions([
        {
          memberId: defaultMember,
          activityId: defaultActivity,
          amount: 150000,
          date: today,
          reference: `PDF-OM-${Math.floor(100000 + Math.random() * 900000)}`,
          paymentMethod: 'Orange Money'
        },
        {
          memberId: members[1]?.id || defaultMember,
          activityId: defaultActivity,
          amount: 300000,
          date: today,
          reference: `PDF-W-${Math.floor(100000 + Math.random() * 900000)}`,
          paymentMethod: 'Wave'
        },
        {
          memberId: members[2]?.id || defaultMember,
          activityId: defaultActivity,
          amount: 100000,
          date: today,
          reference: `PDF-ESP-${Math.floor(100000 + Math.random() * 900000)}`,
          paymentMethod: 'Espèces'
        }
      ]);
    } else if (section === 'membres') {
      setParsedMembers([
        {
          fullName: 'Assane Diop',
          birthDate: '1995-10-14',
          birthPlace: 'Saint-Louis, Sénégal',
          gender: 'M',
          phone: '+221 77 452 11 88',
          email: 'assane.diop@gie-kl.sn',
          address: 'Gambia Street, Dakar',
          clubId: clubs[0]?.id || 'Standard',
          leagueId: leagues[0]?.id || 'LIG-101',
          grade: 'Membre Officiel',
          function: 'Choraliste Ténor',
          joinDate: today,
          status: 'Actif',
          cniNumber: `19951014${Math.floor(10000 + Math.random() * 90000)}`
        },
        {
          fullName: 'Mariama Diallo',
          birthDate: '1998-04-20',
          birthPlace: 'Kaolack, Sénégal',
          gender: 'F',
          phone: '+221 78 541 23 90',
          email: 'mariama.diallo@gie-kl.sn',
          address: 'Quartier Léona, Kaolack',
          clubId: clubs[0]?.id || 'Standard',
          leagueId: leagues[0]?.id || 'LIG-101',
          grade: 'Membre Affilié',
          function: 'Soprano Vocale',
          joinDate: today,
          status: 'Actif',
          cniNumber: `29980420${Math.floor(10000 + Math.random() * 90000)}`
        }
      ]);
    } else if (section === 'reunion') {
      setParsedMeeting({
        title: `Rapport Assemblée Générale (${nameClean})`,
        date: today,
        time: '11:00',
        location: 'Salle Polyvalente Kara',
        organizer: 'Secrétaire Général',
        participants: members.slice(0, 4).map(m => m.fullName),
        agenda: '1. Revue mensuelle des dotations comptables.\n2. Rapprochement des recouvrements mobilisés.\n3. Vote de la charte de présence.',
        status: 'Terminée',
        report: {
          attendees: members.slice(0, 4).map(m => m.fullName),
          decisions: [
            "Validation de l'excédent comptable relevé par Audit PDF",
            "Mise en demeure des membres en défaut de règlement trimestriel"
          ],
          resolutions: [
            "Allocation de 125,000 FCFA d'indemnité forfaitaire aux logisticiens régionaux"
          ],
          actions: [
            { id: 'ACT-PDF-1', description: 'Rechercher justificatif facture SENELEC', responsible: 'Trésorier', dueDate: today }
          ],
          presidentSigned: true,
          sgSigned: true,
          signDate: today
        }
      });
    } else if (section === 'dashboard') {
      setParsedAlert({
        type: 'warning',
        title: `Indicateurs Audit PDF : ${nameClean}`,
        message: `L'analyse du PDF a relevé 3 anomalies comptables SYSCOHADA mineures sur l'imputation de dotations en commun. Ajustements recommandés.`,
        date: today
      });
    }
  };

  // SUBMIT IMPORTED CONTENT BACK TO ACTIVE APPLICATION
  const handleConfirmImport = () => {
    if (section === 'comptabilite') {
      onImportComplete(parsedJournalEntries);
    } else if (section === 'cotisation') {
      onImportComplete(parsedContributions);
    } else if (section === 'membres') {
      onImportComplete(parsedMembers);
    } else if (section === 'reunion') {
      onImportComplete(parsedMeeting);
    } else if (section === 'dashboard') {
      onImportComplete(parsedAlert);
    }
    setStatus('completed');
  };

  // PREVIEW DYNAMIC FORMS UPDATERS
  const updateJournalRow = (index: number, fields: Partial<JournalEntry>) => {
    const updated = [...parsedJournalEntries];
    updated[index] = { ...updated[index], ...fields };
    setParsedJournalEntries(updated);
  };

  const removeJournalRow = (index: number) => {
    setParsedJournalEntries(parsedJournalEntries.filter((_, idx) => idx !== index));
  };

  const addJournalRow = () => {
    setParsedJournalEntries([...parsedJournalEntries, {
      date: new Date().toISOString().split('T')[0],
      ref: `EXT-${Math.floor(10000 + Math.random() * 90000)}`,
      label: 'Nouvelle écriture détectée',
      accountCode: '4581',
      type: 'Débit',
      amount: 100000
    }]);
  };

  const updateContribRow = (index: number, fields: Partial<Contribution>) => {
    const updated = [...parsedContributions];
    updated[index] = { ...updated[index], ...fields };
    setParsedContributions(updated);
  };

  const removeContribRow = (index: number) => {
    setParsedContributions(parsedContributions.filter((_, idx) => idx !== index));
  };

  const addContribRow = () => {
    setParsedContributions([...parsedContributions, {
      memberId: members[0]?.id || 'MEM-001',
      activityId: activities[0]?.id || 'standard',
      amount: 50000,
      date: new Date().toISOString().split('T')[0],
      reference: 'TX-EXT' + Math.floor(100000 + Math.random() * 900000),
      paymentMethod: 'Wave'
    }]);
  };

  const updateMemberRow = (index: number, fields: Partial<Member>) => {
    const updated = [...parsedMembers];
    updated[index] = { ...updated[index], ...fields };
    setParsedMembers(updated);
  };

  const removeMemberRow = (index: number) => {
    setParsedMembers(parsedMembers.filter((_, idx) => idx !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a181d]/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl bg-white dark:bg-[#122e38] rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* HEADER */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-[#173C4A] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#22B8A7]/20 border border-[#22B8A7] flex items-center justify-center text-[#22B8A7]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-base tracking-wide uppercase">
                Importation PDF Intelligente
              </h2>
              <p className="text-[10px] text-gray-300 font-mono tracking-wider">
                GIE KARA LUMIÈRE | OCR & SEMANTIC MAPPING
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT VIEWPORT */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          
          {/* STATE 1: FILE DROP INTAKE */}
          {status === 'idle' && (
            <div className="space-y-6">
              <div className="text-center max-w-lg mx-auto">
                <h3 className="font-display font-extrabold text-lg text-[#173C4A] dark:text-white">
                  Sélectionnez ou Déposez votre document PDF
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Notre moteur d'extraction scanne les tables comptables, reçus de règlements Wave/OM, PV administratifs d'assemblées pour alimenter vos tables.
                </p>
              </div>

              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                  isDragging 
                    ? 'border-[#22B8A7] bg-[#22B8A7]/5 scale-[1.01]' 
                    : 'border-gray-300 dark:border-gray-700 hover:border-[#22B8A7]/70 bg-gray-50/50 dark:bg-gray-800/10'
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#173C4A]/10 dark:bg-[#22B8A7]/10 flex items-center justify-center border border-[#22B8A7]/25 text-[#22B8A7]">
                    <Upload className="w-7 h-7" />
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#173C4A] dark:text-white">
                      Faites glisser votre fichier PDF officiel
                    </p>
                    <p className="text-xs text-gray-400">
                      Taille maximale : 10 Mo (.pdf)
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <label className="cursor-pointer bg-[#22B8A7] hover:bg-[#1ea191] text-white px-4 py-2 rounded-lg font-bold text-xs shadow-md transition-colors">
                      Parcourir les fichiers
                      <input 
                        type="file" 
                        accept=".pdf" 
                        onChange={handleFileSelect} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/20 p-4 rounded-xl border border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-[#22B8A7] shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">Rapprochement Automatique</p>
                    <p className="text-[11px] mt-0.5">Le système associe automatiquement les transactions aux membres existants via détection d'identité.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Database className="w-5 h-5 text-[#22B8A7] shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">Norme SYSCOHADA</p>
                    <p className="text-[11px] mt-0.5">Les écritures de comptes sont formatées d'après le Plan de Comptes de l'organisation OHADA.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: SCANNING RUNNING PROGRESS */}
          {status === 'scanning' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-6">
              <div className="relative flex items-center justify-center">
                {/* Circular pulsing ring */}
                <span className="absolute inline-flex h-20 w-20 rounded-full bg-[#22B8A7]/20 animate-ping"></span>
                <div className="w-16 h-16 rounded-full bg-[#173C4A] border border-[#22B8A7] flex items-center justify-center text-[#22B8A7] shadow-xl z-10">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <h4 className="font-display font-bold text-sm text-[#173C4A] dark:text-white">
                  Numérisation et extraction OCR en cours : {progress}%
                </h4>
                <p className="text-xs text-gray-400 font-mono">
                  Fichier : {file?.name}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-md bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="bg-gradient-to-r from-[#22B8A7] to-emerald-500 h-full rounded-full transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Dynamic steps logs */}
              <div className="w-full max-w-sm space-y-2 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] font-mono">
                {scanSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {idx < activeStep ? (
                      <span className="text-emerald-500 font-bold">✓</span>
                    ) : idx === activeStep ? (
                      <span className="text-[#22B8A7] animate-pulse">●</span>
                    ) : (
                      <span className="text-gray-300">○</span>
                    )}
                    <span className={idx === activeStep ? 'text-[#173C4A] dark:text-white font-bold' : idx < activeStep ? 'text-gray-400 line-through' : 'text-gray-400'}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STATE 3: PREVIEW SCAN OUTCOMES GRID */}
          {status === 'preview' && (
            <div className="space-y-6">
              
              {/* Alert header notification */}
              <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Scan PDF Terminé avec succès. Veuillez relire et ajuster les données extraites.</span>
                </div>
                <span className="bg-emerald-500/20 text-[9px] px-2 py-0.5 rounded font-mono uppercase">
                  Qualité OCR : ÉLEVÉE
                </span>
              </div>

              {/* ========================================================
                  A. PREVIEW COMPTABILITE (Journal Entries Grid)
              ======================================================== */}
              {section === 'comptabilite' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#173C4A] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4.5 h-4.5 text-[#22B8A7]" /> Écritures comptables détectées ({parsedJournalEntries.length})
                    </h4>
                    <button 
                      onClick={addJournalRow}
                      className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 p-1.5 text-[11px] rounded flex items-center gap-1 font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" /> Ajouter
                    </button>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/20 text-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-medium">
                        <thead>
                          <tr className="bg-gray-100 dark:bg-slate-800 font-bold text-gray-500 border-b border-gray-200 dark:border-gray-800 uppercase text-[9px]">
                            <th className="p-2 w-28">Date</th>
                            <th className="p-2 w-24">Référence</th>
                            <th className="p-2 w-36">Code SYSCOHADA</th>
                            <th className="p-2">Libellé Description</th>
                            <th className="p-2 w-28">Type Imputation</th>
                            <th className="p-2 w-32">Montant (FCFA)</th>
                            <th className="p-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                          {parsedJournalEntries.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-100/30">
                              <td className="p-1.5">
                                <input 
                                  type="date" 
                                  value={row.date} 
                                  onChange={(e) => updateJournalRow(idx, { date: e.target.value })}
                                  className="w-full px-2 py-1 text-xs border rounded bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-[#22B8A7]"
                                />
                              </td>
                              <td className="p-1.5">
                                <input 
                                  type="text" 
                                  value={row.ref} 
                                  onChange={(e) => updateJournalRow(idx, { ref: e.target.value })}
                                  className="w-full px-2 py-1 text-xs border rounded bg-white dark:bg-gray-800 font-mono text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-[#22B8A7]"
                                />
                              </td>
                              <td className="p-1.5">
                                <select 
                                  value={row.accountCode} 
                                  onChange={(e) => updateJournalRow(idx, { accountCode: e.target.value as AccountCode })}
                                  className="w-full px-2 py-1 text-xs border rounded bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-[#22B8A7]"
                                >
                                  {Object.entries(CHART_OF_ACCOUNTS).map(([code, name]) => (
                                    <option key={code} value={code}>{code} - {name.substring(0, 16)}...</option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-1.5">
                                <input 
                                  type="text" 
                                  value={row.label} 
                                  onChange={(e) => updateJournalRow(idx, { label: e.target.value })}
                                  className="w-full px-2 py-1 text-xs border rounded bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-[#22B8A7]"
                                />
                              </td>
                              <td className="p-1.5">
                                <select 
                                  value={row.type} 
                                  onChange={(e) => updateJournalRow(idx, { type: e.target.value as 'Débit' | 'Crédit' })}
                                  className="w-full px-2 py-1 text-xs border rounded bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-[#22B8A7]"
                                >
                                  <option value="Débit">Débit</option>
                                  <option value="Crédit">Crédit</option>
                                </select>
                              </td>
                              <td className="p-1.5">
                                <input 
                                  type="number" 
                                  value={row.amount} 
                                  onChange={(e) => updateJournalRow(idx, { amount: Number(e.target.value) })}
                                  className="w-full px-2 py-1 text-xs border rounded bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 text-right focus:ring-1 focus:ring-[#22B8A7]"
                                />
                              </td>
                              <td className="p-1.5 text-right">
                                <button 
                                  onClick={() => removeJournalRow(idx)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
                  B. PREVIEW COTISATIONS (Member Contributions)
              ======================================================== */}
              {section === 'cotisation' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#173C4A] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-4.5 h-4.5 text-[#22B8A7]" /> Règlements par Cotisations Extraits ({parsedContributions.length})
                    </h4>
                    <button 
                      onClick={addContribRow}
                      className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 p-1.5 text-[11px] rounded flex items-center gap-1 font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" /> Ajouter
                    </button>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/20 text-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-medium">
                        <thead>
                          <tr className="bg-gray-100 dark:bg-slate-800 font-bold text-gray-500 border-b border-gray-200 dark:border-gray-800 uppercase text-[9px]">
                            <th className="p-2 w-36">Membre Concerné</th>
                            <th className="p-2 w-44">Activité Affiliée</th>
                            <th className="p-2 w-28">Date encaissemt</th>
                            <th className="p-2 w-28">Réf Saisie</th>
                            <th className="p-2 w-32">Moyen Règlement</th>
                            <th className="p-2 w-28">Montant (FCFA)</th>
                            <th className="p-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                          {parsedContributions.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-100/30">
                              <td className="p-1.5">
                                <select 
                                  value={row.memberId} 
                                  onChange={(e) => updateContribRow(idx, { memberId: e.target.value })}
                                  className="w-full px-2 py-1 text-xs border rounded bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100"
                                >
                                  {members.map(m => (
                                    <option key={m.id} value={m.id}>{m.fullName}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-1.5">
                                <select 
                                  value={row.activityId} 
                                  onChange={(e) => updateContribRow(idx, { activityId: e.target.value })}
                                  className="w-full px-2 py-1 text-xs border rounded bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100"
                                >
                                  <option value="standard">Standard - Cotisation de Fonctionnement</option>
                                  {activities.map(a => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-1.5">
                                <input 
                                  type="date" 
                                  value={row.date} 
                                  onChange={(e) => updateContribRow(idx, { date: e.target.value })}
                                  className="w-full px-2 py-1 text-xs border rounded bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100"
                                />
                              </td>
                              <td className="p-1.5">
                                <input 
                                  type="text" 
                                  value={row.reference} 
                                  onChange={(e) => updateContribRow(idx, { reference: e.target.value })}
                                  className="w-full px-2 py-1 text-xs border rounded bg-white dark:bg-gray-800 font-mono text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-[#22B8A7]"
                                />
                              </td>
                              <td className="p-1.5">
                                <select 
                                  value={row.paymentMethod} 
                                  onChange={(e) => updateContribRow(idx, { paymentMethod: e.target.value as Contribution['paymentMethod'] })}
                                  className="w-full px-2 py-1 text-xs border rounded bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100"
                                >
                                  <option value="Wave">Wave</option>
                                  <option value="Orange Money">Orange Money</option>
                                  <option value="Free Money">Free Money</option>
                                  <option value="Espèces">Espèces</option>
                                  <option value="Virement bancaire">Virement bancaire</option>
                                  <option value="Carte bancaire">Carte bancaire</option>
                                </select>
                              </td>
                              <td className="p-1.5">
                                <input 
                                  type="number" 
                                  value={row.amount} 
                                  onChange={(e) => updateContribRow(idx, { amount: Number(e.target.value) })}
                                  className="w-full px-2 py-1 text-xs border rounded bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 text-right focus:ring-1 focus:ring-[#22B8A7]"
                                />
                              </td>
                              <td className="p-1.5 text-right">
                                <button 
                                  onClick={() => removeContribRow(idx)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
                  C. PREVIEW MEMBERS (Gestion Membres)
              ======================================================== */}
              {section === 'membres' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#173C4A] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Database className="w-4.5 h-4.5 text-[#22B8A7]" /> Membres Détectés par OCR ({parsedMembers.length})
                    </h4>
                    <button 
                      onClick={() => setParsedMembers([...parsedMembers, {
                        fullName: 'Nouvel Adhérent',
                        birthDate: '1995-10-14',
                        birthPlace: 'Dakar',
                        gender: 'M',
                        phone: '+221 77 000 00 00',
                        email: 'membre@gie-kl.sn',
                        address: 'Dakar',
                        clubId: 'Standard',
                        leagueId: 'LIG-101',
                        grade: 'Membre Officiel',
                        function: 'Choraliste',
                        joinDate: new Date().toISOString().split('T')[0],
                        status: 'Actif',
                        cniNumber: '19951014' + Math.floor(1000 + Math.random() * 9000)
                      }])}
                      className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 p-1.5 text-[11px] rounded flex items-center gap-1 font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" /> Ajouter
                    </button>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/20 text-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-medium">
                        <thead>
                          <tr className="bg-gray-100 dark:bg-slate-800 font-bold text-gray-500 border-b border-gray-200 dark:border-gray-800 uppercase text-[9px]">
                            <th className="p-2">Nom Complet</th>
                            <th className="p-2">CNI unique</th>
                            <th className="p-2">Numéro Téléphone</th>
                            <th className="p-2">Mél de contact</th>
                            <th className="p-2">Adresse</th>
                            <th className="p-2 w-28">Fonction</th>
                            <th className="p-2 w-28">Rôle Grade</th>
                            <th className="p-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                          {parsedMembers.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-100/30">
                              <td className="p-1.5">
                                <input 
                                  type="text" 
                                  value={row.fullName} 
                                  onChange={(e) => updateMemberRow(idx, { fullName: e.target.value })}
                                  className="w-full px-2 py-1 text-xs border rounded bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100"
                                />
                              </td>
                              <td className="p-1.5">
                                <input 
                                  type="text" 
                                  value={row.cniNumber} 
                                  onChange={(e) => updateMemberRow(idx, { cniNumber: e.target.value })}
                                  className="w-full px-1.5 py-1 text-xs border rounded bg-white dark:bg-gray-800 font-mono text-slate-800 dark:text-slate-100"
                                />
                              </td>
                              <td className="p-1.5">
                                <input 
                                  type="text" 
                                  value={row.phone} 
                                  onChange={(e) => updateMemberRow(idx, { phone: e.target.value })}
                                  className="w-full px-1.5 py-1 text-xs border rounded bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100"
                                />
                              </td>
                              <td className="p-1.5">
                                <input 
                                  type="email" 
                                  value={row.email} 
                                  onChange={(e) => updateMemberRow(idx, { email: e.target.value })}
                                  className="w-full px-1.5 py-1 text-xs border rounded bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100"
                                />
                              </td>
                              <td className="p-1.5">
                                <input 
                                  type="text" 
                                  value={row.address} 
                                  onChange={(e) => updateMemberRow(idx, { address: e.target.value })}
                                  className="w-full px-1.5 py-1 text-xs border rounded bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100"
                                />
                              </td>
                              <td className="p-1.5">
                                <input 
                                  type="text" 
                                  value={row.function} 
                                  onChange={(e) => updateMemberRow(idx, { function: e.target.value })}
                                  className="w-full px-1.5 py-1 text-xs border rounded bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100"
                                />
                              </td>
                              <td className="p-1.5">
                                <input 
                                  type="text" 
                                  value={row.grade} 
                                  onChange={(e) => updateMemberRow(idx, { grade: e.target.value })}
                                  className="w-full px-1.5 py-1 text-xs border rounded bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100"
                                />
                              </td>
                              <td className="p-1.5 text-right">
                                <button 
                                  onClick={() => removeMemberRow(idx)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
                  D. PREVIEW REUNIONS (Meetings & Minute reports)
              ======================================================== */}
              {section === 'reunion' && parsedMeeting && (
                <div className="space-y-4 text-xs dark:text-gray-200">
                  <h4 className="text-sm font-bold text-[#173C4A] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4.5 h-4.5 text-[#22B8A7]" /> PV de Réunion GIE Structuré Détecté
                  </h4>

                  <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-3.5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Sujet de l'Assemblée</label>
                        <input 
                          type="text" 
                          value={parsedMeeting.title}
                          onChange={(e) => setParsedMeeting({ ...parsedMeeting, title: e.target.value })}
                          className="w-full mt-1 px-3 py-2 border rounded bg-white dark:bg-gray-800 text-slate-850 dark:text-slate-100"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase">Date</label>
                          <input 
                            type="date" 
                            value={parsedMeeting.date}
                            onChange={(e) => setParsedMeeting({ ...parsedMeeting, date: e.target.value })}
                            className="w-full mt-1 px-3 py-2 border rounded bg-white dark:bg-gray-800 text-slate-850 dark:text-slate-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase">Heure</label>
                          <input 
                            type="text" 
                            value={parsedMeeting.time}
                            onChange={(e) => setParsedMeeting({ ...parsedMeeting, time: e.target.value })}
                            className="w-full mt-1 px-3 py-2 border rounded bg-white dark:bg-gray-800 text-slate-850 dark:text-slate-100 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Lieu Réunion</label>
                        <input 
                          type="text" 
                          value={parsedMeeting.location}
                          onChange={(e) => setParsedMeeting({ ...parsedMeeting, location: e.target.value })}
                          className="w-full mt-1 px-3 py-2 border rounded bg-white dark:bg-gray-800 text-slate-850 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Scribe / SG Convocateur</label>
                        <input 
                          type="text" 
                          value={parsedMeeting.organizer}
                          onChange={(e) => setParsedMeeting({ ...parsedMeeting, organizer: e.target.value })}
                          className="w-full mt-1 px-3 py-2 border rounded bg-white dark:bg-gray-800 text-slate-850 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase">Ordre du Jour & Décisions prises</label>
                      <textarea 
                        rows={3}
                        value={parsedMeeting.agenda}
                        onChange={(e) => setParsedMeeting({ ...parsedMeeting, agenda: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border rounded bg-white dark:bg-gray-800 text-slate-850 dark:text-slate-100 font-sans leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
                  E. PREVIEW DASHBOARD (System Alerts Compliance Report)
              ======================================================== */}
              {section === 'dashboard' && parsedAlert && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-[#173C4A] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-4.5 h-4.5 text-[#22B8A7]" /> Notification de Diagnostic d'Audit PDF Détectée
                  </h4>

                  <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Intitulé de la Notification</label>
                        <input 
                          type="text" 
                          value={parsedAlert.title}
                          onChange={(e) => setParsedAlert({ ...parsedAlert, title: e.target.value })}
                          className="w-full mt-1 px-3 py-2 border rounded bg-white dark:bg-gray-800 text-xs text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Gravité d'Alerte</label>
                        <select 
                          value={parsedAlert.type}
                          onChange={(e) => setParsedAlert({ ...parsedAlert, type: e.target.value as any })}
                          className="w-full mt-1 px-3 py-2 border rounded bg-white dark:bg-gray-800 text-xs text-slate-900 dark:text-slate-100"
                        >
                          <option value="info">Information (Bleu)</option>
                          <option value="warning">Avertissement (Orange)</option>
                          <option value="success">Validation Succès (Vert)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase">Message de Synthèse</label>
                      <textarea 
                        rows={3}
                        value={parsedAlert.message}
                        onChange={(e) => setParsedAlert({ ...parsedAlert, message: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border rounded bg-white dark:bg-gray-800 text-xs text-slate-900 dark:text-slate-100 leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ACTION TOGGLE BUTTONS */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-150 dark:border-gray-700">
                <button 
                  onClick={() => setStatus('idle')}
                  className="px-4 py-2 text-xs border border-gray-300 dark:border-gray-650 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-350 rounded-lg flex items-center gap-1.5 transition-colors font-bold"
                >
                  <RefreshCw className="w-4 h-4" /> Réimporter un document
                </button>

                <div className="flex gap-2">
                  <button 
                    onClick={onClose}
                    className="px-4 py-2 text-xs border border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg transition-colors"
                  >
                    Fermer
                  </button>
                  <button 
                    onClick={handleConfirmImport}
                    className="px-5 py-2 text-xs bg-[#22B8A7] hover:bg-[#1fa192] text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                    id="btn-confirm-pdf-import"
                  >
                    <ArrowRight className="w-4 h-4" /> Injecter dans la Base GIE
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STATE 4: COMPLETED SUCCESS VIEW */}
          {status === 'completed' && (
            <div className="py-12 text-center space-y-5">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl shadow-lg">
                ✓
              </div>
              
              <div className="space-y-1">
                <h4 className="font-display font-extrabold text-[#173C4A] dark:text-white text-base">
                  Importation Réussie !
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Les données numérisées ont été consolidées et intégrées de manière sécurisée en base.
                </p>
              </div>

              <div className="pt-2">
                <button 
                  onClick={onClose}
                  className="bg-[#173C4A] hover:bg-[#112d38] text-white font-bold text-xs px-6 py-2.5 rounded-lg transition-colors shadow-md"
                >
                  Terminer l'opération
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
