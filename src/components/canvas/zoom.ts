import { MAX_ZOOM, MIN_ZOOM } from "@/constants";
import { CanvasProperties, NormalizedZoomValue } from "@/types";

export function getNormalizedZoom(zoom: number): NormalizedZoomValue {
    return Math.max(MIN_ZOOM, Math.min(zoom, MAX_ZOOM)) as NormalizedZoomValue;
}

// TODO: understand this code
export const getStateForZoom = (
    {
        viewportX,
        viewportY,
        nextZoom,
    }: {
        viewportX: number;
        viewportY: number;
        nextZoom: NormalizedZoomValue;
    },
    appState: CanvasProperties
) => {
    const currentZoom = appState.zoom;

    // get original scroll position without zoom
    const baseScrollX =
        appState.scroll.x + (viewportX - viewportX / currentZoom);
    const baseScrollY =
        appState.scroll.y + (viewportY - viewportY / currentZoom);

    // get scroll offsets for target zoom level
    const zoomOffsetScrollX = -(viewportX - viewportX / nextZoom);
    const zoomOffsetScrollY = -(viewportY - viewportY / nextZoom);

    return {
        scroll: {
            x: baseScrollX + zoomOffsetScrollX,
            y: baseScrollY + zoomOffsetScrollY,
        },
        zoom: nextZoom,
    };
};
