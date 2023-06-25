import { Element, BoundingBox, GhostElement, AppState, Point } from "@/types";
import { atom } from "jotai";
import { elementsAtom } from "./elements";
import { elementConfigAtomAtom } from "./ui";
import { randomInteger } from "@/utils/random";

export const selectedElementIdsAtom = atom<Set<Element["uid"]>>(
    new Set<Element["uid"]>()
);
export const selectRectAtom = atom<BoundingBox | undefined>(undefined);

const ghostAtom = atom<GhostElement>(undefined);
export const ghostElementAtom = atom((get) => {
    const value = get(ghostAtom);
    const elementConfigAtom = get(elementConfigAtomAtom);
    if (elementConfigAtom) {
        const elementConfig = get(elementConfigAtom);
        const isSelectionChanged =
            value?.elementConfig.type !== elementConfig.type;
        const rv: GhostElement = {
           ...(value || {}),
            show:
                value?.show === undefined || isSelectionChanged
                    ? true
                    : value?.show,
            seed: isSelectionChanged
                ? randomInteger()
                : value?.seed || randomInteger(),
            elementConfig,
        };
        return rv;
    }
    return undefined;
});

type GhostPosition = Partial<Point>;
export const setGhostPosition = atom(
    null,
    (
        get,
        set,
        value: GhostPosition | ((v: GhostPosition) => GhostPosition)
    ) => {
        const current = get(ghostElementAtom);
        if (current && current.show) {
            const v = typeof value === "function" ? value(current) : value;
            set(ghostAtom, { ...current, ...v });
        }
    }
);

export const showGhost = atom(null, (get, set, value: boolean) => {
    const current = get(ghostElementAtom);
    if (current) {
        let point = {};
        if (!value) {
            point = { x: undefined, y: undefined };
        }
        set(ghostAtom, { ...current, show: value, ...point });
    }
});

export const appStateAtom = atom<AppState>((get) => {
    return {
        elements: get(elementsAtom),
        selectedElementIds: get(selectedElementIdsAtom),
        selectRect: get(selectRectAtom),
        ghostElement: get(ghostElementAtom),
    };
});
