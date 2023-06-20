import { NormalizedZoomValue, PaletteTab } from "./types";

export const ZOOM_STEP = 0.1;
export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 15;
export const INITIAL_ZOOM = 1 as NormalizedZoomValue;

export const SELECT_SIZE = 7;
export const SELECT_PADDING = 0;

// Development mode options
export const GRID_SPACE = 20;
export const GRID_TYPE: "dots" | "lines" = "dots";

export const paletteWidth = 230;
export const tabs: PaletteTab[] = ["actions", "component", "circuit"];

export const scrollWidth = 8;
