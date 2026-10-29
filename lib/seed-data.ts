// Catalogue de démonstration de DiCampus (DiegoCampus), plateforme du monde universitaire d'Antsiranana.
// Les noms d'établissements sont à faire valider par l'Université d'Antsiranana.
// Les cours sont attribués à des équipes pédagogiques génériques, à remplacer par les vrais enseignants.

export type SeedModule = { title: string; summary: string; points: [string, string, string] };

export const LEVELS = ["Prépa bac", "Licence 1", "Licence 2", "Licence 3", "Master", "Formation continue"] as const;

/** Niveaux proposés à l'inscription. */
export const STUDY_LEVELS = ["Terminale (futur bachelier)", "Licence 1", "Licence 2", "Licence 3", "Master 1", "Master 2", "Doctorat", "Formation continue", "Enseignant"] as const;

export type SeedCourse = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  domain: string;
  partner: string;
  instructor: string;
  level: (typeof LEVELS)[number];
  hours: number;
  hue: number;
  outcomes: string[];
  skills: string[];
  modules: SeedModule[];
};

export const domains = [
  { slug: "sciences", name: "Sciences fondamentales", description: "Mathématiques, informatique et sciences du vivant.", icon: "∑" },
  { slug: "ingenierie", name: "Ingénierie et énergie", description: "Électrotechnique, énergies renouvelables et technologie.", icon: "⚡" },
  { slug: "lettres-langues", name: "Lettres et langues", description: "Expression écrite, langues et communication.", icon: "Aa" },
  { slug: "sciences-humaines", name: "Sciences humaines et éducation", description: "Recherche, pédagogie et sciences de l'éducation.", icon: "◐" },
  { slug: "gestion", name: "Gestion et entrepreneuriat", description: "Comptabilité, gestion et création d'entreprise.", icon: "↗" },
  { slug: "reussite", name: "Réussir à l'université", description: "Méthodes de travail et préparation au baccalauréat.", icon: "✦" },
];

export const partners = [
  { slug: "esp", short: "ESP", name: "École Supérieure Polytechnique", kind: "École", description: "Formation d'ingénieurs et de techniciens supérieurs de l'Université d'Antsiranana." },
  { slug: "faculte-sciences", short: "FS", name: "Faculté des Sciences", kind: "Faculté", description: "Mathématiques, informatique, physique, chimie et sciences de la vie." },
  { slug: "flsh", short: "FLSH", name: "Faculté des Lettres et Sciences Humaines", kind: "Faculté", description: "Lettres, langues, histoire, géographie et sciences humaines." },
  { slug: "enset", short: "ENSET", name: "École Normale Supérieure pour l'Enseignement Technique", kind: "École", description: "Formation des enseignants de l'enseignement technique et professionnel." },
  { slug: "iut", short: "IUT", name: "Institut Universitaire de Technologie", kind: "Institut", description: "Formations courtes et professionnalisantes, notamment en gestion." },
  { slug: "dicampus", short: "DC", name: "DiegoCampus", kind: "Plateforme", description: "Cours transversaux conçus par l'équipe de la plateforme." },
];

export const instructors = [
  { name: "Équipe Mathématiques-Informatique", title: "Enseignants-chercheurs de la Faculté des Sciences", partner: "faculte-sciences" },
  { name: "Équipe Sciences de la vie", title: "Enseignants-chercheurs de la Faculté des Sciences", partner: "faculte-sciences" },
  { name: "Équipe Génie électrique", title: "Enseignants de l'École Supérieure Polytechnique", partner: "esp" },
  { name: "Équipe Lettres et langues", title: "Enseignants de la FLSH", partner: "flsh" },
  { name: "Équipe Sciences de l'éducation", title: "Formateurs de l'ENSET", partner: "enset" },
  { name: "Équipe Gestion", title: "Enseignants de l'IUT", partner: "iut" },
  { name: "Équipe DiegoCampus", title: "Équipe pédagogique de la plateforme", partner: "dicampus" },
];

