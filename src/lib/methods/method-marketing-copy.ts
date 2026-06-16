/**
 * Descriptions orientées bénéfice (JTBD, spécificité) — affichées au survol des cartes.
 */
export const METHOD_MARKETING_COPY: Record<string, string> = {
  qqoqcp:
    "Cadrer un sujet flou en 15 minutes : six questions qui évitent les malentendus avant même de lancer la séance.",
  "5-pourquoi":
    "Trouver la vraie cause d'un problème récurrent — pas le symptôme — pour arrêter de traiter la surface.",
  "objectifs-smart":
    "Transformer une intention vague en objectif actionnable que toute l'équipe peut suivre et mesurer.",
  "clarification-du-mandat":
    "Aligner sponsor, équipe et facilitateur sur le périmètre, les livrables et ce qui compte vraiment.",
  "analyse-des-parties-prenantes":
    "Identifier qui influence la réussite du projet — et comment les impliquer au bon moment.",
  "matrice-pouvoir-interet":
    "Prioriser vos efforts de communication : savoir qui convaincre, qui informer, qui ignorer.",
  ishikawa:
    "Décomposer un problème complexe en causes vérifiables — plus de débat stérile, plus de clarté.",
  bono:
    "Explorer un sujet sous six angles sans que les ego s'affrontent : chaque regard a sa place.",
  swot:
    "Voir d'un coup d'œil forces, faiblesses, opportunités et menaces pour décider où agir en premier.",
  pestel:
    "Anticiper les facteurs externes (politique, économie, tech…) avant qu'ils ne bloquent votre projet.",
  "analyse-des-risques":
    "Repérer ce qui peut dérailler — et décider quoi surveiller avant que ce ne soit trop tard.",
  "benchmark-concurrentiel":
    "Comparer votre offre aux alternatives sur des critères concrets — pas sur des impressions.",
  persona:
    "Parler à un utilisateur réel, pas à une abstraction : objectifs, frustrations, canaux préférés.",
  "carte-d-empathie":
    "Comprendre ce que votre utilisateur dit, pense, fait et ressent — le fondement de toute innovation utile.",
  "parcours-utilisateur":
    "Visualiser chaque étape du parcours client pour repérer les frictions qui font perdre des gens.",
  brainstorming:
    "Sortir 30 idées en 20 minutes sans autocensure — puis retenir celles qui méritent d'être testées.",
  brainwriting:
    "Faire contribuer les timides et les experts à parts égales : idéation silencieuse, tours structurés.",
  scamper:
    "Réinventer une idée existante avec sept leviers éprouvés — sans repartir de zéro.",
  bmc:
    "Modéliser toute votre activité sur une page : partenaires, valeur, clients, revenus, coûts.",
  "lean-canvas":
    "Tester une hypothèse business rapidement : problème, solution, métriques, avantages compétitifs.",
  "value-proposition-canvas":
    "Vérifier que votre offre répond vraiment aux douleurs et gains de votre client cible.",
  raci:
    "Finir les « qui fait quoi ? » : chaque tâche a un responsable, un valideur, des consultés et informés.",
  roles:
    "Attribuer facilitateur, scribe et porteurs en séance — plus de flou sur les responsabilités.",
  charter:
    "Poser les règles du jeu dès le départ : valeurs, attentes, disponibilités, mode de décision.",
  commplan:
    "Savoir qui reçoit quoi, quand et comment — plus de « je ne savais pas » en milieu de projet.",
  "matrice-impact-effort":
    "Choisir les actions à fort impact et faible effort en premier — arrêter de tout traiter pareil.",
  moscow:
    "Trancher entre indispensable, souhaitable et reportable — fini les listes de souhaits infinies.",
  rice:
    "Prioriser avec des chiffres : portée, impact, confiance et effort — moins de débats subjectifs.",
  "plan-d-action":
    "Transformer les décisions en tâches datées avec un responsable — la séance produit enfin quelque chose.",
  kanban:
    "Voir l'avancement en un coup d'œil : idées, en cours, terminé — sans réunion de suivi de plus.",
  "scrum-sprint-board":
    "Piloter un sprint avec backlog, story points et colonnes — l'équipe sait où elle en est.",
  "gantt-simplifie":
    "Visualiser les phases et dépendances sans outil lourd — un planning lisible en 10 minutes.",
  tracabilite:
    "Relier chaque décision à une action et un responsable — plus de « on avait décidé quoi déjà ? »",
  "start-stop-continue":
    "Clôturer une séance avec trois listes claires : ce qu'on garde, ce qu'on arrête, ce qu'on lance.",
  "retrospective-4l":
    "Capitaliser sur ce qui a plu, appris, manqué et manqué — une rétro structurée qui produit des actions.",
  vote:
    "Trancher collectivement en direct : points, échelle, pour/contre — résultats visibles immédiatement.",
  desaccord:
    "Débloquer un point de friction avec des modes de décision adaptés : compromis, consensus ou vote.",
  reflexion:
    "Sortir du premier réflexe avec des questions puissantes, avocat du diable et analogies.",
  probleme:
    "Passer du constat au plan d'action : HMW, impact/effort, pré-mortem — en une séquence guidée.",
  minuteur:
    "Respecter le temps de chaque étape : Pomodoro, timebox, chrono — la séance ne dérape plus.",
  parking:
    "Capturer les sujets hors-sujet sans les perdre — revenez-y quand le moment est venu.",
  "tableau-blanc":
    "Co-construire visuellement : post-its, formes, schémas — le canevas de votre facilitation.",
};

export function getMethodMarketingCopy(methodId: string, fallbackDesc: string) {
  return METHOD_MARKETING_COPY[methodId] ?? fallbackDesc;
}
