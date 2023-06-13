import { GRID_SPACE } from "@/constants";
import { Element, BoundingBox } from "@/types";
import { atom } from "jotai";
import { nanoid } from "nanoid";

const gridSpace = GRID_SPACE;
const ids = [nanoid(), nanoid(), nanoid()];

export const elementsAtom = atom<{ [key: Element["uid"]]: Element }>({
    [ids[0]]: {
        uid: ids[0],
        x: gridSpace * 6,
        y: gridSpace * 4,
        width: 60,
        height: 60,
        type: "and_gate",
        zIndex: 0,
        nonce: 0,
    },
    [ids[1]]: {
        uid: ids[1],
        x: gridSpace + gridSpace * 10,
        y: gridSpace + gridSpace * 5,
        width: 60,
        height: 60,
        type: "or_gate",
        zIndex: 0,
        nonce: 1,
    },
    [ids[2]]: {
        uid: ids[2],
        x: gridSpace * 3,
        y: gridSpace * 9,
        width: 60,
        height: 60,
        type: "not_gate",
        zIndex: 0,
        nonce: 2,
    },
});
export const selectedElementIdsAtom = atom<Set<Element["uid"]>>(
    new Set<Element["uid"]>()
);
export const selectRectAtom = atom<BoundingBox | undefined>(undefined);

export const appStateAtom = atom((get) => {
    const elements = get(elementsAtom);
    const selectedElementIds = get(selectedElementIdsAtom);
    const selectRect = get(selectRectAtom);
    return {
        elements,
        selectedElementIds,
        selectRect,
    };
});
