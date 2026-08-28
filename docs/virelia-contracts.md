# Contrats Virelia Crédit

Le générateur produit deux documents A4 privés à partir des mêmes données de dossier.

## Version structurée

- fichier principal : `contract-draft.pdf` ;
- stockage : bucket privé `contracts` ;
- présentation : tableaux, blocs synthétiques et validation institutionnelle ;
- titre permanent : **PROJET DE CONTRAT DE PRÊT** ;
- mention permanente : **Soumis à validation du dossier**.

## Version narrative

- fichier : `contract-narrative.pdf` ;
- stockage : espace privé `application-documents` afin de réutiliser le mécanisme admin existant ;
- présentation : clauses et informations rédigées sous forme de texte ;
- mêmes données, mêmes frais de traitement et mêmes règles métier que la version structurée.

## Assets institutionnels

Le générateur utilise exclusivement les quatre assets fournis par le client :

- sceau / filigrane Virelia ;
- signature du Directeur Général ;
- signature du Vice-Président ;
- cachet APPROVED.

Les encodages intégrés dans `src/lib/contracts/official-assets.ts` proviennent des fichiers fournis. Seuls le recadrage, le redimensionnement et l’optimisation nécessaires au PDF ont été appliqués.

## Règles métier

- aucun taux, TAEG ou calendrier de remboursement n’est inventé ;
- les frais de traitement viennent de la configuration applicative ;
- le document ne constitue pas une acceptation automatique du prêt ;
- les coordonnées bancaires restent dans les documents privés et ne sont pas transmises à l’Assistant Virelia ni exposées dans `/suivi`.
