// Compléments du cours « Communauté numérique » pour la Licence 1 à Antsiranana :
// plurilinguisme en ligne, second cas d'étude local (groupe Facebook et WhatsApp de la promo) et un TP par séance.
// Rédigés pour DiCampus ; les exemples en malgache sont à relire par l'enseignant.

export type ExtraItem = { kind: string; title: string; minutes: number; content: string };

/** Où insérer : après l'élément portant ce titre, ou juste avant la synthèse. */
export type Extra = { after: string | "avant-synthese"; item: ExtraItem };

const CAS_LOCAL = `Le serveur Discord cinéphile reste notre cas principal. Pour rapprocher les notions de votre quotidien, nous suivrons aussi, dans chaque séance, un **second cas, inventé mais réaliste** : la communauté en ligne d'une promotion de Licence 1 à Antsiranana.

## Le groupe « L1 Lettres — Diego »

- **Un groupe Facebook** d'environ **400 membres** : les étudiants de L1 de la mention, quelques anciens étudiants de L2 et L3, et deux délégués qui en sont les administrateurs.
- **Un groupe WhatsApp des délégués** d'une vingtaine de membres, plus rapide et plus fermé, où circulent les informations urgentes avant d'être publiées sur Facebook.

On y trouve :

- des **annonces** : emplois du temps, salles, dates d'examen, résultats ;
- de l'**entraide** : cours partagés en PDF, photos du tableau, questions avant les partiels ;
- des **petites annonces** : chambre à louer près du campus, vente de livres d'occasion ;
- des **débats** : organisation d'un rattrapage, choix d'une date de sortie de promotion ;
- et beaucoup de **messages de vie de groupe** : félicitations, « mazotoa » avant les examens, mèmes.

Les messages y sont écrits **en malgache, en français, et souvent dans les deux à la fois**, avec quelques mots d'anglais.

| Discord cinéphile | Groupe « L1 Lettres — Diego » |
| Réunit des inconnus autour d'une passion | Réunit des camarades qui se croisent aussi en amphi |
| Plateforme de flux, salons thématiques | Réseau social (Facebook) et messagerie (WhatsApp) |
| Modérateurs bénévoles et bots | Délégués administrateurs, peu d'outils automatiques |
| Surtout en français | Malgache, français et anglais mêlés |

:::retenir
Comparer deux communautés très différentes aide à voir ce qui relève de la **plateforme**, de la **culture du groupe** et des **personnes**. Gardez ce groupe en tête : vous en analyserez un vrai, de votre choix, dans les TP.
:::`;

