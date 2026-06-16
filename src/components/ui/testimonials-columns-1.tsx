"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Testimonial } from "@/types/facilitation";

export function TestimonialsColumn(props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
  static?: boolean;
}) {
  const reduce = useReducedMotion();

  if (reduce || props.static) {
    return (
      <div className={props.className}>
        <div className="mx-auto flex flex-col gap-6 bg-background pb-6 md:mx-0">
          {props.testimonials.map(({ text, image, name, role }, i) => (
            <TestimonialCard key={i} text={text} image={image} name={name} role={role} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={props.className}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-background"
      >
        {[0, 1].map((index) => (
          <React.Fragment key={index}>
            {props.testimonials.map(({ text, image, name, role }, i) => (
              <TestimonialCard key={`${index}-${i}`} text={text} image={image} name={name} role={role} />
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}

function TestimonialCard({
  text,
  image,
  name,
  role,
}: {
  text: string;
  image: string;
  name: string;
  role: string;
}) {
  return (
    <div className="w-full max-w-xs rounded-3xl border bg-card p-5 shadow-lg shadow-primary/10 sm:p-8">
      <div className="text-sm leading-relaxed">{text}</div>
      <div className="flex items-center gap-2 mt-5">
        <img width={40} height={40} src={image} alt={name} className="h-10 w-10 rounded-full object-cover" />
        <div className="flex flex-col">
          <div className="font-medium tracking-tight leading-5">{name}</div>
          <div className="leading-5 opacity-60 tracking-tight text-sm">{role}</div>
        </div>
      </div>
    </div>
  );
}
