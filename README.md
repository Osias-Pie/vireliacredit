# Remix of Global Funding Bridge

Tu es un développeur Full Stack Senior, un UX/UI Designer Senior et un Architecte logiciel. Construis une application web professionnelle de qualité production.

## Technologies

Utilise exclusivement :

- React

- TypeScript

- Vite

- Tailwind CSS

- shadcn/ui

- Framer Motion

- React Hook Form

- Zod

- React Router

- Supabase

- Lucide Icons

Le code doit être propre, modulaire, fortement typé, réutilisable et responsive.

Le projet doit être prêt à être déployé.

----------------------------------------------------

## Description du projet

Créer un site vitrine professionnel pour un organisme international de financement.

Le site doit inspirer immédiatement confiance.

Il ne s'agit PAS d'une banque ni d'une application de prêt.

Il s'agit d'une plateforme présentant différents programmes de financement et permettant aux visiteurs d'envoyer une demande.

Le suivi du dossier se fera ensuite uniquement par e-mail.

Le site doit être plus moderne, plus élégant et plus professionnel que https://subv-mfi.com tout en conservant le même principe de fonctionnement.

Ne jamais copier le design du site de référence.

Créer une identité graphique originale.

----------------------------------------------------

## Palette graphique

Couleur principale :

Bleu #0B4F8C

Couleur secondaire :

Bleu clair

Couleur d'accent :

Doré

Fond :

Blanc

Créer un design premium avec beaucoup d'espaces, de belles cartes, des ombres discrètes, des animations fluides et une excellente lisibilité.

----------------------------------------------------

## Langues

Prévoir un système multilingue.

Langues :

- Français

- Anglais

- Espagnol

- Allemand

- Portugais

- Italien

- Néerlandais

Créer une architecture facilement extensible.

----------------------------------------------------

## Devises

Prévoir une architecture multi-devise.

- €

- $

- FCFA

- £

- CHF

- CAD

----------------------------------------------------

## Pages publiques

Créer :

Accueil

À propos

Programmes

Conditions d'éligibilité

Processus

Témoignages

FAQ

Contact

Faire une demande

Politique de confidentialité

Conditions d'utilisation

Mentions légales

----------------------------------------------------

## Header

Créer un Header fixe.

Logo

Menu

Sélecteur de langue

Sélecteur de devise

Bouton principal :

Faire une demande

----------------------------------------------------

## Page d'accueil

Créer une Hero Section moderne.

Grand titre.

Sous-titre.

Deux boutons :

Faire une demande

Découvrir les programmes

Ajouter une illustration premium.

Créer ensuite :

Présentation

Programmes

Pourquoi nous choisir

Processus

Statistiques animées

Témoignages

FAQ

Grand appel à l'action

Footer complet.

----------------------------------------------------

## Programmes

Afficher les programmes sous forme de cartes.

Chaque carte possède :

Image

Titre

Description

Montant maximum

Bouton

----------------------------------------------------

## Processus

Afficher :

Choix du programme

↓

Formulaire

↓

Analyse

↓

Contact par e-mail

Créer une belle timeline.

----------------------------------------------------

## Témoignages

Créer un carousel moderne.

----------------------------------------------------

## FAQ

Créer un accordéon.

----------------------------------------------------

## Contact

Créer une page avec :

Coordonnées

Carte Google

Formulaire

----------------------------------------------------

## Formulaire de demande

Créer un formulaire moderne.

Informations personnelles :

Nom

Prénom

Sexe

Date de naissance

Pays

Ville

Adresse

Téléphone

WhatsApp

Email

Informations professionnelles :

Profession

Entreprise

Revenus

Projet :

Programme choisi

Montant demandé

Devise

Description

Objectifs

Case d'acceptation.

Bouton Envoyer.

----------------------------------------------------

## Après l'envoi

Lorsque le formulaire est validé :

Valider les données avec Zod.

Enregistrer la demande dans Supabase.

Créer automatiquement un numéro de dossier :

SUB-2026-000001

Créer automatiquement le statut :

Nouvelle demande

Afficher une page de confirmation.

----------------------------------------------------

## Administration

Créer une administration sécurisée.

Connexion avec Supabase Auth.

Menu :

Dashboard

Demandes

Programmes

Témoignages

FAQ

Messages

Paramètres

Déconnexion

----------------------------------------------------

## Dashboard

Afficher :

Total des demandes

Demandes aujourd'hui

Demandes cette semaine

Demandes ce mois

Dernières demandes

Graphiques modernes.

----------------------------------------------------

## Gestion des demandes

Créer un tableau.

Colonnes :

Numéro

Nom

Pays

Programme

Montant

Date

Statut

Actions

Filtres

Recherche

Pagination

----------------------------------------------------

## Détail d'une demande

Afficher toutes les informations.

Permettre :

Ajouter une note interne

Changer le statut

Archiver

Supprimer

----------------------------------------------------

## Gestion des contenus

Créer un CRUD simple pour :

Programmes

FAQ

Témoignages

Messages de contact

----------------------------------------------------

## Notifications

À chaque nouvelle demande :

1. Enregistrer dans Supabase.

2. Envoyer automatiquement un e-mail professionnel au demandeur.

3. Envoyer automatiquement un e-mail professionnel à l'administrateur.

4. Envoyer une notification Push à l'administrateur sur PC et téléphone via OneSignal (ou une architecture compatible).

Le clic sur la notification doit ouvrir directement l'administration.

----------------------------------------------------

## Temps réel

Utiliser Supabase Realtime.

Les nouvelles demandes doivent apparaître automatiquement dans le Dashboard sans recharger la page.

----------------------------------------------------

## SEO

Optimiser toutes les pages.

Créer :

Meta Title

Meta Description

Open Graph

Twitter Cards

robots.txt

sitemap.xml

Schema.org

----------------------------------------------------

## Performance

Optimiser le projet pour obtenir un excellent score Lighthouse.

Utiliser :

Lazy Loading

Code Splitting

Images optimisées

----------------------------------------------------

## Responsive

Le site doit être parfait sur :

Mobile

Tablette

Laptop

Desktop

----------------------------------------------------

## Qualité

Le résultat final doit ressembler à une plateforme développée par une agence professionnelle.

Le code doit être propre, évolutif et facilement maintenable.

Créer directement tous les composants nécessaires, la structure Supabase, les routes, les layouts, les pages, les tables de base de données et les interfaces afin d'obtenir une première version complète et fonctionnelle.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://vireliacredit.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d028d8a0-554f-4249-b92f-bb00b5acd46c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
