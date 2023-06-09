import { APP_BG_COLOR_PALETTE } from "@/colors";
import { INITIAL_ZOOM } from "@/constants/constants";
import {
    Dimension,
    CanvasProperties,
    Point,
    SetViewportZoom,
} from "@/types";
import { getNormalizedZoom } from "@/utils";
import { atom, getDefaultStore } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const canvasDimensionAtom = atom<Dimension>({
    width: 300,
    height: 150,
});

export const scrollAtom = atomWithStorage<Point>("canvas_scroll", {
    x: 0,
    y: 0,
});
const zoomAtom = atomWithStorage("canvas_zoom", INITIAL_ZOOM);

export const zoomValueAtom = atom((get) => get(zoomAtom));

export const getZoomFromStore = () => getDefaultStore().get(zoomAtom);

export const setViewportZoom = atom(
    null,
    (get, set, newValue: SetViewportZoom) => {
        const dimension = get(canvasDimensionAtom);
        const scroll = get(scrollAtom);
        const currentZoom = get(zoomAtom);
        const rv =
            typeof newValue === "function"
                ? newValue(currentZoom, dimension)
                : newValue;
        const nextZoom = getNormalizedZoom(
            typeof rv === "object" ? +rv.zoom.toFixed(2) : +rv.toFixed(2)
        );
        const viewport =
            typeof rv === "object"
                ? rv.viewport
                : {
                    x: dimension.width / 2,
                    y: dimension.height / 2,
                };

        // get original scroll position without zoom
        const baseScrollX = scroll.x + (viewport.x - viewport.x / currentZoom);
        const baseScrollY = scroll.y + (viewport.y - viewport.y / currentZoom);

        // get scroll offsets for target zoom level
        const zoomOffsetScrollX = -(viewport.x - viewport.x / nextZoom);
        const zoomOffsetScrollY = -(viewport.y - viewport.y / nextZoom);

        set(scrollAtom, {
            x: baseScrollX + zoomOffsetScrollX,
            y: baseScrollY + zoomOffsetScrollY,
        });
        set(zoomAtom, nextZoom);
    }
);

export const bgColorAtom = atomWithStorage<string | undefined>(
    "bg_color",
    APP_BG_COLOR_PALETTE[0]
);

export const sceneAtom = atom<CanvasProperties>((get) => {
    return {
        dimension: get(canvasDimensionAtom),
        zoom: get(zoomAtom),
        scroll: get(scrollAtom),
        bgColor: get(bgColorAtom),
    };
});
