import { PrimitiveAtom } from "jotai";
import { Matrix } from "transformation-matrix";

export type Point = { x: number; y: number };
export type Dimension = {
    width: number;
    height: number;
};
export type BoundingBox = Point & Dimension;
export type BoundingRect = [number, number, number, number];
export type NormalizedZoomValue = number & { _brand: "normalizedZoom" };

export type PinType = "output" | "input" | "select";

export type CanvasProperties = {
    dimension: Dimension;
    scroll: Point;
    zoom: NormalizedZoomValue;
    bgColor: string | undefined;
};
export type ElementInfo = {
    displayName: string;
    path?: string | string[];
    noFillPathIndex?: number[];
    height: number;
    width: number;
    negateOutputPins?: number[];
};
export type ElementType =
    | "and_gate"
    | "not_gate"
    | "or_gate"
    | "nand_gate"
    | "nor_gate"
    | "buffer"
    | "xor_gate"
    | "xnor_gate"
    | "mux"
    | "dmux"
    | "decoder"
    | "DQ_flip_flop"
    | "JK_flip_flop";

export type PinLine = [number, number, number, number];
export type ElementPin = {
    rect: BoundingRect;
    uid: string;
    type: PinType;
    negate?: boolean;
    pinIndex: number;
};
export type ElementPins = {
    pins: ElementPin[];
    lines: PinLine[];
};
export type RenderableElement = {
    seed: number;
    rect: BoundingRect;
    io: ElementPins;
    tmIcon: Matrix;
    iconRect: BoundingRect;
    config: ElementConfig;
};
export type Element = {
    uid: string;
    type: ElementType;
    zIndex: number;
    seed: number;
    rect: BoundingRect;
    io: ElementPins;
    tmIcon: Matrix;
    iconRect: BoundingRect;
    config: ElementConfig;
};

export type GhostElement = RenderableElement & {
    show?: boolean;
    rect?: BoundingRect;
};
export type AppState = {
    elements: { [key: Element["uid"]]: Element };
    selectedElementIds: Set<string>;
    selectRect?: BoundingBox;
    ghostElement?: GhostElement;
};
export type PointerState = {
    moved: boolean;
    selectedElementIds: Set<string>;
    boundingBox?: BoundingBox;
    timeStamp: number;
    lastPoint: Point;
    initial: {
        viewportXY: Point;
        canvasXY: Point;
    };
};

export type PaletteTab = "actions" | "elements" | "circuit";

export type MenuState = {
    isMenuOpen: boolean;
    isCircuitOpen: boolean;
    activeTab: PaletteTab;
};

export type SetViewportZoom =
    | ((
        zoom: number,
        dimension: Dimension
    ) => number | { zoom: number; viewport: Point })
    | number;

export type Circuit = {
    uid: string;
    title: string;
    description?: string;
    // TODO: inputs and outputs
};

export type ElementConfig = {
    type: ElementType;
    inputsCount?: number;
    selectBits?: number;
    dataBits?: number;
    rotation?: number;
    scale?: number;
    color?: string;
};
