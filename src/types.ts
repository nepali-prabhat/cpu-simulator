export type BoundingBox = {
    x: number;
    y: number;
    width: number;
    height: number;
};
export type Point = { x: number; y: number };
export type NormalizedZoomValue = number & { _brand: "normalizedZoom" };

export type CanvasDimension = {
    width: number;
    height: number;
};

export type CanvasProperties = {
    dimension: CanvasDimension;
    scroll: Point;
    zoom: NormalizedZoomValue;
    bgColor: string | undefined;
};
export type ElementInfo = {
    displayName: string;
    height: number;
    width: number;
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
export type Element = BoundingBox & {
    uid: string;
    type: ElementType;
    zIndex: number;
    nonce: number;
};
export type AppState = {
    elements: { [key: Element["uid"]]: Element };
    selectedElementIds: Set<string>;
    selectRect?: BoundingBox;
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
        dimension: CanvasDimension
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
