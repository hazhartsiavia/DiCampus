// Cours « Communauté numérique » (Faculté de Lettres, parcours Langues et Communication Numérique).
// Le texte des séances est converti depuis le site du cours (communaute-numerique.json) ;
// quiz d'entraînement, pistes de réponse et examen final sont rédigés à partir de ce texte.
import type { QuizQuestion } from "@/lib/db";
import sessions from "./communaute-numerique.json";
import { EXTRAS } from "./communaute-numerique-local";

/** À augmenter à chaque modification du contenu : la base existante est alors mise à jour (voir lib/db.ts). */
export const CONTENT_VERSION = 2;

type Item = { kind: string; title: string; minutes: number; content: string };
type Module = { title: string; summary: string; items: Item[] };

export const COURSE = {
  slug: "communaute-numerique",
  title: "Communauté numérique",
  subtitle: "Démocratie, lien social ou contrôle ? Comprendre les communautés en ligne.",
  description:
    "Ce cours explore les dynamiques sociales, linguistiques et communicationnelles qui structurent les espaces collectifs sur Internet. Une question fédératrice le guide : les communautés numériques sont-elles des espaces de démocratie et de lien social authentiques, ou des espaces de contrôle, de fragmentation et de marchandisation ? Chaque séance répond à une sous-question, et deux études de cas traversent le cours : un serveur Discord cinéphile et le groupe en ligne d'une promotion de Licence 1 à Diego, où l'on écrit en malgache, en français et en anglais. Chaque séance se termine par un travail pratique corrigé par l'enseignant, et le cours par un examen final noté.",
  domain: "lettres-langues",
  partner: "flsh",
  instructor: "Équipe Lettres et langues",
  level: "Licence 1",
  hours: 30,
  hue: 205,
  outcomes: [
    "Définir une communauté numérique et en distinguer les grands types",
    "Analyser l'identité et les pratiques langagières en ligne",
    "Repérer l'alternance codique et adapter sa langue à son public",
    "Évaluer la dimension délibérative et les liens sociaux d'une communauté",
    "Décrire la gouvernance, la modération et les pathologies en ligne",
    "Concevoir une stratégie d'animation et mesurer la santé d'une communauté",
  ],
  skills: ["Sociologie du numérique", "Analyse du discours", "Plurilinguisme", "Community management", "Modération", "Esprit critique"],
};

