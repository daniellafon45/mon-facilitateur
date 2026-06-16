export interface LeaderQuote {
  author: string;
  role: string;
  quote: string;
  featured?: boolean;
  image?: string;
}

export const LEADER_QUOTES: LeaderQuote[] = [
  {
    author: "Peter Drucker",
    role: "Père du management moderne",
    quote:
      "L'efficacité, c'est faire les choses bien. L'efficience, c'est faire les bonnes choses.",
  },
  {
    author: "Tom DeMarco",
    role: "Auteur de « Deadline »",
    quote:
      "Vous ne pouvez pas contrôler ce que vous ne pouvez pas mesurer. Clarifiez d'abord l'objectif de la session.",
  },
  {
    author: "Kent Beck",
    role: "Créateur de l'extreme programming",
    quote:
      "Faites-le fonctionner, faites-le bien, faites-le vite — dans cet ordre. La facilitation suit la même logique.",
  },
  {
    author: "W. Edwards Deming",
    role: "Pionnier de la qualité et du pilotage",
    quote:
      "Il ne suffit pas de faire de son mieux ; il faut savoir quoi faire, puis faire de son mieux.",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=1000&fit=crop",
  },
];
