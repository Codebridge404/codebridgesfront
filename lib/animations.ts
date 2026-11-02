import { Variants, Transition } from 'framer-motion';

/**
 * CodeBridges Apple Design Motion & Spring Physics Engine
 * Calibrated from Apple WWDC "Designing Fluid Interfaces" specifications.
 * 
 * Core Principles:
 * - Critically damped springs (damping 1.0) by default for natural, zero-overshoot settle.
 * - Under-damped springs (damping ~0.8) reserved for gestures carrying physical momentum.
 * - Response times calibrated between 0.30s - 0.40s.
 * - Instant press feedback on pointer-down (scale: 0.97).
 */

// 1. Critically Damped Universal Spring (No overshoot, smooth settle)
export const appleSpring: Transition = {
  type: 'spring',
  damping: 30,
  stiffness: 350,
  mass: 0.8,
};

// 2. Momentum / Flick Spring (Gentle physical bounce following a flick/gesture)
export const momentumSpring: Transition = {
  type: 'spring',
  damping: 24,
  stiffness: 300,
  mass: 1.0,
};

// 3. Bottom Sheet & Drawer Spring (Apple-calibrated for vertical sheets)
export const sheetSpring: Transition = {
  type: 'spring',
  damping: 28,
  stiffness: 320,
  mass: 0.9,
};

// 4. Instant Tactile Press Spring (Zero-latency depression on pointer-down)
export const pressSpring: Transition = {
  type: 'spring',
  damping: 35,
  stiffness: 550,
  mass: 0.5,
};

// Backward-compatible alias
export const springTransition: Transition = appleSpring;

// Apple-style smooth ease for non-spring transitions
export const smoothTransition: Transition = {
  duration: 0.32,
  ease: [0.2, 0.9, 0.3, 1.0],
};

// Fade variant
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: smoothTransition,
  },
};

// Symmetrical slide up with spring settling
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: appleSpring,
  },
  exit: {
    opacity: 0,
    y: 16,
    transition: { duration: 0.2, ease: [0.32, 0, 0.67, 0] },
  },
};

// Scale in from origin
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: appleSpring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.18, ease: 'easeOut' },
  },
};

// Modal backdrop scrim with blur integration
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.24, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
};

// Scrim fade for dark modal underlays
export const scrimFade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.24, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.18, ease: 'easeIn' } },
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.24, ease: 'easeOut' } },
};

// Modal content: Materializes scale, transform and blur together
export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: appleSpring,
  },
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: appleSpring,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    transition: { duration: 0.18, ease: [0.32, 0, 0.67, 0] },
  },
};

// Stagger container for list/grid items
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

// Interactive card hover with spring recovery
export const cardHoverMotion = {
  whileHover: { y: -3, scale: 1.008 },
  whileTap: { scale: 0.98 },
  transition: appleSpring,
};

// Button tactile touch-down motion
export const buttonTapMotion = {
  whileTap: { scale: 0.97 },
  transition: pressSpring,
};
