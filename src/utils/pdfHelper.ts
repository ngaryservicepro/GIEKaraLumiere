import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Member, Contribution, JournalEntry, Meeting, Club, League, CHART_OF_ACCOUNTS, Activity } from '../types';

// GIE Theme colors
const COLOR_PRIMARY: [number, number, number] = [23, 60, 74];    // #173C4A (Navy)
const COLOR_SECONDARY: [number, number, number] = [34, 184, 167]; // #22B8A7 (Teal)
const COLOR_ACCENT: [number, number, number] = [14, 37, 46];      // #0E252E (Dark Navy)

// DRAW OFFICIAL GIE HEADER BANNER
function drawHeader(doc: jsPDF, title: string) {
  // Top Banner background
  doc.setFillColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.rect(0, 0, 210, 38, 'F');

  // Secondary color horizontal bar
  doc.setFillColor(COLOR_SECONDARY[0], COLOR_SECONDARY[1], COLOR_SECONDARY[2]);
  doc.rect(0, 38, 210, 2, 'F');

  // Top Title Banner
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('GIE KARA LUMIÈRE', 15, 18);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(COLOR_SECONDARY[0], COLOR_SECONDARY[1], COLOR_SECONDARY[2]);
  doc.text('PLATEFORME DE GESTION ADMINISTRATIVE & COMPTABILITÉ DOUBLE-ENTRÉE', 15, 26);

  // Document Title inside banner
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, 195 - titleWidth, 22);

  // Date/Time Under Header
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const nowStr = new Date().toLocaleString('fr-FR', { 
    year: 'numeric', month: 'long', day: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  });
  doc.text(`Document officiel GIE - Généré le ${nowStr}`, 15, 46);
  
  // Custom unique auth hash to simulate secure tracking
  const authHash = 'GIE-KL-' + Math.floor(100000 + Math.random() * 900000) + '-' + new Date().getFullYear();
  doc.text(`N° Référence Authentique: ${authHash}`, 195 - doc.getTextWidth(`N° Référence Authentique: ${authHash}`), 46);

  // Divider
  doc.setDrawColor(220, 225, 230);
  doc.setLineWidth(0.5);
  doc.line(15, 49, 195, 49);
}

// DRAW STANDARD RUNNING FOOTER
function drawFooter(doc: jsPDF, pageNum: number, totalPages?: number) {
  doc.setDrawColor(220, 225, 230);
  doc.setLineWidth(0.5);
  doc.line(15, 282, 195, 282);

  doc.setTextColor(140, 140, 140);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.text('GIE 221 Lumière - Enregistrement légal SYSCOHADA - Secrétariat Général & Direction de la Trésorerie', 15, 288);
  const pageStr = `Page ${pageNum}${totalPages ? ' sur ' + totalPages : ''}`;
  doc.text(pageStr, 195 - doc.getTextWidth(pageStr), 288);
}

