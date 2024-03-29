import { NormalizedZoomValue, PaletteTab } from "@/types";

// Zoom
export const ZOOM_STEP = 0.1;
export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 15;
export const INITIAL_ZOOM = 1 as NormalizedZoomValue;

export const SELECT_SIZE = 2;
export const SELECT_PADDING = 0;

// Development mode options
export const GRID_SPACE = 30; //20
export const GRID_TYPE: "dots" | "lines" | "" = "dots";
export const SNAP_ELEMENTS = false;

// Used in palette
export const paletteWidth = 200;
export const tabs: PaletteTab[] = ["actions", "elements", "circuit"];

// Ids used to scroll circuits list to the bottom once a circuit is added.
export const circuitsMenuListId = "circuits-menu-list-id";
export const getCircuitsElementId = (uid: string) => `CIRCUIT_SORTABLE_${uid}`;

// Ids used to render elements config menu
export const menuContainerId = "menu-portal-container";
export const paletteContentId = "menu-portal-content1";

export const paletteTitleMap: Map<PaletteTab, string> = new Map();
paletteTitleMap.set("actions", "Actions");
paletteTitleMap.set("elements", "Logic Components");
paletteTitleMap.set("circuit", "Circuits");

// Constants for rendering gates
export const PIN_LENGTH = 7.2 / 1.25;
export const PIN_HEIGHT = 8 / 1.25;

export const WIRES_SNAP_DISTANCE = Math.pow(8, 2);

export const DEBUG_BOUNDING_BOX = false;
