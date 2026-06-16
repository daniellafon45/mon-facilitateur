"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  RevealOnScroll,
  StaggerItem,
  StaggerReveal,
} from "@/components/ui/reveal-on-scroll";

const FAQ = [
  {
    q: "Qu'est-ce qu'un facilitateur IA ?",
    a: "C'est un copilote qui vous aide à cadrer, structurer et animer vos sessions avant même de réunir les participants. Il pose des questions ciblées puis propose format, méthode et ordre du jour.",
  },
  {
    q: "Quelle différence entre solo, équipe et grand atelier ?",
    a: "Solo sert à préparer seul. Équipe couvre les réunions de 2 à 15 personnes. Grand atelier gère les plénières avec sous-groupes orchestrés pour 15 participants et plus.",
  },
  {
    q: "Faut-il être connecté pour utiliser l'assistant ?",
    a: "Oui. La connexion est obligatoire pour lancer une session ou ouvrir le chat IA. Cela garantit que vos projets et comptes rendus restent associés à votre compte.",
  },
  {
    q: "Puis-je exporter mes comptes rendus ?",
    a: "Oui. Chaque session peut produire un rapport exportable en PDF ou Excel, avec les décisions et actions assignées.",
  },
  {
    q: "Mon facilitateur remplace-t-il Miro ou Teams ?",
    a: "Non. Il complète vos outils existants en structurant la facilitation : méthodes, timing, votes et documentation. Connectez Teams, Slack, Google Calendar et Notion depuis le tableau de bord pour synchroniser rencontres et comptes rendus.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        <RevealOnScroll className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">
            Questions fréquentes
          </h2>
        </RevealOnScroll>

        <StaggerReveal stagger={0.07}>
          <Accordion type="single" collapsible className="w-full">
            {FAQ.map((item, i) => (
              <StaggerItem key={i} y={12}>
                <AccordionItem value={`item-${i}`}>
                  <AccordionTrigger className="text-left text-sm sm:text-base">{item.q}</AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              </StaggerItem>
            ))}
          </Accordion>
        </StaggerReveal>
      </div>
    </section>
  );
}
