export type Point = { x: number; y: number };
export type Dimension = {
    width: number;
    height: number;
};
export type BoundingBox = Point & Dimension;
export type BoundingRect = [number, number, number, number];
export type NormalizedZoomValue = number & { _brand: "normalizedZoom" };

export type PinType = "output" | "input";

export type CanvasProperties = {
    dimension: Dimension;
    scroll: Point;
    zoom: NormalizedZoomValue;
    bgColor: string | undefined;
};
export type ElementInfo = {
    displayName: string;
    path?:string;
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
export type Element = BoundingBox & {
    uid: string;
    type: ElementType;
    zIndex: number;
    nonce: number;
};
export type GhostElement =
    | (Partial<Point> & {
        show: boolean;
        seed: number;
        elementConfig: ElementConfig;
    })
    | undefined;
export type AppState = {
    elements: { [key: Element["uid"]]: Element };
    selectedElementIds: Set<string>;
    selectRect?: BoundingBox;
    ghostElement: GhostElement;
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