const QUIZZES: QuizQuestion[][] = [
  [
    { question: "Selon Tönnies, la Gemeinschaft repose principalement sur…", options: ["L'intérêt rationnel et le contrat", "Les liens affectifs, la tradition et la proximité", "La personnalisation algorithmique"], answer: 1 },
    { question: "Lequel de ces critères ne fait PAS partie de la définition de Rheingold (1993) ?", options: ["La persistance temporelle des échanges", "L'investissement affectif réel", "La vérification de l'identité civile des membres"], answer: 2 },
    { question: "Quelle période correspond aux BBS et à Usenet ?", options: ["1970 – 1990", "1990 – 2000", "2004 – 2015"], answer: 0 },
    { question: "Wikipédia et les projets open source sont des exemples typiques de communauté…", options: ["De circonstance", "D'action", "D'intérêt"], answer: 1 },
    { question: "Le serveur Discord cinéphile relève à la fois de la communauté d'intérêt et de la communauté…", options: ["De pratique", "De circonstance", "D'action"], answer: 0 },
    { question: "Le groupe Facebook d'une promotion de L1, qui réunit des étudiants vivant la même année, est d'abord une communauté…", options: ["De circonstance", "D'action", "D'intérêt"], answer: 0 },
  ],
  [
    { question: "Chez Goffman, la « coulisse » (back stage) est l'espace où l'individu…", options: ["Contrôle soigneusement son image", "Se détend et abandonne temporairement la performance sociale", "Est observé par le plus large public"], answer: 1 },
    { question: "La face négative désigne le désir…", options: ["D'être apprécié et valorisé par autrui", "De préserver son autonomie et de ne pas être importuné", "D'effacer ses traces numériques"], answer: 1 },
    { question: "Le « context collapse » (danah boyd) désigne…", options: ["La disparition d'une plateforme", "L'effondrement des frontières entre publics normalement séparés", "La perte d'un pseudonyme"], answer: 1 },
    { question: "Sur le serveur, des points de suspension après « Si tu aimes Michael Bay... » servent à exprimer…", options: ["Un sous-entendu ou de l'ironie", "Un cri de surprise", "Une réaction phatique rapide"], answer: 0 },
    { question: "Qui a forgé le terme de « mème » en 1976 ?", options: ["Limor Shifman", "Richard Dawkins", "David Crystal"], answer: 1 },
    { question: "« Le cours est reporté, mazotoa amin'ny révision ! » est un exemple d'alternance…", options: ["Interphrastique", "Intraphrastique", "Diglossique"], answer: 1 },
    { question: "Écrire en français au responsable de mention et en malgache à ses amis illustre…", options: ["L'audience design (Allan Bell)", "La loi d'airain de l'oligarchie", "La bulle de filtre"], answer: 0 },
  ],
  [
    { question: "Pour Habermas, l'agir communicationnel est orienté vers…", options: ["Le succès", "L'entente mutuelle", "La visibilité"], answer: 1 },
    { question: "Laquelle de ces prétentions à la validité n'est PAS citée par Habermas ?", options: ["La sincérité", "La justesse normative", "La popularité"], answer: 2 },
    { question: "La « bulle de filtre » est une notion proposée par…", options: ["Eli Pariser", "Mark Granovetter", "Randall Collins"], answer: 0 },
    { question: "Selon Granovetter, les liens faibles sont importants parce qu'ils…", options: ["Ont une forte charge émotionnelle", "Font le pont entre des réseaux autrement cloisonnés", "Remplacent les liens familiaux"], answer: 1 },
    { question: "Le capital social de « bridging » est produit…", options: ["Entre pairs proches, il renforce la cohésion interne", "Entre groupes différents, il ouvre sur des informations nouvelles", "Uniquement hors ligne"], answer: 1 },
  ],
  [
    { question: "La loi d'airain de l'oligarchie a été formulée par…", options: ["Robert Michels", "Karl Popper", "Elinor Ostrom"], answer: 0 },
    { question: "Augmenter le coût d'un comportement indésirable (CAPTCHA, délais) relève, chez Grimmelmann, de…", options: ["L'exclusion", "La tarification", "La normalisation"], answer: 1 },
    { question: "La malinformation désigne…", options: ["Une fausse information diffusée sans intention de nuire", "Une fausse information diffusée pour nuire", "Une information exacte utilisée pour nuire"], answer: 2 },
    { question: "Lequel n'est PAS un facteur de l'effet de désinhibition selon Suler ?", options: ["L'invisibilité", "L'asynchronie", "La modération proactive"], answer: 2 },
    { question: "Les nouveaux membres du serveur doivent attendre 10 minutes avant de poster : c'est une modération…", options: ["Proactive", "Réactive", "Inexistante"], answer: 0 },
    { question: "Dans le groupe de la promo, un étudiant partage de bonne foi une fausse annonce de report d'examen. C'est de la…", options: ["Mésinformation", "Malinformation", "Désinformation"], answer: 0 },
  ],
  [
    { question: "Le community manager concilie agir stratégique et agir…", options: ["Communicationnel", "Réactif", "Algorithmique"], answer: 0 },
    { question: "Dans le modèle RACE, l'étape « Engage » consiste à…", options: ["Élargir l'audience", "Susciter une première interaction", "Fidéliser sur la durée les membres convertis"], answer: 2 },
    { question: "Le nombre total de membres du serveur (5 000) est un exemple de…", options: ["Métrique actionnable", "Métrique de vanité", "Taux de rétention"], answer: 1 },
    { question: "Sur 100 nouveaux membres arrivés il y a 3 mois, 30 sont encore actifs. Le taux de rétention est de…", options: ["10 %", "30 %", "70 %"], answer: 1 },
    { question: "Quel indicateur permet de détecter une crise latente qu'un fort engagement pourrait masquer ?", options: ["Le nombre d'abonnés", "L'analyse de sentiment", "Le nombre de vues cumulées"], answer: 1 },
  ],
];

