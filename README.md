# DiCampus (DiegoCampus)

Plateforme de cours et de formations en ligne pour le monde universitaire d'Antsiranana (Diego-Suarez, Madagascar), en français.

Publics : étudiants (licence et master), futurs bacheliers, formation continue et enseignants.

Fonctions : catalogue par domaine, filtres par niveau (Prépa bac, Licence 1 à 3, Master, Formation continue) et par établissement, recherche, pages de cours, lecteur (vidéo, lecture, quiz), suivi de progression, objectif hebdomadaire, avis, cours enregistrés, parcours et certificats vérifiables.

Stack : Next.js 16 (App Router, server actions), React 19, Tailwind CSS 4, SQLite intégré à Node (`node:sqlite`). Aucune dépendance native.

## Démarrer

Prérequis : Node.js 24.22+ ou 26+.

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000. La base `data/dicampus.db` est créée et remplie automatiquement au premier lancement. Pour recharger le catalogue après une modification de `lib/seed-data.ts`, arrêtez le serveur et supprimez `data/dicampus.db*`.

## Mise en ligne (Hostinger, déploiement depuis GitHub)

- Application Node.js, version **22.13 ou plus récente** (24 recommandé).
- Commande de build : `npm run build` ; commande de démarrage : `npm start`.
- Variables d'environnement :
  - `DICAMPUS_ADMIN_EMAILS` : e-mail(s) des administrateurs, et uniquement les vôtres ;
  - `DICAMPUS_DB_PATH` : chemin de la base **hors du dossier déployé** (par exemple `/home/<utilisateur>/dicampus-data/dicampus.db`), sinon un redéploiement peut effacer comptes, notes et copies.
- La base est vide au premier lancement : créez votre compte depuis `/inscription` avec l'e-mail administrateur.

## Comptes de test locaux

| Rôle | E-mail | Mot de passe |
|---|---|---|
| Administrateur (et enseignant) | `testeur@dicampus.test` | `dicampus-test-1` |
| Élève | `eleve@dicampus.test` | `dicampus-eleve-1` |

Ils disparaissent si vous supprimez la base ; recréez-les depuis `/inscription`. L'administrateur est désigné dans `.env.local` (voir ci-dessous).

## Administrateurs et enseignants

Copiez `.env.example` en `.env.local` et indiquez les e-mails des administrateurs :

```
DICAMPUS_ADMIN_EMAILS=admin@exemple.mg,autre@exemple.mg
```

Redémarrez le serveur après modification. Un administrateur a tous les droits enseignant, voit tous les cours et valide les demandes sur `/admin/enseignants`.

La page `/admin` (lien « Administration » dans le menu) regroupe :

- tous les cours, avec publication / dépublication en un clic ;
- l'ouverture et la fermeture de chaque examen : fermé, il ne peut pas être commencé (une copie déjà commencée peut être terminée) ; l'enseignant du cours dispose du même bouton sur sa page de notes ;
- toutes les copies d'examen, avec recherche par élève, e-mail ou cours, et « Autoriser à repasser » (supprime la copie et sa note).

Pour devenir enseignant, un utilisateur ouvre `/enseignant` et envoie une demande (établissement et présentation). Une fois acceptée, il peut :

