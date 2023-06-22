import { getDefaultStore } from "jotai";
import { MAX_ZOOM, MIN_ZOOM } from "./constants";
import { NormalizedZoomValue } from "./types";

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
