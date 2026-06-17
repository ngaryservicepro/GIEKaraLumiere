/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Printer, 
  CheckSquare, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  FileText, 
  Award, 
  PenTool, 
  ChevronDown, 
  X,
  UserCheck
} from 'lucide-react';
import { Meeting, Member, ActionItem } from '../types';
import { exportMeetingsToPdf } from '../utils/pdfHelper';
import PdfImportModal from './PdfImportModal';

interface MeetingsViewProps {
  meetings: Meeting[];
  members: Member[];
  addMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  updateMeeting: (id: string, meeting: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
  isDarkMode: boolean;
  currentUserRole: string;
  selectedMeeting: Meeting | null;
  setSelectedMeeting: (meeting: Meeting | null) => void;
}

export default function MeetingsView({
  meetings,
  members,
  addMeeting,
  updateMeeting,
  deleteMeeting,
  isDarkMode,
  currentUserRole,
  selectedMeeting,
  setSelectedMeeting
}: MeetingsViewProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [organizerFilter, setOrganizerFilter] = useState<string>('All');
  const [isImportOpen, setIsImportOpen] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  // Form states (Meeting)
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [agenda, setAgenda] = useState('');
  const [status, setStatus] = useState<Meeting['status']>('Planifiée');

  // Report details state
  const [reportAttendees, setReportAttendees] = useState<string[]>([]);
  const [reportDecisions, setReportDecisions] = useState<string[]>([]);
  const [reportResolutions, setReportResolutions] = useState<string[]>([]);
  const [reportActions, setReportActions] = useState<ActionItem[]>([]);
  
  // States to add single custom items to lists
  const [newDecision, setNewDecision] = useState('');
  const [newResolution, setNewResolution] = useState('');
  const [actionDesc, setActionDesc] = useState('');
  const [actionResp, setActionResp] = useState('');
  const [actionDue, setActionDue] = useState('');

  // Signature States inside Report
  const [presSigned, setPresSigned] = useState(false);
  const [sgSigned, setSgSigned] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDate('');
    setTime('');
    setLocation('');
    setOrganizer('');
    setParticipants([]);
    setAgenda('');
    setStatus('Planifiée');
    setEditingMeeting(null);
  };

