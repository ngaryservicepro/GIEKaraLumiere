/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Employee } from '../types';

export function generateContractText(employee: Employee): string {
  if (employee.contractType === 'Bénévole') {
    return `CONVENTION DE BÉNÉVOLAT ET D'ENGAGEMENT MANDATAIRE
===================================================

ENTRE LES SOUSSIGNÉS:
Le GIE KARA LUMIÈRE, sis à Dakar, Sénégal, représenté par son Président, d'une part,
ET
M./Mme ${employee.fullName}, ci-après dénommé(e) "Le/La Bénévole", d'autre part.

IL A ÉTÉ CONVENU CE QUI SUIT:

Article 1: Objet de l'engagement
Le/la Bénévole s'engage à apporter son concours à titre gracieux et volontaire aux activités d'intérêt commun du GIE Kara Lumière, en qualité de : ${employee.position}.

Article 2: Absence de relation salariale
Le présent engagement est de nature strictement bénévole. Il ne confère aucun statut de salarié, n'est régi par aucun contrat de travail et exclut tout lien de subordination juridique. Le/la Bénévole reste libre de mettre fin à sa participation à tout moment.

Article 3: Indemnités de défraiement et de transport
Dans le cadre de ses missions, le GIE Kara Lumière pourra allouer au Bénévole une indemnité forfaitaire de transport et subsistance mensuelle d'un montant maximum de ${employee.salary.toLocaleString()} FCFA pour couvrir les frais engagés pour le compte du groupement.

Fait à Dakar, le ${new Date().toLocaleDateString('fr-FR')}
Signatures précédées de la mention "Lu et approuvé"

______________________                  ______________________
Le GIE Kara Lumière                      Le/La Bénévole`;
  }

  if (employee.contractType === 'Stagiaire') {
    return `CONVENTION DE STAGE PRATIQUE NOMINATIVE
===================================================

ENTRE LES SOUSSIGNÉS:
Le GIE KARA LUMIÈRE, sis à Dakar, Sénégal, représenté par son Président, d'une part,
ET
M./Mme ${employee.fullName}, ci-après dénommé(e) "Le/La Stagiaire", d'autre part.

IL A ÉTÉ CONVENU CE QUI SUIT:

Article 1: Objet du stage d'apprentissage
Le/la Stagiaire est accueilli au sein du GIE Kara Lumière pour effectuer un stage d'immersion pratique en qualité de : ${employee.position}.

Article 2: Statut de l'apprenant et durée
Ce stage vise exclusivement le développement des compétences du stagiaire et ne remplace aucun rôle salarié permanent. Le stage débutera le ${employee.startDate}.

Article 3: Gratification académique / d'encouragement
Le présent stage n'étant pas un contrat de travail, il ne donne pas lieu à un salaire. Toutefois, à titre de gratification d'encouragement, le GIE versera au Stagiaire une somme mensuelle de ${employee.salary.toLocaleString()} FCFA.

Fait à Dakar, le ${new Date().toLocaleDateString('fr-FR')}
Signatures précédées de la mention "Lu et de droit"

______________________                  ______________________
Le GIE Kara Lumière                      Le/La Stagiaire`;
  }

  // Prestateur, Consultant or standard Service contract
  return `CONTRAT DE PRESTATION DE SERVICE ET D'HONORAIRES
===================================================

ENTRE LES SOUSSIGNÉS:
Le GIE KARA LUMIÈRE, sis à Dakar, Sénégal, représenté par son Président, d'une part,
ET
M./Mme ${employee.fullName}, Consultant(e) indépendant / Prestataire de services, d'autre part.

IL A ÉTÉ CONVENU CE QUI SUIT:

Article 1: Nature des prestations artistiques ou administratives
Le Prestataire s'engage à exécuter en toute indépendance et autonomie les prestations d'expertise suivantes : ${employee.position}.

Article 2: Indépendance et cadre contractuel
Le présent contrat est soumis aux règles de l'OHADA sur le droit des obligations commerciales. Il exclut explicitement toute qualification de contrat de travail, le Prestataire exerçant sa mission sans aucun lien de subordination hiérarchique.

Article 3: Honoraires forfaitaires de mission
Le GIE Kara Lumière versera au Prestataire des honoraires mensuels forfaitaires de ${employee.salary.toLocaleString()} FCFA, exigibles à terme échu sur présentation de facture acquittée ou note d'honoraires.

Fait à Dakar, le ${new Date().toLocaleDateString('fr-FR')}
Signatures précédées de la mention "Contrat Lu et Accepté"

______________________                  ______________________
Le GIE Kara Lumière                      Le Prestataire`;
}