- créer un cours (brouillon invisible jusqu'à publication) ;
- organiser modules et éléments : lecture, vidéo (lien YouTube ou fichier MP4/WebM en https), quiz, glossaire en cartes, association, questions de réflexion, travail pratique (TP) ;
- prévisualiser le cours comme un élève, publier et dépublier ;
- corriger les TP sur `/enseignant/cours/<id>/tp` : note sur 20 et commentaire ;
- consulter les notes d'examen, les exporter en CSV et autoriser un élève à repasser l'examen.

### Travaux pratiques

Un TP est une consigne (même mise en forme qu'une lecture) suivie d'une zone de rendu. L'élève écrit son travail (brouillon gardé dans son navigateur), ajoute s'il le souhaite un lien (Google Docs, Drive), et peut modifier son rendu jusqu'à la correction. Le TP compte comme terminé dès qu'il est rendu. L'enseignant note sur 20 avec un commentaire ; l'élève voit alors sa note sous la consigne. Pas d'envoi de fichier directement sur la plateforme : les fichiers passent par un lien.

## Cours « Communauté numérique » et examen final

Le cours de la Faculté de Lettres (Licence 1, séances 1 à 5) est importé automatiquement au démarrage, y compris dans une base existante. Le texte est converti depuis le site du cours (`lib/courses/communaute-numerique.json`) ; quiz d'entraînement, pistes de réponse et examen sont dans `lib/courses/communaute-numerique.ts`. Les compléments écrits pour DiCampus sont dans `lib/courses/communaute-numerique-local.ts` : partie 2.3 sur le plurilinguisme (malgache, français, anglais), second cas d'étude local (le groupe Facebook et WhatsApp d'une promotion de L1 à Diego) et un TP par séance. Les exemples en malgache sont à relire. Les séances 6 et la conclusion, marquées « Bientôt » sur le site d'origine, ne sont pas importées.

Après une modification de ces fichiers, augmentez `CONTENT_VERSION` : au redémarrage, la base existante est mise à jour (éléments retrouvés par titre, progression conservée). Attention, cette mise à jour remplace le contenu des éléments du cours modifiés depuis l'éditeur enseignant ; les éléments ajoutés par l'enseignant sont conservés.

Examen final (`/cours/communaute-numerique/examen`) :

- 20 questions, notées sur 20, une seule tentative ; ordre des questions et des réponses mélangé pour chaque élève ;
- 45 minutes, comptées par le serveur ;
- chaque changement d'onglet (ou réduction de la fenêtre) retire 10 minutes et affiche un avertissement ; au 3e, l'examen s'arrête et la copie est notée avec les réponses déjà données ;
- réponses enregistrées automatiquement ; à la fin du temps, la copie est rendue d'office ;
- les bonnes réponses ne sont jamais envoyées au navigateur ;
- notes visibles par l'enseignant dans `/enseignant/cours/<id>/examen` (et export CSV).

Limites : la détection repose sur l'événement « page masquée » du navigateur. Elle repère les changements d'onglet et la réduction de la fenêtre, mais pas un second écran ni un autre appareil.

## Contenu à valider avant toute mise en ligne

- **Établissements** (`lib/seed-data.ts`, `partners`) : École Supérieure Polytechnique, Faculté des Sciences, Faculté des Lettres et Sciences Humaines, ENSET, IUT. Les noms et descriptions doivent être vérifiés et approuvés par l'Université d'Antsiranana.
- **Équipes pédagogiques** : les cours sont attribués à des équipes génériques (« Équipe Génie électrique »…). Remplacez-les par les vrais enseignants avec leur accord.
- **Cours** : les 13 cours sont des exemples de démonstration à remplacer ou compléter par les contenus des enseignants.

## Design

Style clair inspiré du modèle BrightMind : fond blanc, violet `#7a4dfc`, noir d'encre `#03010d`, accents saumon et menthe, police Schibsted Grotesk, titres en gras avec un mot mis en avant en violet, boutons en pilule, cartes arrondies et formes décoratives. Couleurs et composants de base dans `app/globals.css`.

| Fichier | Rôle |
|---|---|
| `components/site-chrome.tsx` | En-tête avec navigation visible, menu compte et menu mobile |
| `components/header.tsx` | Pied de page et bandeau d'appel violet |
| `components/home.tsx` | Défilement des domaines sur l'accueil |
| `components/motion.tsx` | Apparitions en fondu montant (`Reveal`, `StackedLines`…) |
| `lib/spring.ts` | Ressort `{ tension, friction }` utilisé par `Reveal` |

## Organisation

| Dossier | Contenu |
|---|---|
| `app/` | Pages (`/explorer`, `/recherche`, `/cours/[slug]`, `/cours/[slug]/apprendre/[itemId]`, `/parcours/[slug]`, `/mon-apprentissage`, `/enregistres`, `/certificats`) |
| `app/actions.ts` | Server actions : comptes, inscription aux cours, progression, avis, objectif |
| `lib/db.ts` | Schéma SQLite et remplissage initial |
| `lib/seed-data.ts` | Catalogue de démonstration |
| `lib/queries.ts` | Requêtes, progression et certificats |

## Limites connues

- Les vidéos sont des emplacements avec transcription : aucun fichier vidéo n'est fourni.
- Les quiz d'entraînement sont corrigés dans le navigateur (l'examen final, lui, est corrigé par le serveur).
- Pas de photos : vignettes et visuels sont générés (dégradés, motifs). Ajoutez vos photos du campus et de Diego dans `public/`.