// Pistes de réponse des mini-questions, dans l'ordre du site.
const HINTS: string[][] = [
  [
    "Persistance temporelle des échanges, investissement affectif réel, existence d'un espace symbolique de rencontre.",
    "L'opposition liait la communauté authentique à la proximité et aux liens affectifs : le numérique déterritorialise ces liens, d'où le débat sur leur authenticité.",
    "Intérêt : partage d'une passion (un forum de cinéphiles). Pratique : perfectionnement de compétences entre pairs (un serveur Discord de développeurs).",
    "Il existe depuis plusieurs années (persistance), des amitiés et des rituels s'y sont noués (affect), il a ses salons, rôles et règles (espace symbolique).",
    "La période des plateformes de flux (2015 à aujourd'hui) : espaces semi-fermés, instantanéité, co-présence synchrone.",
  ],
  [
    "L'identité numérique est une performance : on soigne son image sur la scène (salons publics) et on se relâche en coulisse (messages privés).",
    "Face positive : être apprécié ; face négative : préserver son autonomie. Le self-branding sollicite surtout la face positive.",
    "L'effondrement des contextes : des publics séparés voient le même contenu, persistant et réplicable, qui peut être relu hors de son contexte d'origine.",
    "En 2011, Google+ impose le nom réel : responsabilisation des utilisateurs contre protection des personnes vulnérables.",
    "Points de suspension pour l'ironie, majuscules pour le cri, émojis modalisateurs (😉) pour désambiguïser le ton.",
    "Le mème circule, est imité et transformé en connaissance mutuelle : le comprendre et le citer à bon escient prouve son appartenance.",
    "On valorise l'endogroupe face à l'exogroupe : maîtriser le lexique marque l'appartenance et trace une frontière.",
    "Mèmes internes et lexique (« PS » pour plan-séquence, « effet Abrams ») sont incompréhensibles aux nouveaux venus et confirment l'appartenance des habitués.",
  ],
  [
    "Stratégique : orienté vers le succès (un message conçu pour faire le buzz). Communicationnel : orienté vers l'entente (un débat argumenté sur un film).",
    "Accessibilité, mise entre parenthèses du rang social, capacité à problématiser. C'est un idéal-type : une grille de lecture critique, pas un modèle à restaurer.",
    "Elles enferment les publics dans des opinions confirmant les leurs et réduisent la rencontre du désaccord.",
    "Une relation distante qui relie des groupes différents : elle fait circuler l'information nouvelle entre réseaux cloisonnés.",
    "Bonding : solidarité entre habitués du serveur. Bridging : découvrir un film grâce à un membre d'un autre pays.",
    "Un rituel réussi produit une énergie émotionnelle collective et renforce l'appartenance ; en ligne : likes, badges, formules d'accueil, mèmes.",
    "Elle trace aussi une frontière entre membres légitimes et non légitimes et socialise les nouveaux venus.",
    "Par exemple le « film du mois » ou les sessions de visionnage : des rendez-vous partagés qui produisent une énergie collective.",
  ],
  [
    "Toute organisation tend à produire une minorité dirigeante stable ; sur le serveur, les membres anciens et actifs concentrent l'autorité.",
    "Technique : créer des salons, gérer les permissions, ajouter des bots. Sociale : supprimer un message hors-sujet, avertir, bannir.",
    "Exclusion, tarification, organisation, normalisation.",
    "Une tolérance illimitée finit par se détruire : une communauté ouverte doit fixer des limites claires.",
    "Trolling : provoquer ; cyberharcèlement : hostilité répétée et ciblée ; désinformation : faux intentionnel ; mésinformation : faux non intentionnel ; malinformation : vrai utilisé pour nuire.",
    "Moins de retenue en ligne, sous l'effet de l'anonymat, de l'invisibilité, de l'asynchronie et de la minimisation du statut.",
    "Réactive : après signalement, peu coûteuse mais lente. Proactive : prévention, plus coûteuse et sujette aux faux positifs ou négatifs.",
    "On peut critiquer un film mais pas les personnes : règlement, bot de détection, signalements et modérateurs humains.",
  ],
  [
    "Il sert les objectifs de l'organisation (stratégique) tout en devant créer un échange authentique (communicationnel).",
    "L'ensemble des choix stables de ton, de sujets, de registre et de posture : les membres apprennent à anticiper ce qu'ils rencontreront.",
    "Garantir une régularité de publication ; ce rythme devient un rituel qui renforce l'appartenance.",
    "Reach : élargir l'audience ; Act : susciter une interaction ; Convert : transformer en engagement ; Engage : fidéliser.",
    "Vanité : le nombre total d'abonnés. Actionnable : le nombre de membres qui participent chaque semaine aux débats.",
    "Taux d'engagement (intérêt réel), taux de rétention (fidélisation), analyse de sentiment (crises latentes).",
    "Beaucoup de messages peuvent traduire une polémique : l'analyse du ton distingue enthousiasme et crise.",
    "Extraits de débats sur les réseaux (Reach), sondage sur le film de la semaine (Act), inviter à poster son analyse (Convert), rôle « Expert cinéma » (Engage).",
  ],
];

