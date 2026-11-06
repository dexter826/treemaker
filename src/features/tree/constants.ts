export const TREE_NODE_WIDTH = 176;
export const TREE_NODE_HEIGHT = 64;
export const MARRIAGE_NODE_SIZE = 20;

export const LAYOUT_CONFIG = {
  nodesep: 40,
  edgesep: 24,
  ranksep: 120,
  marginx: 50,
  marginy: 50,
};

export const CANVAS_ZOOM = {
  min: 0.2,
  max: 1.6,
};

export const ANIMATION_DURATION = {
  OVERLAY: 200,
  CANVAS_LAYOUT: 260,
  CANVAS_FIT_VIEW: 260,
} as const;

export const ANIMATION_DELAY = {
  TOOLBAR_ENTRANCE: 0.1,
} as const;

export const PENDING_DELAY_MS = 150;
export const PENDING_MIN_MS = 300;