export const courses: SeedCourse[] = [
  {
    slug: "analyse-mathematique-l1",
    title: "Analyse mathématique",
    subtitle: "Suites, limites et dérivées pour bien démarrer la licence.",
    description: "Ce cours reprend les bases de l'analyse vues en première année de licence scientifique : suites numériques, limites, continuité et dérivation. Chaque module se termine par un quiz pour vérifier vos acquis avant les travaux dirigés.",
    domain: "sciences", partner: "faculte-sciences", instructor: "Équipe Mathématiques-Informatique",
    level: "Licence 1", hours: 40, hue: 215,
    outcomes: ["Étudier la convergence d'une suite", "Calculer des limites de fonctions", "Dériver une fonction et étudier ses variations"],
    skills: ["Analyse", "Suites", "Dérivation", "Raisonnement mathématique"],
    modules: [
      { title: "Suites numériques", summary: "Suites arithmétiques, géométriques et convergence.", points: ["Une suite arithmétique ajoute la même raison à chaque terme", "Une suite géométrique multiplie chaque terme par la même raison", "Une suite croissante et majorée est convergente"] },
      { title: "Limites et continuité", summary: "Comportement d'une fonction au voisinage d'un point.", points: ["Une fonction est continue en a si sa limite en a vaut f(a)", "Le théorème des valeurs intermédiaires s'applique aux fonctions continues sur un intervalle", "Une forme indéterminée demande de transformer l'expression avant de conclure"] },
      { title: "Dérivation", summary: "Nombre dérivé, tangente et variations.", points: ["Le nombre dérivé est la pente de la tangente à la courbe", "Une fonction de dérivée positive sur un intervalle y est croissante", "La dérivée d'un produit vaut u'v + uv'"] },
    ],
  },
  {
    slug: "algorithmique-python",
    title: "Algorithmique et programmation en Python",
    subtitle: "Écrire ses premiers programmes, pas à pas.",
    description: "Une introduction à l'algorithmique et à la programmation pour les étudiants de licence : variables, conditions, boucles, fonctions et structures de données, avec Python.",
    domain: "sciences", partner: "faculte-sciences", instructor: "Équipe Mathématiques-Informatique",
    level: "Licence 1", hours: 30, hue: 200,
    outcomes: ["Écrire et exécuter un script Python", "Traduire un algorithme en programme", "Structurer un programme avec des fonctions"],
    skills: ["Python", "Algorithmique", "Résolution de problèmes"],
    modules: [
      { title: "Premiers pas", summary: "Installer Python et lancer un premier script.", points: ["Un script Python s'exécute ligne par ligne, de haut en bas", "La fonction print affiche une valeur dans la console", "Une variable associe un nom à une valeur"] },
      { title: "Conditions et boucles", summary: "Faire des choix et répéter des actions.", points: ["if, elif et else exécutent du code selon une condition", "Une boucle for parcourt chaque élément d'une séquence", "Une boucle while se répète tant que sa condition reste vraie"] },
      { title: "Fonctions et structures de données", summary: "Organiser son code et ses données.", points: ["Une fonction se déclare avec le mot-clé def", "Une liste conserve des éléments dans un ordre précis", "Un dictionnaire associe des clés à des valeurs"] },
    ],
  },
  {
    slug: "ecosystemes-marins-cotiers",
    title: "Écosystèmes marins et côtiers",
    subtitle: "Récifs, mangroves et gestion durable du littoral.",
    description: "Le nord de Madagascar offre un terrain d'étude exceptionnel, de la baie de Diego-Suarez aux côtes environnantes. Ce cours présente le fonctionnement des récifs coralliens et des mangroves, ainsi que les outils de leur gestion durable.",
    domain: "sciences", partner: "faculte-sciences", instructor: "Équipe Sciences de la vie",
    level: "Licence 3", hours: 24, hue: 180,
    outcomes: ["Expliquer le fonctionnement d'un récif corallien", "Décrire le rôle écologique des mangroves", "Proposer des mesures de gestion durable d'un littoral"],
    skills: ["Biologie marine", "Écologie", "Gestion des ressources"],
    modules: [
      { title: "Les récifs coralliens", summary: "Des animaux bâtisseurs en symbiose.", points: ["Les coraux vivent en symbiose avec des algues microscopiques appelées zooxanthelles", "Une hausse durable de la température de l'eau peut provoquer le blanchissement des coraux", "Les récifs abritent une très grande diversité d'espèces marines"] },
      { title: "Les mangroves", summary: "Des forêts entre terre et mer.", points: ["Les palétuviers sont des arbres adaptés à l'eau salée", "Les mangroves protègent les côtes contre l'érosion", "Les mangroves servent de nurserie à de nombreux poissons et crustacés"] },
      { title: "Gérer durablement le littoral", summary: "Protéger tout en faisant vivre les communautés.", points: ["Une aire marine protégée encadre les usages d'une zone maritime", "La surpêche réduit les stocks de poissons plus vite qu'ils ne se renouvellent", "Le suivi scientifique régulier permet de mesurer l'efficacité des mesures"] },
    ],
  },
  {
    slug: "electrotechnique-fondamentale",
    title: "Électrotechnique fondamentale",
    subtitle: "Circuits, courant alternatif et machines électriques.",
    description: "Les bases indispensables aux futurs ingénieurs et techniciens : analyse des circuits en courant continu, régime sinusoïdal, transformateurs et machines électriques.",
    domain: "ingenierie", partner: "esp", instructor: "Équipe Génie électrique",
    level: "Licence 2", hours: 36, hue: 225,
    outcomes: ["Analyser un circuit avec les lois de Kirchhoff", "Calculer puissances et valeurs efficaces en alternatif", "Expliquer le fonctionnement d'un transformateur"],
    skills: ["Électrotechnique", "Circuits électriques", "Machines électriques"],
    modules: [
      { title: "Circuits en courant continu", summary: "Loi d'Ohm et lois de Kirchhoff.", points: ["La loi d'Ohm s'écrit U = R × I", "La somme des courants entrant dans un nœud égale la somme des courants sortants", "La puissance électrique reçue par un dipôle vaut P = U × I"] },
      { title: "Le courant alternatif", summary: "Régime sinusoïdal et valeurs efficaces.", points: ["La valeur efficace d'une tension sinusoïdale vaut sa valeur maximale divisée par racine de 2", "La fréquence d'un signal périodique s'exprime en hertz", "Le facteur de puissance relie puissance active et puissance apparente"] },
      { title: "Transformateurs et machines", summary: "Convertir et utiliser l'énergie électrique.", points: ["Un transformateur modifie l'amplitude d'une tension alternative", "Le rapport de transformation dépend du nombre de spires des deux enroulements", "Un moteur électrique convertit l'énergie électrique en énergie mécanique"] },
    ],
  },
  {
    slug: "energies-renouvelables",
    title: "Énergies renouvelables : solaire et éolien",
    subtitle: "Dimensionner une installation adaptée au nord de Madagascar.",
    description: "Ensoleillement et vent font du nord de Madagascar un territoire propice aux énergies renouvelables. Cette formation présente le solaire photovoltaïque, l'éolien et le dimensionnement d'une petite installation autonome.",
    domain: "ingenierie", partner: "esp", instructor: "Équipe Génie électrique",
    level: "Formation continue", hours: 20, hue: 45,
    outcomes: ["Expliquer le principe du photovoltaïque", "Estimer la production d'une éolienne", "Dimensionner une installation solaire autonome"],
    skills: ["Énergie solaire", "Éolien", "Dimensionnement", "Transition énergétique"],
    modules: [
      { title: "L'énergie solaire photovoltaïque", summary: "De la lumière à l'électricité.", points: ["Un panneau photovoltaïque convertit la lumière du soleil en électricité", "La puissance crête d'un panneau s'exprime en watts-crête", "L'orientation et l'inclinaison des panneaux influencent leur production"] },
      { title: "L'énergie éolienne", summary: "Capter l'énergie du vent.", points: ["La puissance récupérable par une éolienne croît avec le cube de la vitesse du vent", "Une éolienne doit être placée à l'écart des obstacles qui perturbent le vent", "Le choix du site s'appuie sur des mesures de vent sur une longue période"] },
      { title: "Stockage et dimensionnement", summary: "Concevoir une installation autonome.", points: ["Le dimensionnement commence par l'estimation des besoins journaliers en wattheures", "Les batteries stockent l'énergie pour les périodes sans production", "Un onduleur convertit le courant continu en courant alternatif"] },
    ],
  },
  {
    slug: "expression-ecrite-argumentation",
    title: "Expression écrite et argumentation",
    subtitle: "Rédiger des écrits universitaires clairs et convaincants.",
    description: "Dissertations, synthèses, rapports : ce cours vous donne les méthodes pour construire un plan, argumenter avec rigueur et rédiger dans un français précis.",
    domain: "lettres-langues", partner: "flsh", instructor: "Équipe Lettres et langues",
    level: "Licence 1", hours: 18, hue: 330,
    outcomes: ["Construire le plan d'une dissertation", "Développer un argument étayé par des exemples", "Relire et corriger efficacement son texte"],
    skills: ["Rédaction", "Argumentation", "Français écrit"],
    modules: [
      { title: "Construire un plan", summary: "Analyser le sujet et organiser ses idées.", points: ["L'analyse des mots-clés du sujet précède toute recherche d'idées", "La problématique est la question à laquelle le devoir répond", "Un plan en deux ou trois parties équilibrées facilite la lecture"] },
      { title: "Argumenter", summary: "Thèse, arguments et exemples.", points: ["Un argument est une idée qui soutient la thèse défendue", "Un exemple précis rend un argument plus convaincant", "Les connecteurs logiques rendent visibles les liens entre les idées"] },
      { title: "Rédiger et relire", summary: "Introduction, conclusion et relecture.", points: ["L'introduction amène le sujet, pose la problématique et annonce le plan", "La conclusion répond à la problématique et peut ouvrir sur une autre question", "Une relecture ciblée vérifie séparément l'orthographe, la syntaxe et la ponctuation"] },
    ],
  },
  {
    slug: "anglais-professionnel",
    title: "Anglais pour la communication professionnelle",
    subtitle: "E-mails, réunions et présentations en anglais.",
    description: "Gagnez en aisance pour écrire des e-mails, participer à des réunions et présenter vos projets en anglais, dans un contexte professionnel ou académique.",
    domain: "lettres-langues", partner: "flsh", instructor: "Équipe Lettres et langues",
    level: "Formation continue", hours: 20, hue: 5,
    outcomes: ["Rédiger des e-mails professionnels clairs", "Participer activement à une réunion", "Présenter un projet en anglais"],
    skills: ["Anglais", "Communication écrite", "Présentation orale"],
    modules: [
      { title: "Les e-mails professionnels", summary: "Structure et formules.", points: ["Un e-mail professionnel annonce son objet dès la première phrase", "« Best regards » est une formule de clôture courante", "Un objet précis augmente les chances de réponse"] },
      { title: "Réunions et appels", summary: "Prendre la parole et reformuler.", points: ["« Could you clarify… » permet de demander une précision poliment", "Reformuler montre que vous avez compris", "Résumer les décisions en fin de réunion évite les malentendus"] },
      { title: "Présenter ses idées", summary: "Structurer une présentation.", points: ["Annoncer le plan aide l'auditoire à suivre", "Des phrases courtes sont plus faciles à comprendre à l'oral", "Une conclusion rappelle le message principal"] },
    ],
  },
  {
    slug: "methodes-recherche-shs",
    title: "Méthodes de recherche en sciences humaines",
    subtitle: "De la problématique au mémoire de master.",
    description: "Ce cours accompagne les étudiants de master dans leur travail de recherche : formuler une problématique, choisir et mener une enquête de terrain, puis rédiger un mémoire rigoureux.",
    domain: "sciences-humaines", partner: "flsh", instructor: "Équipe Lettres et langues",
    level: "Master", hours: 24, hue: 270,
    outcomes: ["Formuler une problématique de recherche", "Concevoir un questionnaire et un guide d'entretien", "Structurer et rédiger un mémoire"],
    skills: ["Méthodologie de recherche", "Enquête de terrain", "Rédaction scientifique"],
    modules: [
      { title: "Construire son objet de recherche", summary: "Question de départ, état de l'art, problématique.", points: ["L'état de l'art recense ce qui a déjà été écrit sur le sujet", "Une problématique précise rend la recherche réalisable", "Les hypothèses sont des réponses provisoires à vérifier sur le terrain"] },
      { title: "Mener une enquête", summary: "Questionnaires, entretiens et observation.", points: ["Le questionnaire permet d'interroger un grand nombre de personnes", "L'entretien semi-directif suit un guide tout en laissant parler l'enquêté", "Le consentement éclairé des participants est indispensable"] },
      { title: "Rédiger le mémoire", summary: "Structure, citations et bibliographie.", points: ["Toute idée empruntée doit être citée avec sa source", "La bibliographie suit une norme de présentation unique", "Les résultats sont présentés avant d'être interprétés"] },
    ],
  },
  {
    slug: "pedagogie-numerique",
    title: "Concevoir un cours en ligne",
    subtitle: "Pédagogie et numérique pour les enseignants.",
    description: "Une formation destinée aux enseignants qui souhaitent publier leurs cours sur DiCampus : définir des objectifs pédagogiques, scénariser un module et évaluer les apprentissages à distance.",
    domain: "sciences-humaines", partner: "enset", instructor: "Équipe Sciences de l'éducation",
    level: "Formation continue", hours: 12, hue: 250,
    outcomes: ["Rédiger des objectifs pédagogiques précis", "Scénariser un module en ligne", "Concevoir des évaluations formatives"],
    skills: ["Ingénierie pédagogique", "Enseignement à distance", "Évaluation"],
    modules: [
      { title: "Définir des objectifs", summary: "Ce que l'étudiant saura faire à la fin.", points: ["Un objectif pédagogique commence par un verbe d'action observable", "Un bon objectif précise ce que l'apprenant sera capable de faire", "Les objectifs guident le choix des contenus et des évaluations"] },
      { title: "Scénariser un module", summary: "Alterner contenus et activités.", points: ["Des séquences courtes maintiennent mieux l'attention en ligne", "Alterner vidéo, lecture et exercice favorise l'engagement", "Chaque activité doit servir un objectif pédagogique"] },
      { title: "Évaluer à distance", summary: "Évaluation formative et retours.", points: ["L'évaluation formative aide l'étudiant à progresser pendant le cours", "Un retour rapide sur une erreur facilite la correction", "Un quiz court en fin de module vérifie les acquis essentiels"] },
    ],
  },
  {
    slug: "comptabilite-generale",
    title: "Comptabilité générale",
    subtitle: "Bilan, compte de résultat et écritures comptables.",
    description: "Les fondamentaux de la comptabilité pour les étudiants en gestion et les porteurs de projet : lire un bilan, comprendre le compte de résultat et passer les écritures courantes.",
    domain: "gestion", partner: "iut", instructor: "Équipe Gestion",
    level: "Licence 1", hours: 30, hue: 150,
    outcomes: ["Lire et construire un bilan simple", "Calculer un résultat à partir des charges et des produits", "Enregistrer des opérations en partie double"],
    skills: ["Comptabilité", "Gestion financière", "Analyse des comptes"],
    modules: [
      { title: "Le bilan", summary: "Ce que l'entreprise possède et ce qu'elle doit.", points: ["Le bilan présente le patrimoine de l'entreprise à une date donnée", "Le total de l'actif est toujours égal au total du passif", "Les capitaux propres figurent au passif du bilan"] },
      { title: "Le compte de résultat", summary: "Charges, produits et résultat.", points: ["Le compte de résultat récapitule l'activité d'un exercice", "Le résultat est égal aux produits moins les charges", "Un résultat positif est un bénéfice, un résultat négatif une perte"] },
      { title: "Les écritures comptables", summary: "Le principe de la partie double.", points: ["Chaque opération est enregistrée au débit d'un compte et au crédit d'un autre", "Le total des débits est égal au total des crédits", "Le journal enregistre les opérations dans l'ordre chronologique"] },
    ],
  },
  {
    slug: "entrepreneuriat",
    title: "Créer son entreprise",
    subtitle: "De l'idée au premier client.",
    description: "Une formation pratique pour les étudiants, diplômés et professionnels qui veulent lancer une activité : valider une idée, construire un modèle économique et préparer un plan d'affaires.",
    domain: "gestion", partner: "iut", instructor: "Équipe Gestion",
    level: "Formation continue", hours: 16, hue: 25,
    outcomes: ["Valider une idée auprès de clients potentiels", "Construire un modèle économique", "Rédiger un plan d'affaires simple"],
    skills: ["Entrepreneuriat", "Modèle économique", "Plan d'affaires"],
    modules: [
      { title: "Valider son idée", summary: "Partir d'un vrai problème.", points: ["Une bonne idée d'entreprise répond à un problème réel d'un client identifié", "Interroger des clients potentiels avant de lancer évite des erreurs coûteuses", "Une étude de marché estime la demande et la concurrence"] },
      { title: "Le modèle économique", summary: "Comment l'entreprise gagne de l'argent.", points: ["Le modèle économique décrit comment l'entreprise crée et capte de la valeur", "Le seuil de rentabilité est le chiffre d'affaires qui couvre toutes les charges", "Le prix de vente doit couvrir les coûts et tenir compte des concurrents"] },
      { title: "Le plan d'affaires", summary: "Convaincre partenaires et financeurs.", points: ["Le plan d'affaires présente le projet, le marché et les prévisions financières", "Le plan de trésorerie anticipe les entrées et sorties d'argent mois par mois", "Un résumé clair d'une page facilite la lecture par les financeurs"] },
    ],
  },
  {
    slug: "methodologie-travail-universitaire",
    title: "Méthodologie du travail universitaire",
    subtitle: "Prendre des notes, réviser et s'organiser.",
    description: "Le passage du lycée à l'université demande de nouvelles méthodes. Ce cours vous apprend à prendre des notes en amphi, à réviser efficacement et à organiser votre semestre.",
    domain: "reussite", partner: "dicampus", instructor: "Équipe DiegoCampus",
    level: "Licence 1", hours: 8, hue: 260,
    outcomes: ["Prendre des notes efficaces en cours magistral", "Planifier ses révisions avec la répétition espacée", "Organiser son travail sur un semestre"],
    skills: ["Méthodes de travail", "Prise de notes", "Organisation"],
    modules: [
      { title: "Prendre des notes", summary: "Suivre un cours magistral.", points: ["Des abréviations régulières permettent de noter plus vite", "Reprendre ses notes le jour même aide à les compléter", "Noter la structure du cours facilite les révisions"] },
      { title: "Réviser efficacement", summary: "Mémoriser durablement.", points: ["Se tester renforce davantage la mémoire que relire", "La répétition espacée revoit une notion à intervalles croissants", "Le sommeil participe à la consolidation des souvenirs"] },
      { title: "S'organiser sur le semestre", summary: "Planning, priorités et concentration.", points: ["Un planning hebdomadaire réserve des créneaux fixes au travail personnel", "Découper une tâche réduit l'envie de la repousser", "La technique Pomodoro alterne travail concentré et courtes pauses"] },
    ],
  },
  {
    slug: "preparer-bac-mathematiques",
    title: "Préparer le bac : mathématiques",
    subtitle: "Revoir l'essentiel avant l'examen et l'entrée à l'université.",
    description: "Pour les élèves de terminale qui veulent consolider leurs bases avant le baccalauréat et aborder sereinement une licence scientifique : fonctions, probabilités et méthode de l'épreuve.",
    domain: "reussite", partner: "dicampus", instructor: "Équipe DiegoCampus",
    level: "Prépa bac", hours: 15, hue: 300,
    outcomes: ["Étudier une fonction de A à Z", "Calculer des probabilités simples", "Gérer son temps pendant l'épreuve"],
    skills: ["Mathématiques", "Probabilités", "Méthode d'examen"],
    modules: [
      { title: "Fonctions", summary: "Variations, extremums et courbes.", points: ["Le signe de la dérivée donne les variations de la fonction", "Un extremum local peut apparaître là où la dérivée s'annule en changeant de signe", "Le tableau de variations résume l'étude d'une fonction"] },
      { title: "Probabilités", summary: "Événements, arbres et indépendance.", points: ["Une probabilité est toujours comprise entre 0 et 1", "La probabilité de l'événement contraire vaut 1 moins celle de l'événement", "Un arbre pondéré aide à calculer des probabilités successives"] },
      { title: "Méthode de l'épreuve", summary: "Lire, choisir, rédiger.", points: ["Lire tout le sujet d'abord permet de commencer par les exercices les mieux maîtrisés", "Une réponse justifiée rapporte plus qu'un résultat sans explication", "Garder du temps pour se relire permet de corriger les erreurs de calcul"] },
    ],
  },
];

export const specializations = [
  {
    slug: "reussir-premiere-annee",
    title: "Réussir sa première année",
    description: "Méthodes de travail, rédaction et mathématiques : le trio gagnant pour réussir la Licence 1.",
    partner: "dicampus", domain: "reussite",
    courses: ["methodologie-travail-universitaire", "expression-ecrite-argumentation", "analyse-mathematique-l1"],
  },
  {
    slug: "electricite-et-energies",
    title: "Électricité et énergies",
    description: "De la programmation aux énergies renouvelables, un parcours pour les futurs techniciens et ingénieurs du nord.",
    partner: "esp", domain: "ingenierie",
    courses: ["algorithmique-python", "electrotechnique-fondamentale", "energies-renouvelables"],
  },
  {
    slug: "entreprendre-a-diego",
    title: "Entreprendre à Diego",
    description: "Comptabilité, création d'entreprise et anglais professionnel pour lancer son activité.",
    partner: "iut", domain: "gestion",
    courses: ["comptabilite-generale", "entrepreneuriat", "anglais-professionnel"],
  },
];
