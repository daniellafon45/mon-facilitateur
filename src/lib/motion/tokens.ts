/** Easing partagé — courbe douce type ease-out expo */
export const MOTION_EASE = [0.16, 1, 0.3, 1] as const;

export const MOTION_DURATION = {
  fast: 0.2,
  page: 0.35,
  overlay: 0.3,
} as const;

export const MOTION_OFFSET = {
  slideY: 12,
  slideYExit: -8,
  slideX: 24,
} as const;

/** @deprecated Utiliser MOTION_EASE */
export const REVEAL_EASE = MOTION_EASE;
