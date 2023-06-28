import { getDefaultStore } from "jotai";
import { MAX_ZOOM, MIN_ZOOM } from "./constants/constants";
import { BoundingBox, BoundingRect, NormalizedZoomValue, Point } from "./types";

export function mergeRefs<T = any>(
    refs: Array<React.MutableRefObject<T> | React.LegacyRef<T>>
): React.RefCallback<T> {
    return (value) => {
        refs.forEach((ref) => {
            if (typeof ref === "function") {
                ref(value);
            } else if (ref != null) {
                (ref as React.MutableRefObject<T | null>).current = value;
            }
        });
    };
}

// Utility functions for scene
export function getNormalizedZoom(zoom: number): NormalizedZoomValue {
    return Math.max(MIN_ZOOM, Math.min(zoom, MAX_ZOOM)) as NormalizedZoomValue;
}

export const getUIStore = () => {
    return getDefaultStore();
};

export function getRectangleFromDiagonals(
    d1: Point,
    d2: Point
): [number, number, number, number] {
    return [d1.x, d1.y, d2.x - d1.x, d2.y - d1.y];
}


export function convertBoxToRect(boundingBox: BoundingBox): BoundingRect {
    const rect: BoundingRect = [
        boundingBox.x,
        boundingBox.y,
        boundingBox.width,
        boundingBox.height,
    ];
    return rect;
}