const PLURILINGUISME = `À Antsiranana comme dans beaucoup de pays, la communication en ligne est **plurilingue**. Dans un même groupe, et parfois dans une même phrase, on passe du malgache au français, avec quelques mots d'anglais. Ce n'est pas du « mauvais langage » : c'est une **compétence** que les linguistes étudient sérieusement.

## Le répertoire verbal

Le sociolinguiste **John Gumperz** appelle **répertoire verbal** l'ensemble des langues et des façons de parler qu'une personne maîtrise. Un étudiant de Diego peut avoir dans son répertoire le malgache de sa famille, le malgache officiel, le français de l'université, l'anglais des chansons et des jeux vidéo… Il choisit dans ce répertoire selon la situation.

:::def
**Plurilinguisme** : capacité d'une personne ou d'une communauté à utiliser plusieurs langues.

**Répertoire verbal** (Gumperz) : ensemble des ressources linguistiques dont dispose un locuteur.
:::

## Diglossie : qui parle quelle langue, quand ?

Le linguiste **Charles Ferguson** (1959) parle de **diglossie** quand deux langues ou variétés se partagent les usages dans une société : une variété dite « haute », réservée aux usages formels (administration, enseignement, écrit officiel), et une variété dite « basse », pour la famille et les amis.

Ce modèle est utile mais doit être **discuté** : à Madagascar, le malgache est aussi langue officielle, langue d'enseignement et langue des médias. Les frontières entre les usages sont plus souples que dans le modèle. En ligne, elles bougent encore plus.

## L'alternance codique

L'**alternance codique** (*code-switching*) est le passage d'une langue à une autre dans un même échange. On distingue souvent (Shana Poplack, 1980) :

| Type | Définition | Exemple |
| **Interphrastique** | Le changement se fait entre deux phrases. | « Misaotra betsaka. Je vous envoie le PDF ce soir. » |
| **Intraphrastique** | Le changement se fait à l'intérieur d'une phrase. | « Le cours est reporté, mazotoa amin'ny révision ! » |
| **Emprunt** | Un mot d'une autre langue est intégré à la phrase. | « Le live commence à 18 h. » |

En malgache, on parle familièrement de **« vary amin'anana »** (du riz mélangé aux brèdes) pour désigner ce mélange de malgache et de français.

### À quoi sert l'alternance ?

Gumperz montre que changer de langue **a un sens** dans l'interaction. On change de langue pour :

- **marquer une émotion** ou la proximité (« Misaotra betsaka 🙏 ») ;
- **citer** quelqu'un dans la langue où il a parlé ;
- **insister** ou répéter un message important ;
- **changer de destinataire** : s'adresser à une partie du groupe seulement ;
- **inclure ou exclure** : une langue que certains ne comprennent pas trace une frontière (comme les mèmes et le lexique vus plus haut) ;
- **nommer une chose** pour laquelle on a l'habitude d'un mot précis (« le partiel », « le PDF », « le live »).

:::cas
Dans le groupe « L1 Lettres — Diego », les annonces officielles des délégués sont souvent **en français** (« Le TD de linguistique est déplacé en salle 4 »), mais les réactions arrivent **en malgache ou en mélange** (« Misaotra ! », « Efa nahazo ny PDF ve ianareo ? »). La langue signale ici le registre : information officielle d'un côté, vie du groupe de l'autre.
:::

## Choisir sa langue selon le public

Le sociolinguiste **Allan Bell** (1984) parle d'**audience design** : nous adaptons notre façon de parler, et notre langue, au **public** que nous imaginons. En ligne, ce public est parfois flou : c'est le **context collapse** vu plus haut. Un même message peut être lu par des amis, par un enseignant, par des parents.

| Situation | Choix fréquent |
| Message au groupe WhatsApp des amis | Malgache, mélange, abréviations, émojis |
| Publication dans le groupe de la promo | Mélange, ou français pour les informations officielles |
| Courriel au responsable de mention | Français (ou malgache) soutenu, formules de politesse complètes |
| Commentaire public sous une page nationale | Choix stratégique : être compris du plus grand nombre |

## L'écriture numérique plurilingue

L'écrit en ligne invente ses propres formes : **abréviations** (« slt », « stp », « bcp »), lettres répétées (« ouiiii »), chiffres et symboles pour des sons, orthographes libres. En malgache aussi, chaque groupe crée ses abréviations et ses façons d'écrire. Le linguiste **David Crystal** y voit non pas un appauvrissement mais une **créativité** de la langue, à condition de savoir **changer de registre** quand la situation l'exige.

:::retenir
- Passer d'une langue à l'autre en ligne est une **compétence**, pas une faute.
- L'**alternance codique** a des fonctions : émotion, insistance, citation, inclusion ou exclusion.
- On choisit sa langue selon le **public imaginé** (audience design), ce qui est difficile quand les publics se mélangent.
- Savoir **changer de registre** (amis / université / administration) fait partie de la compétence de communication.
:::

:::question
Le choix de la langue peut **rassembler** (tout le monde se comprend) ou **exclure** (ceux qui ne maîtrisent pas une langue sont mis à l'écart). Le plurilinguisme d'une communauté numérique la rend-il plus démocratique, ou crée-t-il de nouvelles frontières ?
:::`;

const PLURI_MATCH = JSON.stringify({
  instruction: "Associez chaque notion à l'exemple ou à la définition qui lui correspond.",
  pairs: [
    { left: "Alternance intraphrastique", right: "« Le cours est reporté, mazotoa amin'ny révision ! »" },
    { left: "Alternance interphrastique", right: "« Misaotra betsaka. Je vous envoie le PDF ce soir. »" },
    { left: "Emprunt", right: "« Le live commence à 18 h. »" },
    { left: "Audience design", right: "Écrire en français au responsable de mention, en malgache aux amis" },
    { left: "Diglossie", right: "Deux langues qui se partagent les usages formels et familiers" },
    { left: "Répertoire verbal", right: "Toutes les langues et façons de parler qu'une personne maîtrise" },
  ],
});

