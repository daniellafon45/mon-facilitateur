import type { AnimatedTestimonial } from "@/components/ui/testimonial";
import { getAuthorPortrait } from "@/lib/data/author-portraits";

type AuthorQuote = AnimatedTestimonial & { id: string };

const QUOTES: Omit<AuthorQuote, "src">[] = [
  {
    id: "margaret-mead",
    quote:
      "Ne doutez jamais qu'un petit groupe de citoyens réfléchis et engagés peut changer le monde. C'est d'ailleurs ainsi que cela s'est toujours produit.",
    name: "Margaret Mead",
    designation: "Anthropologue · Pionnière des sciences sociales",
  },
  {
    id: "albert-einstein",
    quote:
      "La logique te mène d'un point A à un point B. L'imagination te mène partout.",
    name: "Albert Einstein",
    designation: "Physicien · Prix Nobel",
  },
  {
    id: "antoine-saint-exupery",
    quote: "On ne voit bien qu'avec le cœur. L'essentiel est invisible pour les yeux.",
    name: "Antoine de Saint-Exupéry",
    designation: "Écrivain et aviateur · Auteur du Petit Prince",
  },
  {
    id: "peter-drucker",
    quote: "La meilleure façon de prédire l'avenir, c'est de le créer.",
    name: "Peter Drucker",
    designation: "Penseur du management · Consultant",
  },
  {
    id: "voltaire",
    quote: "Juge un homme par ses questions plutôt que par ses réponses.",
    name: "Voltaire",
    designation: "Philosophe des Lumières · Écrivain",
  },
  {
    id: "paulo-coelho",
    quote:
      "Quand tu veux vraiment quelque chose, tout l'univers conspire pour t'aider à réaliser ton désir.",
    name: "Paulo Coelho",
    designation: "Romancier · Auteur de L'Alchimiste",
  },
];

export const FAMOUS_AUTHOR_QUOTES: AnimatedTestimonial[] = QUOTES.map((q) => ({
  ...q,
  src: getAuthorPortrait(q.id),
}));
