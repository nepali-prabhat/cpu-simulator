export type BoundingBox = {
    x: number;
    y: number;
    width: number;
    height: number;
};
export type Point = { x: number; y: number };
export type NormalizedZoomValue = number & { _brand: "normalizedZoom" };
export type CanvasProperties = {
    width: number;
    height: number;
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