export function generateMADText(employee: Employee): string {
  return `CONVENTION DE MISE À DISPOSITION (MAD) DE PERSONNEL PARTENAIRE
==================================================================

ENTRE LES SOUSSIGNÉS:
Le GIE KARA LUMIÈRE, ci-après dénommé "Organisme Mandataire",
ET
La structure d'accueil affiliée ou un club membre du GIE, ci-après "La Structure Bénéficiaire".

Il est convenu de la mise à disposition pour mission d'intérêt commun du collaborateur suivant:
Nom Complet des intervenants : ${employee.fullName}
Nature de la mission : ${employee.position}

Conditions de mise à disposition :
- Date de prise d'effet : ${employee.startDate}
- Autonomie : L'intervenant réalise sa mission en accord avec le Bureau Exécutif du GIE.
- Prise en charge financière : Le GIE Kara Lumière compense les coûts opérationnels ou frais de déplacement d'un montant de ${employee.salary.toLocaleString()} FCFA par mois, réglés via le Journal du GIE.

Fait en double exemplaire originaux, le ${new Date().toLocaleDateString('fr-FR')}

______________________                  ______________________
Le GIE Kara Lumière                      La Structure Bénéficiaire`;
}

export function generateITCharter(): string {
  return `CHARTE D'UTILISATION DES SYSTÈMES ET SECURITÉ D'INFORMATION
==================================================================

GIE KARA LUMIÈRE - PORTAIL DE GESTION ADMINISTRATIVE

1. Préambule
La présente charte a pour objet de définir les règles de bonne conduite d'usage et de sécurité de l'outil informatique et du réseau d'administration du GIE Kara Lumière.

2. Accès réservé aux rôles autorisés
Les accès et identifiants attribués de manière nominative aux administrateurs (Super Administrateur, Président, Trésorier, Secrétaire Général, Responsables) sont personnels, confidentiels, et ne peuvent être divulgués à aucun tiers externe.

3. Protection des fichiers archivistiques
Tout document sensible stocké sur ce portail (CNIs numérisés, balance comptable, registres d'activités des clubs) doit être manipulé avec intégrité absolue et ne doit faire l'objet d'aucune exportation non-autorisée.

4. Responsabilité opérationnelle
Les intervenants, prestataires et encadrants des clubs s'engagent à respecter cette charte lors de leur participation aux événements organisés.

Fait pour servir et valoir ce que de droit.
Dakar, le ${new Date().toLocaleDateString('fr-FR')}`;
}

export function generateConfidentialityText(employee: Employee): string {
  return `ENGAGEMENT SOLENNEL DE CONFIDENTIALITÉ ET D'ÉTHIQUE
===========================================================

Je soussigné(e), M./Mme ${employee.fullName}, de nationalité sénégalaise, intervenant en tant que ${employee.position} au sein du GIE Kara Lumière.

M'engage par la présente à respecter une confidentialité absolue concernant :
1. Les données financières et d'écritures (Balance SYSCOHADA, comptes de résultat du GIE, cotisations).
2. Les pièces d'identité et dossiers d'état civil des membres et athlètes des clubs.
3. Les délibérations internes et décisions adoptées lors des assemblées générales et réunions de Bureau.

En cas de manquement à cet engagement d'éthique, je reconnais que ma révocation, suspension ou l'annulation de mes mandats au sein du GIE pourront être prononcées sans délai par le Bureau Exécutif, sans préjudice de poursuites civiles ordinaires.

Date de signature : ${new Date().toLocaleDateString('fr-FR')}

______________________
Signature du Collaborateur`;
}