// ==========================================
// 1. DASHBOARD OVERVIEW EXPORTER
// ==========================================
export function exportDashboardToPdf(data: {
  memberCount: number;
  clubCount: number;
  leagueCount: number;
  meetingsPlanned: number;
  treasuryBalance: number;
  totalCollected: number;
  upcomingMeetings: Meeting[];
  activities: { name: string; budget: number; status: string }[];
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  drawHeader(doc, 'Tableau de Bord Analytique');

  // Primary introduction statement
  doc.setTextColor(23, 60, 74);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('SYNTHÈSE EXÉCUTIVE DES INDICATEURS DE CONDUITE', 15, 57);

  // Quick Description
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(80, 80, 80);
  doc.text('Ce rapport dresse la feuille de situation globale du Groupement d\'Intérêt Économique (GIE) 221 Lumière.', 15, 62);
  doc.text('Il consolide les effectifs, la balance trésorerie, les budgets alloués et le calendrier d\'administration.', 15, 66);

  // BENTO STATS METRICS GRID (Drawing manual key boxes)
  const statsY = 73;
  const colWidth = 56;
  const spacing = 4;

  const statsList = [
    { label: 'Trésorerie GIE', val: data.treasuryBalance.toLocaleString('fr-FR') + ' FCFA', color: [16, 185, 129] },
    { label: 'Cotisations Reçues', val: data.totalCollected.toLocaleString('fr-FR') + ' FCFA', color: [34, 184, 167] },
    { label: 'Membres Actifs', val: `${data.memberCount} Adhérents`, color: [23, 60, 74] },
    { label: 'Clubs Affiliés', val: `${data.clubCount} Enregistrés`, color: [23, 60, 74] },
    { label: 'Ligues Régionales', val: `${data.leagueCount} Zones`, color: [23, 60, 74] },
    { label: 'Réunions & PV', val: `${data.meetingsPlanned} Planifiées`, color: [23, 60, 74] }
  ];

  statsList.forEach((stat, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = 15 + col * (colWidth + spacing);
    const y = statsY + row * 23;

    // Outer card border & fill
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, colWidth, 19, 2, 2, 'FD');

    // Colored left indicator edge
    doc.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
    doc.rect(x, y + 0.5, 2.5, 18, 'F');

    // Label and values text
    doc.setTextColor(110, 110, 110);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(stat.label.toUpperCase(), x + 5, y + 5);

    doc.setTextColor(stat.color[0] === 16 ? 5 : stat.color[0], stat.color[1], stat.color[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(stat.val, x + 5, y + 13);
  });

  // Table 1: Plan d'Actions / Activités et budgets
  doc.setFontSize(12);
  doc.setTextColor(23, 60, 74);
  doc.text('PROGRAMME D\'ACTIVITÉS & ALLOCATIONS BUDGÉTAIRES', 15, 126);

  const activitiesRows = data.activities.map(a => [
    a.name,
    a.budget.toLocaleString('fr-FR') + ' FCFA',
    a.status === 'Terminée' ? 'Validée (Cloturée)' : a.status === 'En cours' ? 'Active' : 'Planifiée'
  ]);

  autoTable(doc, {
    startY: 130,
    head: [['Nom de l\'Activité', 'Budget Alloué', 'Statut Réalisation']],
    body: activitiesRows,
    theme: 'grid',
    headStyles: { fillColor: COLOR_PRIMARY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
    margin: { left: 15, right: 15 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 45, halign: 'right' },
      2: { cellWidth: 45, halign: 'center' }
    }
  });

  // Table 2: Prochaines réunions importantes
  const lastY = (doc as any).lastAutoTable.finalY || 180;
  doc.setFontSize(12);
  doc.setTextColor(23, 60, 74);
  doc.text('CALENDRIER IMMÉDIAT ET ORDRES DU JOUR DES RÉUNIONS', 15, lastY + 12);

  const meetingsRows = data.upcomingMeetings.slice(0, 4).map(m => [
    new Date(m.date).toLocaleDateString('fr-FR'),
    m.title,
    m.location,
    m.organizer,
    m.status
  ]);

  autoTable(doc, {
    startY: lastY + 16,
    head: [['Date rdv', 'Désignation de la Réunion', 'Lieu retenu', 'Convocateur', 'État']],
    body: meetingsRows.length > 0 ? meetingsRows : [['-', 'Aucun rendez-vous planifié à ce jour', '-', '-', '-']],
    theme: 'striped',
    headStyles: { fillColor: COLOR_SECONDARY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
    margin: { left: 15, right: 15 },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 35 },
      3: { cellWidth: 30 },
      4: { cellWidth: 20, halign: 'center' }
    }
  });

  // Final Seal and page numbers
  drawFooter(doc, 1, 1);
  doc.save('GIE_221_Lumiere_Rapport_Tableau_De_Bord.pdf');
}

// ==========================================
// 2. MEMBER DIRECTORY EXPORTER
// ==========================================
export function exportMembersToPdf(members: Member[], clubs: Club[], leagues: League[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  
  // Custom landscape header drawing
  doc.setFillColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.rect(0, 0, 297, 34, 'F');
  doc.setFillColor(COLOR_SECONDARY[0], COLOR_SECONDARY[1], COLOR_SECONDARY[2]);
  doc.rect(0, 34, 297, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('GIE 221 LUMIÈRE', 15, 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(COLOR_SECONDARY[0], COLOR_SECONDARY[1], COLOR_SECONDARY[2]);
  doc.text('REPERTOIRE ET REGISTRE UNIQUE DES MEMBRES ACTIFS', 15, 22);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('REGISTRE DES MEMBRES', 280 - doc.getTextWidth('REGISTRE DES MEMBRES'), 18);

  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Nombre total d\'adhérents listés : ${members.length} | Généré le ${new Date().toLocaleDateString('fr-FR')}`, 15, 42);

  // Header bottom border
  doc.setDrawColor(220, 225, 230);
  doc.line(15, 45, 282, 45);

  const tableBody = members.map(m => {
    const club = clubs.find(c => c.id === m.clubId)?.name || 'Standard';
    const league = leagues.find(l => l.id === m.leagueId)?.name || 'Dakar';
    return [
      m.id,
      m.fullName,
      m.cniNumber,
      m.phone,
      m.email,
      `${club} (${league})`,
      m.grade,
      m.function,
      m.status
    ];
  });

  autoTable(doc, {
    startY: 48,
    head: [['ID Matricule', 'Nom Complet', 'N° CNI', 'Téléphone', 'Email de Secours', 'Club & Ligue Affiliée', 'Grade', 'Fonctions', 'Statut']],
    body: tableBody,
    theme: 'grid',
    headStyles: { fillColor: COLOR_PRIMARY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: [60, 60, 60] },
    margin: { left: 15, right: 15 },
    columnStyles: {
      0: { cellWidth: 18, fontStyle: 'bold' },
      1: { cellWidth: 'auto', fontStyle: 'bold' },
      2: { cellWidth: 24, fontStyle: 'normal' },
      3: { cellWidth: 26 },
      4: { cellWidth: 35 },
      5: { cellWidth: 35 },
      6: { cellWidth: 22 },
      7: { cellWidth: 25 },
      8: { cellWidth: 17, halign: 'center' }
    }
  });

  // Custom landscape footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(220, 225, 230);
    doc.line(15, 195, 282, 195);
    
    doc.setTextColor(130, 130, 130);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.text('GIE 221 Lumière - Enregistrement d\'état civil et d\'inscription des personnels - Document Confidentiel S1', 15, 201);
    doc.text(`Page ${i} sur ${pageCount}`, 282 - doc.getTextWidth(`Page ${i} sur ${pageCount}`), 201);
  }

  doc.save('GIE_221_Lumiere_Registre_Des_Membres.pdf');
}

// ==========================================
// 3. CONTRIBUTIONS / ECOLES / RECOUVREMENTS EXPORTER
// ==========================================
export function exportContributionsToPdf(contributions: Contribution[], members: Member[], activities: Activity[]) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  drawHeader(doc, 'Bilan des Cotisations');

  // Summary Metrics Header
  const totalReceived = contributions.reduce((sum, c) => sum + c.amount, 0);
  
  doc.setTextColor(23, 60, 74);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('RAPPORT DE SYNTHÈSE DES RECOUVREMENTS', 15, 57);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(80, 80, 80);
  doc.text(`Montant Cumulé Recouvré à ce jour : `, 15, 62);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // green
  doc.text(`${totalReceived.toLocaleString('fr-FR')} FCFA`, 73, 62);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Ce rapport enregistre les versements validés de nos membres affiliés dans le système de facturation.`, 15, 67);

  // Table rows map
  const tableRows = contributions.map(c => {
    const memberName = members.find(m => m.id === c.memberId)?.fullName || 'Adhérent inconnu';
    const activityName = activities.find(a => a.id === c.activityId)?.name || 'Fonctionnement Standard';
    return [
      c.reference,
      memberName,
      activityName,
      c.paymentMethod,
      new Date(c.date).toLocaleDateString('fr-FR'),
      c.amount.toLocaleString('fr-FR') + ' FCFA'
    ];
  });

  autoTable(doc, {
    startY: 72,
    head: [['Référence Reçu', 'Membre Cotisant', 'Objet / Activité', 'Moyen Versement', 'Date Dépôt', 'Montant Cotisé']],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: COLOR_PRIMARY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    bodyStyles: { fontSize: 8, textColor: [60, 60, 60] },
    margin: { left: 15, right: 15 },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold' },
      1: { cellWidth: 'auto', fontStyle: 'bold' },
      2: { cellWidth: 42 },
      3: { cellWidth: 28 },
      4: { cellWidth: 22 },
      5: { cellWidth: 32, halign: 'right', fontStyle: 'bold', textColor: [23, 60, 74] }
    }
  });

  // Signature Block area at the bottom
  const lastY = (doc as any).lastAutoTable.finalY || 180;
  const signatureY = lastY + 15 < 230 ? lastY + 15 : 15;
  
  if (signatureY === 15) {
    doc.addPage();
    drawHeader(doc, 'Bilan des Cotisations (Signatures)');
  }

  doc.setTextColor(23, 60, 74);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('VISA DU TRÉSORIER GÉNÉRAL', 15, signatureY + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(110, 110, 110);
  doc.text('Fait foi d\'approbation authentique des montants actés.', 15, signatureY + 13);
  doc.setDrawColor(200, 200, 200);
  doc.rect(15, signatureY + 17, 60, 24);
  doc.text('[ Signature & Tampon GIE ]', 25, signatureY + 30);

  doc.setTextColor(23, 60, 74);
  doc.setFont('helvetica', 'bold');
  doc.text('DÉCHARGE DU PRÉSIDENT CLOTURANT', 125, signatureY + 8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110, 110, 110);
  doc.text('Contrôle de conformité de rapprochement bancaire exécuté.', 125, signatureY + 13);
  doc.rect(125, signatureY + 17, 60, 24);
  doc.text('[ Signature & Sceau GIE ]', 135, signatureY + 30);

  // Footer Setup
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(doc, p, totalPages);
  }

  doc.save('GIE_221_Lumiere_Bilan_Recouvrements.pdf');
}

// ==========================================
// 4. ACCOUNTING ENTIRE LEDGER/BALANCE SHEET EXPORTER
// ==========================================
export function exportAccountingToPdf(
  journalEntries: JournalEntry[], 
  subTab: 'journal' | 'grand-livre' | 'balance' | 'compte-resultat' | 'bilan'
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const docTitleMap = {
    'journal': 'Journal Général Des Écritures',
    'grand-livre': 'Grand Livre Des Comptes SYSCOHADA',
    'balance': 'Balance Générale de Vérification',
    'compte-resultat': 'Compte de Résultat Simplifié',
    'bilan': 'Bilan Patrimonial Synthétisé'
  };

  drawHeader(doc, docTitleMap[subTab]);

  doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`COMPTABILITÉ GIE KARA LUMIÈRE - EXERCICE COUVRANT S1 2026`, 15, 57);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text(`Ce relevé comptable est conçu en stricte harmonie avec l\'organisation comptable harmonisée de l\'OHADA (SYSCOHADA).`, 15, 61);

  // RENDER SECTIONS BASED ON SELECTED SUBTAB
  if (subTab === 'journal') {
    const tableRows = journalEntries.map(e => [
      new Date(e.date).toLocaleDateString('fr-FR'),
      e.ref,
      e.accountCode,
      CHART_OF_ACCOUNTS[e.accountCode] || 'Compte Divers',
      e.label,
      e.type === 'Débit' ? e.amount.toLocaleString('fr-FR') + ' F' : '-',
      e.type === 'Crédit' ? e.amount.toLocaleString('fr-FR') + ' F' : '-'
    ]);

    autoTable(doc, {
      startY: 66,
      head: [['Date', 'Pièce Réf', 'Compte', 'Intitulé SYSCOHADA', 'Déscription Libellé', 'Débit (FCFA)', 'Crédit (FCFA)']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: COLOR_PRIMARY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 7.5, textColor: [60, 60, 60] },
      margin: { left: 15, right: 15 },
      columnStyles: {
        0: { cellWidth: 18 },
        1: { cellWidth: 18 },
        2: { cellWidth: 15, fontStyle: 'bold', textColor: COLOR_SECONDARY },
        3: { cellWidth: 32 },
        4: { cellWidth: 'auto', fontStyle: 'bold' },
        5: { cellWidth: 26, halign: 'right', textColor: [16, 120, 80] },
        6: { cellWidth: 26, halign: 'right', textColor: [190, 100, 10] }
      }
    });

  } else if (subTab === 'grand-livre') {
    // Generate ledger breakdown
    const ledgerData: { [key: string]: { deb: number; cred: number; lines: JournalEntry[] } } = {};
    Object.keys(CHART_OF_ACCOUNTS).forEach(code => {
      ledgerData[code] = { deb: 0, cred: 0, lines: [] };
    });
    
    journalEntries.forEach(je => {
      if (ledgerData[je.accountCode]) {
        ledgerData[je.accountCode].lines.push(je);
        if (je.type === 'Débit') ledgerData[je.accountCode].deb += je.amount;
        else ledgerData[je.accountCode].cred += je.amount;
      }
    });

    let currentY = 66;
    let anyPrinted = false;

    Object.entries(CHART_OF_ACCOUNTS).forEach(([code, name]) => {
      const acc = ledgerData[code];
      if (acc && acc.lines.length > 0) {
        anyPrinted = true;
        // Keep inside bounds or force page break
        if (currentY > 230) {
          doc.addPage();
          drawHeader(doc, docTitleMap[subTab]);
          currentY = 55;
        }

        // Account Header box
        doc.setFillColor(241, 245, 249);
        doc.rect(15, currentY, 180, 7, 'F');
        doc.setDrawColor(203, 213, 225);
        doc.rect(15, currentY, 180, 7, 'D');

        doc.setTextColor(23, 60, 74);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(`COMPTE SYSCOHADA ${code} : ${name.toUpperCase()}`, 18, currentY + 4.5);

        const subLines = acc.lines.map(l => [
          new Date(l.date).toLocaleDateString('fr-FR'),
          l.ref,
          l.label,
          l.type === 'Débit' ? l.amount.toLocaleString('fr-FR') + ' F' : '-',
          l.type === 'Crédit' ? l.amount.toLocaleString('fr-FR') + ' F' : '-'
        ]);

        autoTable(doc, {
          startY: currentY + 8,
          head: [['Date', 'Réf', 'Libellé description', 'Débit', 'Crédit']],
          body: subLines,
          theme: 'striped',
          headStyles: { fillColor: COLOR_ACCENT, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
          bodyStyles: { fontSize: 7, textColor: [60, 60, 60] },
          margin: { left: 15, right: 15 },
          columnStyles: {
            0: { cellWidth: 18 },
            1: { cellWidth: 18 },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 26, halign: 'right' },
            4: { cellWidth: 26, halign: 'right' }
          }
        });

        const finalLedgerY = (doc as any).lastAutoTable.finalY || (currentY + 18);
        // Draw total balance for this ledger account
        doc.setFillColor(254, 243, 199);
        doc.rect(15, finalLedgerY + 1, 180, 5.5, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(180, 83, 9);
        const balVal = acc.deb - acc.cred;
        doc.text(`Totaux du Compte - Débit: ${acc.deb.toLocaleString()} F | Crédit: ${acc.cred.toLocaleString()} F | Solde: ${Math.abs(balVal).toLocaleString()} F (${balVal >= 0 ? 'DÉBITEUR' : 'CRÉDITEUR'})`, 18, finalLedgerY + 4.8);

        currentY = finalLedgerY + 11;
      }
    });

    if (!anyPrinted) {
      doc.setFontSize(10);
      doc.text("Aucun mouvement enregistré d'écriture pour l'instant dans le grand livre.", 15, currentY + 10);
    }

  } else if (subTab === 'balance') {
    // Generate Verification Trial Balance
    const balData: { [key: string]: { deb: number; cred: number } } = {};
    Object.keys(CHART_OF_ACCOUNTS).forEach(code => {
      balData[code] = { deb: 0, cred: 0 };
    });
    journalEntries.forEach(je => {
      if (balData[je.accountCode]) {
        if (je.type === 'Débit') balData[je.accountCode].deb += je.amount;
        else balData[je.accountCode].cred += je.amount;
      }
    });

    let debitsTotal = 0;
    let creditsTotal = 0;
    let debSoldeTotal = 0;
    let credSoldeTotal = 0;

    const rows = Object.entries(CHART_OF_ACCOUNTS).map(([code, name]) => {
      const stats = balData[code];
      const bal = stats.deb - stats.cred;
      debitsTotal += stats.deb;
      creditsTotal += stats.cred;

      let soldeDeb = 0;
      let soldeCred = 0;
      if (bal >= 0) {
        soldeDeb = bal;
        debSoldeTotal += bal;
      } else {
        soldeCred = Math.abs(bal);
        credSoldeTotal += Math.abs(bal);
      }

      return [
        code,
        name,
        stats.deb.toLocaleString() + ' F',
        stats.cred.toLocaleString() + ' F',
        soldeDeb > 0 ? soldeDeb.toLocaleString() + ' F' : '-',
        soldeCred > 0 ? soldeCred.toLocaleString() + ' F' : '-'
      ];
    });

    // Append Balance Total
    rows.push([
      'TOTAUX',
      'CONCORDANCE DOUBLE-ENTRÉE',
      debitsTotal.toLocaleString() + ' F',
      creditsTotal.toLocaleString() + ' F',
      debSoldeTotal.toLocaleString() + ' F',
      credSoldeTotal.toLocaleString() + ' F'
    ]);

    autoTable(doc, {
      startY: 66,
      head: [['Code', 'Libellé SYSCOHADA', 'Somme Débit', 'Somme Crédit', 'Solde Débiteur', 'Solde Créditeur']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: COLOR_PRIMARY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 7.5, textColor: [50, 50, 50] },
      margin: { left: 15, right: 15 },
      columnStyles: {
        0: { cellWidth: 16, fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 26, halign: 'right' },
        3: { cellWidth: 26, halign: 'right' },
        4: { cellWidth: 26, halign: 'right' },
        5: { cellWidth: 26, halign: 'right' }
      },
      didParseCell: function (data) {
        if (data.row.index === rows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [241, 245, 249];
          data.cell.styles.textColor = [15, 23, 42];
        }
      }
    });

  } else if (subTab === 'compte-resultat' || subTab === 'bilan') {
    // Generate specialized financial sheet totals
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text(`Compte abrégé des produits et charges du Groupement d'Intérêt Économique.`, 15, 66);

    const dataRows = journalEntries.map((je, index) => [
      String(index + 1).padStart(3, '0'),
      new Date(je.date).toLocaleDateString('fr-FR'),
      je.accountCode,
      CHART_OF_ACCOUNTS[je.accountCode],
      je.label,
      je.type,
      je.amount.toLocaleString('fr-FR') + ' FCFA'
    ]);

    autoTable(doc, {
      startY: 72,
      head: [['ID', 'Date', 'Compte', 'Rubrique OHADA', 'Désignation de l\'écriture', 'Type', 'Montant Écriture']],
      body: dataRows.length > 0 ? dataRows : [['-', '-', '-', 'Aucune écriture patrimoniale de clôture à ce jour', '-', '-', '-']],
      theme: 'grid',
      headStyles: { fillColor: COLOR_PRIMARY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 15, right: 15 }
    });
  }

  // Draw signature and pages
  const lastY = (doc as any).lastAutoTable.finalY || 180;
  const signatureY = lastY + 15 < 230 ? lastY + 15 : 15;
  if (signatureY === 15) {
    doc.addPage();
    drawHeader(doc, docTitleMap[subTab]);
  }

  doc.setTextColor(23, 60, 74);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('CERTIFIÉ CONFORME SYSCOHADA', 15, signatureY + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 110);
  doc.text(`GIE 221 Lumière, Commission de Contrôle de Gestion.`, 15, signatureY + 12);
  doc.rect(15, signatureY + 16, 60, 20);
  doc.text('[ Signature & Tampon Orgue ]', 20, signatureY + 27);

  // Footer Setup
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(doc, p, totalPages);
  }

  doc.save(`GIE_221_Lumiere_Comptabilite_${subTab}.pdf`);
}

// ==========================================
// 5. MEETINGS & SIGNED PV EXPORTER
// ==========================================
export function exportMeetingsToPdf(meetings: Meeting[], selectedMeeting?: Meeting | null) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Mode 1: Individual Signed Meeting report (PV - Procès-Verbal Officiel)
  if (selectedMeeting) {
    drawHeader(doc, `PROCES-VERBAL : ${selectedMeeting.id}`);

    const m = selectedMeeting;
    const reportVal = m.report || { attendees: [], decisions: [], resolutions: [], actions: [], presidentSigned: false, sgSigned: false };

    doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(m.title.toUpperCase(), 15, 58);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(80, 80, 80);
    doc.text(`Date & Horaires : Le ${new Date(m.date).toLocaleDateString('fr-FR')} à ${m.time}`, 15, 64);
    doc.text(`Lieu Réunion : ${m.location}`, 15, 69);
    doc.text(`Organisé sous l'égide de : ${m.organizer}`, 15, 74);

    doc.setDrawColor(220, 225, 230);
    doc.line(15, 78, 195, 78);

    // Section: Ordre du Jour
    doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('ORDRE DU JOUR ADOPTÉ', 15, 84);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(60, 60, 60);
    
    // Split text with margins
    const agendaLines = doc.splitTextToSize(m.agenda, 180);
    doc.text(agendaLines, 15, 89);
    const agendaHeight = agendaLines.length * 4.8;

    let yOffset = 89 + agendaHeight + 8;

    // Section: Participants présents
    if (yOffset > 240) { doc.addPage(); drawHeader(doc, `PROCES-VERBAL : ${selectedMeeting.id}`); yOffset = 55; }
    doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('EMARGEMENTS & LISTE DES PARTICIPANTS', 15, yOffset);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(60, 60, 60);

    const attendeesStr = reportVal.attendees && reportVal.attendees.length > 0
      ? reportVal.attendees.join(', ')
      : "Aucun participant inscrit nominativement (séance ouverte)";
    const attLines = doc.splitTextToSize(attendeesStr, 180);
    doc.text(attLines, 15, yOffset + 5);
    yOffset += 5 + (attLines.length * 4.8) + 8;

    // Section: Decisions prises
    if (yOffset > 240) { doc.addPage(); drawHeader(doc, `PROCES-VERBAL : ${selectedMeeting.id}`); yOffset = 55; }
    doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('DÉCISIONS PRISES EN SÉANCE', 15, yOffset);
    
    if (!reportVal.decisions || reportVal.decisions.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.text('Aucune décision contractuelle votée durant cette assemblée.', 15, yOffset + 5);
      yOffset += 11;
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      reportVal.decisions.forEach((dec, idx) => {
        if (yOffset > 260) { doc.addPage(); drawHeader(doc, `PROCES-VERBAL : ${selectedMeeting.id}`); yOffset = 55; }
        doc.text(`VOTE-${idx + 1}: ${dec}`, 18, yOffset + 5 + (idx * 5));
      });
      yOffset += 5 + (reportVal.decisions.length * 5) + 8;
    }

    // Section: Resolutions adoptées
    if (yOffset > 240) { doc.addPage(); drawHeader(doc, `PROCES-VERBAL : ${selectedMeeting.id}`); yOffset = 55; }
    doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('RÉSOLUTIONS INTRODUITES', 15, yOffset);

    if (!reportVal.resolutions || reportVal.resolutions.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.text('Aucune résolution exceptionnelle notée à s\'appliquer.', 15, yOffset + 5);
      yOffset += 11;
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      reportVal.resolutions.forEach((res, idx) => {
        if (yOffset > 260) { doc.addPage(); drawHeader(doc, `PROCES-VERBAL : ${selectedMeeting.id}`); yOffset = 55; }
        doc.text(`- ${res}`, 18, yOffset + 5 + (idx * 5));
      });
      yOffset += 5 + (reportVal.resolutions.length * 5) + 8;
    }

    // Actions items table if exists
    if (reportVal.actions && reportVal.actions.length > 0) {
      if (yOffset > 220) { doc.addPage(); drawHeader(doc, `PROCES-VERBAL : ${selectedMeeting.id}`); yOffset = 55; }
      doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('PLAN INITIAL DES ACTIONS ASSIGNÉES', 15, yOffset);

      const actionRows = reportVal.actions.map(act => [
        act.description,
        act.responsible,
        act.dueDate ? new Date(act.dueDate).toLocaleDateString('fr-FR') : '-'
      ]);

      autoTable(doc, {
        startY: yOffset + 4,
        head: [['Intitulé Action', 'Responsable Affecté', 'Date Butoir']],
        body: actionRows,
        theme: 'grid',
        headStyles: { fillColor: COLOR_PRIMARY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 7.5, textColor: [60, 60, 60] },
        margin: { left: 15, right: 15 }
      });

      yOffset = (doc as any).lastAutoTable.finalY + 10;
    }

    // Signatures blocks
    if (yOffset > 230) { doc.addPage(); drawHeader(doc, `PROCES-VERBAL : ${selectedMeeting.id}`); yOffset = 55; }
    
    doc.setFillColor(248, 250, 252);
    doc.rect(15, yOffset, 180, 28, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, yOffset, 180, 28, 'D');

    doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`Visa du Secrétaire Général (SG)`, 20, yOffset + 6);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.text(reportVal.sgSigned ? '✓ PV SIGNÉ NUMÉRIQUEMENT PAR LE SG' : '× EN ATTENTE DE VISA DU SECRÉTARIAT', 20, yOffset + 12);
    doc.text(reportVal.signDate ? `Date: ${reportVal.signDate}` : '', 20, yOffset + 17);

    doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`Visa de Décharge du Président`, 120, yOffset + 6);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.text(reportVal.presidentSigned ? '✓ PV APPROUVÉ ET SIGNÉ PAR LE PRÉSIDENT' : '× EN ATTENTE DE CONCORDANCE PRÉSIDENTIELLE', 120, yOffset + 12);
    doc.text(reportVal.signDate ? `Date: ${reportVal.signDate}` : '', 120, yOffset + 17);

  } else {
    // Mode 2: General assembly scheduled calendar listing
    drawHeader(doc, 'Registre des Réunions du GIE');

    doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('CALENDRIER GÉNÉRAL DES ASSEMBLÉES ET REUNIONS PRIVÉES', 15, 57);

    const rows = meetings.map(m => [
      m.id,
      new Date(m.date).toLocaleDateString('fr-FR') + ' ' + m.time,
      m.title,
      m.location,
      m.organizer,
      m.status,
      m.report ? 'Validé (PV signé)' : 'Projet (PV manquant)'
    ]);

    autoTable(doc, {
      startY: 62,
      head: [['ID', 'Date & Heure', 'Objet Assemblée / Réunion', 'Lieu retenu', 'Animateur', 'Statut', 'État PV']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: COLOR_PRIMARY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
      bodyStyles: { fontSize: 8, textColor: [60, 60, 60] },
      margin: { left: 15, right: 15 }
    });
  }

  // Footer Setup
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(doc, p, totalPages);
  }

  const nameOut = selectedMeeting ? `GIE_PV_${selectedMeeting.id}.pdf` : 'GIE_221_Lumiere_Registre_Reunions.pdf';
  doc.save(nameOut);
}
