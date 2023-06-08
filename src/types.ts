export type Point = { x: number; y: number };
export type NormalizedZoomValue = number & { _brand: "normalizedZoom" };
export type CanvasProperties = {
    width: number;
    height: number;
    scroll: Point;
    zoom: NormalizedZoomValue;
};
export type ElementType = "not_gate" | "and_gate" | "or_gate";
export type Element = {
    uid: string;
    x: number;
    y: number;
    width: number;
    height: number;
    type: ElementType;
};
export type AppState = {
    elements: Element[];
    selectedElementIds: Set<string>;
};
