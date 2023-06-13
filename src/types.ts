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
};
export type ElementType = "not_gate" | "and_gate" | "or_gate";
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

export type MenuState = {
    isMenuOpen: boolean;
    isCircuitOpen: boolean;
};
export type Circuit = {
    title: string;
    description: string;
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
    description: string;
    // TODO: inputs and outputs
}