export const EXAM = {
  title: "Examen final — Communauté numérique",
  durationMinutes: 45,
  penaltyMinutes: 10,
  maxSwitches: 3,
  questions: [
    { question: "Quelle définition de la communauté virtuelle (1993) insiste sur la durée des discussions et l'investissement affectif ?", options: ["Celle de Ferdinand Tönnies", "Celle de Howard Rheingold", "Celle de Limor Shifman", "Celle de Jürgen Habermas"], answer: 1 },
    { question: "La période 2004 – 2015, dominée par Facebook et Twitter, marque le passage…", options: ["De la communauté d'intérêt au réseau personnel égocentré", "Des forums aux BBS", "Des plateformes de flux aux forums", "Du pseudonymat à l'anonymat complet"], answer: 0 },
    { question: "Un groupe de soutien pour malades est typiquement une communauté…", options: ["D'action", "De pratique", "De circonstance", "D'intérêt"], answer: 2 },
    { question: "Que désigne la « déterritorialisation » du lien social ?", options: ["La fermeture des serveurs par pays", "Le fait que le lien social n'a plus besoin de co-présence physique", "La perte d'intérêt pour les communautés locales", "Le passage au nom réel"], answer: 1 },
    { question: "Dans un groupe WhatsApp, un étudiant écrit : « Misaotra betsaka. Je vous envoie le PDF ce soir. » Il s'agit…", options: ["D'une alternance interphrastique", "D'une alternance intraphrastique", "D'un emprunt", "D'une métrique de vanité"], answer: 0 },
    { question: "La controverse des « nymwars » (2011) opposait…", options: ["Modérateurs et administrateurs", "Responsabilisation des utilisateurs et protection des personnes vulnérables", "Mèmes et lexique de plateforme", "Agir stratégique et agir communicationnel"], answer: 1 },
    { question: "Un « shibboleth » est…", options: ["Un bot de modération", "Un élément culturel dont la maîtrise identifie l'appartenance à un groupe", "Une règle de netiquette écrite", "Un indicateur de rétention"], answer: 1 },
    { question: "Selon Tajfel et Turner, les individus tendent à…", options: ["Valoriser les membres de leur propre groupe (endogroupe)", "Refuser toute catégorisation sociale", "Préférer les liens faibles aux liens forts", "Rechercher systématiquement l'anonymat"], answer: 0 },
    { question: "Laquelle de ces conditions caractérise l'espace public habermassien ?", options: ["L'accès réservé aux experts", "La mise entre parenthèses du rang social", "La personnalisation des contenus", "La primauté de l'autorité"], answer: 1 },
    { question: "Une chambre d'écho est un environnement où…", options: ["Les opinions contraires sont mises en avant", "L'individu n'est exposé qu'à des opinions confirmant les siennes", "Les messages sont supprimés automatiquement", "Chacun parle à tour de rôle"], answer: 1 },
    { question: "Pour Putnam, le capital social est avant tout…", options: ["Une ressource collective de coopération et de confiance", "Un capital strictement économique", "Une métrique de vanité", "Un pouvoir technique"], answer: 0 },
    { question: "Selon Randall Collins, un rituel d'interaction réussi…", options: ["Réduit le nombre de membres", "Produit une énergie émotionnelle collective et renforce l'appartenance", "Remplace la netiquette", "Supprime les conflits"], answer: 1 },
    { question: "Selon la loi d'airain de l'oligarchie, une organisation démocratique tend à…", options: ["Rester parfaitement horizontale", "Engendrer une minorité dirigeante stable", "Se dissoudre rapidement", "Confier le pouvoir aux nouveaux venus"], answer: 1 },
    { question: "Selon Gumperz, changer de langue au cours d'une conversation en ligne…", options: ["Est une faute à corriger", "Peut avoir une fonction : émotion, insistance, inclusion ou exclusion", "N'arrive que chez les débutants", "Est interdit par la netiquette"], answer: 1 },
    { question: "Elinor Ostrom montre que la concentration du pouvoir peut être évitée grâce à…", options: ["L'anonymat complet", "Des règles claires et légitimes, des sanctions graduées et un accès simple à la résolution des conflits", "La suppression des modérateurs", "La publicité ciblée"], answer: 1 },
    { question: "Une rumeur fausse sur la sortie d'un film, diffusée sans intention de nuire, relève de…", options: ["La désinformation", "La mésinformation", "La malinformation", "Le cyberharcèlement"], answer: 1 },
    { question: "Une ligne éditoriale constitue pour les membres…", options: ["Une promesse implicite sur le ton et les contenus", "Un outil de mesure de l'engagement", "Une sanction graduée", "Un calendrier de publication"], answer: 0 },
    { question: "Dans le modèle RACE de Chaffey, l'étape « Convert » consiste à…", options: ["Élargir la visibilité", "Transformer une interaction en engagement ou en action concrète", "Fidéliser sur la durée", "Analyser le sentiment"], answer: 1 },
    { question: "Sur 5 000 membres, 500 postent au moins un message par semaine. Le taux d'engagement est de…", options: ["5 %", "10 %", "50 %", "500 %"], answer: 1 },
    { question: "Pourquoi Eric Ries met-il en garde contre les métriques de vanité ?", options: ["Elles sont trop difficiles à calculer", "Elles progressent mécaniquement sans informer sur la qualité de l'engagement", "Elles sont interdites sur Discord", "Elles mesurent uniquement le sentiment"], answer: 1 },
  ] satisfies QuizQuestion[],
};

