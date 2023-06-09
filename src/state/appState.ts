import { BoundingBox, GhostElement, AppState, ElementType } from "@/types";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { elementsAtom, selectedElementIdsAtom } from "./elements";
import { elementConfigAtomAtom } from "./ui";
import { getElementRects } from "@/utils/box";
import { wiresAtom } from "./wires";

export const selectRectAtom = atom<BoundingBox | undefined>(undefined);

export const ghostStateAtom = atomWithStorage<
    | {
        position?: [number, number];
        seed: number;
        show: boolean;
        type: ElementType;
    }
    | undefined
>("ghost_atom_state", undefined);
ghostStateAtom.debugLabel = "ghostStateAtom";

export const ghostElementAtom = atom((get) => {
    const value = get(ghostStateAtom);
    const elementConfigAtom = get(elementConfigAtomAtom);
    if (elementConfigAtom) {
        const config = get(elementConfigAtom);

        let elementRects =
            config &&
            getElementRects({
                config: config,
                position: value?.position,
            });
        if (!elementRects || !value) {
            return undefined;
        }
        const rv: GhostElement = {
            show: value.show && !!value.position,
            seed: value.seed,
            ...elementRects,
            config: config,
        };
        return rv;
    }
    return undefined;
});
ghostElementAtom.debugLabel = "ghost element atom";

export const setGhostPosition = atom(
    null,
    (get, set, value: [number, number]) => {
        const ghostState = get(ghostStateAtom);
        if (ghostState) {
            set(ghostStateAtom, {
                ...ghostState,
                position: value,
            });
        }
    }
);

export const showGhost = atom(null, (_, set, value: boolean) => {
    set(ghostStateAtom, (v) => (!!v ? { ...v, show: value } : undefined));
});

export const appStateAtom = atom<AppState>((get) => {
    return {
        elements: get(elementsAtom),
        selectedElementIds: get(selectedElementIdsAtom),
        selectRect: get(selectRectAtom),
        ghostElement: get(ghostElementAtom),
        wires: get(wiresAtom),
    };
});