const ETHIQUE = `:::def
**Règles d'éthique pour tous les TP.** Vous observez de vraies personnes : **ne recopiez jamais un nom, un numéro de téléphone ou une photo**. Remplacez les noms par « Membre A », « Membre B »… Si vous ajoutez des captures d'écran (par un lien), **floutez** les noms et les photos de profil. N'observez que des groupes dont vous êtes membre.
:::`;

const TP: string[] = [
  `**Objectif :** reconnaître une communauté numérique et la classer avec les outils de la séance.

${ETHIQUE}

## Consigne

Choisissez **trois groupes en ligne** dont vous faites partie (groupe Facebook, groupe WhatsApp, serveur Discord, page de club…). Au moins un doit être lié à vos études.

**1.** Pour chaque groupe, présentez en 3 ou 4 lignes : la plateforme, le nombre approximatif de membres, à quoi sert le groupe, la ou les langues utilisées.

**2.** Classez chaque groupe dans la typologie : communauté **d'intérêt**, **de pratique**, **d'action** ou **de circonstance**. Justifiez en une phrase. Un groupe peut relever de deux types : dites lesquels.

**3.** Vérifiez pour chaque groupe les **trois critères de Rheingold** : persistance des échanges, investissement affectif, espace symbolique de rencontre. Pour chaque critère, répondez oui ou non avec un exemple observé.

**4.** Conclusion (5 lignes) : lequel de vos trois groupes est le plus une « communauté » au sens de Rheingold ? Pourquoi ?

:::cas
Exemple de début de réponse : « Le groupe Facebook de ma promo (environ 400 membres) est d'abord une **communauté de circonstance** : il rassemble des étudiants qui vivent la même année de L1, et il disparaîtra sans doute à la fin du cycle. C'est aussi une **communauté de pratique** : on s'y aide à comprendre les cours. »
:::

:::retenir
**Rendu attendu :** un texte d'environ une page, rédigé dans la zone ci-dessous.

**Barème indicatif (/20) :** présentation des groupes (4) · typologie justifiée (6) · critères de Rheingold avec exemples (6) · conclusion argumentée (4).
:::`,

  `**Objectif :** observer l'alternance codique et le choix de la langue dans une vraie communauté en ligne.

${ETHIQUE}

## Consigne

**1. Relevé.** Dans un groupe dont vous êtes membre et où plusieurs langues se mêlent, relevez **six messages**. Recopiez-les en remplaçant les noms (« Membre A »…).

**2. Analyse.** Pour chaque message, indiquez dans un petit tableau :

- la ou les langues utilisées ;
- le type : alternance **interphrastique**, **intraphrastique** ou **emprunt** ;
- la **fonction probable** du changement de langue (émotion, insistance, citation, inclusion ou exclusion, mot technique…).

Vous pouvez présenter le tableau ainsi : « Message 1 | malgache + français | intraphrastique | émotion ».

**3. Écriture numérique.** Relevez **cinq abréviations ou façons d'écrire** propres à l'écrit en ligne (en malgache, en français ou en anglais) et expliquez leur sens.

**4. Réécriture.** Prenez l'annonce suivante et réécrivez-la pour **deux publics** :

> Le TD de demain est annulé, il est reporté à jeudi 8 h en salle 4.

- (a) un message au groupe WhatsApp de vos amis ;
- (b) un courriel au responsable de mention pour demander confirmation.

Expliquez en 4 ou 5 lignes vos choix de langue, de registre et de formules (pensez à l'**audience design** et à la **face**).

:::retenir
**Rendu attendu :** le tableau d'analyse, la liste des abréviations, les deux réécritures et leur explication.

**Barème indicatif (/20) :** relevé correct et anonymisé (3) · identification des types d'alternance (5) · fonctions justifiées (5) · abréviations (2) · réécritures adaptées et expliquées (5).
:::`,

  `**Objectif :** analyser une vraie discussion en ligne avec les outils de Habermas, Granovetter et Collins.

${ETHIQUE}

## Consigne

Choisissez une **discussion d'au moins dix commentaires** dans un groupe dont vous êtes membre (un débat sur une date de rattrapage, sur un film, sur une décision du groupe…).

**1. Présentation (5 lignes).** Le groupe, le sujet du débat, le nombre approximatif de participants, la ou les langues utilisées.

**2. L'espace public de Habermas.** Pour chacune des trois conditions, répondez oui, en partie ou non, avec un exemple tiré de la discussion :

- **accessibilité** : tout le monde peut-il participer ?
- **mise entre parenthèses du rang social** : les délégués, les anciens ou les « populaires » ont-ils plus de poids ?
- **capacité à problématiser** : des arguments sont-ils échangés, ou seulement des avis ?

**3. Stratégique ou communicationnel ?** Citez (anonymement) un message plutôt orienté vers le **succès** (convaincre, se faire remarquer) et un message orienté vers l'**entente**. Expliquez.

**4. Liens et rituels.** Repérez un exemple de **lien faible** utile (quelqu'un qu'on connaît peu apporte une information nouvelle) et un **rituel d'interaction** (formule d'accueil, félicitations, mème, émoji partagé).

**5. Conclusion.** Cette discussion était-elle une vraie délibération ? 5 lignes.

:::cas
Dans le groupe « L1 Lettres — Diego », un débat sur la date d'un rattrapage oppose ceux qui rentrent dans leur famille pendant les vacances et ceux qui préfèrent passer l'épreuve vite. Si les délégués tranchent sans lire les arguments, la condition de « mise entre parenthèses du rang social » n'est pas remplie.
:::

:::retenir
**Rendu attendu :** un texte structuré en cinq parties, environ une page et demie.

**Barème indicatif (/20) :** présentation (2) · grille de Habermas avec exemples (7) · stratégique / communicationnel (4) · liens et rituels (4) · conclusion (3).
:::`,

  `**Objectif :** concevoir la gouvernance d'une communauté et réagir à une crise.

## Consigne

Les délégués de la promotion vous demandent d'écrire la **charte du groupe Facebook « L1 Lettres — Diego »**.

**1. La charte.** Rédigez **six à huit règles** courtes et claires. Elles doivent obligatoirement traiter :

- **la ou les langues** du groupe (malgache, français, les deux ?) ;
- **les fausses informations** (annonces de report d'examen, rumeurs) ;
- **la vie privée** (photos, captures d'écran, numéros de téléphone) ;
- **les petites annonces** (où et comment les publier).

**2. Les sanctions graduées.** Inspirez-vous d'**Elinor Ostrom** : prévoyez au moins trois niveaux de sanction, du plus léger au plus lourd, et dites qui décide.

**3. Les outils.** Choisissez **deux outils** de la typologie de **Grimmelmann** (exclusion, tarification, organisation, normalisation) et expliquez comment vous les appliqueriez dans ce groupe.

**4. Gestion de crise.** Un samedi soir, une capture d'écran circule : « Examen de lundi reporté !! ». Elle est fausse, mais 80 personnes l'ont déjà partagée.

- (a) Est-ce de la **désinformation**, de la **mésinformation** ou de la **malinformation** ? Justifiez (les deux réponses peuvent se défendre selon l'intention : expliquez).
- (b) Rédigez le **message de l'administrateur** au groupe (80 mots maximum), dans la langue ou les langues de votre choix, en expliquant ce choix.

:::retenir
**Rendu attendu :** la charte, les sanctions, les deux outils expliqués, et la réponse à la crise.

**Barème indicatif (/20) :** charte claire et complète (6) · sanctions graduées (4) · outils de Grimmelmann (4) · analyse de la crise (2) · message de l'administrateur (4).
:::`,

  `**Objectif :** préparer et mesurer l'animation d'une communauté.

## Consigne

Vous devenez **community manager** du groupe « L1 Lettres — Diego » (ou de la page d'un club ou d'une association de l'université, si vous préférez).

**1. Ligne éditoriale (5 lignes).** Ton, sujets, langue(s), ce que les membres peuvent attendre du groupe.

**2. Calendrier d'une semaine.** Proposez **sept publications**, une par jour. Pour chacune, indiquez :

- le jour et le format (texte, sondage, photo, vidéo courte, live…) ;
- la ou les langues ;
- l'étape du modèle **RACE** visée (Reach, Act, Convert, Engage) et pourquoi.

**3. Métriques.** Choisissez **deux métriques actionnables** à suivre et **une métrique de vanité** à ne pas surveiller seule. Justifiez.

**4. Calcul.** Le groupe compte **400 membres**. Cette semaine, **60 membres** ont commenté ou réagi au moins une fois. Calculez le **taux d'engagement** et commentez ce résultat en 3 lignes.

**5. Santé de la communauté.** Une publication reçoit 150 commentaires en une soirée. Est-ce forcément une bonne nouvelle ? Quel indicateur vous aiderait à le savoir ?

:::retenir
**Rendu attendu :** la ligne éditoriale, le calendrier (un tableau ou une liste), les métriques, le calcul et la réponse à la question 5.

**Barème indicatif (/20) :** ligne éditoriale (3) · calendrier cohérent avec RACE (7) · choix des métriques (4) · calcul juste et commenté (3) · santé de la communauté (3).
:::`,
];