/** Modules complets : contenu converti, pistes de réponse et quiz d'entraînement en fin de séance. */
export function buildModules(): Module[] {
  return (sessions as Module[]).map((m, i) => {
    const items = m.items.map((item) => {
      if (item.kind !== "reflection" || !item.title.startsWith("Mini-questions")) return item;
      const questions = JSON.parse(item.content) as { question: string; hint: string }[];
      return { ...item, content: JSON.stringify(questions.map((q, qi) => ({ ...q, hint: HINTS[i]?.[qi] ?? "" }))) };
    });
    // Le quiz, puis le TP, prennent place juste avant la synthèse ; les compléments locaux après l'élément indiqué.
    const synthIndex = items.findIndex((it) => it.title === "Synthèse de la séance");
    items.splice(synthIndex, 0, { kind: "quiz", title: `Quiz — Séance ${i + 1}`, minutes: 5, content: JSON.stringify(QUIZZES[i]) });
    for (const extra of EXTRAS[i] ?? []) {
      const at = extra.after === "avant-synthese"
        ? items.findIndex((it) => it.title === "Synthèse de la séance")
        : items.findIndex((it) => it.title === extra.after) + 1;
      if (at <= 0) throw new Error(`Communauté numérique : élément « ${extra.after} » introuvable (séance ${i + 1}).`);
      items.splice(at, 0, extra.item);
    }
    return { ...m, items };
  });
}
