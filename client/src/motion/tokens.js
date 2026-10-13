export const springPresets = {
  gentle: {
    type: 'spring',
    stiffness: 120,
    damping: 14,
    mass: 1
  },
  snappy: {
    type: 'spring',
    stiffness: 300,
    damping: 25,
    mass: 0.8
  },
  bouncy: {
    type: 'spring',
    stiffness: 400,
    damping: 18,
    mass: 1.2
  }
};

export const durations = {
  fast: 0.15,
  base: 0.25,
  moderate: 0.4,
  slow: 0.7
};

export const easings = {
  smooth: [0.25, 0.1, 0.25, 1],
  anticipate: [0.68, -0.55, 0.265, 1.55],
  easeOut: [0, 0, 0.2, 1]
};

export const staggerDelays = {
  fast: 0.05,
  base: 0.08,
  relaxed: 0.12
};