  const handleCreateOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) {
      alert("Veuillez renseigner le titre du meeting, la date et l'heure.");
      return;
    }

    const meetingData = {
      title,
      date,
      time,
      location,
      organizer,
      participants,
      agenda,
      status
    };

    if (editingMeeting) {
      updateMeeting(editingMeeting.id, meetingData);
    } else {
      addMeeting(meetingData);
    }

    resetForm();
    setShowAddForm(false);
  };

  const handleEdit = (m: Meeting) => {
    setEditingMeeting(m);
    setTitle(m.title);
    setDate(m.date);
    setTime(m.time);
    setLocation(m.location);
    setOrganizer(m.organizer);
    setParticipants(m.participants);
    setAgenda(m.agenda);
    setStatus(m.status);
    setShowAddForm(true);
  };

  // Open Report Panel and fill temporary states
  const handleOpenReportEditor = (m: Meeting) => {
    setSelectedMeeting(m);
    setReportAttendees(m.report?.attendees || m.participants);
    setReportDecisions(m.report?.decisions || []);
    setReportResolutions(m.report?.resolutions || []);
    setReportActions(m.report?.actions || []);
    setPresSigned(m.report?.presidentSigned || false);
    setSgSigned(m.report?.sgSigned || false);
  };

  const handleSaveReport = () => {
    if (!selectedMeeting) return;
    
    const updatedReport = {
      attendees: reportAttendees,
      decisions: reportDecisions,
      resolutions: reportResolutions,
      actions: reportActions,
      presidentSigned: presSigned,
      sgSigned: sgSigned,
      signDate: presSigned && sgSigned ? new Date().toISOString().split('T')[0] : undefined
    };

    updateMeeting(selectedMeeting.id, {
      ...selectedMeeting,
      status: 'Terminée', // Autosets to completed when report is signed or saved
      report: updatedReport
    });

    // Refresh context selected meeting
    const fresh = meetings.find(m => m.id === selectedMeeting.id);
    if (fresh) {
      setSelectedMeeting({
        ...fresh,
        status: 'Terminée',
        report: updatedReport
      });
    }

    alert("Le procès-verbal (Rapport de réunion) a été enregistré et validé.");
  };

  const addDecision = () => {
    if (!newDecision.trim()) return;
    setReportDecisions([...reportDecisions, newDecision.trim()]);
    setNewDecision('');
  };

  const addResolution = () => {
    if (!newResolution.trim()) return;
    setReportResolutions([...reportResolutions, newResolution.trim()]);
    setNewResolution('');
  };

  const addActionItem = () => {
    if (!actionDesc.trim() || !actionResp.trim() || !actionDue) {
      alert("Responsable, libellé et date d'achèvement requis pour attribuer l'action.");
      return;
    }
    const item: ActionItem = {
      id: 'ACT-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
      description: actionDesc.trim(),
      responsible: actionResp.trim(),
      dueDate: actionDue
    };
    setReportActions([...reportActions, item]);
    setActionDesc('');
    setActionResp('');
    setActionDue('');
  };

  const handlePrintReport = () => {
    window.print();
  };

  const toggleParticipant = (memberId: string) => {
    if (participants.includes(memberId)) {
      setParticipants(participants.filter(p => p !== memberId));
    } else {
      setParticipants([...participants, memberId]);
    }
  };

  // Filters application
  const filteredMeetings = meetings.filter(m => {
    const searchStr = `${m.title} ${m.agenda} ${m.organizer} ${m.location}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    const matchesOrganizer = organizerFilter === 'All' || m.organizer === organizerFilter;
    return matchesSearch && matchesStatus && matchesOrganizer;
  });

  const headingClass = isDarkMode ? 'text-white' : 'text-[#173C4A]';
  const cardBgClass = isDarkMode ? 'bg-[#122e38] border-gray-700' : 'bg-white border-gray-100';
  const textClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const inputClass = "w-full p-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#22B8A7]";

  // Gather unique organizers
  const organizers = Array.from(new Set(meetings.map(m => m.organizer).filter(Boolean)));

  const canModify = currentUserRole !== 'Membre';

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between pb-4 border-b border-gray-200 dark:border-gray-800 gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${headingClass}`}>Réunions & Procès-Verbaux</h1>
          <p className={`text-sm ${textClass}`}>
            Planifier des assemblées, ordonner le jour des débats et consigner de manière juridique et électronique les décisions de séance.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {canModify && !showAddForm && (
            <>
              <button 
                onClick={() => setIsImportOpen(true)}
                className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#122e38] text-gray-700 dark:text-gray-205 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                📥 Importer PV PDF
              </button>
              
              <button
                onClick={() => exportMeetingsToPdf(selectedMeeting ? [selectedMeeting] : meetings)}
                className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-[#22B8A7]/20 bg-[#22B8A7]/10 text-[#22B8A7] hover:bg-[#22B8A7]/20 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                📤 Exporter {selectedMeeting ? "PV Actif" : "Liste PV"} PDF
              </button>

              <button
                onClick={() => { resetForm(); setShowAddForm(true); }}
                className="bg-[#22B8A7] hover:bg-[#1fa192] text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                id="btn-add-meeting"
              >
                <Plus className="w-4 h-4" /> Nouvelle Réunion
              </button>
            </>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className={`p-6 rounded-xl border ${cardBgClass} shadow-md`}>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
            <h2 className={`font-bold text-base ${headingClass}`}>
              {editingMeeting ? `Modifier l'ordre du jour : ${editingMeeting.title}` : 'Programmer une Séance de Travail'}
            </h2>
            <button 
              onClick={() => { setShowAddForm(false); resetForm(); }}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-850 text-gray-500"
              id="btn-close-meeting-form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreateOrUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Titre de la Réunion *</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Assemblée Générale Ordinaire 2026"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Organisateur / Animateur *</label>
                <input 
                  type="text" 
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  placeholder="Ex: Secrétariat Général"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Date *</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Heure de début *</label>
                  <input 
                    type="time" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Statut Initial</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value as Meeting['status'])}
                    className={inputClass}
                  >
                    <option value="Planifiée">Planifiée</option>
                    <option value="En cours">En cours</option>
                    <option value="Terminée">Terminée</option>
                    <option value="Annulée">Annulée</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Lieu Physique ou Lien Électronique</label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Siège Social Dakar ou Google Meet"
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Ordre du Jour & Contexte</label>
                <textarea 
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  rows={3}
                  placeholder="Quels sont les points d'examen ?"
                  className={inputClass}
                />
              </div>

              {/* PARTICIPANTS CHECKBOXES */}
              <div className="md:col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <span className="block text-xs font-bold text-gray-500 mb-2 uppercase">Membres à inviter</span>
                {members.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Veuillez d'abord ajouter d'autres membres au système pour les convier.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                    {members.map(member => (
                      <label key={member.id} className="flex items-center gap-1.5 p-1 text-xs text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                        <input 
                          type="checkbox"
                          checked={participants.includes(member.fullName)}
                          onChange={() => toggleParticipant(member.fullName)}
                          className="rounded text-[#22B8A7] border-gray-300 dark:border-gray-700 focus:ring-[#22B8A7]"
                        />
                        <span className="truncate">{member.fullName}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button 
                type="button" 
                onClick={() => { setShowAddForm(false); resetForm(); }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="px-5 py-2 bg-[#173C4A] hover:bg-[#12303c] text-white rounded-lg text-sm font-semibold transition-colors"
                id="btn-save-meeting"
              >
                {editingMeeting ? 'Sauvegarder l\'Ordre du Jour' : 'Programmer la Séance'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTERS PANEL */}
      <div className="bg-gray-50 dark:bg-[#112730] p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Chercher une assemblée par titre ou ordre du jour..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-auto flex gap-3">
          <select 
            className="p-2 text-xs bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">Tous les statuts</option>
            <option value="Planifiée">Planifiées</option>
            <option value="En cours">En cours</option>
            <option value="Terminée">Terminées</option>
            <option value="Annulée">Annulées</option>
          </select>
          <select 
            className="p-2 text-xs bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none"
            value={organizerFilter}
            onChange={(e) => setOrganizerFilter(e.target.value)}
          >
            <option value="All">Tous les organisateurs</option>
            {organizers.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      {/* MEETINGS CONTAINER SCREEN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LIST COLUMN (2/3 of space) */}
        <div className="lg:col-span-2 space-y-4">
          {filteredMeetings.length === 0 ? (
            <div className={`p-8 rounded-xl border text-center ${cardBgClass}`}>
              <Calendar className="w-12 h-12 text-gray-405 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Aucun rendez-vous ne correspond à vos filtres.</p>
            </div>
          ) : (
            filteredMeetings.map(m => (
              <div 
                key={m.id} 
                className={`p-5 rounded-lg border ${cardBgClass} transition-all hover:border-[#22B8A7] flex flex-col justify-between ${
                  selectedMeeting?.id === m.id ? 'ring-2 ring-[#22B8A7] scale-[1.01]' : ''
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase ${
                          m.status === 'Planifiée' ? 'bg-blue-105 bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300' :
                          m.status === 'En cours' ? 'bg-yellow-100 text-yellow-850 dark:bg-yellow-950/40 dark:text-yellow-300' :
                          m.status === 'Terminée' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' :
                          'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                        }`}>
                          {m.status}
                        </span>
                        <span className="text-xs text-gray-400 font-bold font-mono">#{m.id}</span>
                      </div>
                      <h3 className={`font-bold text-base leading-snug ${headingClass}`}>{m.title}</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <p className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#22B8A7]" /> {new Date(m.date).toLocaleDateString('fr-FR')}</p>
                    <p className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#22B8A7]" /> {m.time}</p>
                    <p className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#22B8A7]" /> {m.location || 'Dakar'}</p>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap line-clamp-2">
                    {m.agenda || 'Aucune description écrite de l\'ordre du jour.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <p className="text-[10px] text-gray-400 font-bold uppercase truncate max-w-[150px]">
                    Organisé par: {m.organizer || 'Secrétaire'}
                  </p>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenReportEditor(m)}
                      className="px-3 py-1 bg-[#173C4A] hover:bg-[#204f61] text-white text-xs font-bold rounded transition-colors"
                      id={`btn-open-report-${m.id}`}
                    >
                      PV / Rapport
                    </button>
                    {canModify && (
                      <>
                        <button 
                          onClick={() => handleEdit(m)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-[#173C4A] dark:text-gray-300 rounded"
                          title="Modifier"
                          id={`btn-editmeet-${m.id}`}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm(`Rayer définitivement le meeting "${m.title}" des fiches d'activité ?`)) {
                              deleteMeeting(m.id);
                              if (selectedMeeting?.id === m.id) setSelectedMeeting(null);
                            }
                          }}
                          className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded"
                          title="Supprimer"
                          id={`btn-deletemeet-${m.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DETAILS & RAPPORT EDITOR COLUMN (1/3 of space) */}
        <div className="lg:col-span-1">
          {selectedMeeting ? (
            <div className={`p-6 rounded-lg border border-[#22B8A7] bg-[#1a3842] text-white shadow-lg space-y-6 print:bg-white print:text-black print:border-none print:p-0`}>
              
              {/* Meeting Header info */}
              <div className="space-y-2 pb-3 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg text-white print:text-black">{selectedMeeting.title}</h3>
                  <button 
                    onClick={() => setSelectedMeeting(null)}
                    className="p-1 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 print:hidden"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-emerald-400 space-y-1">
                  <p>Date : {new Date(selectedMeeting.date).toLocaleDateString('fr-FR')} à {selectedMeeting.time}</p>
                  <p>Lieu : {selectedMeeting.location}</p>
                </div>
              </div>

              {/* REPORT EDIT / VIEW CHUNKS */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#22B8A7] flex items-center gap-1.5 border-b border-gray-800 pb-1">
                  <FileText className="w-4 h-4" /> Procès-verbal de Séance
                </h4>

                {/* 1. Attendances list */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Contrôle des présences</label>
                  <div className="flex flex-wrap gap-1">
                    {reportAttendees.length === 0 ? (
                      <span className="text-xs text-gray-500 italic">Aucun membre enregistré</span>
                    ) : (
                      reportAttendees.map(att => (
                        <span key={att} className="px-2 py-0.5 bg-gray-850 bg-gray-850/50 border border-gray-700 rounded text-xs">
                          {att}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* 2. Decisions List */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">Décisions prises</label>
                  <ul className="list-disc pl-4 text-xs space-y-1.5 text-gray-300">
                    {reportDecisions.map((dec, i) => (
                      <li key={i} className="flex justify-between items-start gap-1">
                        <span>{dec}</span>
                        <button 
                          onClick={() => setReportDecisions(reportDecisions.filter((_, idx) => idx !== i))}
                          className="text-red-400 hover:text-red-600 text-[10px] flex-shrink-0 cursor-pointer print:hidden"
                        >
                          retirer
                        </button>
                      </li>
                    ))}
                  </ul>
                  {canModify && (
                    <div className="flex gap-1.5 mt-2 print:hidden">
                      <input 
                        type="text" 
                        value={newDecision}
                        onChange={(e) => setNewDecision(e.target.value)}
                        placeholder="Ex: Refonte du prélèvement"
                        className="flex-1 p-1 bg-gray-800 text-xs border border-gray-700 rounded text-white"
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDecision(); } }}
                      />
                      <button 
                        onClick={addDecision}
                        className="px-2 py-1 bg-[#22B8A7] text-white text-xs rounded hover:bg-[#1fa192]"
                      >
                        Ajouter
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Resolutions list */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">Résolutions Votées</label>
                  <ul className="list-decimal pl-4 text-xs space-y-1 text-gray-300">
                    {reportResolutions.map((res, i) => (
                      <li key={i} className="flex justify-between items-start gap-1">
                        <span>{res}</span>
                        <button 
                          onClick={() => setReportResolutions(reportResolutions.filter((_, idx) => idx !== i))}
                          className="text-red-400 hover:text-red-600 text-[10px] flex-shrink-0 cursor-pointer print:hidden"
                        >
                          retirer
                        </button>
                      </li>
                    ))}
                  </ul>
                  {canModify && (
                    <div className="flex gap-1.5 mt-2 print:hidden">
                      <input 
                        type="text" 
                        value={newResolution}
                        onChange={(e) => setNewResolution(e.target.value)}
                        placeholder="Ex: Vote budget musical à l'unanimité"
                        className="flex-1 p-1 bg-gray-800 text-xs border border-gray-700 rounded text-white"
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addResolution(); } }}
                      />
                      <button 
                        onClick={addResolution}
                        className="px-2 py-1 bg-[#22B8A7] text-white text-xs rounded hover:bg-[#1fa192]"
                      >
                        Voter
                      </button>
                    </div>
                  )}
                </div>

                {/* 4. Action plan table */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">Plan d'Action (Responsabilités)</label>
                  <div className="border border-gray-700 rounded overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="bg-gray-800 text-gray-400 border-b border-gray-700 font-semibold">
                          <th className="p-1">Tâche</th>
                          <th className="p-1">Pilote</th>
                          <th className="p-1">Échéance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {reportActions.map(act => (
                          <tr key={act.id} className="hover:bg-gray-850">
                            <td className="p-1 text-gray-200">{act.description}</td>
                            <td className="p-1 text-emerald-400">{act.responsible}</td>
                            <td className="p-1 text-gray-400">{new Date(act.dueDate).toLocaleDateString('fr-FR')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {canModify && (
                    <div className="space-y-1.5 p-2 bg-gray-850 border border-gray-700 rounded text-xs print:hidden">
                      <input 
                        type="text" 
                        value={actionDesc} 
                        onChange={(e) => setActionDesc(e.target.value)}
                        className="w-full p-1 bg-gray-800 border border-gray-700 rounded text-white text-[11px]" 
                        placeholder="Action à entreprendre" 
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="text" 
                          value={actionResp} 
                          onChange={(e) => setActionResp(e.target.value)}
                          className="p-1 bg-gray-800 border border-gray-700 rounded text-white text-[11px]" 
                          placeholder="Responsable" 
                        />
                        <input 
                          type="date" 
                          value={actionDue} 
                          onChange={(e) => setActionDue(e.target.value)}
                          className="p-1 bg-gray-800 border border-gray-700 rounded text-white text-[11px] text-gray-400" 
                        />
                      </div>
                      <button 
                        onClick={addActionItem}
                        className="w-full py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[11px] transition-colors"
                      >
                        Attribuer l'Action
                      </button>
                    </div>
                  )}
                </div>

                {/* ELECTRONIC SIGNATURE SECURED FLOW */}
                <div className="pt-2 border-t border-gray-700">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Signatures Électroniques</label>
                  <div className="grid grid-cols-2 gap-4">
                    
                    {/* Président Signature status */}
                    <div className="border border-gray-700 p-2.5 rounded text-center relative overflow-hidden bg-gray-900/30">
                      <p className="text-[10px] text-gray-400">Président du GIE</p>
                      {presSigned ? (
                        <div className="mt-2 text-emerald-400 text-xs font-bold font-mono">
                          <CheckSquare className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
                          <span>SIGNÉ ÉLECTRONIQUEMENT</span>
                        </div>
                      ) : (
                        <div className="mt-2 text-yellow-500 text-xs">A signer...</div>
                      )}
                      
                      {currentUserRole === 'Président' || currentUserRole === 'Super Administrateur' ? (
                        <button 
                          onClick={() => setPresSigned(!presSigned)}
                          className="mt-2.5 w-full py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded transition-colors"
                        >
                          {presSigned ? 'Se rétracter' : 'Apposer Signature'}
                        </button>
                      ) : null}
                    </div>

                    {/* Secrétaire G. Status */}
                    <div className="border border-gray-700 p-2.5 rounded text-center relative bg-gray-900/30">
                      <p className="text-[10px] text-gray-400">Secrétaire Général</p>
                      {sgSigned ? (
                        <div className="mt-2 text-emerald-400 text-xs font-bold font-mono">
                          <UserCheck className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
                          <span>SIGNÉ ÉLECTRONIQUEMENT</span>
                        </div>
                      ) : (
                        <div className="mt-2 text-yellow-500 text-xs">A signer...</div>
                      )}
                      
                      {currentUserRole === 'Secrétaire Général' || currentUserRole === 'Super Administrateur' ? (
                        <button 
                          onClick={() => setSgSigned(!sgSigned)}
                          className="mt-2.5 w-full py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded transition-colors"
                        >
                          {sgSigned ? 'Se rétracter' : 'Apposer Signature'}
                        </button>
                      ) : null}
                    </div>

                  </div>
                </div>

              </div>

              {/* ACTION FOOTER RAPPORT */}
              <div className="flex gap-2 pt-4 border-t border-gray-700 print:hidden justify-end">
                <button
                  onClick={handlePrintReport}
                  className="px-3 py-1.5 border border-gray-500 text-gray-300 hover:bg-gray-800 rounded font-medium text-xs flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Exporter PDF
                </button>
                {canModify && (
                  <button
                    onClick={handleSaveReport}
                    className="px-3.5 py-1.5 bg-[#22B8A7] text-white hover:bg-[#1ea091] rounded font-semibold text-xs flex items-center gap-1"
                  >
                    Enregistrer PV
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className={`p-6 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-center ${textClass}`}>
              <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-xs font-semibold">Aucun PV ouvert</p>
              <p className="text-[11px] text-gray-400 mt-1">Sélectionnez le bouton "PV / Rapport" sur une réunion à gauche pour rédiger le procès-verbal de séance.</p>
            </div>
          )}
        </div>

      </div>
      <PdfImportModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
        section="reunion" 
        members={members}
        onImportComplete={(importedMeeting: any) => {
          if (importedMeeting) {
            addMeeting(importedMeeting);
          }
        }} 
      />
    </div>
  );
}
