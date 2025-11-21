// canvas.constants.ts

// Geometry
export const FULL_TURN_RAD    = Math.PI * 2;
export const HALF_TURN_RAD    = Math.PI;
export const QUARTER_TURN_RAD = Math.PI / 2;

// Default rotation (sector "up")
export const DEFAULT_ROTATION_UP = - QUARTER_TURN_RAD;

// Visual dB thresholds
export const DISPLAY_DB_MIN   = - 12;
export const DISPLAY_DB_MAX   = 12;
export const DISPLAY_DB_RANGE = DISPLAY_DB_MAX - DISPLAY_DB_MIN;

// HSL color parameters
export const HUE_GREEN_DEG   = 120;
export const LIGHTNESS_BASE  = 40;
export const LIGHTNESS_RANGE = 40;

// Grid stroke opacities
export const GRID_LINE_OPACITY   = 0.25;
export const CELL_STROKE_OPACITY = 0.2;
