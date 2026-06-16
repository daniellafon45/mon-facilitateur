"use client";

import { motion, useReducedMotion } from "motion/react";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { FACILITATION_TESTIMONIALS } from "@/lib/data/testimonials";

const firstColumn = FACILITATION_TESTIMONIALS.slice(0, 3);
const secondColumn = FACILITATION_TESTIMONIALS.slice(3, 6);
const thirdColumn = FACILITATION_TESTIMONIALS.slice(6, 9);

export function TestimonialsSection() {
  const reduce = useReducedMotion();

  return (
    <section id="avis" className="bg-background py-20 relative">
      <div className="container z-10 mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <div className="flex justify-center">
            <div className="border py-1 px-4 rounded-lg text-sm">Témoignages</div>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter mt-5 text-center">
            Ce que disent nos utilisateurs
          </h2>
          <p className="text-center mt-5 opacity-75">
            Professionnels et étudiants du Québec partagent comment ils structurent
            leurs rencontres sans perdre de temps.
          </p>
        </motion.div>

        <RevealOnScroll delay={0.15} y={28} duration={0.7} className="mt-10">
          <div className="mx-auto flex max-h-[55vh] justify-center gap-4 overflow-hidden sm:max-h-[65vh] sm:gap-6 lg:max-h-[740px] [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]">
            <TestimonialsColumn testimonials={firstColumn} duration={15} static={!!reduce} />
            <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} static={!!reduce} />
            <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} static={!!reduce} />
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
