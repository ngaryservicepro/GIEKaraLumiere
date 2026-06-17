/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Employee } from '../types';

export function generateContractText(employee: Employee): string {
  return `CONTRAT DE TRAVAIL À DURÉE DÉTERMINÉE/INDÉTERMINÉE
===================================================

ENTRE LES SOUSSIGNÉS:
Le GIE KARA LUMIER, sis à Dakar, Sénégal, représenté par son Président, d'une part,
ET
M./Mme ${employee.fullName}, demeurant au numéro fourni, d'autre part.

IL A ÉTÉ CONVENU CE QUI SUIT:

Article 1: Fonctions et qualification
M./Mme ${employee.fullName} est engagé(e) en qualité de ${employee.position} sous le statut ${employee.contractType}.

Article 2: Date d'effet
Le présent contrat prendra effet le ${employee.startDate}.

Article 3: Rémunération
En contrepartie, le GIE Kara Lumier versera une rémunération brute mensuelle de ${employee.salary.toLocaleString()} FCFA.

Fait à Dakar, le ${new Date().toLocaleDateString('fr-FR')}
Signatures précédées de la mention "Lu et approuvé"

______________________                  ______________________
Le GIE Kara Lumier                      L'Employé(e)`;
}

export function generateMADText(employee: Employee): string {
  return `CONVENTION DE MISE À DISPOSITION (MAD)
=====================================

ENTRE LES SOUSSIGNÉS:
Le GIE KARA LUMIER, ci-après dénommé "Organisme d'Origine",
ET
La structure d'accueil affiliée au GIE, ci-après dénommée "Structure d'Accueil".

Il est convenu de la mise à disposition de l'employé(e) suivant(e):
Nom Complet : ${employee.fullName}
Poste Occupé : ${employee.position}

Conditions de MAD:
- Date de début : ${employee.startDate}
- Horaires et règles applicables conformément au règlement intérieur de la structure d'accueil.
- Prise en charge financière assurée selon la balance comptable partagée (réf. Plan Comptable GIE).

Fait en double exemplaire, le ${new Date().toLocaleDateString('fr-FR')}

______________________                  ______________________
Le GIE Kara Lumier                      La Structure d'Accueil`;
}

export function generateITCharter(): string {
  return `CHARTE D'UTILISATION DES SYSTÈMES D'INFORMATION
===================================================

GIE KARA LUMIER - PLATEFORME INTÉLLIGENTE

1. Préambule
La présente charte a pour objet de définir les règles d'usage et de sécurité de l'outil informatique et du réseau du GIE Kara Lumier.

2. Accès aux ressources
Les identifiants et mots de passe attribués aux administrateurs (Super Administrateur, Président, Trésorier, Secrétaire Général, Responsable Musicale) sont personnels et confidentiels.

3. Utilisation de la messagerie
L'usage des e-mails professionnels doit être conforme aux objectifs du GIE.

4. Responsabilité administrative
Tous les documents téléchargés (CNI, Balance comptable, Comptes de résultat) doivent être conservés sur la plateforme de manière sécurisée.

Fait pour servir et valoir ce que de droit.
Dakar, le ${new Date().toLocaleDateString('fr-FR')}`;
}

export function generateConfidentialityText(employee: Employee): string {
  return `ENGAGEMENT DE CONFIDENTIALITÉ
==============================

Je soussigné(e), M./Mme ${employee.fullName}, de nationalité sénégalaise, recruté(e) en tant que ${employee.position} au sein du GIE Kara Lumier.

M'engage à respecter une confidentialité absolue concernant :
1. Les données financières et comptables (Plan comptable du GIE, cotisations collectées).
2. Les informations relatives aux membres (CNI déposés, coordonnées personnelles).
3. Les décisions stratégiques du Bureau Exécutif prises lors des réunions.

En cas de manquement, je m'expose aux sanctions prévues par le code du travail et le règlement intérieur.

Date de signature : ${new Date().toLocaleDateString('fr-FR')}

______________________
Signature de l'Employé`;
}
