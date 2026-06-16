"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type AnimatedTestimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

interface AnimatedTestimonialsProps {
  testimonials: AnimatedTestimonial[];
  autoplay?: boolean;
  className?: string;
  compact?: boolean;
}

const STACK_ROTATIONS = [-6, 4, -3, 5, -2, 7, -5, 3, -4, 6] as const;

export function AnimatedTestimonials({
  testimonials,
  autoplay = true,
  className,
  compact = false,
}: AnimatedTestimonialsProps) {
  const [active, setActive] = useState(0);
  const reducedMotion = useReducedMotion();

  const rotations = useMemo(
    () =>
      testimonials.map(
        (_, i) => `${STACK_ROTATIONS[i % STACK_ROTATIONS.length]}deg`,
      ),
    [testimonials],
  );

  const handleNext = useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (!autoplay || reducedMotion) return;
    const interval = setInterval(handleNext, 6000);
    return () => clearInterval(interval);
  }, [autoplay, handleNext, reducedMotion]);

  const isActive = (index: number) => index === active;

  return (
    <div
      className={cn(
        "mx-auto w-full font-sans antialiased",
        compact ? "max-w-4xl px-0 py-0" : "max-w-4xl px-4 py-12 md:px-8",
        className,
      )}
    >
      <div className="relative grid grid-cols-1 gap-y-10 md:grid-cols-2 md:gap-x-12 lg:gap-x-16">
        <div className="flex items-center justify-center">
          <div className="relative h-72 w-full max-w-xs sm:h-80">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={
                    reducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.9, y: 50, rotate: rotations[index] }
                  }
                  animate={{
                    opacity: isActive(index) ? 1 : 0.45,
                    scale: isActive(index) ? 1 : 0.92,
                    y: isActive(index) || reducedMotion ? 0 : 20,
                    zIndex: isActive(index)
                      ? testimonials.length
                      : testimonials.length - Math.abs(index - active),
                    rotate: isActive(index) || reducedMotion ? "0deg" : rotations[index],
                  }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: -50 }}
                  transition={{ duration: reducedMotion ? 0.15 : 0.5, ease: "easeInOut" }}
                  className="absolute inset-0 origin-bottom"
                  style={{ perspective: "1000px" }}
                >
                  <img
                    src={testimonial.src}
                    alt={testimonial.name}
                    width={500}
                    height={500}
                    draggable={false}
                    className="h-full w-full rounded-3xl object-cover shadow-2xl ring-1 ring-foreground/10"
                    onError={(e) => {
                      e.currentTarget.src = `https://placehold.co/500x500/e2e8f0/64748b?text=${testimonial.name.charAt(0)}`;
                      e.currentTarget.onerror = null;
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col justify-center py-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reducedMotion ? 0 : -20 }}
              transition={{ duration: reducedMotion ? 0.15 : 0.3, ease: "easeInOut" }}
            >
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                {testimonials[active].name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {testimonials[active].designation}
              </p>
              <p className="mt-6 text-lg leading-relaxed text-foreground/85 sm:text-xl">
                « {testimonials[active].quote} »
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-3 pt-8">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Citation précédente"
              className="group flex h-10 w-10 items-center justify-center rounded-full border bg-card transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ArrowLeft className="h-5 w-5 text-foreground transition-transform duration-300 group-hover:-translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Citation suivante"
              className="group flex h-10 w-10 items-center justify-center rounded-full border bg-card transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ArrowRight className="h-5 w-5 text-foreground transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