const CAS_SEANCES = [
  // Séance 2 : traité dans la partie 2.3.
  null,
  `:::cas
**Délibérer dans le groupe de la promo.** Quand les délégués demandent « Rattrapage mardi ou jeudi ? », le groupe devient un petit **espace public** : chacun peut répondre, mais tous ne pèsent pas autant. Les **liens forts** (les amis proches) se retrouvent dans le groupe WhatsApp ; le grand groupe Facebook fait circuler l'information grâce aux **liens faibles** (un étudiant d'une autre filière qui signale un changement de salle). Les félicitations après les résultats et les « mazotoa » avant les partiels sont des **rituels d'interaction** au sens de Collins : ils renforcent l'appartenance.
:::`,
  `:::cas
**Gouverner le groupe de la promo.** Les deux délégués administrateurs concentrent le pouvoir : ils acceptent les membres, suppriment les messages, épinglent les annonces. C'est une petite **oligarchie** au sens de Michels, souvent acceptée parce qu'elle est élue. Les crises typiques : une **fausse annonce** de report d'examen, une **arnaque** dans les petites annonces, une **capture d'écran** d'une conversation partagée hors du groupe. Sans règles écrites, chaque crise est gérée au cas par cas, ce qui fragilise la légitimité des administrateurs.
:::`,
  `:::cas
**Animer le groupe de la promo.** Un bon community manager pourrait y installer des rendez-vous : un sondage le lundi sur les révisions, une « question de la semaine » sur un cours, un rappel du calendrier le vendredi. Le nombre de membres (400) est une **métrique de vanité** : il augmente à chaque rentrée sans dire si le groupe est vivant. Le nombre de membres qui participent chaque semaine est une **métrique actionnable**.
:::`,
];

