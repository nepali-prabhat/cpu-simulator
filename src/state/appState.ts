import {
    Element,
    BoundingBox,
    GhostElement,
    GhostElementValue,
    AppState,
} from "@/types";
import { atom } from "jotai";
import { elementsAtom } from "./elements";
import { atomWithStorage } from "jotai/utils";
import { elementsConfigAtomsMap } from "./elementsConfig";

export const selectedElementIdsAtom = atom<Set<Element["uid"]>>(
    new Set<Element["uid"]>()
);
export const selectRectAtom = atom<BoundingBox | undefined>(undefined);

const ghost = atomWithStorage<GhostElement>("ghostElement", undefined);
export const ghostElementAtom = atom(
    (get) => {
        const value = get(ghost);
        const elementConfigAtom =
            value && elementsConfigAtomsMap.get(value.type);
        if (elementConfigAtom) {
            const rv: GhostElementValue = {
                ...value,
                elementConfig: get(elementConfigAtom),
            };
            return rv;
        }
        return undefined;
    },
    (
        get,
        set,
        value: GhostElement | ((v: GhostElement) => GhostElement | undefined)
    ) => {
        const v = typeof value === "function" ? value(get(ghost)) : value;
        set(ghost, v);
    }
);

export const appStateAtom = atom<AppState>((get) => {
    return {
        elements: get(elementsAtom),
        selectedElementIds: get(selectedElementIdsAtom),
        selectRect: get(selectRectAtom),
        ghostElement: get(ghostElementAtom),
    };
});