export const EXTRAS: Extra[][] = [
  [
    { after: "Introduction", item: { kind: "reading", title: "Second cas : le groupe de la promo à Diego", minutes: 5, content: CAS_LOCAL } },
    { after: "avant-synthese", item: { kind: "tp", title: "TP 1 — Ma carte des communautés", minutes: 60, content: TP[0] } },
  ],
  [
    { after: "Associer : marqueur et fonction pragmatique", item: { kind: "reading", title: "2.3 — Plurilinguisme en ligne : malgache, français, anglais", minutes: 10, content: PLURILINGUISME } },
    { after: "2.3 — Plurilinguisme en ligne : malgache, français, anglais", item: { kind: "match", title: "Associer : notion et exemple (plurilinguisme)", minutes: 6, content: PLURI_MATCH } },
    { after: "avant-synthese", item: { kind: "tp", title: "TP 2 — Observer l'alternance codique", minutes: 75, content: TP[1] } },
  ],
  [
    { after: "3.2 — Capital social et rituels d’interaction", item: { kind: "reading", title: "Cas local — Délibérer dans le groupe de la promo", minutes: 3, content: CAS_SEANCES[1]! } },
    { after: "avant-synthese", item: { kind: "tp", title: "TP 3 — Analyser une discussion en ligne", minutes: 75, content: TP[2] } },
  ],
  [
    { after: "4.2 — Pathologies et gestion des crises", item: { kind: "reading", title: "Cas local — Gouverner le groupe de la promo", minutes: 3, content: CAS_SEANCES[2]! } },
    { after: "avant-synthese", item: { kind: "tp", title: "TP 4 — Rédiger la charte du groupe", minutes: 75, content: TP[3] } },
  ],
  [
    { after: "5.2 — Métriques et analyse de la santé communautaire", item: { kind: "reading", title: "Cas local — Animer le groupe de la promo", minutes: 3, content: CAS_SEANCES[3]! } },
    { after: "avant-synthese", item: { kind: "tp", title: "TP 5 — Plan d'animation d'une semaine", minutes: 75, content: TP[4] } },
  ],
];
